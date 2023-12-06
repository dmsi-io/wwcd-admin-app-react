import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Anime from 'react-anime';

import { Button, Modal } from '@wedgekit/core';
import Icon from '@wedgekit/icons';

import Api from '../../utils/api';

import s from './drawingModal.module.scss';

const TICKET_WIDTH = 100;

class DrawingModal extends Component {
  constructor(props) {
    super(props);

    let winnerFirstName = '';
    let winnerLastName = '';

    if (props.winningTicket.userId) {
      const found = props.users.find((user) => user.id === props.winningTicket.userId);

      if (found) {
        winnerFirstName = found.firstName;
        winnerLastName = found.lastName;
      }
    } else {
      winnerFirstName = props.winningTicket.firstName;
      winnerLastName = props.winningTicket.lastName;
    }

    this.state = {
      display: true,
      winnerFirstName,
      winnerLastName,
      // Improve performance by only rendering up to 100 tickets, and only one per person. This does not affect winner
      // selection as the winner was already chosen
      tickets: Array.from(
        new Map(
          props.prize.tickets.map((ticket) => {
            const user = this.props.users.find(({ id }) => ticket.userId === id);
            return [
              user.id,
              {
                ...ticket,
                user,
                displayData: {
                  delay: Math.random() * 500,
                  startX: Math.random() * window.innerWidth,
                  endXRandom: Math.random() * 400 - 200,
                  flyingYRandom: Math.random() * 100,
                  endXRandom2: Math.random() * 400 - 200,
                  flyingYRandom2: Math.random() * 100,
                  randomRotate: Math.floor(Math.random() * 240 + 120),
                },
              },
            ];
          }),
        ).values(),
      ).slice(0, 100),
    };
  }

  shouldComponentUpdate(nextProps, nextState) {
    return this.state !== nextState;
  }

  redraw = () => {
    console.log('hi');
    this.setState(
      {
        display: false,
      },
      () => {
        const { tickets } = this.props.prize;
        const filteredTickets = tickets.filter((ticket) => !ticket.used);
        const newWinner = filteredTickets[Math.floor(Math.random() * filteredTickets.length)];
        const found = this.props.users.find((user) => user.id === newWinner.userId);
        Api.post(
          '/tickets/markused',
          JSON.stringify({
            data: {
              attributes: {
                prizeId: newWinner.prizeId,
                userId: newWinner.userId,
              },
            },
          }),
          true,
        );
        setTimeout(() => {
          this.setState({
            display: true,
            winnerFirstName: found.firstName,
            winnerLastName: found.lastName,
          });
        }, 50);
      },
    );
  };

  render() {
    const { onExit } = this.props;
    return (
      <Modal fullscreen onExit={onExit}>
        <div style={{ position: 'relative', width: '100vw', height: '90vh' }}>
          {this.state.display && (
            <>
              <Anime
                key="1"
                translateX={[
                  {
                    duration: 1000,
                    easing: 'easeInOutQuad',
                    value: (e, i) =>
                      window.innerWidth / 2 -
                      TICKET_WIDTH / 2 -
                      this.state.tickets[i].displayData.startX +
                      this.state.tickets[i].displayData.endXRandom,
                    delay: (e, i) => this.state.tickets[i].displayData.delay,
                  },
                  {
                    delay: 0,
                    duration: 0,
                    easing: 'linear',
                    value: (e, i) =>
                      window.innerWidth / 2 -
                      TICKET_WIDTH / 2 -
                      this.state.tickets[i].displayData.startX +
                      Math.abs(this.state.tickets[i].displayData.endXRandom + 100) -
                      100,
                  },
                  {
                    delay: 700,
                    duration: 1000,
                    easing: 'linear',
                    value: (e, i) =>
                      window.innerWidth / 2 -
                      TICKET_WIDTH / 2 -
                      this.state.tickets[i].displayData.startX +
                      -Math.abs(this.state.tickets[i].displayData.endXRandom - 100) +
                      100,
                  },
                  {
                    delay: 0,
                    duration: 0,
                    easing: 'linear',
                    value: (e, i) =>
                      window.innerWidth / 2 -
                      TICKET_WIDTH / 2 -
                      this.state.tickets[i].displayData.startX +
                      -Math.abs(this.state.tickets[i].displayData.endXRandom2 - 100) +
                      100,
                  },
                  {
                    delay: 500,
                    duration: 1000,
                    easing: 'linear',
                    value: (e, i) =>
                      window.innerWidth / 2 -
                      TICKET_WIDTH / 2 -
                      this.state.tickets[i].displayData.startX +
                      Math.abs(this.state.tickets[i].displayData.endXRandom2 + 100) -
                      100,
                  },
                ]}
                translateY={[
                  {
                    duration: 800,
                    easing: 'easeInOutQuad',
                    value: '300px',
                    delay: (e, i) => this.state.tickets[i].displayData.delay,
                  },
                  {
                    duration: 200,
                    easing: 'linear',
                    value: '400px',
                    delay: 0,
                  },
                  {
                    delay: 700,
                    duration: 400,
                    value: (e, i) => 200 - this.state.tickets[i].displayData.flyingYRandom,
                    easing: 'easeOutCubic',
                  },
                  {
                    delay: 100,
                    duration: 500,
                    value: '400px',
                    easing: 'easeInCubic',
                  },
                  {
                    delay: 500,
                    duration: 400,
                    value: (e, i) => 200 - this.state.tickets[i].displayData.flyingYRandom2,
                    easing: 'easeOutCubic',
                  },
                  {
                    delay: 100,
                    duration: 500,
                    value: '400px',
                    easing: 'easeInCubic',
                  },
                ]}
                rotate={[
                  {
                    duration: 1500,
                    easing: 'easeInOutQuad',
                    value: (e, i) => `-${this.state.tickets[i].displayData.randomRotate}deg`,
                    delay: (e, i) => 1200 + this.state.tickets[i].displayData.delay,
                  },
                  {
                    duration: 1500,
                    easing: 'easeInOutQuad',
                    value: '0deg',
                    delay: (e, i) => this.state.tickets[i].displayData.delay,
                  },
                ]}
                easing="easeInOutQuad"
                duration={1000}
                direction="normal"
              >
                {this.state.tickets.map((ticket) => {
                  return (
                    <div
                      key={ticket.id}
                      className={s.animatedContainer}
                      style={{
                        left: ticket.displayData.startX,
                        top: -70,
                      }}
                    >
                      <div>
                        {ticket.user.firstName}
                        <br />
                        {ticket.user.lastName}
                      </div>
                    </div>
                  );
                })}
              </Anime>
              <Anime
                key="4"
                delay={5000}
                translateY={-280}
                easing="easeOutCirc"
                direction="normal"
                scale={[1, 1, 6]}
              >
                <div
                  className={s.animatedContainer}
                  style={{
                    left: window.innerWidth / 2 - TICKET_WIDTH / 2,
                    top: '400px',
                  }}
                >
                  <div>
                    {this.state.winnerFirstName}
                    <br />
                    {this.state.winnerLastName}
                  </div>
                </div>
              </Anime>
              <Anime
                key="5"
                rotate={[
                  {
                    value: '12deg',
                    easing: 'linear',
                    delay: 1200,
                    duration: 500,
                  },
                  {
                    value: '0deg',
                    easing: 'easeOutElastic',
                    delay: 0,
                    duration: 700,
                  },
                  {
                    value: '-12deg',
                    easing: 'linear',
                    delay: 250,
                    duration: 500,
                  },
                  {
                    value: '0deg',
                    easing: 'easeOutElastic',
                    delay: 0,
                    duration: 700,
                  },
                ]}
              >
                <div className={s.bowlBackground} onClick={this.redraw}>
                  <div className={s.bowl}>
                    <div />
                    <span>DMSi Holiday Party</span>
                  </div>
                </div>
              </Anime>
            </>
          )}
        </div>
        <Button domain="primary" style={{ margin: 'auto' }} onClick={this.redraw}>
          Redraw
        </Button>
      </Modal>
    );
  }
}

DrawingModal.propTypes = {
  prize: PropTypes.object.isRequired,
  users: PropTypes.arrayOf(PropTypes.object).isRequired,
  winningTicket: PropTypes.object.isRequired,
  onExit: PropTypes.func.isRequired,
};

export default DrawingModal;
