import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import axios from "../lib/axios";

const profileSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
});
type ProfileFormData = z.infer<typeof profileSchema>;

const AccountManagement: React.FC = () => {
  const queryClient = useQueryClient();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
  });

  useEffect(() => {
    // Pre-fill form with data from localStorage
    const currentName = localStorage.getItem("name");
    // Attempt to get email from localStorage, might be named 'email' or 'userEmail'
    // Let's assume 'email' for now, adjust if your localStorage key is different
    const currentEmail = localStorage.getItem("email");

    const defaultValues: Partial<ProfileFormData> = {};
    if (currentName) {
      defaultValues.name = currentName;
    }
    if (currentEmail) {
      defaultValues.email = currentEmail;
    }
    // Only reset if there's something to set, or always reset with potentially empty email
    if (currentName || currentEmail) {
      reset(defaultValues);
    }
  }, [reset]);

  const updateProfileMutation = useMutation({
    mutationFn: async (data: ProfileFormData) => {
      // The API expects { name, email } directly in the body
      const response = await axios.put("/api/auth/profile", data);
      return response.data; // Assuming API returns { _id, name, email, role, isActive }
    },
    onSuccess: (data) => {
      // data here is the direct response from API, not nested under 'user' based on typical PUT responses
      toast.success("Profile updated successfully!");
      localStorage.setItem("name", data.name);
      if (data.email) {
        // If email was updated and returned
        localStorage.setItem("email", data.email); // Update email in localStorage if it exists
      }
      reset({ name: data.name, email: data.email });
      // Invalidate queries related to user data if any, e.g., a 'me' query
      queryClient.invalidateQueries({ queryKey: ["me"] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to update profile.");
    },
  });

  const onSubmitProfile = (data: ProfileFormData) => {
    updateProfileMutation.mutate(data);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">
        Account Management
      </h1>

      <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold mb-6">Update Profile</h2>
        <form onSubmit={handleSubmit(onSubmitProfile)} className="space-y-4">
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700"
            >
              Name
            </label>
            <input
              {...register("name")}
              type="text"
              id="name"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
            )}
          </div>
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700"
            >
              Email
            </label>
            <input
              {...register("email")}
              type="email"
              id="email"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-600">
                {errors.email.message}
              </p>
            )}
          </div>
          <div>
            <button
              type="submit"
              disabled={updateProfileMutation.isPending}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400"
            >
              {updateProfileMutation.isPending
                ? "Updating..."
                : "Update Profile"}
            </button>
          </div>
        </form>
      </div>
      {/* Password change and holiday mode sections will be added below or in separate divs */}
    </div>
  );
};

export default AccountManagement;
