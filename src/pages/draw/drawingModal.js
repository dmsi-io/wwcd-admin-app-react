import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Anime from 'react-anime';

import { Modal } from '@dmsi/wedgekit';

import s from './drawingModal.module.scss';

const TICKET_WIDTH = 50;

class DrawingModal extends Component {
  constructor(props) {
    super(props);

    this.state = {
      winnerFirstName: '',
      winnerLastName: '',
      tickets: props.prize.tickets.map((ticket) => ({
        ...ticket,
        displayData: {
          delay: Math.random() * 500,
          startX: Math.random() * window.innerWidth,
          endXRandom: Math.random() * 300 - 150,
          flyingYRandom: Math.random() * 100 - 50,
          endXRandom2: Math.random() * 400 - 200,
          flyingYRandom2: Math.random() * 100 - 50,
        },
      })),
    };
  }

  componentDidMount() {
    if (this.props.prize.tickets.length > 0) {
      const winningTicket = this.props.prize.tickets[
        Math.floor(Math.random() * this.props.prize.tickets.length)
      ];

      const result = this.props.users.find(({ id }) => winningTicket.userId === id);

      if (result) {
        const user = result;
        // setTimeout(() => {
        //   this.setState({
        //     winnerFirstName: user.firstName,
        //     winnerLastName: user.lastName,
        //   });
        // }, 2500);
      }
    } else {
      // setTimeout(() => {
      //   this.setState({
      //     winnerFirstName: 'No Tickets',
      //     winnerLastName: 'Entered',
      //   });
      // }, 2500);
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    return this.state !== nextState;
  }

  render() {
    const { onExit } = this.props;
    return (
      <Modal fullscreen onExit={onExit}>
        <div key={'keyyyyy'}>
          {this.state.tickets.map((ticket) => {
            const user = this.props.users.find(({ id }) => ticket.userId === id);
            return (
              <Anime
                key={ticket.id}
                translateX={[
                  {
                    duration: 1000,
                    easing: 'easeInOutQuad',
                    value:
                      window.innerWidth / 2 -
                      ticket.displayData.startX +
                      ticket.displayData.endXRandom,
                    delay: ticket.displayData.delay,
                  },
                  {
                    delay: 0,
                    duration: 100,
                    easing: 'linear',
                    value:
                      window.innerWidth / 2 -
                      TICKET_WIDTH / 2 -
                      ticket.displayData.startX +
                      Math.abs(ticket.displayData.endXRandom),
                  },
                  {
                    delay: 400,
                    duration: 1000,
                    easing: 'linear',
                    value:
                      window.innerWidth / 2 -
                      TICKET_WIDTH / 2 -
                      ticket.displayData.startX +
                      -Math.abs(ticket.displayData.endXRandom),
                  },
                  {
                    delay: 0,
                    duration: 100,
                    easing: 'linear',
                    value:
                      window.innerWidth / 2 -
                      TICKET_WIDTH / 2 -
                      ticket.displayData.startX +
                      -Math.abs(ticket.displayData.endXRandom2),
                  },
                  {
                    delay: 400,
                    duration: 1000,
                    easing: 'linear',
                    value:
                      window.innerWidth / 2 -
                      TICKET_WIDTH / 2 -
                      ticket.displayData.startX +
                      Math.abs(ticket.displayData.endXRandom2),
                  },
                ]}
                translateY={[
                  {
                    duration: 1000,
                    easing: 'easeInOutQuad',
                    value: '400px',
                    delay: ticket.displayData.delay,
                  },
                  {
                    delay: 500,
                    duration: 400,
                    value: 200 - ticket.displayData.flyingYRandom,
                    easing: 'easeOutCubic',
                  },
                  {
                    delay: 100,
                    duration: 400,
                    value: '400px',
                    easing: 'easeInCubic',
                  },
                  {
                    delay: 500,
                    duration: 400,
                    value: 200 - ticket.displayData.flyingYRandom2,
                    easing: 'easeOutCubic',
                  },
                  {
                    delay: 100,
                    duration: 400,
                    value: '400px',
                    easing: 'easeInCubic',
                  },
                ]}
                easing="easeInOutQuad"
                duration={1000}
                direction="normal"
                scale={[1, 1]}
              >
                <div
                  className={s.animatedContainer}
                  style={{
                    left: ticket.displayData.startX,
                    top: -70,
                  }}
                >
                  {user.firstName}
                  <br />
                  {user.lastName}
                </div>
              </Anime>
            );
          })}
          <Anime
            key={'5'}
            rotate={[
              {
                value: '12deg',
                easing: 'linear',
                delay: 1000,
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
            <div className={s.bowl} />
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
