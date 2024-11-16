import { useState, useEffect } from "react";
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
  isActive: boolean;
}

interface FinancialReport {
  charges?: {
    date: string;
    interpreter: string;
    language: string;
    hours: number;
    rate: number;
    amount: number;
  }[];
  earnings?: {
    date: string;
    client: string;
    language: string;
    hours: number;
    rate: number;
    amount: number;
  }[];
  totalAmount: number;
  bookingCount: number;
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
  const [reportData, setReportData] = useState<FinancialReport | null>(null);
  const [dateRange, setDateRange] = useState({
    start: new Date().toISOString().split("T")[0],
    end: new Date().toISOString().split("T")[0],
  });
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const dropdown = document.getElementById("exportDropdown");
      if (dropdown && !dropdown.contains(event.target as Node)) {
        dropdown.classList.add("hidden");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

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
    try {
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
    } catch (error) {
      console.error("Error fetching financial report:", error);
      toast.error("Failed to fetch financial report");
    }
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

  const handleViewFinance = (user: User) => {
    if (user.role !== "admin") {
      setSelectedUserId(user._id);
      setShowFinancialReport(user.role);
      fetchFinancialReport(user.role, user._id);
    }
  };

  const toggleUserStatus = (user: User) => {
    if (user.role !== "admin") {
      console.log(
        "Toggling status for user:",
        user.name,
        "Current status:",
        user.isActive
      ); // Debug log
      updateUserMutation.mutate({
        userId: user._id,
        data: { isActive: !user.isActive },
      });
    }
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
                Status
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
                      onClick={() => toggleUserStatus(user)}
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        user.isActive
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {user.isActive ? "Active" : "Inactive"}
                    </button>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {user.role !== "admin" && (
                    <button
                      onClick={() => handleViewFinance(user)}
                      className="ml-4 text-green-600 hover:text-green-900"
                    >
                      View Finance
                    </button>
                  )}
                  {user.role === "interpreter" && (
                    <button
                      onClick={() => handleEditUser(user)}
                      className="text-indigo-600 hover:text-indigo-900 ml-4"
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
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-medium">
                {showFinancialReport === "client"
                  ? "Client Charges"
                  : "Interpreter Earnings"}
              </h3>
              <div className="flex items-end space-x-4">
                <div>
                  <label className="block text-sm text-gray-700">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={dateRange.start}
                    onChange={(e) =>
                      setDateRange((prev) => ({
                        ...prev,
                        start: e.target.value,
                      }))
                    }
                    className="mt-1 block rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-700">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={dateRange.end}
                    onChange={(e) =>
                      setDateRange((prev) => ({ ...prev, end: e.target.value }))
                    }
                    className="mt-1 block rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => {
                      if (selectedUserId && showFinancialReport) {
                        fetchFinancialReport(
                          showFinancialReport,
                          selectedUserId
                        );
                      }
                    }}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                  >
                    Update
                  </button>
                  <div className="relative">
                    <button
                      onClick={() => {
                        const dropdown =
                          document.getElementById("exportDropdown");
                        if (dropdown) {
                          dropdown.classList.toggle("hidden");
                        }
                      }}
                      className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 inline-flex items-center"
                    >
                      Export
                      <svg
                        className="w-4 h-4 ml-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </button>
                    <div
                      id="exportDropdown"
                      className="hidden absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50"
                    >
                      <div className="py-1">
                        <button
                          onClick={() => {
                            if (selectedUserId && showFinancialReport) {
                              window.location.href = `${
                                import.meta.env.VITE_API_URL
                              }/api/admin/export-financials?type=${showFinancialReport}&userId=${selectedUserId}&startDate=${
                                dateRange.start
                              }&endDate=${dateRange.end}&format=excel`;
                            }
                          }}
                          className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          Export as Excel
                        </button>
                        <button
                          onClick={() => {
                            if (selectedUserId && showFinancialReport) {
                              window.location.href = `${
                                import.meta.env.VITE_API_URL
                              }/api/admin/export-financials?type=${showFinancialReport}&userId=${selectedUserId}&startDate=${
                                dateRange.start
                              }&endDate=${dateRange.end}&format=csv`;
                            }
                          }}
                          className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          Export as CSV
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mb-6 bg-gray-50 p-4 rounded-lg">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Total Amount</p>
                  <p className="text-2xl font-bold">
                    £{reportData.totalAmount.toFixed(2)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Number of Bookings</p>
                  <p className="text-2xl font-bold">
                    {reportData.bookingCount}
                  </p>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
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
                      Rate/Hour
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {(showFinancialReport === "client"
                    ? reportData.charges
                    : reportData.earnings
                  )?.map((item, index) => (
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
                        £{item.rate.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        £{item.amount.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => {
                  setShowFinancialReport(null);
                  setReportData(null);
                }}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
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
