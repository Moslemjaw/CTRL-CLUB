"use client";

import { useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { IoMdCloudUpload } from 'react-icons/io';
import { createEvent } from "@/api/events";
import PageHeader from "@/components/molecule/PageHeader";
import { toast } from 'react-toastify';

const AddEvent = () => {
  const [coverImagePreview, setCoverImagePreview] = useState('');

  const callAddEvent = async (eventData) => {
    try {
      await createEvent(eventData);
      toast.success('Your data has been inserted successfully.');
      return true;
    } catch (error) {
      toast.error(error.message || 'Add Event failed. Please try again.');
      return false;
    }
  };

  // Formik with Yup validation
  const formik = useFormik({
    initialValues: {
      coverImage: null,
      title: '',
      price: '',
      date: '',
      description: '',
      location: '',
      capacity: '',
    },
    validationSchema: Yup.object({
      coverImage: Yup.mixed().required('Event cover image is required'),
      title: Yup.string().required('Event title is required'),
      price: Yup.number()
        .transform((value, original) => (String(original ?? '').trim() === '' ? undefined : value))
        .typeError('Price must be a number')
        .min(0, 'Price cannot be negative'),
      date: Yup.date().required('Date is required').typeError('Date must be a valid date'),
      description: Yup.string().required('Description is required'),
      location: Yup.string().required('Location is required'),
      capacity: Yup.number().required('Capacity is required').typeError('Capacity must be a number'),
    }),
    onSubmit: async (values, { setSubmitting, resetForm }) => {
      if (await callAddEvent(values)) {
        resetForm();
        setCoverImagePreview('');
      }
      setSubmitting(false);
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
      <PageHeader title="Add Event" />
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
            placeholder="Event Price (leave empty if free)"
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

        <button type="submit" className="btn btn-primary 2md:col-span-2 2md:justify-self-start">
          Submit
        </button>
      </form>
    </div>
  );
};

export default AddEvent;
