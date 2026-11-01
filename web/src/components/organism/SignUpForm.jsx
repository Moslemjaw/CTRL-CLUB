"use client";

import { useState } from 'react';
import { Formik, Form, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { signUp, verifyCode } from "@/api/auth";
import { toast } from 'react-toastify';
import { useRouter } from "next/navigation";

const SignUpForm = () => {
  const [isVerificationStep, setIsVerificationStep] = useState(false);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const callSignUp = async (signUpData) => {
    setLoading(true);
    try {
      await signUp(signUpData);
      toast.success('Verification code sent to your email.');
      setEmail(signUpData.email);
      setIsVerificationStep(true);
    } catch (error) {
      toast.error(error.message || 'Sign Up failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const callVerifyCode = async (verificationData) => {
    setLoading(true);
    try {
      await verifyCode(verificationData);
      toast.success('Verification successful. You are now registered!');
      router.push('/logIn');
    } catch (error) {
      toast.error(error.message || 'Verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const initialValues = {
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phoneNumber: '',
    verificationCode: '',
  };

  const validationSchema = Yup.object({
    name: Yup.string()
      .max(50, 'Must be 50 characters or less')
      .required('Required'),
    email: Yup.string()
      .email('Invalid email address')
      .required('Required'),
    password: Yup.string()
      .min(8, 'Password must be at least 8 characters')
      .required('Required'),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref('password'), null], 'Passwords must match')
      .required('Required'),
    phoneNumber: Yup.number()
      .typeError('Phone number must be a number')
      .required('Required'),
  });

  const verificationSchema = Yup.object({
    verificationCode: Yup.string()
      // Supabase's email OTP length is configurable from 6 to 10 digits.
      .matches(/^\d{6,10}$/, 'Enter the full code from your email')
      .required('Required'),
  });

  const handleSubmit = async (values, { setSubmitting }) => {
    if (!isVerificationStep) {
      await callSignUp(values);
    } else {
      await callVerifyCode({ email, code: values.verificationCode });
    }
    setSubmitting(false);
  };

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={!isVerificationStep ? validationSchema : verificationSchema}
      onSubmit={handleSubmit}
    >
      {({ getFieldProps, isSubmitting }) => (
        <Form className="flex flex-col gap-4 mb-20">
          {!isVerificationStep ? (
            <>
              <div>
                <label htmlFor="name" className="field-label">
                  Full Name
                </label>
                <input
                  id="name"
                  type="text"
                  {...getFieldProps('name')}
                  className="field"
                />
                <ErrorMessage name="name" component="div" className="field-error" />
              </div>

              <div>
                <label htmlFor="email" className="field-label">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  {...getFieldProps('email')}
                  className="field"
                />
                <ErrorMessage name="email" component="div" className="field-error" />
              </div>

              <div>
                <label htmlFor="phoneNumber" className="field-label">
                  Phone Number
                </label>
                <input
                  id="phoneNumber"
                  type="text"
                  {...getFieldProps('phoneNumber')}
                  className="field"
                />
                <ErrorMessage name="phoneNumber" component="div" className="field-error" />
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="password" className="field-label">
                    Password
                  </label>
                  <input
                    id="password"
                    type="password"
                    {...getFieldProps('password')}
                    className="field"
                  />
                  <ErrorMessage name="password" component="div" className="field-error" />
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="field-label">
                    Confirm Password
                  </label>
                  <input
                    id="confirmPassword"
                    type="password"
                    {...getFieldProps('confirmPassword')}
                    className="field"
                  />
                  <ErrorMessage name="confirmPassword" component="div" className="field-error" />
                </div>
              </div>
            </>
          ) : (
            <>
              <div>
                <label htmlFor="verificationCode" className="field-label">
                  Verification Code
                </label>
                <input
                  id="verificationCode"
                  type="text"
                  {...getFieldProps('verificationCode')}
                  className="field"
                />
                <ErrorMessage name="verificationCode" component="div" className="field-error" />
                <p className="mt-4 font-display text-lg font-semibold text-sky">Check Your Email</p>
              </div>
            </>
          )}

          <div className="flex justify-between text-center mt-4">
            <button
              type="submit"
              disabled={isSubmitting || loading}
              className="btn btn-primary w-full"
            >
              {loading ? 'Loading...' : isVerificationStep ? 'Verify Code' : 'Sign Up'}
            </button>
          </div>
        </Form>
      )}
    </Formik>
  );
};

export default SignUpForm;
