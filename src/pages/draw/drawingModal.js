import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Anime from 'react-anime';

import { Modal } from '@dmsi/wedgekit';

import s from './drawingModal.module.scss';

const TICKET_WIDTH = 100;

class DrawingModal extends Component {
  constructor(props) {
    super(props);

    let winnerFirstName = '';
    let winnerLastName = '';

    if (this.props.prize.tickets.length > 0) {
      const winningTicket = this.props.prize.tickets[
        Math.floor(Math.random() * this.props.prize.tickets.length)
      ];

      const result = this.props.users.find(({ id }) => winningTicket.userId === id);

      if (result) {
        winnerFirstName = result.firstName;
        winnerLastName = result.lastName;
      }
    } else {
      winnerFirstName = 'No Tickets';
      winnerLastName = 'Entered';
    }

    this.state = {
      winnerFirstName,
      winnerLastName,
      tickets: props.prize.tickets.map((ticket) => ({
        ...ticket,
        displayData: {
          delay: Math.random() * 500,
          startX: Math.random() * window.innerWidth,
          endXRandom: Math.random() * 400 - 200,
          flyingYRandom: Math.random() * 100,
          endXRandom2: Math.random() * 400 - 200,
          flyingYRandom2: Math.random() * 100,
          randomRotate: Math.floor(Math.random() * 240 + 120),
        },
      })),
    };
  }

  shouldComponentUpdate(nextProps, nextState) {
    return this.state !== nextState;
  }

  render() {
    const { onExit } = this.props;
    return (
      <Modal fullscreen onExit={onExit}>
        <div>
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
              const user = this.props.users.find(({ id }) => ticket.userId === id);
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
                    {user.firstName}
                    <br />
                    {user.lastName}
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
            <div className={s.bowlBackground}>
              <div className={s.bowl}>
                <div />
                <span>DMSi Christmas Party</span>
              </div>
            </div>
          </Anime>
        </div>
      </Modal>
    );
  }
}

DrawingModal.propTypes = {
  prize: PropTypes.object.isRequired,
  users: PropTypes.arrayOf(PropTypes.object).isRequired,
  onExit: PropTypes.func.isRequired,
};

export default DrawingModal;
