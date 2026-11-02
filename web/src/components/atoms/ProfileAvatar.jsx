import { avatarUrl } from "@/api/users";

export default function ProfileAvatar({ userData, className = "h-24 w-24 text-4xl" }) {
  const url = avatarUrl(userData?.avatar);
  return url ? (
    <img src={url} alt="" className={`shrink-0 rounded-2xl border-2 border-white object-cover shadow-[0_4px_0_#6FCBFF] ${className}`} />
  ) : (
    <span aria-hidden="true" className={`flex shrink-0 items-center justify-center rounded-2xl bg-white font-display font-bold text-ink shadow-[0_4px_0_#6FCBFF] ${className}`}>{userData?.name?.[0]?.toUpperCase()}</span>
  );
}
