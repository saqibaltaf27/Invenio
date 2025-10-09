import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import swal from 'sweetalert';
import moment from 'moment';
import './ExpenseAddNew.css';

function ExpenseAddNew() {
  const [expenseItems, setExpenseItems] = useState([]);
  const [expenseDate, setExpenseDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [items, setItems] = useState([{ id: 1, item_id: '', quantity: 1, unit_price: '', total: 0 }]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchExpenseItems();
  }, []);

  const fetchExpenseItems = async () => {
    try {
      const result = await fetch(`http://localhost:5000/api/get_expense_items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
      });
      const body = await result.json();
      if (body.operation === 'success') {
        setExpenseItems(body.info.items);
      }
    } catch (error) {
      console.error('Error fetching expense items:', error);
    }
  };

  const addItem = () => {
    const newId = items.length > 0 ? Math.max(...items.map(item => item.id)) + 1 : 1;
    setItems([...items, { id: newId, item_id: '', quantity: 1, unit_price: '', total: 0 }]);
  };

  const removeItem = (id) => {
    if (items.length > 1) {
      setItems(items.filter(item => item.id !== id));
    } else {
      swal('Warning', 'At least one item is required', 'warning');
    }
  };

  const updateItem = (id, field, value) => {
    setItems(items.map(item => {
      if (item.id === id) {
        const updatedItem = { ...item, [field]: value };
        
        // Calculate total if quantity or unit_price changes
        if (field === 'quantity' || field === 'unit_price') {
          const quantity = field === 'quantity' ? parseFloat(value) || 0 : item.quantity;
          const unit_price = field === 'unit_price' ? parseFloat(value) || 0 : item.unit_price;
          updatedItem.total = quantity * unit_price;
        }
        
        // If total is manually entered, calculate unit price
        if (field === 'total') {
          const total = parseFloat(value) || 0;
          const quantity = parseFloat(item.quantity) || 1;
          updatedItem.total = total;
          updatedItem.unit_price = quantity > 0 ? total / quantity : 0;
        }
        
        return updatedItem;
      }
      return item;
    }));
  };

  const calculateGrandTotal = () => {
    return items.reduce((total, item) => total + (item.total || 0), 0);
  };

  const addExpense = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    // Validate all items - now only item_id, quantity, and total are required
    const invalidItems = items.filter(item => !item.item_id || !item.quantity || !item.total);
    if (invalidItems.length > 0) {
      swal('Error', 'Please fill all required fields for all items', 'error');
      setLoading(false);
      return;
    }

    if (calculateGrandTotal() <= 0) {
      swal('Error', 'Total amount must be greater than 0', 'error');
      setLoading(false);
      return;
    }

    try {
      const result = await fetch(`http://localhost:5000/api/add_expense`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map(item => ({
            item_id: item.item_id,
            quantity: parseFloat(item.quantity),
            unit_price: parseFloat(item.unit_price) || 0,
            total_amount: item.total
          })),
          expense_date: expenseDate,
          notes: notes,
          grand_total: calculateGrandTotal(),
          created_by: 1 // Get from user session
        }),
        credentials: 'include'
      });
      
      const body = await result.json();
      if (body.operation === 'success') {
        swal('Success', body.message, 'success').then(() => {
          window.location.href = '/expenses';
        });
      } else {
        swal('Error', body.message, 'error');
      }
    } catch (error) {
      console.error('Error adding expense:', error);
      swal('Error', 'Failed to add expense', 'error');
    } finally {
      setLoading(false);
    }
  };

  const grandTotal = calculateGrandTotal();

  return (
    <div className='expenses'>
      <div className='expense-header'>
        <div className='title'>Add New Expense</div>
        <Link to="/expenses" className='btn info'>Back to Expenses</Link>
      </div>

      <div className="card">
        <div className="container">
          <form onSubmit={addExpense} className="form-container">
            <div className="form-section items-section">
              <h3 className="section-title">EXPENSE Items</h3>
              
              {items.map((item, index) => (
                <div key={item.id} className="item-card">
                  <div className="item-header">
                    <h4>Item {index + 1}</h4>
                    {items.length > 1 && (
                      <button 
                        type="button" 
                        className="btn danger btn-sm"
                        onClick={() => removeItem(item.id)}
                      >
                        Remove
                      </button>
                    )}
                  </div>
                  
                  <div className="form-row items-row">
                    <div className="form-group item-select">
                      <label>Expense Item *</label>
                      <select 
                        value={item.item_id}
                        onChange={(e) => updateItem(item.id, 'item_id', e.target.value)}
                        required
                      >
                        <option value="">Select Expense Item</option>
                        {expenseItems.map(expenseItem => (
                          <option key={expenseItem.item_id} value={expenseItem.item_id}>
                            {expenseItem.item_name} {expenseItem.size_unit ? `(${expenseItem.size_unit})` : ''}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="form-group quantity-input">
                      <label>Quantity *</label>
                      <input 
                        type="number" 
                        value={item.quantity}
                        onChange={(e) => updateItem(item.id, 'quantity', e.target.value)}
                        step="0.01"
                        min="0.01"
                        required 
                      />
                    </div>

                    <div className="form-group unit-price-input">
                      <label>Unit Price (Rs)</label>
                      <input 
                        type="number" 
                        value={item.unit_price}
                        onChange={(e) => updateItem(item.id, 'unit_price', e.target.value)}
                        step="0.01"
                        min="0"
                        placeholder="Auto-calculated"
                      />
                    </div>

                    <div className="form-group total-input">
                      <label>Total (Rs) *</label>
                      <input 
                        type="number" 
                        value={item.total}
                        onChange={(e) => updateItem(item.id, 'total', e.target.value)}
                        step="0.01"
                        min="0.01"
                        required
                        className="total-amount-input"
                      />
                    </div>
                  </div>
                </div>
              ))}

              <div className="form-group add-item-btn">
                <button type="button" className="btn info" onClick={addItem}>
                  + ADD ANOTHER ITEM
                </button>
              </div>
            </div>

            <div className="form-section summary-section">
              <h3 className="section-title">Expense Summary</h3>
              
              <div className="summary-card">
                <div className="summary-row">
                  <span className="summary-label">Grand Total:</span>
                  <span className="summary-value">Rs.{grandTotal.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="form-section additional-info">
              <h3 className="section-title">Additional Information</h3>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Expense Date *</label>
                  <input 
                    type="date" 
                    value={expenseDate}
                    onChange={(e) => setExpenseDate(e.target.value)}
                    required 
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Notes</label>
                <textarea 
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows="3"
                  placeholder="Any additional notes about this expense..."
                />
              </div>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn success btn-large" disabled={loading}>
                {loading ? (
                  <>
                    <span className="spinner"></span>
                    Recording Expense...
                  </>
                ) : (
                  `Record Expense (Rs.${grandTotal.toFixed(2)})`
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default ExpenseAddNew;