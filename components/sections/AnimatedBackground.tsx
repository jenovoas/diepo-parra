import React from 'react';
import styles from './AnimatedBackground.module.css';

const AnimatedBackground: React.FC = () => {
  return (
    <div className={styles.ocean}>
      <div className={styles.wave}></div>
      <div className={styles.wave}></div>
    </div>
  );
};

export default AnimatedBackground;