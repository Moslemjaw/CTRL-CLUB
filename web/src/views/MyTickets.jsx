"use client";

import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { toast } from "react-toastify";
import TicketCard from "@/components/molecule/TicketCard";
import PaginationRounded from "@/components/molecule/PaginationRounded";
import FilterKeys from "@/components/molecule/FilterKeys";
import ButtonComponent from "@/components/atoms/ButtonComponent";
import { useAuth } from "@/components/AuthProvider";
import { getCountUserTickets, getTicketsByUserId } from "@/api/tickets";

const ITEMS_PER_PAGE = 6;
const FILTERS = [
  { value: "all", label: "All Tickets" },
  { value: "unused", label: "Unused" },
  { value: "used", label: "Used" },
];

export default function MyTickets() {
  const reduced = useReducedMotion();
  const { userData } = useAuth();
  const userId = userData?.id;
  const [filter, setFilter] = useState("unused");
  const [ticketsData, setTicketsData] = useState([]);
  const [ticketsCount, setTicketsCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [loaded, setLoaded] = useState(false);

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
      })
      .finally(() => setLoaded(true));
  }, [currentPage, filter, userId]);

  const handleFilterChange = (value) => {
    setFilter(value);
    setCurrentPage(1);
  };

  return (
    <main className="page-bg relative min-h-screen px-5 pb-16 pt-10 lg:pt-16">
      <div className="page-enter mx-auto max-w-[1300px]">
        <div className="flex flex-col justify-between gap-7 lg:flex-row lg:items-end">
          <div>
            <p className="eyebrow mb-4">{userData?.name}</p>
            <h1 className="heading text-5xl md:text-7xl">My Tickets</h1>
          </div>
          <FilterKeys label="Filter Tickets" options={FILTERS} value={filter} onChange={handleFilterChange} />
        </div>

        <div className="mt-12 grid justify-items-center gap-6 md:grid-cols-2 slg:grid-cols-3 lg:mt-16 lg:gap-8">
          {ticketsData.map((ticket, index) => (
            <motion.div
              key={ticket.id}
              initial={reduced ? false : { opacity: 0, y: 60, rotate: index % 2 ? 3 : -3 }}
              animate={{ opacity: 1, y: 0, rotate: 0 }}
              transition={{ duration: 0.8, delay: index * 0.08, ease: [0.16, 1, 0.3, 1] }}
              className="w-full max-w-sm"
            >
              <TicketCard qrId={ticket.qrId} eventId={ticket.eventId} title={ticket.title} date={ticket.date} location={ticket.location} status={ticket.status} />
            </motion.div>
          ))}
        </div>

        {loaded && ticketsData.length === 0 && (
          <div className="rounded-3xl border border-dashed border-sky/30 px-6 py-20 text-center">
            <p className="heading mb-6 text-3xl">No tickets found.</p>
            <ButtonComponent text="Browse Events" path="/" />
          </div>
        )}

        {ticketsData.length > 0 && (
          <PaginationRounded count={Math.ceil(ticketsCount / ITEMS_PER_PAGE)} page={currentPage} onChange={(_event, value) => setCurrentPage(value)} />
        )}
      </div>
    </main>
  );
}
