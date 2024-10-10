import React, { useState, useEffect } from 'react';
import './RaidTimer.css'; // Make sure to import the CSS

// Helper function to format time remaining with days included
const formatTime = (time) => {
  const days = Math.floor(time / (1000 * 60 * 60 * 24));
  const hours = Math.floor((time % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((time % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((time % (1000 * 60)) / 1000);
  return `${days}d ${hours}h ${minutes}m ${seconds}s`;
};

// Array for raid information (raid name, boss images)
const raids = {
  Tier11: {
    name: "Tier 11",
    bosses: [
      { id: 1, name: "Sinestra", image: `${process.env.PUBLIC_URL}/images/Sinestra-consort.png` },
      { id: 2, name: "Al'Akir", image: `${process.env.PUBLIC_URL}/images/Al'Akir_Cataclysm.webp` }
    ]
  },
  Tier12: {
    name: "Tier 12",
    bosses: [
      { id: 1, name: "Ragnaros", image: `${process.env.PUBLIC_URL}/images/Ragnaros-raid.png` },

    ]
  }
  // Add more raid tiers here...
};

const RaidCountdown = () => {
  const [nextRaid, setNextRaid] = useState(null);
  const [isRaiding, setIsRaiding] = useState(false);
  const [remainingTime, setRemainingTime] = useState(null);
  const [currentRaid, setCurrentRaid] = useState(null); // Track current raid tier

  // Default raid times with raid information
  const defaultRaids = [
    { day: 4, time: '19:30', duration: 3, raid: 'Tier12' }, // Thursday, Tier 11
  ];

  const customRaids = [
    { day: 2, time: '20:00', duration: 2.5, raid: 'Tier12' }, // Custom raid on Tuesday
  ];

  const calculateNextRaid = () => {
    const now = new Date();
    let nextRaidTime = null;
    let selectedRaid = null; // Track the associated raid

    const allRaids = [...defaultRaids, ...customRaids];

    for (const raid of allRaids) {
      const nextDate = new Date(now);
      const [hour, minute] = raid.time.split(':');
      nextDate.setHours(hour, minute, 0, 0);

      // If raid is scheduled for today but current time is past, move to next week
      if (raid.day === now.getDay() && now > nextDate) {
        nextDate.setDate(nextDate.getDate() + 7);
      }

      // Set the next raid based on the closest day of the week
      if (raid.day > now.getDay()) {
        nextDate.setDate(now.getDate() + (raid.day - now.getDay()));
      }
      if (raid.day < now.getDay()) {
        nextDate.setDate(now.getDate() + (7 - (now.getDay() - raid.day)));
      }

      // Determine if this is the next raid time
      if (!nextRaidTime || nextDate < nextRaidTime) {
        nextRaidTime = nextDate;
        selectedRaid = raid.raid; // Save the associated raid
      }
    }

    setCurrentRaid(raids[selectedRaid]); // Set the current raid based on the selected raid tier
    return nextRaidTime;
  };

  const checkIfRaiding = (raidTime) => {
    const now = new Date();
    const raidEndTime = new Date(raidTime);
    raidEndTime.setHours(raidEndTime.getHours() + 3);

    if (now >= raidTime && now <= raidEndTime) {
      setIsRaiding(true);
    } else {
      setIsRaiding(false);
    }
  };

  useEffect(() => {
    const nextRaidTime = calculateNextRaid();
    setNextRaid(nextRaidTime);

    const interval = setInterval(() => {
      const now = new Date();
      const timeDifference = nextRaidTime - now;

      if (timeDifference <= 0) {
        checkIfRaiding(nextRaidTime);
      } else {
        setRemainingTime(timeDifference);
      }

      if (now > nextRaidTime && !isRaiding) {
        clearInterval(interval);
        setNextRaid(calculateNextRaid());
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isRaiding]);

  return (
    <div className="raid-timer-toolbar">
      <div className="raid-timer-left">
        {isRaiding ? (
          <h2 className="raid-timer-text raiding-active">We are currently raiding!</h2>
        ) : (
          <h2 className="raid-timer-text">
            Raiding in {remainingTime ? formatTime(remainingTime) : ''}
          </h2>
        )}
      </div>

      {/* Only display raid bosses when current raid is available */}
      <div className="raid-timer-right">
        {currentRaid && currentRaid.bosses.map((boss) => (
          <img key={boss.id} src={boss.image} alt={boss.name} className="raid-boss-image" />
        ))}
      </div>
    </div>
  );
};

export default RaidCountdown;
