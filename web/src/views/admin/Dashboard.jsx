"use client";

import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import DashboardCard from "@/components/atoms/DashboardCard";
import PaginationRounded from "@/components/molecule/PaginationRounded";
import { useAuth } from "@/components/AuthProvider";
import { deleteUser, getAllUsers, getCountUsers, setUserRole } from "@/api/users";
import { getCountEvents } from "@/api/events";
import { getCountTickets } from "@/api/tickets";

const ITEMS_PER_PAGE = 6;
const ROLES = [
  { value: "user", label: "User" },
  { value: "admin", label: "Admin" },
  { value: "scanner", label: "Scanner" },
  { value: "ctrl_member", label: "CTRL Member" },
];

export default function Dashboard() {
  const { userData } = useAuth();
  const [usersData, setUsersData] = useState([]);
  const [usersCount, setUsersCount] = useState(0);
  const [eventsCount, setEventsCount] = useState(0);
  const [ticketsCount, setTicketsCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);

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
    getAllUsers(currentPage)
      .then(setUsersData)
      .catch((error) => toast.error(`Error fetching users data: ${error.message}`));
  }, [currentPage]);

  const handleDelete = async (userId) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    try {
      const response = await deleteUser(userId);
      setUsersData((previous) => previous.filter((user) => user.id !== userId));
      setUsersCount((previous) => previous - 1);
      toast.success(response.message);
    } catch (error) {
      toast.error(error.message || "An error occurred");
    }
  };

  const handleRoleChange = async (userId, role) => {
    try {
      const response = await setUserRole(userId, role);
      setUsersData((previous) => previous.map((user) => (user.id === userId ? { ...user, role } : user)));
      toast.success(response.message);
    } catch (error) {
      toast.error(error.message || "An error occurred");
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <DashboardCard title="Users" count={usersCount} />
        <DashboardCard title="All Events" count={eventsCount} />
        <DashboardCard title="All Tickets" count={ticketsCount} />
      </div>

      <div className="panel">
        <h2 className="heading mb-5 text-2xl">Admin Data</h2>
        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <p className="field-label !mb-1">Name</p>
            <p className="text-lg text-white">{userData?.name}</p>
          </div>
          <div>
            <p className="field-label !mb-1">Email</p>
            <p className="text-lg text-white">{userData?.email}</p>
          </div>
        </div>
      </div>

      <div className="panel">
        <h2 className="heading mb-5 text-2xl">Users</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-white/80">
            <thead className="border-b border-sky/20 font-mono text-xs uppercase tracking-[0.12em] text-sky">
              <tr>
                <th scope="col" className="px-6 py-3">Name</th>
                <th scope="col" className="px-6 py-3">Email</th>
                <th scope="col" className="px-6 py-3">Phone Number</th>
                <th scope="col" className="px-6 py-3">Role</th>
                <th scope="col" className="px-6 py-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {usersData.length > 0 ? (
                usersData.map((user) => (
                  <tr key={user.id} className="border-b border-sky/10 transition-colors hover:bg-white/5">
                    <td scope="row" className="px-6 py-4 whitespace-nowrap font-medium text-white">
                      {user.name}
                    </td>
                    <td className="px-6 py-4">{user.email}</td>
                    <td className="px-6 py-4">{user.phoneNumber}</td>
                    <td className="px-6 py-4">
                      {user.id === userData?.id ? (
                        ROLES.find((role) => role.value === user.role)?.label
                      ) : (
                        <select
                          aria-label={`Role for ${user.name}`}
                          value={user.role}
                          onChange={(event) => handleRoleChange(user.id, event.target.value)}
                          className="field !min-h-10 !w-40 !py-2 text-sm"
                        >
                          {ROLES.map((role) => (
                            <option key={role.value} value={role.value}>{role.label}</option>
                          ))}
                        </select>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {user.id !== userData?.id && (
                        <button
                          type="button"
                          onClick={() => handleDelete(user.id)}
                          className="font-medium text-stop hover:underline"
                        >
                          Delete User
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-6 py-4 text-center text-white/60">
                    No users found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {usersData.length > 0 && (
          <div className="mx-auto">
            <PaginationRounded
              count={Math.ceil(usersCount / ITEMS_PER_PAGE)}
              page={currentPage}
              onChange={(_event, value) => setCurrentPage(value)}
            />
          </div>
        )}
      </div>
    </div>
  );
}
