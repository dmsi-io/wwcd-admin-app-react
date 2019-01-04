import React, { Component } from 'react';
import { Player, ControlBar } from 'video-react';

import { Loading, Modal } from '@dmsi/wedgekit';

import Header from '../../components/header/header';
import Firebase from '../../fire';

import s from './draw.module.scss';

class DrawPage extends Component {
  constructor(props) {
    super(props);

    this.state = {
      prizes: [],
      tickets: [],
      loading: true,
    };
  }

  componentDidMount = async () => {
    const db = Firebase.firestore();

    const prizesRef = db.collection('prizes');
    let prizesSnapshot = null;
    try {
      prizesSnapshot = await prizesRef.get();
    } catch (err) {
      // eslint-disable-next-line no-console
      console.log('Error getting prizes', err);
    }

    const ticketsRef = db.collection('tickets');
    let ticketsSnapshot = null;
    try {
      ticketsSnapshot = await ticketsRef.get();
    } catch (err) {
      // eslint-disable-next-line no-console
      console.log('Error getting tickets', err);
    }

    const tickets = ticketsSnapshot.docs.map((ticket) => ({ ...ticket.data(), id: ticket.id }));
    const prizes = prizesSnapshot.docs.map((prize) => ({
      ...prize.data(),
      id: prize.id,
      tickets: tickets.filter((ticket) => ticket.prize === prize.id),
    })).sort((a, b) => {
      if (a.title < b.title) {
        return -1;
      }
      return a.title > b.title ? 1 : 0;
    });

    this.setState({
      prizes,
      tickets,
      loading: false,
    });

    this.prizeUpdateUnsubscribe = prizesRef.onSnapshot({
      next: (snapshot) => {
        this.setState((prevState) => {
          const prizes2 = snapshot.docs.map((prize) => ({
            ...prize.data(),
            id: prize.id,
            tickets: prevState.tickets.filter((ticket) => ticket.prize === prize.id),
          })).sort((a, b) => {
            if (a.title < b.title) {
              return -1;
            }
            return a.title > b.title ? 1 : 0;
          });
          return {
            prizes: prizes2,
          };
        });
      },
      error: (err) => {
        // eslint-disable-next-line no-console
        console.log('Error updating prizes', err);
      },
    });

    this.ticketUpdateUnsubscribe = ticketsRef.onSnapshot({
      next: (snapshot) => {
        this.setState((prevState) => {
          const tickets2 = snapshot.docs.map((ticket) => ({ ...ticket.data(), id: ticket.id }));
          const prizes2 = prevState.prizes.map((prize) => ({
            ...prize,
            tickets: tickets.filter((ticket) => ticket.prize === prize.id),
          })).sort((a, b) => {
            if (a.title < b.title) {
              return -1;
            }
            return a.title > b.title ? 1 : 0;
          });

          return {
            tickets: tickets2,
            prizes: prizes2,
          };
        });
      },
      error: (err) => {
        // eslint-disable-next-line no-console
        console.log('Error updating prizes', err);
      },
    });
  }

  componentWillUnmount() {
    if (this.prizeUpdateUnsubscribe) {
      this.prizeUpdateUnsubscribe();
    }
    if (this.ticketUpdateUnsubscribe) {
      this.ticketUpdateUnsubscribe();
    }
  }

  onPrizeClick = async (prize) => {
    if (prize.tickets.length > 0) {
      const winningTicket = prize.tickets[Math.floor(Math.random() * prize.tickets.length)];

      const userId = winningTicket.user;

      const db = Firebase.firestore();

      const usersRef = db.collection('users');
      const result = await usersRef.where('username', '==', userId).get();

      if (!result.empty) {
        const user = result.docs[0].data();

        this.setState({
          prizeModal: true,
          winnerFirstName: '',
          winnerLastName: '',
        }, () => {
          setTimeout(() => {
            this.setState({
              winnerFirstName: user.firstName,
              winnerLastName: user.lastName,
            });
          }, 2500);
        });
      }
    } else {
      this.setState({
        prizeModal: true,
        winnerFirstName: '',
        winnerLastName: '',
      }, () => {
        setTimeout(() => {
          this.setState({
            winnerFirstName: 'No Tickets',
            winnerLastName: 'Entered',
          });
        }, 2500);
      });
    }
  }

  render() {
    return (
      <div>
        {this.state.prizeModal &&
          <Modal
            fullscreen
            onExit={() => this.setState({ prizeModal: false })}
          >
            <div className={s.modalContentContainer}>
              <Player
                autoPlay
                src="https://firebasestorage.googleapis.com/v0/b/wwcd-f0480.appspot.com/o/videos%2Fdrawing.mp4?alt=media&token=5517d566-52fd-4c00-adbd-fe5c0ac603f4"
              >
                <ControlBar disableCompletely />
              </Player>
              <span className={s.winnerText}>
                {this.state.winnerFirstName}<br />{this.state.winnerLastName}
              </span>
            </div>
          </Modal>
        }
        <Header />
        {this.state.loading && <Loading />}
        <div className={s.contentContainer}>
          <div>
            <div className={s.prizesHeader}>
              <h1>Draw for Prizes</h1>
            </div>
            <div className={s.prizesContainer}>
              {this.state.prizes.map((prize) => (
                <div
                  role="button"
                  tabIndex={-1}
                  key={prize.id}
                  onClick={() => this.onPrizeClick(prize)}
                  onKeyPress={() => {}}
                  className={s.prizeContainer}
                >
                  {
                    prize.image !== '' &&
                    <div className={s.prizeImageContainer}>
                      <img
                        className={s.prizeImage}
                        src={prize.image}
                        alt="Prize"
                      />
                    </div>
                  }
                  <div className={s.prizeInfoContainer}>
                    <h3>{prize.title}</h3>
                    <p>{prize.description}</p>
                  </div>
                  <div className={s.ticketContiner}>
                    <h4># of Tickets:</h4>
                    <h4>{prize.tickets.length}</h4>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default DrawPage;
