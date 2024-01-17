import React, { Component, useState, useMemo } from 'react';
import { Wheel } from 'react-custom-roulette';
import RoulettePro from 'react-roulette-pro';
import 'react-roulette-pro/dist/index.css';
import PropTypes from 'prop-types';
import Anime from 'react-anime';

import styled from 'styled-components';

import { Button, Modal } from '@wedgekit/core';

import Api from '../../utils/api';

import s from './drawingModal.module.scss';

const TICKET_WIDTH = 100;

const RedrawButton = styled(Button)`
  border-radius: 1rem;
  font-size: 5vh;
  font-weight: lighter;
  line-height: 6vh;
  padding: 1rem;

  :focus,
  :focus-within,
  > *:focus,
  > *:focus-within,
  :focus::after,
  :focus-within::after,
  > *:focus::after,
  > *:focus-within::after {
    border-width: 0;
    outline: none;
  }
`;

const ModalDiv = styled.div`
  position: relative;
  width: 90vw;
  height: 78vh;
`;

const WheelDiv = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  // height: 100%;
  // width: 100%;
`;

class SlotWheel extends Component {
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

    const winner = `${winnerFirstName} ${winnerLastName}`;

    const results = Object.values(
      props.prize.tickets.reduce((obj, item) => {
        obj[item.userId] = obj[item.userId] || { userId: item.userId, count: 0 };
        obj[item.userId].count++;
        return obj;
      }, {}),
    );

    const newResults = results.map((a) => {
      const firstName = this.props.users.find(({ id }) => a.userId === id).firstName;
      const lastName = this.props.users.find(({ id }) => a.userId === id).lastName;
      return { ...a, userName: `${firstName} ${lastName}` };
    });

    const data = newResults.map((a) => {
      return { text: a.userName, id: a.userName, image: props.prize.image };
    });

    const prizeNumber = data.findIndex((a) => a.id === winner);

    console.log('prizeNumber', prizeNumber);
    console.log('data', data);
    console.log('newResults', newResults);
    console.log('results', results);
    console.log('tickets', props.prize);
    console.log('users', props.users);

    this.state = {
      data: data,
      mustSpin: false,
      prizeNumber: prizeNumber,
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
                  delay: Math.random() * 175 + 200,
                  startX: Math.random() * window.innerWidth * 0.9,
                  endXRandom: Math.sin(Math.PI * Math.random()) * 400 - 200,
                  flyingYRandom: Math.random() * 150 + 60,
                  endXRandom2: Math.random() * 300 - 150,
                  flyingYRandom2: Math.random() * 325,
                  randomRotate: Math.floor(Math.random() * 360 + 60),
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

  handleSpinClick = () => {
    if (!this.state.mustSpin) {
      this.setState({ ...this.state, mustSpin: true });
      console.log('mustSpin', this.state.mustSpin);
    }
  };

  // console.log('DATA', this.state.data);
  // console.log('PRIZE', this.state.prizeNumber);

  redraw = () => {
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
            data: data,
            display: true,
            mustSpin: false,
            prizeNumber: prizeNumber,
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
        <ModalDiv>
          {this.state.display && (
            <WheelDiv>
              <RoulettePro
                options={{ withoutAnimation: true }}
                defaultDesignOptions={{ prizesWithText: true }}
                spinningTime={5}
                start={this.state.mustSpin}
                prizes={this.state.data}
                prizeIndex={this.state.prizeNumber}
                onPrizeDefined={() => {
                  window.alert('winner');
                }}
              />
            </WheelDiv>
          )}
        </ModalDiv>
        <button onClick={this.handleSpinClick}>SPIN</button>
        <RedrawButton domain="primary" style={{ margin: 'auto' }} onClick={this.redraw}>
          Redraw
        </RedrawButton>
      </Modal>
    );
  }
}

SlotWheel.propTypes = {
  prize: PropTypes.object.isRequired,
  users: PropTypes.arrayOf(PropTypes.object).isRequired,
  winningTicket: PropTypes.object.isRequired,
  onExit: PropTypes.func.isRequired,
};

export default SlotWheel;
