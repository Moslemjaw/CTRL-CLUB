"use client";

import { useFormik } from 'formik';
import * as Yup from 'yup';
import { toast } from 'react-toastify';
import { addUserByAdmin } from "@/api/users";

const AddUser = () => {
  const callAddUser = async (userData) => {
    try {
      await addUserByAdmin(userData);
      toast.success('User created successfully.');
      return true;
    } catch (error) {
      toast.error(error.message || 'Add failed. Please try again.');
      return false;
    }
  };

  // Formik with Yup validation
  const formik = useFormik({
    initialValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      role: 'user',
      phoneNumber: '',
    },
    validationSchema: Yup.object({
      name: Yup.string().required('Name is required'),
      email: Yup.string().email('Invalid email address').required('Email is required'),
      password: Yup.string()
        .min(8, 'Password must be at least 8 characters')
        .required('Password is required'),
      confirmPassword: Yup.string()
        .oneOf([Yup.ref('password'), null], 'Passwords must match')
        .required('Confirm password is required'),
      role: Yup.string().oneOf(['user', 'admin', 'scanner'], 'Invalid user role').required('User role is required'),
      phoneNumber: Yup.string()
        .matches(/^\d+$/, 'Phone number must be digits only')
        .min(10, 'Phone number must be at least 10 digits')
        .required('Phone number is required'),
    }),
    onSubmit: async (values, { setSubmitting, resetForm }) => {
      if (await callAddUser(values)) resetForm();
      setSubmitting(false);
    },
  });

  return (
    <div className="panel !p-0">
      <div className='border-b border-sky/15 p-6'>
        <h1 className='heading text-3xl'>Add User</h1>
      </div>
      <form onSubmit={formik.handleSubmit} className="w-full flex flex-col gap-4 mx-auto p-6">
        <div>
          <input
            type="text"
            name="name"
            placeholder="Name"
            value={formik.values.name}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            className={`field ${formik.touched.name && formik.errors.name ? 'field-invalid' : ''}`}
          />
          {formik.touched.name && formik.errors.name && (
            <div className="field-error">{formik.errors.name}</div>
          )}
        </div>

        <div>
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formik.values.email}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            className={`field ${formik.touched.email && formik.errors.email ? 'field-invalid' : ''}`}
          />
          {formik.touched.email && formik.errors.email && (
            <div className="field-error">{formik.errors.email}</div>
          )}
        </div>

        <div>
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formik.values.password}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            className={`field ${formik.touched.password && formik.errors.password ? 'field-invalid' : ''}`}
          />
          {formik.touched.password && formik.errors.password && (
            <div className="field-error">{formik.errors.password}</div>
          )}
        </div>

        <div>
          <input
            type="password"
            name="confirmPassword"
            placeholder="Confirm Password"
            value={formik.values.confirmPassword}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            className={`field ${formik.touched.confirmPassword && formik.errors.confirmPassword ? 'field-invalid' : ''}`}
          />
          {formik.touched.confirmPassword && formik.errors.confirmPassword && (
            <div className="field-error">{formik.errors.confirmPassword}</div>
          )}
        </div>

        <div>
          <input
            type="text"
            name="phoneNumber"
            placeholder="Phone Number"
            value={formik.values.phoneNumber}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            className={`field ${formik.touched.phoneNumber && formik.errors.phoneNumber ? 'field-invalid' : ''}`}
          />
          {formik.touched.phoneNumber && formik.errors.phoneNumber && (
            <div className="field-error">{formik.errors.phoneNumber}</div>
          )}
        </div>

        <div>
          <select
            name="role"
            value={formik.values.role}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            className={`field ${formik.touched.role && formik.errors.role ? 'field-invalid' : ''}`}
          >
            <option value="user">User</option>
            <option value="admin">Admin</option>
            <option value="scanner">Scanner</option>
          </select>
          {formik.touched.role && formik.errors.role && (
            <div className="field-error">{formik.errors.role}</div>
          )}
        </div>

        <button
          type="submit"
          disabled={formik.isSubmitting}
          className="btn btn-primary"
        >
          {formik.isSubmitting ? 'Submitting...' : 'Submit'}
        </button>
      </form>
    </div>
  );
};

export default AddUser;
