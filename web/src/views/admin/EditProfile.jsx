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
    <form onSubmit={formik.handleSubmit} className="p-6 mx-auto bg-white rounded-lg">
      <h2 className="text-2xl font-bold mb-4">Edit Profile</h2>

      <div className="mb-4">
        <label htmlFor="name" className="block text-gray-700">User Name</label>
        <input
          id="name"
          name="name"
          type="text"
          required
          onChange={formik.handleChange}
          value={formik.values.name}
          className="w-full mt-1 p-2 border border-gray-300 rounded-md"
        />
      </div>

      <div className="mb-4">
        <label htmlFor="email" className="block text-gray-700">Email</label>
        <input
          id="email"
          name="email"
          type="email"
          required
          onChange={formik.handleChange}
          value={formik.values.email}
          className="w-full mt-1 p-2 border border-gray-300 rounded-md"
        />
      </div>

      <button type="submit" className="bg-base-color hover:bg-second-color text-white py-2 px-4 rounded-md transition-all duration-300">
        Update Profile
      </button>
    </form>
  );
};

export default EditProfile;
