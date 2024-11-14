import { Navigate } from 'react-router-dom';

interface ProtectedRouteProps {
  children: React.ReactNode;
  adminOnly?: boolean;
  interpreterOnly?: boolean;
}

export default function ProtectedRoute({ 
  children, 
  adminOnly = false,
  interpreterOnly = false 
}: ProtectedRouteProps) {
  const token = localStorage.getItem('token');
  const userRole = localStorage.getItem('userRole');

  if (!token) {
    return <Navigate to="/login" />;
  }

  if (adminOnly && userRole !== 'admin') {
    return <Navigate to="/" />;
  }

  if (interpreterOnly && userRole !== 'interpreter') {
    return <Navigate to="/" />;
  }

  return <>{children}</>;
}