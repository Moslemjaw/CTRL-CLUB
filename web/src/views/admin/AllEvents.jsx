"use client";

import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import PaginationRounded from "@/components/molecule/PaginationRounded";
import EventCard from "@/components/molecule/EventCard";
import FilterKeys from "@/components/molecule/FilterKeys";
import { deleteEvent, getAllEvents, getCountEvents } from "@/api/events";

const ITEMS_PER_PAGE = 3;
const FILTERS = [
  { value: "all", label: "All Events" },
  { value: "open", label: "Open Events" },
  { value: "closed", label: "Closed Events" },
];

export default function AllEvents() {
  const [filter, setFilter] = useState("open");
  const [eventsData, setEventsData] = useState([]);
  const [eventsCount, setEventsCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    getCountEvents(filter)
      .then(setEventsCount)
      .catch((error) => toast.error(`Error fetching events count: ${error.message}`));
  }, [filter]);

  useEffect(() => {
    getAllEvents(currentPage, filter)
      .then(setEventsData)
      .catch((error) => toast.error(`Error fetching events data: ${error.message}`));
  }, [currentPage, filter]);

  const handleDelete = async (event) => {
    try {
      await deleteEvent(event);
      setEventsData((previous) => previous.filter((item) => item.id !== event.id));
      setEventsCount((previous) => previous - 1);
      toast.success(`Event ${event.title} deleted successfully`);
    } catch (error) {
      toast.error(error.message || "An error occurred");
    }
  };

  const handleFilterChange = (value) => {
    setFilter(value);
    setCurrentPage(1);
  };

  return (
    <div>
      <div className="mb-8 flex flex-col justify-between gap-5 xl:flex-row xl:items-center">
        <h1 className="heading text-4xl md:text-5xl">All Events</h1>
        <FilterKeys label="Filter Events" options={FILTERS} value={filter} onChange={handleFilterChange} />
      </div>
      <div className="space-y-6">
        {eventsData.map((event) => (
          <EventCard
            key={event.id}
            id={event.id}
            image={event.coverImage}
            title={event.title}
            description={event.description}
            date={event.date}
            location={event.location}
            price={event.price}
            capacity={event.capacity}
            availableTickets={event.availableTickets}
            homeTickets={"Admin"}
            handleDelete={() => handleDelete(event)}
          />
        ))}

        {eventsData.length > 0 && (
          <div className="mx-auto mt-20">
            <PaginationRounded
              count={Math.ceil(eventsCount / ITEMS_PER_PAGE)}
              page={currentPage}
              onChange={(_event, value) => setCurrentPage(value)}
            />
          </div>
        )}
      </div>
    </div>
  );
}
