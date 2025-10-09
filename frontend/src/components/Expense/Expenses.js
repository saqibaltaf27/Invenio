import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Modal from 'react-bootstrap/Modal';
import './Expenses.css';

import moment from 'moment';
import swal from 'sweetalert';

import Table from '../Table/Table';
import Loader from '../PageStates/Loader';
import Error from '../PageStates/Error';

function Expenses() {
  const [pageState, setPageState] = useState(1); // 1: Loading, 2: Success, 3: Error
  const [expenses, setExpenses] = useState([]);
  const [expenseCount, setExpenseCount] = useState(0);
  const [searchInput, setSearchInput] = useState("");
  const [sortColumn, setSortColumn] = useState("");
  const [sortOrder, setSortOrder] = useState("");
  const [tablePage, setTablePage] = useState(1);
  const [data, setData] = useState([]);

  // Modal related state variables
  const [viewModalShow, setViewModalShow] = useState(false);
  const [viewExpenseDetails, setViewExpenseDetails] = useState(null);

  const getExpenses = async (searchValue, sc, so, startVal) => {
    try {
      let result = await fetch(`http://localhost:5000/api/get_expenses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          search_value: searchValue || '',
          sort_column: sc || 'created_at',
          sort_order: so || 'DESC',
          start_value: startVal || 0
        }),
        credentials: 'include'
      });

      let body = await result.json();
      
      if (body?.info?.expenses) {
        setExpenses(body.info.expenses);
        setExpenseCount(body.info.count);
        setPageState(2);
      } else {
        setPageState(3);
      }
    } catch (err) {
      console.error(err);
      setPageState(3);
    }
  };

  useEffect(() => {
    getExpenses(searchInput, sortColumn, sortOrder, (tablePage - 1) * 10);
  }, [tablePage, sortColumn, sortOrder, searchInput]);

  useEffect(() => {
    const tArray = expenses.map((expense, i) => ({
      sl: i + 1,
      expense_ref: expense.expense_ref,
      items_count: expense.items.length,
      items_preview: expense.items.slice(0, 2).map(item => item.item_name).join(', ') + 
                    (expense.items.length > 2 ? ` +${expense.items.length - 2} more` : ''),
      grand_total: `Rs.${expense.grand_total}`,
      expense_date: moment(expense.expense_date).format('MMMM Do, YYYY'),
      addedon: moment(expense.created_at).format('MMMM Do, YYYY'),
      action: (
        <>
          <button 
            className='btn warning' 
            style={{ marginRight: '0.5rem' }} 
            onClick={() => viewModalInit(expense.expense_id)}
          >
            View
          </button>
          <button 
            className='btn danger' 
            onClick={() => confirmDelete(expense.expense_id)}
          >
            Delete
          </button>
        </>
      )
    }));
    setData(tArray);
  }, [expenses]);

  const confirmDelete = (id) => {
    swal({
      title: "Are you sure?",
      text: "Once deleted, you will not be able to recover this entry!",
      icon: "warning",
      buttons: true,
      dangerMode: true,
    }).then((willDelete) => {
      if (willDelete) deleteExpense(id);
    });
  };

  const deleteExpense = async (id) => {
    try {
      let result = await fetch(`http://localhost:5000/api/delete_expense`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ expense_id: id }),
        credentials: 'include'
      });

      let body = await result.json();
      if (body.operation === 'success') {
        getExpenses(searchInput, sortColumn, sortOrder, (tablePage - 1) * 10);
        swal('Success', body.message, 'success');
      } else {
        swal('Oops!', 'Something went wrong', 'error');
      }
    } catch (error) {
      console.error('Error deleting expense:', error);
      swal('Oops!', 'Something went wrong', 'error');
    }
  };

  const viewModalInit = async (id) => {
    try {
      const result = await fetch(`http://localhost:5000/api/get_expense_details`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ expense_id: id }),
        credentials: 'include'
      });

      const body = await result.json();
      if (body.operation === 'success') {
        setViewExpenseDetails(body.info);
        setViewModalShow(true);
      } else {
        swal('Error', 'Failed to load expense details', 'error');
      }
    } catch (error) {
      console.error('Error fetching expense details:', error);
      swal('Error', 'Failed to load expense details', 'error');
    }
  };

  const handleViewModalClose = () => {
    setViewModalShow(false);
    setViewExpenseDetails(null);
  };

  return (
    <div className='expenses'>
      <div className='expense-header'>
        <div className='title'>Expenses</div>
        <div>
          <Link to="/expenses/items" className='btn info' style={{ marginRight: '0.5rem' }}>
            Manage Expense Items
          </Link>
          <Link to="/expenses/addnew" className='btn success'>
            Add New Expense
          </Link>
        </div>
      </div>

      {pageState === 1 && <Loader />}
      {pageState === 2 && (
        <div className="card">
          <div className="container">
            <Table
              headers={['S.No', 'Expense Ref', 'Items Count', 'Items', 'Total Amount', 'Expense Date', 'Added on', 'Action']}
              columnOriginalNames={["expense_ref", "grand_total", "expense_date", "created_at"]}
              sortColumn={sortColumn}
              setSortColumn={setSortColumn}
              sortOrder={sortOrder}
              setSortOrder={setSortOrder}
              data={data}
              data_count={expenseCount}
              searchInput={searchInput}
              setSearchInput={setSearchInput}
              custom_styles={["3rem", "6rem", "5rem", "10rem", "6rem", "8rem", "8rem", "8rem"]}
              current_page={tablePage}
              tablePageChangeFunc={setTablePage}
            />
          </div>
        </div>
      )}
      {pageState === 3 && <Error />}

      <Modal show={viewModalShow} onHide={handleViewModalClose} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title className='fs-4 fw-bold' style={{ color: "#2cd498" }}>
            Expense Details - {viewExpenseDetails?.expense?.expense_ref}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ backgroundColor: "#fafafa" }}>
          <div className='container'>
            <div className='card my_card'>
              <div className='card-body'>
                {viewExpenseDetails && (
                  <>
                    <div className="form-row">
                      <div className="form-group">
                        <label className='fst-italic fw-bold'>Expense Reference</label>
                        <input className='my_form_control' type='text' value={viewExpenseDetails.expense.expense_ref} readOnly />
                      </div>
                      <div className="form-group">
                        <label className='fst-italic fw-bold'>Expense Date</label>
                        <input className='my_form_control' type='text' value={moment(viewExpenseDetails.expense.expense_date).format('MMMM Do, YYYY')} readOnly />
                      </div>
                      <div className="form-group">
                        <label className='fst-italic fw-bold'>Grand Total</label>
                        <input className='my_form_control' type='text' value={`Rs.${viewExpenseDetails.expense.grand_total}`} readOnly />
                      </div>
                    </div>

                    <div className='form-group mb-2'>
                      <label className='fst-italic fw-bold mb-2'>Expense Items:</label>
                      <div className='p-2 border rounded'>
                        <div className='mb-2 row gx-0'>
                          <div className='fw-bold text-secondary col-4 d-flex align-items-center text-uppercase justify-content-start' style={{ fontSize: "smaller" }}>Item Name</div>
                          <div className='fw-bold text-secondary col-2 d-flex align-items-center text-uppercase justify-content-center' style={{ fontSize: "smaller" }}>Size</div>
                          <div className='fw-bold text-secondary col-2 d-flex align-items-center text-uppercase justify-content-center' style={{ fontSize: "smaller" }}>Qty</div>
                          <div className='fw-bold text-secondary col-2 d-flex align-items-center text-uppercase justify-content-center' style={{ fontSize: "smaller" }}>Unit Price</div>
                          <div className='fw-bold text-secondary col-2 d-flex align-items-center text-uppercase justify-content-center' style={{ fontSize: "smaller" }}>Total</div>
                        </div>
                        {viewExpenseDetails.items.map((item, ind) => (
                          <div key={ind} className='py-2 row gx-0' style={{ borderBottom: "1px dashed lightgray" }}>
                            <div className='col-4 d-flex align-items-center justify-content-start'>{item.item_name}</div>
                            <div className='col-2 d-flex align-items-center justify-content-center'>{item.size_unit || '-'}</div>
                            <div className='col-2 d-flex align-items-center justify-content-center'>{item.quantity}</div>
                            <div className='col-2 d-flex align-items-center justify-content-center'>Rs.{item.unit_price}</div>
                            <div className='col-2 d-flex align-items-center justify-content-center'>Rs.{item.total_amount}</div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {viewExpenseDetails.expense.notes && (
                      <div className='form-group mb-2'>
                        <label className='fst-italic fw-bold'>Notes</label>
                        <textarea className='my_form_control' value={viewExpenseDetails.expense.notes} readOnly rows="3" />
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <button className='btn btn-outline-danger' onClick={handleViewModalClose}>Close</button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default Expenses;