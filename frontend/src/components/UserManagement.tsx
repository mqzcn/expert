import { useMutation } from "@tanstack/react-query";
import axios from "../lib/axios";
import { toast } from "react-hot-toast";
import { User } from "../types";

interface UserManagementProps {
  user: User;
  handleViewFinance: (user: User) => void;
  handleEditUser: (user: User) => void;
}

export default function UserManagementActions({
  user,
  handleViewFinance,
  handleEditUser,
}: UserManagementProps) {
  const sendPasswordResetMutation = useMutation({
    mutationFn: async (email: string) => {
      const response = await axios.post("/api/auth/send-reset", { email });
      return response.data;
    },
    onSuccess: () => {
      toast.success("Password reset email sent successfully");
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || "Failed to send reset email"
      );
    },
  });

  const handleSendPasswordReset = (email: string) => {
    sendPasswordResetMutation.mutate(email);
  };

  return (
    <td className="px-6 py-4 whitespace-nowrap">
      {user.role !== "admin" && (
        <>
          <button
            onClick={() => handleViewFinance(user)}
            className="text-green-600 hover:text-green-900"
          >
            View Finance
          </button>
          {user.role === "interpreter" && (
            <button
              onClick={() => handleEditUser(user)}
              className="text-indigo-600 hover:text-indigo-900 ml-4"
            >
              Edit Rate
            </button>
          )}
          <button
            onClick={() => handleSendPasswordReset(user.email)}
            className="text-blue-600 hover:text-blue-900 ml-4"
          >
            Reset Password
          </button>
        </>
      )}
    </td>
  );
}
