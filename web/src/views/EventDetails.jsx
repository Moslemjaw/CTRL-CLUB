"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "react-toastify";
import SpeedDialComponent from "@/components/organism/SpeedDialComponent";
import Footer from "@/components/organism/Footer";
import { coverImageUrl, getEventById } from "@/api/events";
import { createTicket } from "@/api/tickets";

const EventDetails = () => {
  const eventId = useSearchParams().get("id");
  const [event, setEvent] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const loadEvent = () =>
    getEventById(eventId)
      .then((data) => {
        if (data) setEvent(data);
        else toast.error("Event not found");
      })
      .catch((error) => toast.error(error.message));

  useEffect(() => {
    loadEvent();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventId]);

  const handleParticipate = async () => {
    setSubmitting(true);
    try {
      const { emailSent } = await createTicket(eventId);
      if (emailSent) {
        toast.success("Done, Sent Ticket");
      } else {
        toast.warning("You are registered, but the email could not be sent. Your ticket is in My Tickets.");
      }
      await loadEvent();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-blue-50 h-screen relative flex justify-center items-center p-5">
      <SpeedDialComponent />
      {event && (
        <div className="max-w-2xl mx-auto mb-16 md:p-6 p-3 bg-white shadow-md rounded-lg">
          <div className="flex flex-col">
            <img
              src={coverImageUrl(event.coverImage)}
              alt={event.title}
              className="w-full lg:min-w-[600px] max-h-[350px] rounded-lg object-cover object-center"
            />
            <div className="md:ml-8 mt-4 text-center">
              <h1 className="text-3xl font-bold text-gray-800">{event.title}</h1>
              <p className="mt-4 text-gray-600">{event.description}</p>
              <button
                onClick={handleParticipate}
                disabled={submitting}
                className="mt-8 text-lg inline-block w-full xmobile:w-2/3 bg-base-color text-white font-semibold py-3 shadow-gray-900 rounded-lg hover:bg-blue-600 text-center hover:shadow-xl transition-all duration-300 disabled:opacity-60"
              >
                {submitting ? "REGISTERING..." : "REGISTER IN THE EVENT"}
              </button>
              <div className="mt-8">
                <p className="text-gray-600">
                  <strong>Available Tickets:</strong>
                  <span className="px-1 font-semibold ml-2 border rounded shadow-inner shadow-gray-300">
                    {event.availableTickets}
                  </span>
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
      <div className="absolute w-full bottom-0">
        <Footer />
      </div>
    </div>
  );
};

export default EventDetails;
