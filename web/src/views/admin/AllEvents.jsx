"use client";

import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import PaginationRounded from "@/components/molecule/PaginationRounded";
import EventCard from "@/components/molecule/EventCard";
import { deleteEvent, getAllEvents, getCountEvents } from "@/api/events";

const ITEMS_PER_PAGE = 3;

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

  const handleFilterChange = (event) => {
    setFilter(event.target.value);
    setCurrentPage(1);
  };

  return (
    <div className="lg:col-span-3 w-full mx-auto lg:ml-6 bg-white rounded-lg">
      <div className="p-6 border rounded-t-lg">
        <h1 className="text-2xl font-semibold text-blue-900 ">All Events</h1>
      </div>
      <div className="z-10 mt-10 flex justify-center items-center gap-4">
        <label htmlFor="eventFilter" className=" text-black">Filter Events: </label>
        <select
          id="eventFilter"
          value={filter}
          onChange={handleFilterChange}
          className="border border-gray-300 rounded px-2 py-1"
        >
          <option value="all">All Events</option>
          <option value="open">Open Events</option>
          <option value="closed">Closed Events</option>
        </select>
      </div>
      <div className="p-6 space-y-6">
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
