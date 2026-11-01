"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion, useScroll } from "motion/react";
import { toast } from "react-toastify";
import Hero from "@/components/organism/Hero";
import Navbar from "@/components/organism/Navbar";
import AboutUs from "@/components/organism/AboutUs";
import Marquee from "@/components/organism/Marquee";
import ContactForm from "@/components/organism/ContactSection";
import EventCard from "@/components/molecule/EventCard";
import FilterKeys from "@/components/molecule/FilterKeys";
import PaginationRounded from "@/components/molecule/PaginationRounded";
import SignalField from "@/components/brand/SignalField";
import SmoothScroll from "@/components/brand/SmoothScroll";
import { getAllEvents, getCountEvents } from "@/api/events";

const ITEMS_PER_PAGE = 3;
const FILTERS = [
  { value: "all", label: "All Events" },
  { value: "open", label: "Open Events" },
  { value: "closed", label: "Closed Events" },
];

export default function Home() {
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll();
  const [filter, setFilter] = useState("open");
  const [eventsData, setEventsData] = useState([]);
  const [eventsCount, setEventsCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    getCountEvents(filter)
      .then(setEventsCount)
      .catch((error) => toast.error(`Error fetching events count: ${error.message}`));
  }, [filter]);

  useEffect(() => {
    getAllEvents(currentPage, filter)
      .then(setEventsData)
      .catch((error) => toast.error(`Error fetching events data: ${error.message}`))
      .finally(() => setLoaded(true));
  }, [currentPage, filter]);

  const handleFilterChange = (value) => {
    setFilter(value);
    setCurrentPage(1);
  };

  return (
    <div>
      <SmoothScroll />
      <motion.div style={{ scaleX: scrollYProgress }} className="fixed inset-x-0 top-0 z-[200] h-0.5 origin-left bg-sky" aria-hidden="true" />
      <Navbar />
      <main>
        <Hero />
        <AboutUs />
        <Marquee />

        <section id="events" className="relative overflow-hidden bg-navy-deep px-5 py-24 lg:py-36">
          <SignalField density={0.8} opacity={0.75} />
          <div className="relative mx-auto max-w-[1300px]">
            <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
              <div>
                <p className="eyebrow mb-4">Events</p>
                <h2 className="heading text-5xl md:text-6xl xl:text-7xl">Browse Through<br />Our Events Here.</h2>
              </div>
              <FilterKeys label="Filter Events" options={FILTERS} value={filter} onChange={handleFilterChange} />
            </div>

            <div className="mt-14 grid gap-6 lg:mt-20">
              <AnimatePresence mode="popLayout" initial={false}>
                {eventsData.map((event, index) => (
                  <motion.div
                    key={event.id}
                    layout={!reduced}
                    initial={reduced ? false : { opacity: 0, y: 50, rotateX: -8 }}
                    animate={{ opacity: 1, y: 0, rotateX: 0 }}
                    exit={{ opacity: 0, scale: 0.97 }}
                    transition={{ duration: 0.8, delay: index * 0.08, ease: [0.16, 1, 0.3, 1] }}
                    style={{ transformPerspective: 1200 }}
                  >
                    <EventCard
                      id={event.id}
                      image={event.coverImage}
                      title={event.title}
                      description={event.description}
                      date={event.date}
                      location={event.location}
                      price={event.price}
                      capacity={event.capacity}
                      availableTickets={event.availableTickets}
                      homeTickets="Home"
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
              {loaded && eventsData.length === 0 && (
                <div className="rounded-3xl border border-dashed border-sky/30 px-6 py-20 text-center">
                  <p className="heading text-3xl">No events here yet.</p>
                  <p className="mt-3 text-white/70">Try another filter, or check back soon.</p>
                </div>
              )}
            </div>

            {eventsData.length > 0 && (
              <PaginationRounded count={Math.ceil(eventsCount / ITEMS_PER_PAGE)} page={currentPage} onChange={(_event, value) => setCurrentPage(value)} />
            )}
          </div>
        </section>

        <ContactForm />
      </main>
    </div>
  );
}
