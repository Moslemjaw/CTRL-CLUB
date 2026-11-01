"use client";

import { useState } from 'react';
import { Formik, Form, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { RiEyeCloseFill } from 'react-icons/ri';
import { FaRegEye } from 'react-icons/fa';
import { toast } from 'react-toastify';
import Link from "next/link";
import { useRouter } from "next/navigation";
import { logIn } from "@/api/auth";

const LoginForm = () => {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const initialValues = {
    email: '',
    password: '',
    rememberMe: false,
  };

  const validationSchema = Yup.object({
    email: Yup.string()
      .email('Invalid email address')
      .required('Email is required'),
    password: Yup.string()
      .min(6, 'Password must be at least 6 characters')
      .required('Password is required'),
  });

  const handleSubmit = async (values) => {
    try {
      await logIn(values);
      toast.success('Login successful');
      router.push('/');
    } catch (error) {
      toast.error(error.message || 'Login failed. Please try again.');
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
          <div>
            <label className="field-label">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                className="field"
                {...getFieldProps('password')}
              />
              <button
                type="button"
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="absolute right-1 top-1 flex h-10 w-10 items-center justify-center text-xl text-sky"
                onClick={togglePasswordVisibility}
              >
                {showPassword ? <FaRegEye /> : <RiEyeCloseFill />}
              </button>
            </div>
            <ErrorMessage
              name="password"
              component="div"
              className="field-error"
            />
          </div>
          <div className="flex flex-col xmobile:flex-row xmobile:justify-between items-start gap-4">
            <Link
              href='/signUp'
              className="text-sm font-semibold text-sky hover:underline"
            >
              Create Account
            </Link>
            <Link
              href='/logIn/forgot-password'
              className="text-sm font-semibold text-white/80 hover:text-white hover:underline"
            >
              Forgot Password?
            </Link>
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="btn btn-primary w-full"
          >
            Sign In
          </button>
        </Form>
      )}
    </Formik>
  );
};

export default LoginForm;
