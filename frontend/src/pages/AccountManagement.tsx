import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import axios from '../lib/axios';

const profileSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
});
type ProfileFormData = z.infer<typeof profileSchema>;

const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z.string().min(8, "New password must be at least 8 characters"),
    confirmNewPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: "New passwords don't match",
    path: ["confirmNewPassword"],
  });
type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;

const AccountManagement: React.FC = () => {
  const queryClient = useQueryClient();
  // Profile Update Form
  const {
    register, // Renamed to avoid conflict if not destructuring with new names
    handleSubmit: handleSubmitProfile, // Renamed
    reset: resetProfileForm, // Renamed
    formState: { errors: profileErrors }, // Renamed
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
  });

  // Change Password Form
  const {
    register: registerChangePassword,
    handleSubmit: handleSubmitChangePassword,
    formState: { errors: changePasswordErrors },
    reset: resetChangePasswordForm,
  } = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
  });

  const { data: userData, isLoading: isLoadingUserData, error: userDataError } = useQuery({
    queryKey: ['me'],
    queryFn: async () => {
      const response = await axios.get('/api/auth/me');
      return response.data; // This is the user object { _id, name, email, role, isActive, isAvailable, ... }
    },
  });

  useEffect(() => {
    if (userData) {
      resetProfileForm({ name: userData.name, email: userData.email });
    } else {
      // Fallback or initial load from localStorage if preferred for name
      const currentName = localStorage.getItem('name');
      // Email prefill from localStorage is less reliable; /me endpoint is better.
      // If userData is not yet available, form can start empty or with localStorage name.
      resetProfileForm({ name: currentName || '', email: '' });
    }
  }, [userData, resetProfileForm]);

  const updateProfileMutation = useMutation({
    mutationFn: async (data: ProfileFormData) => {
      // The API expects { name, email } directly in the body
      const response = await axios.put('/api/auth/profile', data);
      return response.data; // Assuming API returns { _id, name, email, role, isActive }
    },
    onSuccess: (data) => { // data here is the direct response from API, not nested under 'user' based on typical PUT responses
      toast.success('Profile updated successfully!');
      localStorage.setItem('name', data.name);
      if (data.email) {
        localStorage.setItem('email', data.email);
      }
      resetProfileForm({ name: data.name, email: data.email }); // Use renamed reset
      queryClient.invalidateQueries({ queryKey: ['me'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update profile.');
    },
  });

  const onSubmitProfile = (data: ProfileFormData) => {
    updateProfileMutation.mutate(data);
  };

  const changePasswordMutation = useMutation({
    mutationFn: async (data: ChangePasswordFormData) => {
      const response = await axios.post('/api/auth/change-password', data);
      return response.data;
    },
    onSuccess: () => {
      toast.success('Password changed successfully!');
      resetChangePasswordForm();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to change password. Check your current password.');
    },
  });

  const onSubmitChangePassword = (data: ChangePasswordFormData) => {
    changePasswordMutation.mutate(data);
  };

  const toggleAvailabilityMutation = useMutation({
    mutationFn: async (isAvailable: boolean) => {
      const response = await axios.put('/api/auth/availability', { isAvailable });
      return response.data;
    },
    onSuccess: () => {
      toast.success('Availability updated!');
      queryClient.invalidateQueries({ queryKey: ['me'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update availability.');
    },
  });

  if (isLoadingUserData) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <p>Loading account details...</p>
      </div>
    );
  }

  if (userDataError) {
    return (
      <div className="container mx-auto px-4 py-8 text-center text-red-500">
        <p>Error loading account details: {userDataError.message}</p>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">Account Management</h1>
      
      {/* Profile Update Section */}
      <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold mb-6">Update Profile</h2>
        <form onSubmit={handleSubmitProfile(onSubmitProfile)} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
            <input
              {...register('name')} {/* Remains as is, tied to first useForm instance */}
              type="text"
              id="name"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
            {profileErrors.name && <p className="mt-1 text-sm text-red-600">{profileErrors.name.message}</p>}
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
            <input
              {...register('email')} {/* Remains as is, tied to first useForm instance */}
              type="email"
              id="email"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
            {profileErrors.email && <p className="mt-1 text-sm text-red-600">{profileErrors.email.message}</p>}
          </div>
          <div>
            <button
              type="submit"
              disabled={updateProfileMutation.isPending}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400"
            >
              {updateProfileMutation.isPending ? 'Updating...' : 'Update Profile'}
            </button>
          </div>
        </form>
      </div>

      {/* Change Password Section */}
      <div className="mt-8 max-w-md mx-auto bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold mb-6">Change Password</h2>
        <form onSubmit={handleSubmitChangePassword(onSubmitChangePassword)} className="space-y-4">
          <div>
            <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700">Current Password</label>
            <input
              {...registerChangePassword('currentPassword')}
              type="password"
              id="currentPassword"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
            {changePasswordErrors.currentPassword && <p className="mt-1 text-sm text-red-600">{changePasswordErrors.currentPassword.message}</p>}
          </div>
          <div>
            <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">New Password</label>
            <input
              {...registerChangePassword('newPassword')}
              type="password"
              id="newPassword"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
            {changePasswordErrors.newPassword && <p className="mt-1 text-sm text-red-600">{changePasswordErrors.newPassword.message}</p>}
          </div>
          <div>
            <label htmlFor="confirmNewPassword" className="block text-sm font-medium text-gray-700">Confirm New Password</label>
            <input
              {...registerChangePassword('confirmNewPassword')}
              type="password"
              id="confirmNewPassword"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
            {changePasswordErrors.confirmNewPassword && <p className="mt-1 text-sm text-red-600">{changePasswordErrors.confirmNewPassword.message}</p>}
          </div>
          <div>
            <button
              type="submit"
              disabled={changePasswordMutation.isPending}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400"
            >
              {changePasswordMutation.isPending ? 'Changing Password...' : 'Change Password'}
            </button>
          </div>
        </form>
      </div>
      {/* Holiday mode section will be added later, extra div removed */}

      {/* Availability Toggle Section - Only for Interpreters */}
      {userData && userData.role === 'interpreter' && (
        <div className="mt-8 max-w-md mx-auto bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold mb-4">Availability / Holiday Mode</h2>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">
              {userData.isAvailable ? 'Available for new bookings' : 'On Holiday (not accepting new bookings)'}
            </span>
            <button
              onClick={() => toggleAvailabilityMutation.mutate(!userData.isAvailable)}
              disabled={toggleAvailabilityMutation.isPending || isLoadingUserData}
              className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${userData.isAvailable ? 'bg-green-500' : 'bg-gray-400'}`}
            >
              <span className="sr-only">Toggle Availability</span>
              <span className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform duration-200 ease-in-out ${userData.isAvailable ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
          </div>
          {toggleAvailabilityMutation.isPending && <p className="text-sm text-gray-500 mt-2">Updating availability...</p>}
        </div>
      )}
    </div>
  );
};

export default AccountManagement;
