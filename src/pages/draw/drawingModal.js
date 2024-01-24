import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { Modal } from '@wedgekit/core';

import BowlDrawing from './animations/bowl';

const ANIMATIONS = [BowlDrawing];

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

    const animation = ANIMATIONS[Math.floor(ANIMATIONS.length * Math.random())];
    const { users } = this.props;
    const tickets = props.prize.tickets.map((ticket) => ({
      ...ticket,
      user: users.find(({ id }) => ticket.userId === id),
    }));
    this.state = {
      animation,
      display: true,
      winnerFirstName,
      winnerLastName,
      // Improve performance by only rendering up to 100 tickets, and only one per person. This does not affect winner
      // selection as the winner was already chosen
      tickets:
        tickets.length > 50
          ? Array.from(new Map(tickets.map((t) => [t.user.id, t])).values()).slice(0, 50)
          : tickets,
    };
  }

  shouldComponentUpdate(nextProps, nextState) {
    return this.state !== nextState;
  }

  render() {
    const { animation: Animation, tickets, winnerFirstName, winnerLastName } = this.state;
    const { onExit } = this.props;
    return (
      <Modal fullscreen onExit={onExit}>
        <div style={{ position: 'relative', width: '90vw', height: '60vh' }}>
          {this.state.display && (
            <Animation
              tickets={tickets}
              winnerFirstName={winnerFirstName}
              winnerLastName={winnerLastName}
            />
          )}
        </div>
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
