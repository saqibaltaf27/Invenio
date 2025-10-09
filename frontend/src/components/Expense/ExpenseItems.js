import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import swal from 'sweetalert';
import moment from 'moment';
import './ExpenseItems.css';

function ExpenseItems() {
  const [items, setItems] = useState([]);
  const [itemName, setItemName] = useState('');
  const [sizeUnit, setSizeUnit] = useState('');
  const [description, setDescription] = useState('');
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
        setItems(body.info.items);
      }
    } catch (error) {
      console.error('Error fetching expense items:', error);
    }
  };

  const addExpenseItem = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const result = await fetch(`http://localhost:5000/api/add_expense_item`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          item_name: itemName,
          size_unit: sizeUnit,
          description: description
        }),
        credentials: 'include'
      });
      
      const body = await result.json();
      if (body.operation === 'success') {
        swal('Success', body.message, 'success');
        setItemName('');
        setSizeUnit('');
        setDescription('');
        fetchExpenseItems();
      } else {
        swal('Error', body.message, 'error');
      }
    } catch (error) {
      console.error('Error adding expense item:', error);
      swal('Error', 'Failed to add expense item', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='expenses'>
      <div className='expense-header'>
        <div className='title'>Manage Expense Items</div>
        <Link to="/expenses" className='btn info'>Back to Expenses</Link>
      </div>

      <div className="card">
        <div className="container">
          <h3>Add New Expense Item</h3>
          <form onSubmit={addExpenseItem} className="form-container">
            <div className="form-row">
              <div className="form-group">
                <label>Item Name *</label>
                <input 
                  type="text" 
                  value={itemName}
                  onChange={(e) => setItemName(e.target.value)}
                  required 
                  placeholder="Enter item name"
                />
              </div>
              <div className="form-group">
                <label>Size Unit</label>
                <input 
                  type="text" 
                  value={sizeUnit}
                  onChange={(e) => setSizeUnit(e.target.value)}
                  placeholder="kg, liter, piece, etc."
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <input 
                  type="text" 
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Enter description"
                />
              </div>
              <div className="form-group form-group-button">
                <button type="submit" className="btn success" disabled={loading}>
                  {loading ? (
                    <>
                      <span className="spinner"></span>
                      Adding...
                    </>
                  ) : (
                    'Add Item'
                  )}
                </button>
              </div>
            </div>
          </form>

          <h3 style={{ marginTop: '2rem' }}>Existing Expense Items ({items.length})</h3>
          <table className="table">
            <thead>
              <tr>
                <th>S.No</th>
                <th>Item Code</th>
                <th>Item Name</th>
                <th>Size Unit</th>
                <th>Description</th>
                <th>Created Date</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, index) => (
                <tr key={item.item_id}>
                  <td>{index + 1}</td>
                  <td>{item.item_code}</td>
                  <td>{item.item_name}</td>
                  <td>{item.size_unit || '-'}</td>
                  <td>{item.description || '-'}</td>
                  <td>{moment(item.created_at).format('MMM D, YYYY')}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {items.length === 0 && (
            <div className="no-data">
              No expense items found. Add your first expense item above.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ExpenseItems;