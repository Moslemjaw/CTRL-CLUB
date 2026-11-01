"use client";

import "aos/dist/aos.css";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import MyTimer from "@/components/atoms/MyTimer";
import Navbar from "@/components/organism/Navbar";
import ContactForm from "@/components/organism/ContactSection";
import AboutUs from "@/components/organism/AboutUs";
import ButtonComponent from "@/components/atoms/ButtonComponent";
import EventCard from "@/components/molecule/EventCard";
import PaginationRounded from "@/components/molecule/PaginationRounded";
import { useAuth } from "@/components/AuthProvider";
import { getAllEvents, getCountEvents } from "@/api/events";

const ITEMS_PER_PAGE = 3;

export default function Home() {
  const { isLoggedIn, role } = useAuth();
  const [filter, setFilter] = useState("open");
  const [eventsData, setEventsData] = useState([]);
  const [eventsCount, setEventsCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    import("aos").then(({ default: AOS }) => AOS.init());
  }, []);

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

  const handleFilterChange = (event) => {
    setFilter(event.target.value);
    setCurrentPage(1);
  };

  return (
    <div>
      <Navbar />
      <section id="home" className="relative bg-ticket-bg bg-no-repeat bg-cover bg-center w-full h-[90vh] flex items-center">
        <div className="absolute w-full h-full bg-blue-600 bg-opacity-30"></div>

        <div className="relative z-10 text-white flex flex-col justify-center items-center w-full h-full text-center">
          <h1 className="text-2xl md:text-6xl font-black">
            Welcome to <span className="text-base-color">CTRL CLUB</span>
          </h1>
          <h2 className="text-xl md:text-4xl font-black mt-6">
            Discover Our Next Big Event
          </h2>

          <div className="mt-16 text-4xl md:text-6xl">
            <MyTimer />
          </div>

          {!isLoggedIn ? (
            <div className="flex flex-col md:flex-row gap-6 mt-16">
              <ButtonComponent text={"Log In"} path={"/logIn"} />
              <ButtonComponent text={"Sign Up"} path={"/signUp"} />
            </div>
          ) : role !== "scanner" ? (
            <div className="flex flex-col md:flex-row gap-6 mt-16">
              <ButtonComponent text={"My Tickets"} path={"/myTickets"} />
            </div>
          ) : null}
        </div>
      </section>

      <AboutUs />

      <section id="events" className="relative bg-ticket-bg bg-no-repeat bg-cover bg-center w-full">
        <div className="absolute w-full h-full bg-blue-600 bg-opacity-40"></div>
        <div className="max-w-[1300px] mx-auto flex flex-col justify-center items-center">
          <div className="z-10 mt-10 px-4 2xmobile:px-10">
            <div className="border-t-2 border-base-color border-opacity-60 w-44 my-10"></div>
            <h1 className="text-xl xmobile:text-2xl 2xmobile:text-4xl 2md:text-5xl text-gray-800 font-black z-10 text-center">Browse Through Our <span className="text-base-color">Events</span> Here.</h1>
          </div>
          <div className="z-10 mt-10">
            <label htmlFor="eventFilter" className="mr-2 text-white">Filter Events: </label>
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
          <div className="mt-20 grid z-10 px-4 2xmobile:px-10 mb-20 gap-5">
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
                homeTickets={"Home"}
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
      </section>
      <div className="second-section flex max-w-[1300px] mx-auto pt-14 pb-28 gap-6 p-4 overflow-hidden">
        <ContactForm />
      </div>
    </div>
  );
}
