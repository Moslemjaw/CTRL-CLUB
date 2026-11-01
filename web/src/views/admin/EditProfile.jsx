"use client";

import { useFormik } from "formik";
import { toast } from "react-toastify";
import { logOut } from "@/api/auth";
import { updateProfile } from "@/api/users";
import { useAuth } from "@/components/AuthProvider";

const EditProfile = () => {
  const { userData } = useAuth();

  const formik = useFormik({
    initialValues: {
      name: userData.name,
      email: userData.email,
    },
    onSubmit: async (values) => {
      try {
        await updateProfile(userData.id, values, userData.email);
        toast.success(
          values.email !== userData.email
            ? "Profile updated. Confirm the new email address from your inbox."
            : "Profile updated successfully"
        );
        await logOut();
      } catch (error) {
        toast.error(`Error updating profile: ${error.message}`);
      }
    },
  });

  return (
    <form onSubmit={formik.handleSubmit} className="max-w-xl">
      <h2 className="heading mb-5 text-2xl">Edit Profile</h2>

      <div className="mb-4">
        <label htmlFor="name" className="field-label">User Name</label>
        <input
          id="name"
          name="name"
          type="text"
          required
          onChange={formik.handleChange}
          value={formik.values.name}
          className="field"
        />
      </div>

      <div className="mb-4">
        <label htmlFor="email" className="field-label">Email</label>
        <input
          id="email"
          name="email"
          type="email"
          required
          onChange={formik.handleChange}
          value={formik.values.email}
          className="field"
        />
      </div>

      <button type="submit" className="btn btn-primary">
        Update Profile
      </button>
    </form>
  );
};

export default EditProfile;
