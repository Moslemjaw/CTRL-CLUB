"use client";

import { useState, useEffect } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { IoMdCloudUpload } from 'react-icons/io';
import { useSearchParams } from "next/navigation";
import { toast } from 'react-toastify';
import { coverImageUrl, getEventById, updateEvent } from "@/api/events";
import PageHeader from "@/components/molecule/PageHeader";

// datetime-local inputs expect local time, not UTC.
const toLocalInput = (value) => {
  const date = new Date(value);
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().substring(0, 16);
};

const EditEvent = () => {
  const eventId = useSearchParams().get('id');
  const [coverImagePreview, setCoverImagePreview] = useState('');
  const [eventData, setEventData] = useState(null);

  useEffect(() => {
    getEventById(eventId)
      .then((event) => {
        if (!event) return toast.error('Event not found');
        setEventData(event);
        setCoverImagePreview(coverImageUrl(event.coverImage));
      })
      .catch((error) => toast.error(error.message));
  }, [eventId]);

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      coverImage: eventData?.coverImage ?? null,
      title: eventData?.title ?? '',
      price: eventData?.price ?? '',
      date: eventData ? toLocalInput(eventData.date) : '',
      description: eventData?.description ?? '',
      location: eventData?.location ?? '',
      capacity: eventData?.capacity ?? '',
      availableTickets: eventData?.availableTickets ?? '',
    },
    validationSchema: Yup.object({
      title: Yup.string().required('Event title is required'),
      price: Yup.number().required('Price is required').typeError('Price must be a number'),
      date: Yup.date().required('Date is required').typeError('Date must be a valid date'),
      description: Yup.string().required('Description is required'),
      location: Yup.string().required('Location is required'),
      capacity: Yup.number().min(0).required('Capacity is required').typeError('Capacity must be a number'),
      availableTickets: Yup.number().min(0).required('Available tickets is required').typeError('Available tickets must be a number'),
    }),
    onSubmit: async (values, { setSubmitting }) => {
      try {
        await updateEvent(eventId, values, eventData.coverImage);
        toast.success(`Event ${values.title} updated successfully`);
      } catch (error) {
        toast.error(error.message || 'Failed to update event. Please try again.');
      } finally {
        setSubmitting(false);
      }
    },
  });

  const handleCoverImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      formik.setFieldValue('coverImage', file);

      // Update the cover image preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setCoverImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div>
      <PageHeader title="Edit Event" />
      <form onSubmit={formik.handleSubmit} className="panel grid gap-4 2md:grid-cols-2">
        <div className="mb-2 border-b border-sky/15 pb-5 2md:col-span-2">
          <label className="field-label">Event Cover Image</label>
          <div className="flex flex-wrap items-center gap-4">
            {coverImagePreview && (
              <img
                src={coverImagePreview}
                alt="Cover Image Preview"
                className="max-h-64 w-full max-w-96 rounded-lg object-cover border-2 border-sky"
              />
            )}
            <label
              htmlFor="coverImage"
              className="btn-icon"
            >
              <IoMdCloudUpload className="text-2xl" />
            </label>
            <input
              id="coverImage"
              name="coverImage"
              type="file"
              accept="image/png, image/jpeg, image/jpg"
              onChange={handleCoverImageChange}
              className="hidden"
            />
          </div>
          {formik.touched.coverImage && formik.errors.coverImage ? (
            <div className="field-error">{formik.errors.coverImage}</div>
          ) : null}
          <p className="text-white/60 mt-2 text-sm">PNG or JPG no bigger than 800px width and height</p>
        </div>

        <div className="2md:col-span-2">
          <input
            type="text"
            name="title"
            placeholder="Event Title"
            value={formik.values.title}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            className={`field ${formik.touched.title && formik.errors.title ? 'field-invalid' : ''}`}
          />
          {formik.touched.title && formik.errors.title ? (
            <div className="field-error">{formik.errors.title}</div>
          ) : null}
        </div>

        <div>
          <input
            type="text"
            name="price"
            placeholder="Event Price"
            value={formik.values.price}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            className={`field ${formik.touched.price && formik.errors.price ? 'field-invalid' : ''}`}
          />
          {formik.touched.price && formik.errors.price ? (
            <div className="field-error">{formik.errors.price}</div>
          ) : null}
        </div>

        <div>
          <input
            type="datetime-local"
            name="date"
            placeholder="Event Date and Time"
            value={formik.values.date}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            className={`field ${formik.touched.date && formik.errors.date ? 'field-invalid' : ''}`}
          />
          {formik.touched.date && formik.errors.date ? (
            <div className="field-error">{formik.errors.date}</div>
          ) : null}
        </div>

        <div className="2md:col-span-2">
          <textarea
            name="description"
            rows={4}
            placeholder="Event Description"
            value={formik.values.description}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            className={`field ${formik.touched.description && formik.errors.description ? 'field-invalid' : ''}`}
          />
          {formik.touched.description && formik.errors.description ? (
            <div className="field-error">{formik.errors.description}</div>
          ) : null}
        </div>

        <div>
          <input
            type="text"
            name="location"
            placeholder="Event Location"
            value={formik.values.location}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            className={`field ${formik.touched.location && formik.errors.location ? 'field-invalid' : ''}`}
          />
          {formik.touched.location && formik.errors.location ? (
            <div className="field-error">{formik.errors.location}</div>
          ) : null}
        </div>

        <div>
          <input
            type="number"
            name="capacity"
            placeholder="Event Capacity"
            value={formik.values.capacity}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            className={`field ${formik.touched.capacity && formik.errors.capacity ? 'field-invalid' : ''}`}
          />
          {formik.touched.capacity && formik.errors.capacity ? (
            <div className="field-error">{formik.errors.capacity}</div>
          ) : null}
        </div>
        <div>
          <input
            type="number"
            name="availableTickets"
            placeholder="Available Tickets"
            value={formik.values.availableTickets}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            className={`field ${formik.touched.availableTickets && formik.errors.availableTickets ? 'field-invalid' : ''}`}
          />
          {formik.touched.availableTickets && formik.errors.availableTickets ? (
            <div className="field-error">{formik.errors.availableTickets}</div>
          ) : null}
        </div>

        <div className="2md:col-span-2">
          <button
            type="submit"
            className="btn btn-primary"
            disabled={formik.isSubmitting}  // Disable button while submitting
          >
            {formik.isSubmitting ? 'Updating...' : 'Update'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditEvent;
