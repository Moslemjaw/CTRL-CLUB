"use client";


import { Formik, Form, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { toast } from 'react-toastify';
import { sendForgotPasswordEmail } from "@/api/auth";

const ForgotPasswordForm = () => {

  const initialValues = {
    email: '',
  };

  const validationSchema = Yup.object({
    email: Yup.string()
      .email('Invalid email address')
      .required('Email is required'),
  });

  const handleSubmit = async (values) => {
    try {
      await sendForgotPasswordEmail(values);
      toast.success('If this email has an account, a reset link has been sent.');
    } catch (error) {
      toast.error(error.message || 'Error sending reset email. Please try again.');
    }
  };

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={validationSchema}
      onSubmit={handleSubmit}
    >
      {({ getFieldProps, isSubmitting }) => (
        <Form className="mt-6 flex flex-col gap-6">
          <div>
            <label className="field-label">Email</label>
            <input
              type="email"
              placeholder="Enter your email address"
              className="field"
              {...getFieldProps('email')}
            />
            <ErrorMessage
              name="email"
              component="div"
              className="field-error"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="btn btn-primary w-full"
          >
            Send Reset Link
          </button>
        </Form>
      )}
    </Formik>
  );
};

export default ForgotPasswordForm;
