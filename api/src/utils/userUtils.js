import User from '../models/User.js'; // Adjust path if necessary based on actual User model location

export const getAdminEmails = async () => {
  try {
    const admins = await User.find({ role: 'admin' }).select('email');
    if (!admins || admins.length === 0) {
      console.warn('No admin users found to send contact form to.');
      return [];
    }
    return admins.map(admin => admin.email);
  } catch (error) {
    console.error('Error fetching admin emails:', error);
    return []; // Return empty array on error to prevent email sending failure from crashing process
  }
};
