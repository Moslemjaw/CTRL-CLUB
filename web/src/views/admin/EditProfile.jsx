"use client";

import { useRef, useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { toast } from "react-toastify";
import { IoMdCloudUpload } from "react-icons/io";
import { useAuth } from "@/components/AuthProvider";
import { avatarUrl, changePassword, removeAvatar, setAvatar, updateProfile } from "@/api/users";

const ROLE_LABELS = { admin: "Admin", ctrl_member: "CTRL Member", scanner: "Scanner", user: "User" };
const BIO_LIMIT = 300;

export function ProfileAvatar({ userData, className = "h-24 w-24 text-4xl" }) {
  const url = avatarUrl(userData?.avatar);
  return url ? (
    <img src={url} alt="" className={`shrink-0 rounded-2xl border-2 border-white object-cover shadow-[0_4px_0_#6FCBFF] ${className}`} />
  ) : (
    <span aria-hidden="true" className={`flex shrink-0 items-center justify-center rounded-2xl bg-white font-display font-bold text-ink shadow-[0_4px_0_#6FCBFF] ${className}`}>{userData?.name?.[0]?.toUpperCase()}</span>
  );
}

function Field({ formik, name, label, type = "text", autoComplete, hint }) {
  const error = formik.touched[name] && formik.errors[name];
  return (
    <div>
      <label htmlFor={name} className="field-label">{label}</label>
      <input
        id={name}
        name={name}
        type={type}
        autoComplete={autoComplete}
        value={formik.values[name]}
        onChange={formik.handleChange}
        onBlur={formik.handleBlur}
        className={`field ${error ? "field-invalid" : ""}`}
      />
      {error ? <p className="field-error">{error}</p> : hint && <p className="mt-2 text-sm text-white/55">{hint}</p>}
    </div>
  );
}

function PhotoSection({ userData, refreshProfile }) {
  const inputRef = useRef(null);
  const [busy, setBusy] = useState(false);

  const run = async (action, message) => {
    setBusy(true);
    try {
      await action();
      await refreshProfile();
      toast.success(message);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setBusy(false);
    }
  };

  const handleFile = (event) => {
    const file = event.target.files[0];
    event.target.value = "";
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Choose a photo smaller than 2 MB");
      return;
    }
    run(() => setAvatar(userData.id, file, userData.avatar), "Photo updated");
  };

  return (
    <div className="flex flex-wrap gap-3">
      <input ref={inputRef} type="file" accept="image/png, image/jpeg, image/webp" onChange={handleFile} className="hidden" aria-label="Choose a profile photo" />
      <button type="button" disabled={busy} onClick={() => inputRef.current.click()} className="btn btn-ghost !min-h-11 !py-2 text-sm">
        <IoMdCloudUpload aria-hidden="true" /> {busy ? "Saving..." : userData.avatar ? "Change Photo" : "Upload Photo"}
      </button>
      {userData.avatar && (
        <button type="button" disabled={busy} onClick={() => run(() => removeAvatar(userData.id, userData.avatar), "Photo removed")} className="min-h-11 px-2 font-medium text-stop hover:underline">Remove</button>
      )}
    </div>
  );
}

function ProfileForm({ userData, refreshProfile }) {
  const formik = useFormik({
    initialValues: {
      name: userData.name ?? "",
      phoneNumber: userData.phone_number ?? "",
      email: userData.email ?? "",
      bio: userData.bio ?? "",
    },
    enableReinitialize: true,
    validationSchema: Yup.object({
      name: Yup.string().trim().max(50, "Must be 50 characters or less").required("Name is required"),
      phoneNumber: Yup.string().matches(/^\+?\d{6,15}$/, "Enter digits only, like 96500000000").required("Phone number is required"),
      email: Yup.string().email("Invalid email address").required("Email is required"),
      bio: Yup.string().max(BIO_LIMIT, `Must be ${BIO_LIMIT} characters or less`),
    }),
    onSubmit: async (values) => {
      try {
        await updateProfile(userData.id, values, userData.email);
        await refreshProfile();
        toast.success(
          values.email !== userData.email
            ? "Profile updated. Confirm the new email address from your inbox."
            : "Profile updated successfully"
        );
      } catch (error) {
        toast.error(`Error updating profile: ${error.message}`);
      }
    },
  });

  return (
    <form onSubmit={formik.handleSubmit} noValidate className="panel" aria-labelledby="details-heading">
      <h2 id="details-heading" className="heading mb-5 text-2xl">Personal Details</h2>
      <div className="grid gap-5 md:grid-cols-2">
        <Field formik={formik} name="name" label="Full Name" autoComplete="name" />
        <Field formik={formik} name="phoneNumber" label="Phone Number" type="tel" autoComplete="tel" />
        <div className="md:col-span-2">
          <Field formik={formik} name="email" label="Email" type="email" autoComplete="email" hint="Changing this sends a confirmation link to the new address." />
        </div>
        <div className="md:col-span-2">
          <label htmlFor="bio" className="field-label">Bio</label>
          <textarea id="bio" name="bio" rows={4} maxLength={BIO_LIMIT} value={formik.values.bio} onChange={formik.handleChange} onBlur={formik.handleBlur} placeholder="A short line about you" className="field resize-y" />
          <p className="mt-2 text-right font-mono text-xs text-white/55">{formik.values.bio.length}/{BIO_LIMIT}</p>
        </div>
      </div>
      <button type="submit" disabled={formik.isSubmitting || !formik.dirty} className="btn btn-primary mt-2 w-full md:w-auto">
        {formik.isSubmitting ? "Saving..." : "Save Changes"}
      </button>
    </form>
  );
}

function PasswordForm({ email }) {
  const formik = useFormik({
    initialValues: { currentPassword: "", newPassword: "", confirmPassword: "" },
    validationSchema: Yup.object({
      currentPassword: Yup.string().required("Current password is required"),
      newPassword: Yup.string().min(8, "Password must be at least 8 characters").required("New password is required"),
      confirmPassword: Yup.string().oneOf([Yup.ref("newPassword")], "Passwords must match").required("Please confirm your password"),
    }),
    onSubmit: async (values, { resetForm }) => {
      try {
        await changePassword(email, values.currentPassword, values.newPassword);
        resetForm();
        toast.success("Password changed");
      } catch (error) {
        toast.error(error.message);
      }
    },
  });

  return (
    <form onSubmit={formik.handleSubmit} noValidate className="panel" aria-labelledby="password-heading">
      <h2 id="password-heading" className="heading mb-5 text-2xl">Change Password</h2>
      <div className="grid gap-5 md:grid-cols-3">
        <Field formik={formik} name="currentPassword" label="Current Password" type="password" autoComplete="current-password" />
        <Field formik={formik} name="newPassword" label="New Password" type="password" autoComplete="new-password" />
        <Field formik={formik} name="confirmPassword" label="Confirm Password" type="password" autoComplete="new-password" />
      </div>
      <button type="submit" disabled={formik.isSubmitting} className="btn btn-ghost mt-6 w-full md:w-auto">
        {formik.isSubmitting ? "Changing..." : "Change Password"}
      </button>
    </form>
  );
}

const EditProfile = () => {
  const { userData, refreshProfile } = useAuth();
  const roleLabel = ROLE_LABELS[userData.role] ?? "User";
  const memberSince = userData.created_at && new Date(userData.created_at).toLocaleDateString("en-US", { month: "long", year: "numeric" });

  return (
    <div className="space-y-6">
      <section className="panel flex flex-col gap-5 md:flex-row md:items-center" aria-label="Your profile">
        <ProfileAvatar userData={userData} />
        <div className="min-w-0 flex-1">
          <h2 className="heading break-words text-3xl">{userData.name}</h2>
          <p className="mt-1 font-display text-lg font-semibold text-sky">{userData.title || roleLabel}</p>
          <p className="mt-2 font-mono text-xs uppercase tracking-[0.12em] text-white/60">
            {roleLabel}{memberSince ? ` / Joined ${memberSince}` : ""}
          </p>
          {userData.bio && <p className="mt-3 max-w-2xl whitespace-pre-wrap break-words text-white/75">{userData.bio}</p>}
        </div>
        <PhotoSection userData={userData} refreshProfile={refreshProfile} />
      </section>
      <ProfileForm userData={userData} refreshProfile={refreshProfile} />
      <PasswordForm email={userData.email} />
    </div>
  );
};

export default EditProfile;
