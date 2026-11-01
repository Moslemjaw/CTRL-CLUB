"use client";

import { useState, useEffect } from "react";
import { useTimer } from "react-timer-hook";
import { getClosestEvent } from "@/api/events";

function Countdown({ expiryTimestamp }) {
  const { seconds, minutes, hours, days } = useTimer({ expiryTimestamp });

  return (
    <div data-aos="zoom-in" data-aos-duration="2000" style={{ textAlign: "center" }}>
      <div className="xmobile:flex gap-5 2xmobile:gap-10 text-[50px] 2xmobile:text-[80px] md:text-[100px] 2md:gap-20 text-center">
        <div className="flex gap-5 2xmobile:gap-10 2md:gap-20 justify-center">
          <span>{days}<p className="text-lg md:text-2xl font-black">Days</p></span>
          <span>{hours}<p className="text-lg md:text-2xl font-black">Hours</p></span>
        </div>
        <div className="flex gap-5 2xmobile:gap-10 2md:gap-20 justify-center">
          <span>{minutes}<p className="text-lg md:text-2xl font-black">Minutes</p></span>
          <span>{seconds}<p className="text-lg md:text-2xl font-black">Seconds</p></span>
        </div>
      </div>
    </div>
  );
}

export default function MyTimer() {
  const [eventDate, setEventDate] = useState(null);
  const [noEventsMessage, setNoEventsMessage] = useState("");

  useEffect(() => {
    getClosestEvent()
      .then((event) => {
        if (event) setEventDate(new Date(event.date));
        else setNoEventsMessage("There are no upcoming events.");
      })
      .catch(() => setNoEventsMessage("Server Error"));
  }, []);

  if (noEventsMessage) {
    return <p className="2xmobile:text-lg text-white md:text-2xl font-black z-10 mt-7">{noEventsMessage}</p>;
  }

  if (!eventDate) {
    return <p className="2xmobile:text-lg text-white md:text-2xl font-black z-10 mt-7">Loading...</p>;
  }

  return (
    <div className="z-10">
      <Countdown expiryTimestamp={eventDate} />
    </div>
  );
}
