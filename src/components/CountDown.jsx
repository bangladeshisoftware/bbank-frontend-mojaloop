import { useState, useEffect } from 'react';

function Countdown({ targetDate, onFinish }) {
  const [time, setTime] = useState('');

  useEffect(() => {
    const interval = setInterval(() => {
      const diff = new Date(targetDate) - new Date();
      if (diff <= 0) {
        clearInterval(interval);
        setTime('00:00:00');
        onFinish && onFinish();
        return;
      }
      const h = String(Math.floor(diff / 1000 / 60 / 60)).padStart(2, '0');
      const m = String(Math.floor((diff / 1000 / 60) % 60)).padStart(2, '0');
      const s = String(Math.floor((diff / 1000) % 60)).padStart(2, '0');
      setTime(`${h}:${m}:${s}`);
    }, 1000);

    return () => clearInterval(interval);
  }, [targetDate, onFinish]);

  return <div>{time}</div>;
}

// Usage example:
// <Countdown targetDate="2025-11-04T14:20:49.578Z" onFinish={() => console.log("Done!")} />

export default Countdown