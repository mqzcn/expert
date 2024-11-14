import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import axios from "../lib/axios";

interface User {
  _id: string;
  name: string;
  email: string;
  role: "client" | "interpreter" | "admin";
  languages?: { _id: string; name: string; code: string }[];
  hourlyRate?: number;
}

export default function UserManagement() {
  const queryClient = useQueryClient();
  const [selectedRole, setSelectedRole] = useState<
    "all" | "client" | "interpreter" | "admin"
  >("all");
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [showFinancialReport, setShowFinancialReport] = useState<
    "client" | "interpreter" | null
  >(null);
  const [reportData, setReportData] = useState<any>(null);
  const [dateRange, setDateRange] = useState({
    start: new Date().toISOString().split("T")[0],
    end: new Date().toISOString().split("T")[0],
  });

  const { data: users, isLoading } = useQuery<User[]>({
    queryKey: ["users"],
    queryFn: async () => {
      const response = await axios.get("/api/admin/users");
      return response.data;
    },
  });

  const updateUserMutation = useMutation({
    mutationFn: async ({
      userId,
      data,
    }: {
      userId: string;
      data: Partial<User>;
    }) => {
      const response = await axios.patch(`/api/admin/users/${userId}`, data);
      return response.data;
    },
    onSuccess: () => {
      toast.success("User updated successfully");
      setEditingUser(null);
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to update user");
    },
  });

  const fetchFinancialReport = async (
    type: "client" | "interpreter",
    id: string
  ) => {
    const endpoint =
      type === "client" ? "client-charges" : "interpreter-earnings";
    const response = await axios.get(`/api/admin/${endpoint}`, {
      params: {
        [`${type}Id`]: id,
        startDate: dateRange.start,
        endDate: dateRange.end,
      },
    });
    setReportData(response.data);
  };

  const filteredUsers = users?.filter((user) =>
    selectedRole === "all" ? true : user.role === selectedRole
  );

  const handleEditUser = (user: User) => {
    setEditingUser(user);
  };

  const handleUpdateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    const formData = new FormData(e.currentTarget as HTMLFormElement);
    const hourlyRate = formData.get("hourlyRate");

    updateUserMutation.mutate({
      userId: editingUser._id,
      data: {
        hourlyRate: hourlyRate ? parseFloat(hourlyRate as string) : undefined,
      },
    });
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="max-w-7xl mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">User Management</h1>
        <select
          value={selectedRole}
          onChange={(e) => setSelectedRole(e.target.value as any)}
          className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        >
          <option value="all">All Users</option>
          <option value="client">Clients</option>
          <option value="interpreter">Interpreters</option>
          <option value="admin">Admins</option>
        </select>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Role
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Rate/Hour
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredUsers?.map((user) => (
              <tr key={user._id}>
                <td className="px-6 py-4 whitespace-nowrap">{user.name}</td>
                <td className="px-6 py-4 whitespace-nowrap">{user.email}</td>
                <td className="px-6 py-4 whitespace-nowrap capitalize">
                  {user.role}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {user.role === "interpreter" && (
                    <>£{user.hourlyRate || 0}/hr</>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {user.role !== "admin" && (
                    <button
                      onClick={() => {
                        setShowFinancialReport(user.role);
                        fetchFinancialReport(user.role, user._id);
                      }}
                      className="ml-4 text-green-600 hover:text-green-900"
                    >
                      View Finance
                    </button>
                  )}
                  {user.role === "interpreter" && (
                    <button
                      onClick={() => handleEditUser(user)}
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      Edit Rate
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Edit User Modal */}
      {editingUser && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-medium mb-4">Edit Interpreter Rate</h3>
            <form onSubmit={handleUpdateUser}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">
                  Hourly Rate (£)
                </label>
                <input
                  type="number"
                  name="hourlyRate"
                  defaultValue={editingUser.hourlyRate || 0}
                  min="0"
                  step="0.01"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Financial Report Modal */}
      {showFinancialReport && reportData && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-medium mb-4">
              {showFinancialReport === "client"
                ? "Client Charges"
                : "Interpreter Earnings"}
            </h3>
            <div className="mb-4">
              <p className="text-sm text-gray-500">
                Total Amount: £{reportData.totalAmount}
              </p>
              <p className="text-sm text-gray-500">
                Number of Bookings: {reportData.bookingCount}
              </p>
            </div>
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    {showFinancialReport === "client"
                      ? "Interpreter"
                      : "Client"}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Language
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Hours
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Rate
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Amount
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {(showFinancialReport === "client"
                  ? reportData.charges
                  : reportData.earnings
                )?.map((item: any, index: number) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {new Date(item.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {showFinancialReport === "client"
                        ? item.interpreter
                        : item.client}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {item.language}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {item.hours}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      £{item.rate}/hr
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      £{item.amount}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="mt-4 flex justify-end">
              <button
                onClick={() => setShowFinancialReport(null)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
