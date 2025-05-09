import React, { useContext } from 'react';
import { BrowserRouter, Route, Routes } from "react-router-dom";
// Import your components.  Make sure these paths are CORRECT for your project structure.
import { 
  NotFound, 
  Unauthorized, 
  Login, 
  Forgetpassword, 
  Dashboard, 
  Employee, 
  EmployeeAddNew, 
  Product, 
  ProductAddNew, 
  Supplier, 
  SupplierAddNew, 
  Expense, 
  ExpenseAddNew,  
  Customer, 
  CustomerAddNew, 
  Order, 
  OrderAddNew, 
  Profile, 
  Settings, 
} from './components'; //  You might need to adjust these paths
import Layout from './components/Layout/Layout'; //  Make sure this path is correct.
import Products from './components/Product/Products'; //  And this one.
import GoodsReceiveCreate from './components/Goods Receive/GoodsReceive'; // And this
import StockOut from './components/Stock Out/StockOut';     // And this
import ProtectedRoute from './ProtectedRoute';  // And this
import "./style/dark.scss"; //  And this
import { DarkModeContext } from './context/darkModeContext'; // And this

function App() {
  const { darkMode } = useContext(DarkModeContext);

  return (
    <div className={darkMode ? "dark" : ""}>
      <BrowserRouter>
        <Routes>

          {/* Public Routes (No authentication required) */}
          <Route path="/login" element={<Login />} />
          <Route path="/forgetpassword" element={<Forgetpassword />} />
          <Route path="/unauthorized" element={<Unauthorized />} />
          <Route path="*" element={<NotFound />} />

          {/* Protected Routes (Authentication required) */}
          <Route path="/" element={<Layout />}>
            <Route index element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
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
            <Route path="products" element={
              <ProtectedRoute>
                <Products />
              </ProtectedRoute>
            } />
            <Route path="products/addnew" element={
              <ProtectedRoute>
                <ProductAddNew />
              </ProtectedRoute>
            } />
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
            <Route path="GoodsReceive" element={
              <ProtectedRoute>
                <GoodsReceiveCreate />
              </ProtectedRoute>
            } />
            <Route path="stockout" element={<StockOut />} /> {/* StockOut is correctly nested */}
          </Route>
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
