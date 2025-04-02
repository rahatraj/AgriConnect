import React, { useEffect, useState } from "react";
import moment from "moment";

function BiddingStatus({ deadline }) {
  const calculateTimeLeft = () => {
    const now = moment();
    const end = moment(deadline);
    const diff = moment.duration(end.diff(now));

    if (diff.asSeconds() <= 0) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true };
    }

    return {
      days: Math.floor(diff.asDays()),
      hours: diff.hours(),
      minutes: diff.minutes(),
      seconds: diff.seconds(),
      expired: false,
    };
  };

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [deadline]);

  return (
    <div className="card p-5 rounded-xl text-center">
      <h3 className="text-xl font-semibold text-primary mb-3">Bidding Status</h3>

      {timeLeft.expired ? (
        <p className="text-red-600 text-2xl font-bold">Bidding Closed</p>
      ) : (
        <div className="flex flex-wrap justify-center gap-2 text-white text-lg font-bold">
          <span className="badge badge-success px-4 py-2">{timeLeft.days}d</span>
          <span className="badge badge-info px-4 py-2">{timeLeft.hours}h</span>
          <span className="badge badge-warning px-4 py-2">{timeLeft.minutes}m</span>
          <span className="badge badge-error px-4 py-2">{timeLeft.seconds}s</span>
        </div>
      )}
    </div>
  );
}

export default BiddingStatus;
