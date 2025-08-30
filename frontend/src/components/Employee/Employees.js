import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Modal from 'react-bootstrap/Modal';
import './Employees.scss';

import moment from 'moment';
import swal from 'sweetalert';

import Table from '../Table/Table';
import Loader from '../PageStates/Loader';
import Error from '../PageStates/Error';

function Employees() {
  const [pageState, setPageState] = useState(1); // 1: Loading, 2: Success, 3: Error
  const [employees, setEmployees] = useState([]);
  const [empCount, setEmpCount] = useState(0);
  const [searchInput, setSearchInput] = useState("");
  const [sortColumn, setSortColumn] = useState("");
  const [sortOrder, setSortOrder] = useState("");
  const [tablePage, setTablePage] = useState(1);
  const [data, setData] = useState([]);

  const [editModalShow, setEditModalShow] = useState(false);
  const [editEmployeeId, setEditEmployeeId] = useState(null);
  const [editName, setEditName] = useState('');
  const [editAddress, setEditAddress] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editModalSubmitButton, setEditModalSubmitButton] = useState(false);

  // ✅ fixed param order + default sort column
  const getEmployees = async (searchValue, sc, so, startVal) => {
    try {
      let result = await fetch('https://invenio-api-production.up.railway.app/api/get_employees', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          search_value: searchValue || '',
          sort_column: sc || 'user_name', 
          sort_order: so || 'ASC',
          start_value: startVal || 0
        }),
        credentials: 'include',
      });
      let body = await result.json();

      if (body?.operation === 'success' && body.info?.employees) {
        setEmployees(body.info.employees);
        setEmpCount(body.info.count);
        setPageState(2);
      } else {
        setPageState(3);
      }
    } catch (err) {
      console.error(err);
      setPageState(3);
    }
  };

  // ✅ corrected param order
  useEffect(() => {
    getEmployees(searchInput, sortColumn, sortOrder, (tablePage - 1) * 10);
  }, [tablePage, sortColumn, sortOrder, searchInput]);

  useEffect(() => {
    const tArray = employees.map((obj, i) => ({
      sl: i + 1,
      name: obj.user_name,
      address: obj.address,
      email: obj.email,
      addedon: moment(obj.timeStamp).format('MMMM Do, YYYY'),
      action: (
        <>
          <button
            className='btn warning'
            style={{ marginRight: '0.5rem' }}
            onClick={() => editModalInit(obj.user_id)}
          >
            View/Edit
          </button>
          <button
            className='btn danger'
            onClick={() => confirmDelete(obj.user_id)}
          >
            Delete
          </button>
        </>
      ),
    }));
    setData(tArray);
  }, [employees]);

  const confirmDelete = (id) => {
    swal({
      title: "Are you sure?",
      text: "Once deleted, this entry cannot be recovered!",
      icon: "warning",
      buttons: true,
      dangerMode: true,
    }).then((willDelete) => {
      if (willDelete) deleteEmployee(id);
    });
  };

  // ✅ backend expects employee_id, not user_id
  const deleteEmployee = async (id) => {
    let result = await fetch('https://invenio-api-production.up.railway.app/api/delete_employee', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ employee_id: id }),
      credentials: 'include',
    });
    let body = await result.json();
    if (body.operation === 'success') {
      swal('Deleted!', body.message, 'success');
      getEmployees(searchInput, sortColumn, sortOrder, (tablePage - 1) * 10);
    } else {
      swal('Oops!', body.message || 'Something went wrong', 'error');
    }
  };

  const editModalInit = (id) => {
    let emp = employees.find(e => e.user_id === id);
    if (emp) {
      setEditEmployeeId(emp.user_id);
      setEditName(emp.user_name);
      setEditAddress(emp.address);
      setEditEmail(emp.email);
      setEditModalShow(true);
    }
  };

  const updateEmployee = async () => {
    if (!editName.trim() || !editEmail.trim()) {
      return swal("Oops!", "Name and Email cannot be empty", "error");
    }
    let regex = /^[\w\-\.]+@([\w\-]+\.)+[\w\-]{2,4}$/;
    if (!regex.test(editEmail)) {
      return swal("Oops!", "Enter a valid email", "error");
    }

    setEditModalSubmitButton(true);
    let res = await fetch('https://invenio-api-production.up.railway.app/api/update_employee', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id: editEmployeeId,   // ✅ matches backend
        name: editName,
        address: editAddress,
        email: editEmail,
      }),
      credentials: 'include',
    });
    let body = await res.json();
    setEditModalSubmitButton(false);

    if (body.operation === 'success') {
      swal("Success", "Employee updated", "success");
      handleEditModalClose();
      getEmployees(searchInput, sortColumn, sortOrder, (tablePage - 1) * 10);
    } else {
      swal("Oops!", body.message, "error");
    }
  };

  const handleEditModalClose = () => {
    setEditModalShow(false);
    setEditEmployeeId(null);
    setEditName('');
    setEditAddress('');
    setEditEmail('');
  };

  return (
    <div className='employees'>
      <div className='employee-header'>
        <div className='title'>Employees</div>
        <Link to="/employees/addnew" className='btn success'>Add New</Link>
      </div>

      {pageState === 1 && <Loader />}
      {pageState === 2 && (
        <div className='card'>
          <div className='container'>
            <Table
              headers={['Serial No.', 'Name', 'Address', 'Email', 'Added on', 'Action']}
              columnOriginalNames={['user_name', 'address', 'email', 'timeStamp']}
              sortColumn={sortColumn}
              setSortColumn={setSortColumn}
              sortOrder={sortOrder}
              setSortOrder={setSortOrder}
              data={data}
              data_count={empCount}
              searchInput={searchInput}
              setSearchInput={setSearchInput}
              custom_styles={["3rem", "5rem", "6rem", "rem", "8rem", "8rem"]}
              current_page={tablePage}
              tablePageChangeFunc={setTablePage}
            />
          </div>
        </div>
      )}
      {pageState === 3 && <Error />}

      <Modal show={editModalShow} onHide={handleEditModalClose} centered>
        <Modal.Header closeButton>
          <Modal.Title>Edit Employee</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className='form-group mb-3'>
            <label>Name</label>
            <input className='form-control' type='text' value={editName} onChange={(e) => setEditName(e.target.value)} />
          </div>
          <div className='form-group mb-3'>
            <label>Address</label>
            <input className='form-control' type='text' value={editAddress} onChange={(e) => setEditAddress(e.target.value)} />
          </div>
          <div className='form-group mb-3'>
            <label>Email</label>
            <input className='form-control' type='text' value={editEmail} onChange={(e) => setEditEmail(e.target.value)} />
          </div>
        </Modal.Body>
        <Modal.Footer>
          <button className='btn btn-secondary' onClick={handleEditModalClose}>Cancel</button>
          <button className='btn btn-success' onClick={updateEmployee} disabled={editModalSubmitButton}>
            {editModalSubmitButton ? "Saving..." : "Save Changes"}
          </button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default Employees;
