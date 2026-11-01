"use client";

import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import TicketCard from "@/components/molecule/TicketCard";
import PaginationRounded from "@/components/molecule/PaginationRounded";
import { useAuth } from "@/components/AuthProvider";
import { getCountUserTickets, getTicketsByUserId } from "@/api/tickets";

const ITEMS_PER_PAGE = 6;

export default function MyTickets() {
  const { userData } = useAuth();
  const userId = userData?.id;
  const [filter, setFilter] = useState("unused");
  const [ticketsData, setTicketsData] = useState([]);
  const [ticketsCount, setTicketsCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    getCountUserTickets(filter, userId)
      .then(setTicketsCount)
      .catch((error) => toast.error(`Error fetching tickets count: ${error.message}`));
  }, [filter, userId]);

  useEffect(() => {
    getTicketsByUserId(userId, currentPage, filter)
      .then(setTicketsData)
      .catch((error) => {
        toast.error(`Failed to fetch tickets: ${error.message}`);
        setTicketsData([]);
      });
  }, [currentPage, filter, userId]);

  const handleFilterChange = (event) => {
    setFilter(event.target.value);
    setCurrentPage(1);
  };

  return (
    <section id="events" className="relative bg-ticket-bg bg-no-repeat bg-cover bg-center w-full">
      <div className="absolute w-full h-full bg-blue-600 bg-opacity-40"></div>
      <div className="max-w-[1300px] mx-auto flex flex-col justify-center items-center">
        <div className="z-10 mt-10 px-4 2xmobile:px-10">
          <div className="border-t-2 border-base-color border-opacity-60 w-44 my-10"></div>
          <h1 className="text-xl xmobile:text-2xl 2xmobile:text-4xl 2md:text-5xl text-gray-800 font-black z-10 text-center">My Tic<span className="text-base-color">ke</span>ts</h1>
        </div>
        <div className="z-10 mt-10">
          <label htmlFor="eventFilter" className="mr-2 text-white">Filter Events: </label>
          <select
            id="eventFilter"
            value={filter}
            onChange={handleFilterChange}
            className="border border-gray-300 rounded px-2 py-1"
          >
            <option value="all">All Tickets</option>
            <option value="unused">Unused Tickets</option>
            <option value="used">Used Tickets</option>
          </select>
        </div>
        <div className="mt-20 grid md:grid-cols-2 slg:grid-cols-3 z-10 px-4 2xmobile:px-10 mb-20 gap-5 lg:gap-10 xl:gap-20">
          {ticketsData.length > 0 ? (
            ticketsData.map((ticket) => (
              <TicketCard
                key={ticket.id}
                qrId={ticket.qrId}
                eventId={ticket.eventId}
                title={ticket.title}
                date={ticket.date}
                location={ticket.location}
                status={ticket.status}
              />
            ))
          ) : (
            <p className="text-gray-600 text-center">No tickets found.</p>
          )}
        </div>
        {ticketsData.length > 0 && (
          <div className="mx-auto mb-20 z-10">
            <PaginationRounded
              count={Math.ceil(ticketsCount / ITEMS_PER_PAGE)}
              page={currentPage}
              onChange={(_event, value) => setCurrentPage(value)}
            />
          </div>
        )}
      </div>
    </section>
  );
}
