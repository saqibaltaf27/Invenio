import React, { useContext } from 'react';
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { NotFound, Unauthorized, Login, Forgetpassword, Dashboard, Employee, EmployeeAddNew, Product, ProductAddNew, Supplier, SupplierAddNew, Expense, ExpenseAddNew, Customer, CustomerAddNew, Order, OrderAddNew, Profile, Settings, Layout } from './components';
import ProtectedRoute from './ProtectedRoute';  // Import ProtectedRoute
import "./style/dark.scss";
import { DarkModeContext } from './context/darkModeContext';

function App() {
  const { darkMode } = useContext(DarkModeContext);

  return (
    <div className={darkMode ? "dark" : ""}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />
          <Route path="/forgetpassword" element={<Forgetpassword />} />
          <Route path="/unauthorized" element={<Unauthorized />} />
          <Route path="*" element={<NotFound />} />

          {/* Layout (Protected) Routes */}
          <Route path="/" element={<Layout />}>
            {/* Protected Routes */}
            <Route path="/dashboard" element={
				<ProtectedRoute>
				<Dashboard />
				</ProtectedRoute>
				} />
            <Route path="/employees" element={<ProtectedRoute element={<Employee />} />} />
            <Route path="/employees/addnew" element={<ProtectedRoute element={<EmployeeAddNew />} />} />
            <Route path="/products" element={<ProtectedRoute element={<Product />} />} />
            <Route path="/products/addnew" element={<ProtectedRoute element={<ProductAddNew />} />} />
            <Route path="/suppliers" element={<ProtectedRoute element={<Supplier />} />} />
            <Route path="/suppliers/addnew" element={<ProtectedRoute element={<SupplierAddNew />} />} />
            <Route path="/expenses" element={<ProtectedRoute element={<Expense />} />} />
            <Route path="/expenses/addnew" element={<ProtectedRoute element={<ExpenseAddNew />} />} />
            <Route path="/customers" element={<ProtectedRoute element={<Customer />} />} />
            <Route path="/customers/addnew" element={<ProtectedRoute element={<CustomerAddNew />} />} />
            <Route path="/orders" element={<ProtectedRoute element={<Order />} />} />
            <Route path="/orders/addnew" element={<ProtectedRoute element={<OrderAddNew />} />} />
            <Route path="/profile" element={<ProtectedRoute element={<Profile />} />} />
            <Route path="/settings" element={<ProtectedRoute element={<Settings />} />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
