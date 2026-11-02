"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "react-toastify";
import { IoSearch } from "react-icons/io5";
import DashboardCard from "@/components/atoms/DashboardCard";
import PageHeader from "@/components/molecule/PageHeader";
import PaginationRounded from "@/components/molecule/PaginationRounded";
import { useAuth } from "@/components/AuthProvider";
import { deleteUser, getAllUsers, getCountUsers, setUserRole, setUserTitle } from "@/api/users";
import { getCountEvents } from "@/api/events";
import { getCountTickets } from "@/api/tickets";

const ITEMS_PER_PAGE = 6;
const ROLES = [
  { value: "user", label: "User" },
  { value: "admin", label: "Admin" },
  { value: "scanner", label: "Scanner" },
  { value: "ctrl_member", label: "CTRL Member" },
];
const USER_COLUMNS = "2md:grid-cols-[minmax(0,1fr)_7rem_9rem_14rem_3.5rem] 2md:gap-3";
const SEARCH_DELAY_MS = 300;
const TITLED_ROLES = ["admin", "ctrl_member"];

function TitleInput({ user, onSave }) {
  const [value, setValue] = useState(user.title ?? "");

  useEffect(() => setValue(user.title ?? ""), [user.title]);

  const save = () => {
    const title = value.trim();
    setValue(title);
    if (title !== (user.title ?? "")) onSave(user.id, title);
  };

  if (!TITLED_ROLES.includes(user.role)) {
    return <p className="text-white/40"><span className="2md:hidden">Title: </span>Not available</p>;
  }

  return (
    <input
      type="text"
      aria-label={`Title for ${user.name}`}
      placeholder="e.g. President"
      maxLength={60}
      value={value}
      onChange={(event) => setValue(event.target.value)}
      onBlur={save}
      onKeyDown={(event) => {
        if (event.key === "Enter") event.currentTarget.blur();
      }}
      className="field !min-h-10 !py-2 text-sm"
    />
  );
}

export default function Dashboard() {
  const { userData, refreshProfile } = useAuth();
  const [usersData, setUsersData] = useState([]);
  const [usersCount, setUsersCount] = useState(0);
  const [eventsCount, setEventsCount] = useState(0);
  const [ticketsCount, setTicketsCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchText, setSearchText] = useState("");
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [matchCount, setMatchCount] = useState(0);
  const [usersLoaded, setUsersLoaded] = useState(false);

  useEffect(() => {
    Promise.all([getCountUsers(), getCountEvents(), getCountTickets()])
      .then(([users, events, tickets]) => {
        setUsersCount(users);
        setEventsCount(events);
        setTicketsCount(tickets);
      })
      .catch((error) => toast.error(`Error fetching data: ${error.message}`));
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchText);
      setCurrentPage(1);
    }, SEARCH_DELAY_MS);
    return () => clearTimeout(timer);
  }, [searchText]);

  useEffect(() => {
    let active = true;
    getAllUsers(currentPage, { search, role: roleFilter })
      .then(({ users, count }) => {
        if (!active) return;
        setUsersData(users);
        setMatchCount(count);
      })
      .catch((error) => toast.error(`Error fetching users data: ${error.message}`))
      .finally(() => {
        if (active) setUsersLoaded(true);
      });
    return () => {
      active = false;
    };
  }, [currentPage, search, roleFilter]);

  const handleRoleFilterChange = (event) => {
    setRoleFilter(event.target.value);
    setCurrentPage(1);
  };

  const handleDelete = async (userId) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    try {
      const response = await deleteUser(userId);
      setUsersData((previous) => previous.filter((user) => user.id !== userId));
      setUsersCount((previous) => previous - 1);
      setMatchCount((previous) => previous - 1);
      toast.success(response.message);
    } catch (error) {
      toast.error(error.message || "An error occurred");
    }
  };

  const handleTitleChange = async (userId, title) => {
    try {
      const response = await setUserTitle(userId, title);
      setUsersData((previous) => previous.map((user) => (user.id === userId ? { ...user, title } : user)));
      if (userId === userData?.id) await refreshProfile();
      toast.success(response.message);
    } catch (error) {
      toast.error(error.message || "An error occurred");
    }
  };

  const handleRoleChange = async (userId, role) => {
    try {
      const response = await setUserRole(userId, role);
      setUsersData((previous) => previous.map((user) => (user.id === userId ? { ...user, role, title: TITLED_ROLES.includes(role) ? user.title : null } : user)));
      toast.success(response.message);
    } catch (error) {
      toast.error(error.message || "An error occurred");
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader title={`Welcome, ${userData?.name?.split(" ")[0] ?? ""}`} description={userData?.email}>
        <Link href="/admin/addEvent" className="btn btn-primary !min-h-11 !py-2">Add Event</Link>
        <Link href="/admin/addUser" className="btn btn-ghost !min-h-11 !py-2">Add User</Link>
      </PageHeader>

      <div className="grid grid-cols-3 gap-3 md:gap-4">
        <DashboardCard title="Users" count={usersCount} />
        <DashboardCard title="Events" count={eventsCount} />
        <DashboardCard title="Tickets" count={ticketsCount} />
      </div>

      <section className="panel" aria-labelledby="users-heading">
        <h2 id="users-heading" className="heading mb-5 text-2xl">Users</h2>
        <div className="mb-5 grid gap-3 md:grid-cols-[minmax(0,1fr)_13rem]">
          <div className="relative">
            <IoSearch className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-lg text-sky" aria-hidden="true" />
            <input
              type="search"
              aria-label="Search users"
              placeholder="Search by name, phone or email"
              value={searchText}
              onChange={(event) => setSearchText(event.target.value)}
              className="field !pl-11"
            />
          </div>
          <select aria-label="Filter by role" value={roleFilter} onChange={handleRoleFilterChange} className="field">
            <option value="all">All Roles</option>
            {ROLES.map((role) => (
              <option key={role.value} value={role.value}>{role.label}</option>
            ))}
          </select>
        </div>
        <p className="mb-3 font-mono text-xs text-white/60" role="status">{usersLoaded ? `Showing ${matchCount} of ${usersCount} users` : "Loading users..."}</p>
        <div className={`hidden border-b border-sky/20 px-3 pb-3 font-mono text-xs uppercase tracking-[0.12em] text-sky 2md:grid ${USER_COLUMNS}`} aria-hidden="true">
          <span>User</span>
          <span>Phone Number</span>
          <span>Role</span>
          <span>Title</span>
          <span />
        </div>
        {usersData.length > 0 ? (
          <ul className="flex flex-col gap-3 2md:gap-0">
            {usersData.map((user) => (
              <li key={user.id} className={`grid items-center gap-3 rounded-xl border border-sky/15 p-4 text-sm text-white/80 transition-colors hover:bg-white/5 2md:rounded-none 2md:border-0 2md:border-b 2md:border-sky/10 2md:p-3 ${USER_COLUMNS}`}>
                <div className="min-w-0">
                  <p className="break-words font-display text-base font-semibold text-white">{user.name}</p>
                  <p className="break-all">{user.email}</p>
                </div>
                <p className="break-all">{user.phoneNumber}</p>
                {user.id === userData?.id ? (
                  <p>{ROLES.find((role) => role.value === user.role)?.label}</p>
                ) : (
                  <select
                    aria-label={`Role for ${user.name}`}
                    value={user.role}
                    onChange={(event) => handleRoleChange(user.id, event.target.value)}
                    className="field !min-h-10 !py-2 text-sm"
                  >
                    {ROLES.map((role) => (
                      <option key={role.value} value={role.value}>{role.label}</option>
                    ))}
                  </select>
                )}
                <TitleInput user={user} onSave={handleTitleChange} />
                <div className="2md:text-right">
                  {user.id !== userData?.id && (
                    <button
                      type="button"
                      onClick={() => handleDelete(user.id)}
                      aria-label={`Delete ${user.name}`}
                      className="min-h-10 font-medium text-stop hover:underline"
                    >
                      Delete
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="py-10 text-center text-white/60">{usersLoaded ? "No users match your search." : ""}</p>
        )}
        {usersData.length > 0 && (
          <div className="mx-auto">
            <PaginationRounded
              count={Math.ceil(matchCount / ITEMS_PER_PAGE)}
              page={currentPage}
              onChange={(_event, value) => setCurrentPage(value)}
            />
          </div>
        )}
      </section>
    </div>
  );
}
