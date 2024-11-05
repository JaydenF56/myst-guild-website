import React, { useState, useEffect } from 'react';
import './RaidTimer.css';

// Helper function to format time remaining with days included
const formatTime = (time) => {
  const days = Math.floor(time / (1000 * 60 * 60 * 24));
  const hours = Math.floor((time % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((time % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((time % (1000 * 60)) / 1000);
  return `${days}d ${hours}h ${minutes}m ${seconds}s`;
};

// Raid information (raid name, boss images)
const raids = {
  Tier11: {
    name: "Tier 11",
    bosses: [
      { id: 1, name: "Sinestra", image: `${process.env.PUBLIC_URL}/images/Sinestra-consort.png` },
    ]
  },
  Tier12: {
    name: "Tier 12",
    bosses: [
      { id: 1, name: "Ragnaros", image: `${process.env.PUBLIC_URL}/images/firelands.webp` },
    ]
  }
};

// Function to get current time in AEST
const getAESTTime = () => {
  return new Date(new Date().toLocaleString("en-AU", { timeZone: "Australia/Brisbane" }));
};

const RaidCountdown = () => {
  const [isRaiding, setIsRaiding] = useState(false);
  const [remainingTime, setRemainingTime] = useState(null);
  const [currentRaid, setCurrentRaid] = useState(null);

  // Define start and end times for each raid in AEST
  const raidSchedule = [
    { day: 4, start: '09:00', end: '22:30', raid: 'Tier12' }, // Thursday, Tier 11
    { day: 6, start: '19:30', end: '22:30', raid: 'Tier12' }  // Tuesday, Tier 12
  ];

  const calculateNextRaid = () => {
    const now = getAESTTime();
    let nextRaidStart = null;
    let nextRaidEnd = null;
    let selectedRaid = null;

    for (const raid of raidSchedule) {
      const startDate = new Date(now);
      const [startHour, startMinute] = raid.start.split(':');
      startDate.setHours(startHour, startMinute, 0, 0);

      const endDate = new Date(startDate);
      const [endHour, endMinute] = raid.end.split(':');
      endDate.setHours(endHour, endMinute, 0, 0);

      // Adjust date to next occurrence if today’s raid has already ended
      if (raid.day === now.getDay() && now > endDate) {
        startDate.setDate(startDate.getDate() + 7);
        endDate.setDate(endDate.getDate() + 7);
      } else if (raid.day !== now.getDay()) {
        const daysToAdd = (raid.day - now.getDay() + 7) % 7;
        startDate.setDate(now.getDate() + daysToAdd);
        endDate.setDate(now.getDate() + daysToAdd);
      }

      if (!nextRaidStart || startDate < nextRaidStart) {
        nextRaidStart = startDate;
        nextRaidEnd = endDate;
        selectedRaid = raid;
      }
    }

    setCurrentRaid(raids[selectedRaid.raid]);
    return { nextRaidStart, nextRaidEnd };
  };

  useEffect(() => {
    const { nextRaidStart, nextRaidEnd } = calculateNextRaid();
    let raidInterval;

    const updateRaidStatus = () => {
      const now = getAESTTime();
      const currentlyRaiding = now >= nextRaidStart && now <= nextRaidEnd;

      setIsRaiding(currentlyRaiding);
      setRemainingTime(currentlyRaiding ? null : nextRaidStart - now);

      // If raid ended, calculate the next raid
      if (now > nextRaidEnd && currentlyRaiding) {
        const { nextRaidStart: newRaidStart, nextRaidEnd: newRaidEnd } = calculateNextRaid();
        nextRaidStart = newRaidStart;
        nextRaidEnd = newRaidEnd;
      }
    };

    // Initial update and interval setup
    updateRaidStatus();
    raidInterval = setInterval(updateRaidStatus, 1000);

    return () => clearInterval(raidInterval);
  }, []);

  return (
    <div className="raid-timer-toolbar">
      {(isRaiding || remainingTime > 0) && (
        <>
          <div className="raid-timer-left">
            {isRaiding ? (
              <h2 className="raid-timer-text raiding-active">We are currently raiding!</h2>
            ) : (
              <h2 className="raid-timer-text">
                Raiding in {remainingTime ? formatTime(remainingTime) : ''}
              </h2>
            )}
          </div>

          <div className="raid-timer-right">
            {currentRaid && currentRaid.bosses.map((boss) => (
              <img key={boss.id} src={boss.image} alt={boss.name} className="raid-boss-image" />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default RaidCountdown;
