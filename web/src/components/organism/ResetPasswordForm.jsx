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
            <label className="field-label">New Password</label>
            <input
              type="password"
              placeholder="Enter your new password"
              className="field"
              {...getFieldProps('newPassword')}
            />
            <ErrorMessage
              name="newPassword"
              component="div"
              className="field-error"
            />
          </div>

          <div>
            <label className="field-label">Confirm Password</label>
            <input
              type="password"
              placeholder="Confirm your new password"
              className="field"
              {...getFieldProps('confirmPassword')}
            />
            <ErrorMessage
              name="confirmPassword"
              component="div"
              className="field-error"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="btn btn-primary w-full"
          >
            Reset Password
          </button>
        </Form>
      )}
    </Formik>
  );
};

export default ResetPasswordForm;
