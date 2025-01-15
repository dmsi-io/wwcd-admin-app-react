import React, { Component } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

import { Modal } from '@wedgekit/core';
import Icon, { IconWidth } from '@wedgekit/icons';

import BowlDrawing from './animations/bowl';
import SlotMachine from './animations/slotMachine';

const ANIMATIONS = [BowlDrawing];

const NoDrawingsMsg = styled.div`
  position: relative;
  width: 450px;
  display: flex;
  align-items: center;
  text-align: left;
  font-size: 16px;
  column-gap: 20px;
`;

class DrawingModal extends Component {
  constructor(props) {
    super(props);

    let prizeWinner = {};

    if (props.winningTicket.userId) {
      const found = props.users.find((user) => user.id === props.winningTicket.userId);

      if (found) {
        prizeWinner = {
          firstName: found.firstName,
          lastName: found.lastName,
          initials: `${found.firstName.charAt(0)}${found.lastName.charAt(0)}`,
          image: found.image,
        };
      }
    } else {
      prizeWinner = {
        firstName: 'Player',
        lastName: 'Not Found',
        initials: props.winningTicket.userId,
        image: '',
      };
    }

    const animation = ANIMATIONS[Math.floor(ANIMATIONS.length * Math.random())];
    const { users } = this.props;
    const tickets = props.prize.tickets.map((ticket) => ({
      ...ticket,
      user: users.find(({ id }) => ticket.userId === id),
      initials: `${users.find(({ id }) => ticket.userId === id).firstName.charAt(0)}${users
        .find(({ id }) => ticket.userId === id)
        .lastName.charAt(0)}`,
    }));
    this.state = {
      animation,
      display: true,
      prizeWinner,
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
    const { animation: Animation, prizeWinner, tickets } = this.state;
    const { onExit } = this.props;
    return (
      <Modal fullscreen onExit={onExit}>
        {this.state.display && tickets.length > 0 ? (
          <div style={{ position: 'relative', width: '90vw', height: '80vh' }}>
            {this.state.display && tickets.length > 0 && (
              <SlotMachine tickets={tickets} prizeWinner={prizeWinner} />
            )}
          </div>
        ) : (
          <NoDrawingsMsg>
            <div>
              <IconWidth iconWidth={48}>
                <Icon color="Y500">warning</Icon>
              </IconWidth>
            </div>
            <div>
              There are no more tickets assigned to this prize. Please select a different prize.
            </div>
          </NoDrawingsMsg>
        )}
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
