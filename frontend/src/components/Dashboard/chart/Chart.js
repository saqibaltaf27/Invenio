import React, { useState, useEffect } from 'react';
import './chart.scss';
import {
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Label
} from 'recharts';
import axios from 'axios';

export default function Chart() {
  const [chartType, setChartType] = useState('products'); // 'products' or 'suppliers'
  const [productStats, setProductStats] = useState([]);
  const [supplierStats, setSupplierStats] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch product data from the backend
  const fetchProductData = async () => {
    try {
      setLoading(true);
      const response = await axios.get('https://invenio-api-production.up.railway.app/api/productsChart');
      setProductStats(response.data.data || []);
      setLoading(false);
    } catch (error) {
      console.error('Product data fetch error:', error);
      setLoading(false);
    }
  };

  // Fetch supplier data from the backend
  const fetchSupplierData = async () => {
    try {
      setLoading(true);
      const response = await axios.get('https://invenio-api-production.up.railway.app/api/suppliersChart');
      setSupplierStats(response.data.data || []);
      setLoading(false);
    } catch (error) {
      console.error('Supplier data fetch error:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (chartType === 'products') {
      fetchProductData();
    } else if (chartType === 'suppliers') {
      fetchSupplierData();
    }
  }, [chartType]);

  // Group product data by Category (if needed)
  const groupedProductStats = productStats.map(({ Name, product_stock }) => ({
    productName: Name,
    stock: product_stock,
  }));

  // Format supplier data for the bar chart
  const groupedSupplierStats = supplierStats.map(({ Name, timeStamp }) => {
    const month = new Date(timeStamp).toLocaleString('default', { month: 'long' });
    return {
      supplierName: Name,
      month,
    };
  });

  // Group supplier stats by month for display, including the supplier names
  const groupedSuppliersByMonth = groupedSupplierStats.reduce((acc, { supplierName, month }) => {
    const existingMonth = acc.find(item => item.month === month);
    if (existingMonth) {
      existingMonth.count++;
      existingMonth.supplierNames.push(supplierName);  // Add supplier name to the list
    } else {
      acc.push({ month, count: 1, supplierNames: [supplierName] });
    }
    return acc;
  }, []);

  // Chart rendering logic
  return (
    <div className="chart">
      <div className="chartTitle">
        {chartType.toUpperCase()} ANALYTICS
        <div className="chartToggle">
          <button onClick={() => setChartType('products')}>Products</button>
          <button onClick={() => setChartType('suppliers')}>Suppliers</button>
        </div>
      </div>

      <div className="chartContent">
        <ResponsiveContainer width="100%" aspect={4 / 1}>
          {chartType === 'products' ? (
            <BarChart width={730} height={250} data={groupedProductStats}
              margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <XAxis dataKey="productName" />
              <YAxis />
              <Tooltip 
                content={({ payload }) => {
                  if (payload && payload.length) {
                    const { productName, stock } = payload[0].payload;
                    return (
                      <div className="custom-tooltip">
                        <p>Product: {productName}</p>
                        <p>Stock: {stock}</p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar dataKey="stock" fill="#8884d8">
                <Label 
                  value={(data) => `${data.productName} (${data.stock})`}
                  position="inside"
                  fill="#fff"
                  fontSize={12}
                />
              </Bar>
            </BarChart>
          ) : (
            <BarChart width={730} height={250} data={groupedSuppliersByMonth}>
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip 
                content={({ payload }) => {
                  if (payload && payload.length) {
                    const { month, count, supplierNames } = payload[0].payload;
                    return (
                      <div className="custom-tooltip">
                        <p>Month: {month}</p>
                        <p>Total Suppliers: {count}</p>
                        {supplierNames && supplierNames.length > 0 && (
                          <div>
                            <p>Suppliers:</p>
                            <ul>
                              {supplierNames.map((name, index) => (
                                <li key={index}>{name}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar dataKey="count" fill="#82ca9d">
                <Label 
                  value={(data) => `${data.supplierNames.join(', ')}`}
                  position="inside"
                  fill="#fff"
                  fontSize={12}
                />
              </Bar>
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
}
