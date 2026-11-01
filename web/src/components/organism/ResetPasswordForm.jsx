"use client";

import { Formik, Form, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { toast } from 'react-toastify';
import { useRouter } from "next/navigation";
import { resetPassword } from "@/api/auth";
import { useAuth } from "../AuthProvider";

const ResetPasswordForm = () => {
  const router = useRouter();
  const { loading, isLoggedIn } = useAuth();

  const initialValues = {
    newPassword: '',
    confirmPassword: '',
  };

  const validationSchema = Yup.object({
    newPassword: Yup.string()
      .min(8, 'Password must be at least 8 characters')
      .required('New password is required'),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref('newPassword'), null], 'Passwords must match')
      .required('Please confirm your password'),
  });

  const handleSubmit = async (values) => {
    try {
      await resetPassword(values.newPassword);
      toast.success('Password reset successfully.');
      router.push('/logIn');
    } catch (error) {
      toast.error(error.message || 'Error resetting password. Please try again.');
    }
  };

  if (loading) return null;

  // The link in the reset email signs the user in; without that session the link is invalid.
  if (!isLoggedIn) {
    return <p className="mt-6 text-red-500">This reset link is invalid or has expired. Please request a new one.</p>;
  }

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={validationSchema}
      onSubmit={handleSubmit}
    >
      {({ getFieldProps, isSubmitting }) => (
        <Form className="mt-6 flex flex-col gap-6">
          <div>
            <label className="block mb-2 font-medium">New Password</label>
            <input
              type="password"
              placeholder="Enter your new password"
              className="w-full min-h-12 p-3 pl-5 border rounded-md focus:outline-none focus:ring-2 focus:ring-base-color"
              {...getFieldProps('newPassword')}
            />
            <ErrorMessage
              name="newPassword"
              component="div"
              className="text-red-500 text-sm mt-1"
            />
          </div>

          <div>
            <label className="block mb-2 font-medium">Confirm Password</label>
            <input
              type="password"
              placeholder="Confirm your new password"
              className="w-full min-h-12 p-3 pl-5 border rounded-md focus:outline-none focus:ring-2 focus:ring-base-color"
              {...getFieldProps('confirmPassword')}
            />
            <ErrorMessage
              name="confirmPassword"
              component="div"
              className="text-red-500 text-sm mt-1"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-base-color text-white py-3 font-semibold rounded-md hover:bg-second-color transition-all duration-300"
          >
            Reset Password
          </button>
        </Form>
      )}
    </Formik>
  );
};

export default ResetPasswordForm;
