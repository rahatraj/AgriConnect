import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
import { Loader } from "lucide-react";
import { toast } from "react-hot-toast";
import ErrorComponent from "../components/common/ErrorComponent";

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { isLoggedIn, data, authChecked, error } = useSelector((state) => state.users);
  const userRole = data?.user?.role;
  const [showError, setShowError] = useState(true);

  useEffect(() => {
    if (authChecked && !isLoggedIn) {
      toast.error("Please login to continue");
    } else if (authChecked && allowedRoles && !allowedRoles.includes(userRole)) {
      toast.error("You don't have permission to access this page");
    }
  }, [authChecked, isLoggedIn, allowedRoles, userRole]);

  if (!authChecked) {
    return null;
  }
  
  // Redirect to login if not logged in
  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }
  
  if (error && showError) {
    return <ErrorComponent message={error} onDismiss={() => setShowError(false)} />;
  }

  // Redirect to home if the user role is not allowed
  if (allowedRoles && !allowedRoles.includes(userRole)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;