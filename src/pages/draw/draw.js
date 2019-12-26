import React, { Component } from 'react';
import { Player, ControlBar } from 'video-react';

import { Loading, Modal } from '@dmsi/wedgekit';

import Header from '../../components/header/header';
import Api from '../../utils/api';

import s from './draw.module.scss';

const sortPrizes = (a, b) => {
  if (a.title < b.title) {
    return -1;
  }
  return a.title > b.title ? 1 : 0;
};

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

    const prizeInitialLoadPromise = new Promise((resolve) => {
      const prizesRef = db.collection('prizes');

      this.prizeUpdateUnsubscribe = prizesRef.onSnapshot({
        next: (snapshot) => {
          this.setState((prevState) => {
            const prizes = snapshot.docs
              .map((prize) => ({
                ...prize.data(),
                id: prize.id,
                tickets: prevState.tickets.filter((ticket) => ticket.prize.id === prize.id),
              }))
              .sort(sortPrizes);
            return {
              prizes,
            };
          }, resolve);
        },
        error: (err) => {
          // eslint-disable-next-line no-console
          console.log('Error updating prizes', err);
        },
      });
    });

    const ticketInitialLoadPromise = new Promise((resolve) => {
      const ticketsRef = db.collection('tickets');

      this.ticketUpdateUnsubscribe = ticketsRef.onSnapshot({
        next: (snapshot) => {
          this.setState((prevState) => {
            const tickets = snapshot.docs.map((ticket) => ({ ...ticket.data(), id: ticket.id }));
            const prizes = prevState.prizes
              .map((prize) => ({
                ...prize,
                tickets: tickets.filter((ticket) => ticket.prize.id === prize.id),
              }))
              .sort(sortPrizes);

            return {
              tickets,
              prizes,
            };
          }, resolve);
        },
        error: (err) => {
          // eslint-disable-next-line no-console
          console.log('Error updating prizes', err);
        },
      });
    });

    Promise.all([prizeInitialLoadPromise, ticketInitialLoadPromise]).then(() => {
      this.setState({ loading: false });
    });
  };

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

      const result = await winningTicket.user.get();

      if (result.exists) {
        const user = result.data();

        this.setState(
          {
            prizeModal: true,
            winnerFirstName: '',
            winnerLastName: '',
          },
          () => {
            setTimeout(() => {
              this.setState({
                winnerFirstName: user.firstName,
                winnerLastName: user.lastName,
              });
            }, 2500);
          },
        );
      }
    } else {
      this.setState(
        {
          prizeModal: true,
          winnerFirstName: '',
          winnerLastName: '',
        },
        () => {
          setTimeout(() => {
            this.setState({
              winnerFirstName: 'No Tickets',
              winnerLastName: 'Entered',
            });
          }, 2500);
        },
      );
    }
  };

  render() {
    return (
      <div>
        {this.state.prizeModal && (
          <Modal fullscreen onExit={() => this.setState({ prizeModal: false })}>
            <div className={s.modalContentContainer}>
              <Player
                autoPlay
                src="https://firebasestorage.googleapis.com/v0/b/wwcd-f0480.appspot.com/o/videos%2Fdrawing.mp4?alt=media&token=5517d566-52fd-4c00-adbd-fe5c0ac603f4"
              >
                <ControlBar disableCompletely />
              </Player>
              <span className={s.winnerText}>
                {this.state.winnerFirstName}
                <br />
                {this.state.winnerLastName}
              </span>
            </div>
          </Modal>
        )}
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
                  {prize.image !== '' && (
                    <div className={s.prizeImageContainer}>
                      <img className={s.prizeImage} src={prize.image} alt="Prize" />
                    </div>
                  )}
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
