import React, { useState } from 'react';
import Anime from 'react-anime';
import s from './bowl.module.scss';

const TICKET_SCALE = 5;
// vw
const TICKET_WIDTH = 8;
const STARTING_HEIGHT = 50;

const BowlDrawing = ({ tickets: propTickets, winnerFirstName, winnerLastName }) => {
  const [tickets] = useState(() => {
    return propTickets.map((ticket) => ({
      ...ticket,
      displayData: {
        delay: Math.random() * 175 + 200,
        startX: Math.random() * 30 + 50,
        endXRandom: Math.sin(Math.PI * Math.random()) * 3,
        flyingYRandom: Math.random() * 30 + 2,
        endXRandom2: Math.random() * 5,
        flyingYRandom2: Math.random() * 20,
        randomRotate: Math.floor(Math.random() * 360 + 60),
      },
    }));
  });
  return (
    <>
      <Anime
        key="1"
        translateX={[
          {
            duration: 1000,
            easing: 'easeInOutQuad',
            value: (e, i) => `${TICKET_WIDTH / 2 + tickets[i].displayData.startX}vh`,
            delay: (e, i) => tickets[i].displayData.delay,
          },
          {
            delay: 700,
            duration: 1000,
            easing: 'linear',
            value: (e, i) =>
              `${TICKET_WIDTH / 2 +
                tickets[i].displayData.startX -
                Math.abs(tickets[i].displayData.endXRandom)}vh`,
          },
          {
            delay: 0,
            duration: 0,
            easing: 'linear',
            value: (e, i) =>
              `${TICKET_WIDTH / 2 +
                tickets[i].displayData.startX -
                Math.abs(tickets[i].displayData.endXRandom2) -
                7}vh`,
          },
          {
            delay: 500,
            duration: 1000,
            easing: 'linear',
            value: (e, i) =>
              `${TICKET_WIDTH / 2 +
                tickets[i].displayData.startX +
                Math.abs(tickets[i].displayData.endXRandom2) -
                7}vh`,
          },
        ]}
        translateY={[
          {
            duration: 1000,
            easing: 'easeInOutQuad',
            value: `${STARTING_HEIGHT}vh`,
            delay: (e, i) => tickets[i].displayData.delay,
          },
          {
            delay: 700,
            duration: 400,
            value: (e, i) => `${STARTING_HEIGHT - tickets[i].displayData.flyingYRandom}vh`,
            easing: 'easeOutCubic',
          },
          {
            delay: 100,
            duration: 500,
            value: `${STARTING_HEIGHT}vh`,
            easing: 'easeInCubic',
          },
          {
            delay: 500,
            duration: 400,
            value: (e, i) => `${STARTING_HEIGHT - tickets[i].displayData.flyingYRandom2}vh`,
            easing: 'easeOutCubic',
          },
          {
            delay: 100,
            duration: 500,
            value: `${STARTING_HEIGHT}vh`,
            easing: 'easeInCubic',
          },
        ]}
        rotate={[
          {
            duration: 1500,
            easing: 'easeInOutQuad',
            value: (e, i) => `-${tickets[i].displayData.randomRotate}deg`,
            delay: (e, i) => 1200 + tickets[i].displayData.delay,
          },
          {
            duration: 1500,
            easing: 'easeInOutQuad',
            value: '0deg',
            delay: (e, i) => tickets[i].displayData.delay,
          },
        ]}
        easing="easeInOutQuad"
        duration={1000}
        direction="normal"
      >
        {tickets.map((ticket) => {
          return (
            <div
              key={ticket.id}
              className={s.animatedContainer}
              style={{
                left: ticket.displayData.startX,
                top: -70,
              }}
            >
              {ticket.user.firstName}
              <br />
              {ticket.user.lastName}
            </div>
          );
        })}
      </Anime>
      <Anime
        key="4"
        translateX={`${60 - (TICKET_WIDTH / 2) * TICKET_SCALE}vw`}
        translateY={[
          {
            delay: 0,
            duration: 0,
            value: `${STARTING_HEIGHT + 4}vh`,
          },
          {
            delay: 5000,
            duration: 1000,
            easing: 'easeOutCirc',
            value: `${STARTING_HEIGHT - 35.5}vh`,
          },
        ]}
        scale={[
          {
            delay: 0,
            duration: 0,
            value: 0,
          },
          {
            delay: 5000,
            duration: 1000,
            easing: 'easeOutCirc',
            value: TICKET_SCALE,
          },
        ]}
        direction="normal"
      >
        <div className={s.animatedContainer}>
          {winnerFirstName}
          <br />
          {winnerLastName}
        </div>
      </Anime>
      <Anime
        key="5"
        translateY={`${STARTING_HEIGHT - 25}vh`}
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
            <div>❅ ❅ ❅ ❅ ❅ ❅ ❅ ❅ ❅ ❅ ❅ ❅ ❅ ❅ ❅ ❅ ❅ ❅ ❅ ❅ ❅ ❅ ❅ ❅ ❅ ❅ ❅ ❅ ❅ ❅ ❅ ❅ ❅ ❅ ❅ ❅ ❅ ❅ ❅</div>
            <span>❅ DMSi Holiday Party ❅</span>
          </div>
        </div>
      </Anime>
    </>
  );
};

export default BowlDrawing;
