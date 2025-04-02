import React, { useEffect } from "react";
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
import { Loader } from "lucide-react";
import { toast } from "react-hot-toast";
import ErrorComponent from "../components/common/ErrorComponent";

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { isLoggedIn, data, authChecked, error } = useSelector((state) => state.users);
  const userRole = data?.user?.role;

  useEffect(() => {
    if (authChecked && !isLoggedIn) {
      toast.error("Please login to continue");
    } else if (authChecked && allowedRoles && !allowedRoles.includes(userRole)) {
      toast.error("You don't have permission to access this page");
    }
  }, [authChecked, isLoggedIn, allowedRoles, userRole]);

  if (error) {
    return <ErrorComponent message={error} />;
  }

  if (!authChecked) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader className="size-10 animate-spin" />
      </div>
    );
  }

  // Redirect to login if not logged in
  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  // Redirect to home if the user role is not allowed
  if (allowedRoles && !allowedRoles.includes(userRole)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
