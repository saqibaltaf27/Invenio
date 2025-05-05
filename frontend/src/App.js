import React, { useContext } from 'react';
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { 
  NotFound, Unauthorized, Login, Forgetpassword, Dashboard, Employee, EmployeeAddNew, 
  Product, ProductAddNew, Supplier, SupplierAddNew, Expense, ExpenseAddNew, 
  Customer, CustomerAddNew, Order, OrderAddNew, Profile, Settings, Layout 
} from './components';
import ProtectedRoute from './ProtectedRoute';  
import "./style/dark.scss";
import { DarkModeContext } from './context/darkModeContext';
import Products from './components/Product/Products';

function App() {
  const { darkMode } = useContext(DarkModeContext);

  return (
    <div className={darkMode ? "dark" : ""}>
      <BrowserRouter>
        <Routes>

          {/* Public Routes */}
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />
          <Route path="/forgetpassword" element={<Forgetpassword />} />
          <Route path="/unauthorized" element={<Unauthorized />} />
          <Route path="*" element={<NotFound />} />

          {/* Protected Routes under Layout */}
          <Route path="/" element={<Layout />}>

            <Route path="dashboard" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />

            <Route path="employees" element={
              <ProtectedRoute>
                <Employee />
              </ProtectedRoute>
            } />

            <Route path="employees/addnew" element={
              <ProtectedRoute>
                <EmployeeAddNew />
              </ProtectedRoute>
            } />

            <Route path="/Products" element={<Products />} />

            <Route path="products/addnew" element={<ProductAddNew />} />

            <Route path="suppliers" element={
              <ProtectedRoute>
                <Supplier />
              </ProtectedRoute>
            } />

            <Route path="suppliers/addnew" element={
              <ProtectedRoute>
                <SupplierAddNew />
              </ProtectedRoute>
            } />

            <Route path="expenses" element={
              <ProtectedRoute>
                <Expense />
              </ProtectedRoute>
            } />

            <Route path="expenses/addnew" element={
              <ProtectedRoute>
                <ExpenseAddNew />
              </ProtectedRoute>
            } />

            <Route path="customers" element={
              <ProtectedRoute>
                <Customer />
              </ProtectedRoute>
            } />

            <Route path="customers/addnew" element={
              <ProtectedRoute>
                <CustomerAddNew />
              </ProtectedRoute>
            } />

            <Route path="orders" element={
              <ProtectedRoute>
                <Order />
              </ProtectedRoute>
            } />

            <Route path="orders/addnew" element={
              <ProtectedRoute>
                <OrderAddNew />
              </ProtectedRoute>
            } />

            <Route path="profile" element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } />

            <Route path="settings" element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            } />

          </Route>

        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
