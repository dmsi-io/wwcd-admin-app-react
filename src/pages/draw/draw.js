import React, { Component } from 'react';

import { Loading } from '@dmsi/wedgekit';

import Header from '../../components/header/header';
import Api from '../../utils/api';

import s from './draw.module.scss';
import DrawingModal from './drawingModal';

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
      users: [],
      loading: true,
    };
  }

  componentDidMount = async () => {
    this.updateSince = new Date();

    Promise.all([Api.get('/prizes'), Api.get('/tickets', true), Api.get('/users', true)]).then(
      ([[prizeErr, prizesRes], [ticketErr, ticketsRes], [userErr, usersRes]]) => {
        if (prizeErr) {
          console.log('Error while getting prizes', prizeErr);
          return;
        }

        if (ticketErr) {
          console.log('Error while getting tickets', ticketErr);
          return;
        }

        if (userErr) {
          console.log('Error while getting users', userErr);
          return;
        }

        console.log(prizesRes, ticketsRes, usersRes);

        const tickets = ticketsRes.data.map(({ attributes }) => attributes);
        const users = usersRes.data.map(({ attributes }) => attributes);

        const prizes = prizesRes.data
          .map(({ attributes }) => ({
            ...attributes,
            tickets: tickets.filter(({ prizeId }) => prizeId === attributes.id),
          }))
          .sort(sortPrizes);

        this.setState({
          loading: false,
          prizes,
          tickets,
          users,
        });

        this.updateTimeout = setTimeout(this.update, 30000);
      },
    );
  };

  componentWillUnmount() {
    if (this.updateTimeout) {
      clearTimeout(this.updateTimeout);
    }
  }

  update = async () => {
    const since = new Date();

    let err;
    let newTickets;

    try {
      [err, newTickets] = await Api.get(`/tickets?since=${this.updateSince}`, true);
    } catch (error) {
      err = error;
    }

    if (err) {
      console.log('Error getting new tickets', err);
    } else {
      this.updateSince = since;

      const tickets = newTickets.data
        .map(({ attributes }) => attributes)
        .filter(({ id }) => !this.state.tickets.some((ticket) => ticket.id === id));

      this.setState(({ prizes, tickets: oldTickets }) => ({
        prizes: prizes.map((prize) => ({
          ...prize,
          tickets: [...prize.tickets, ...tickets.filter(({ prizeId }) => prizeId === prize.id)],
        })),
        tickets: [...oldTickets, ...tickets],
      }));
    }
    this.updateTimeout = setTimeout(this.update, 30000);
  };

  onPrizeClick = async (prize) => {
    this.setState({
      chosenPrize: prize,
      prizeModal: true,
    });
  };

  render() {
    return (
      <div>
        {this.state.prizeModal && (
          <DrawingModal
            users={this.state.users}
            prize={this.state.chosenPrize}
            onExit={() => this.setState({ prizeModal: false })}
          />
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
                  {prize.image !== '' && prize.image != null && (
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
