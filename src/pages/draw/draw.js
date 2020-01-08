import React, { Component } from 'react';
import styled from 'styled-components';

import { Loading, Card, StackedCard } from '@wedgekit/core';
import Layout from '@wedgekit/layout';
import primitives, { Title, Text } from '@wedgekit/primitives';
import color from '@wedgekit/color';

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

const ImageContainer = styled.div`
  width: 100px;
  height: 100px;
  position: relative;
  
  img {
    width: 100%;
    height: 100%;
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    object-fit: cover;
  }
`;

const TicketCount = styled.span`
  display: block;
  font-size: 48px;
  line-height: 1;
  text-align: center;
  font-weight: 600;
  font-family: ${primitives.fontFamily};
  color: ${color.G500};
`;

class DrawPage extends Component {
  constructor(props) {
    super(props);

    this.state = {
      prizes: [],
      tickets: [],
      users: [],
      winningTicket: null,
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
    let filteredTickets = [];
    if (prize.tickets.length > 0) {
      filteredTickets = prize.tickets.filter((ticket) => !ticket.used);

      if (filteredTickets.length > 0) {
        const winningTicket = filteredTickets[Math.floor(Math.random() * filteredTickets.length)];

        this.setState(({ prizes, tickets }) => ({
          chosenPrize: {
            ...prize,
            tickets: filteredTickets,
          },
          winningTicket,
          prizes: prizes.map((p) => ({
            ...p,
            tickets:
              p.id === winningTicket.prizeId
                ? p.tickets.map((ticket) =>
                    ticket.userId === winningTicket.userId
                      ? {
                          ...ticket,
                          used: true,
                        }
                      : ticket,
                  )
                : p.tickets,
          })),
          tickets: tickets.map((ticket) =>
            ticket.prizeId === winningTicket.prizeId && ticket.userId === winningTicket.userId
              ? { ...ticket, used: true }
              : ticket,
          ),
          prizeModal: true,
        }));
        await Api.post(
          '/tickets/markused',
          JSON.stringify({
            data: {
              attributes: {
                prizeId: winningTicket.prizeId,
                userId: winningTicket.userId,
              },
            },
          }),
          true,
        );
        return; // make sure we return here
      }
    }
    this.setState({
      chosenPrize: {
        ...prize,
        tickets: filteredTickets,
      },
      winningTicket: {
        firstName: 'No Tickets',
        lastName: 'Entered',
      },
      prizeModal: true,
    });
  };

  render() {
    return (
      <div>
        {this.state.prizeModal && (
          <DrawingModal
            winningTicket={this.state.winningTicket}
            users={this.state.users}
            prize={this.state.chosenPrize}
            onExit={() => this.setState({ prizeModal: false })}
          />
        )}
        <Header />
        {this.state.loading && <Loading />}
        <Card className={s.contentContainer}>
          <Layout.Grid columns={[1]} areas={[]} multiplier={3}>
            <Title level={1} elementLevel={1}>Draw for Prizes</Title>
            <Layout.Grid columns={[1]} multiplier={2} areas={[]}>
              {this.state.prizes.map((prize) => (
                <StackedCard
                  role="button"
                  tabIndex={-1}
                  key={prize.id}
                  onClick={() => this.onPrizeClick(prize)}
                  onKeyPress={() => {}}
                  className={s.prizeContainer}
                >
                  <Layout.Grid align="start" columns={['minmax(0, max-content)', 1, 'minmax(0, 160px)']} multiplier={2} areas={[]}>
                    {prize.image !== '' && prize.image != null && (
                      <ImageContainer>
                        <img src={prize.image} alt="Prize" />
                      </ImageContainer>
                    )}
                    <Layout.Grid columns={[1]} areas={[]} multiplier={2}>
                      <Title elementLevel={3} level={3}>{prize.title}</Title>
                      <Text>{prize.description}</Text>
                    </Layout.Grid>
                    <Layout.Grid columns={[1]} areas={[]} multiplier={2} justify="center">
                      <Title elementLevel={4} level={4} style={{ textAlign: 'center' }}># of Tickets:</Title>
                      <TicketCount>{prize.tickets.length}</TicketCount>
                    </Layout.Grid>
                  </Layout.Grid>
                </StackedCard>
              ))}
            </Layout.Grid>
          </Layout.Grid>
        </Card>
      </div>
    );
  }
}

export default DrawPage;
