import * as React from 'react';
import { useState } from 'react';
import { RandomReveal } from 'react-random-reveal';
import s from './slot.module.scss';
import slot from './images/slotMachine.png';
import Avatar from '@material-ui/core/Avatar';
import { makeStyles } from '@material-ui/core';

const SlotMachine = ({ tickets: playerTickets, prizeWinner }) => {
  const [slotWinner, setSlotWinner] = useState('And The Winner Is...');

  const handleComplete = () => {
    setTimeout(() => {
      setSlotWinner(`${prizeWinner.firstName} ${prizeWinner.lastName}`);
    }, 500);

    return { shouldRepeat: false };
  };

  const randomUserOne = Math.floor(Math.random() * playerTickets.length);
  const randomUserTwo = Math.floor(Math.random() * playerTickets.length);

  const useStyles = makeStyles(() => ({
    avatar: {
      height: '80px',
      width: '80px',
      backgroundColor: '#01821d',
      fontSize: '40px',
    },
  }));

  const classes = useStyles();

  const player = (a) => {
    return {
      className: classes.avatar,
      children: a.initials,
      alt: a.initials,
      src: a.user.image,
    };
  };

  const winner = (a) => {
    return {
      className: classes.avatar,
      children: a.initials,
      alt: a.initials,
      src: a.image,
    };
  };

  return (
    <div className={s.slotParent}>
      <div className={s.winner}>{slotWinner}</div>
      <div className={s.emoji}>
        <div className={s.reels}>
          <RandomReveal
            isPlaying={true}
            duration={7}
            updateInterval={0.3}
            revealDuration={0.3}
            characterSet={playerTickets.map((a) => (
              <Avatar {...player(a)} />
            ))}
            characters={[
              <Avatar {...player(playerTickets[randomUserOne])} />,
              <Avatar {...player(playerTickets[randomUserOne])} />,
              <Avatar {...player(playerTickets[randomUserOne])} />,
            ]}
            onComplete={handleComplete}
          />
        </div>
        <div className={s.reels}>
          <RandomReveal
            isPlaying={true}
            duration={7}
            updateInterval={0.3}
            revealDuration={0.3}
            characterSet={playerTickets.map((a) => (
              <Avatar {...player(a)} />
            ))}
            characters={[
              <Avatar {...winner(prizeWinner)} />,
              <Avatar {...winner(prizeWinner)} />,
              <Avatar {...winner(prizeWinner)} />,
            ]}
            onComplete={handleComplete}
          />
        </div>
        <div className={s.reels}>
          <RandomReveal
            isPlaying={true}
            duration={7}
            updateInterval={0.3}
            revealDuration={0.3}
            characterSet={playerTickets.map((a) => (
              <Avatar {...player(a)} />
            ))}
            characters={[
              <Avatar {...player(playerTickets[randomUserTwo])} />,
              <Avatar {...player(playerTickets[randomUserTwo])} />,
              <Avatar {...player(playerTickets[randomUserTwo])} />,
            ]}
            onComplete={handleComplete}
          />
        </div>
      </div>
      <img src={slot} alt="My Image" width={400} className={s.slotMachine} />
    </div>
  );
};

export default SlotMachine;
