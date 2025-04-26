import React from 'react';

import { Navigate } from 'react-router-dom';


const ProtectedRoute = ({ children }) => {
  const user = JSON.parse(localStorage.getItem('user'));  // Parse the string to an object
  console.log("user from localStorage:", user);

  return user && user.user_id ? children : <Navigate to="/login" />;
};

export default ProtectedRoute;
