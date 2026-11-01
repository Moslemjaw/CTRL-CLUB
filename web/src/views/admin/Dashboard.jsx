"use client";

import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import DashboardCard from "@/components/atoms/DashboardCard";
import PaginationRounded from "@/components/molecule/PaginationRounded";
import { useAuth } from "@/components/AuthProvider";
import { deleteUser, getAllUsers, getCountUsers } from "@/api/users";
import { getCountEvents } from "@/api/events";
import { getCountTickets } from "@/api/tickets";

const ITEMS_PER_PAGE = 6;

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

  return (
    <div className="lg:col-span-3 w-full mx-auto lg:ml-6 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 rounded-lg">
        <DashboardCard title="Users" count={usersCount} />
        <DashboardCard title="All Events" count={eventsCount} />
        <DashboardCard title="All Tickets" count={ticketsCount} />
      </div>

      <div className="bg-white p-6 rounded-lg divide-y border overflow-x-auto">
        <h2 className="text-2xl font-semibold text-blue-900 mb-4">Admin Data</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6">
          <div>
            <p className="text-gray-900 font-semibold">Name</p>
            <p className="text-lg text-gray-600">{userData?.name}</p>
          </div>
          <div>
            <p className="text-gray-900 font-semibold">Email</p>
            <p className="text-lg text-gray-600">{userData?.email}</p>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg divide-y border">
        <h2 className="text-2xl font-semibold text-blue-900 mb-4">Users</h2>
        <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
          <table className="w-full text-sm text-left rtl:text-right text-gray-500">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50">
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
                  <tr key={user.id} className="bg-white border-b">
                    <td scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                      {user.name}
                    </td>
                    <td className="px-6 py-4">{user.email}</td>
                    <td className="px-6 py-4">{user.phoneNumber}</td>
                    <td className="px-6 py-4">{user.role}</td>
                    <td className="px-6 py-4">
                      {user.id !== userData?.id && (
                        <button
                          type="button"
                          onClick={() => handleDelete(user.id)}
                          className="font-medium text-red-600 hover:underline"
                        >
                          Delete User
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
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
