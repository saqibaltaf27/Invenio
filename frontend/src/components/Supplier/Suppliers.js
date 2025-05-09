import React, { useEffect, useState } from 'react';
import { Link } from "react-router-dom";
import Modal from 'react-bootstrap/Modal';
import moment from 'moment';
import swal from 'sweetalert';

import './Suppliers.scss';
import Table from '../Table/Table';
import Loader from '../PageStates/Loader';
import ErrorComponent from '../PageStates/Error';

const Suppliers = () => {
  const [pageState, setPageState] = useState(1); // 1: loading, 2: loaded, 3: error
  const [suppliers, setSuppliers] = useState([]);
  const [supplierCount, setSupplierCount] = useState(0);
  const [tableData, setTableData] = useState([]);

  const [searchInput, setSearchInput] = useState("");
  const [sortColumn, setSortColumn] = useState("");
  const [sortOrder, setSortOrder] = useState("");
  const [tablePage, setTablePage] = useState(1);

  const [editModalShow, setEditModalShow] = useState(false);
  const [editModalSubmitButton, setEditModalSubmitButton] = useState(false);

  const [editSupplier, setEditSupplier] = useState({
    supplier_id: null,
    name: '',
    address: '',
    email: '',
    phone: '' // Added phone to the state
  });

  const fetchSuppliers = async (start = 0, column = "", order = "", search = "") => {
    try {
      const res = await fetch(`https://invenio-api-production.up.railway.app/api/get_suppliers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          start_value: start,
          sort_column: column,
          sort_order: order,
          search_value: search
        }),
        credentials: 'include'
      });

      const body = await res.json();
      const info = body?.info;

      if (!info || !Array.isArray(info.suppliers)) throw new Error("Invalid response structure");

      setSuppliers(info.suppliers);
      setSupplierCount(info.count);
      setPageState(2);
    } catch (error) {
      console.error("Failed to fetch suppliers:", error);
      setPageState(3);
    }
  };

  useEffect(() => {
    fetchSuppliers((tablePage - 1) * 10, sortColumn, sortOrder, searchInput);
  }, [tablePage, sortColumn, sortOrder, searchInput]);

  useEffect(() => {
    const formattedData = suppliers.map((s, idx) => ({
      sl: idx + 1,
      name: s.name,
      address: s.address,
      email: s.email,
      phone: s.phone, // Included phone in the table data
      addedon: moment(s.timeStamp).format('MMMM Do, YYYY'),
      action: (
        <>
          <button className="btn warning" onClick={() => openEditModal(s)}>View/Edit</button>
          <button className="btn danger" style={{ marginLeft: '0.5rem' }} onClick={() => confirmDeleteSupplier(s.supplier_id)}>Delete</button>
        </>
      )
    }));
    setTableData(formattedData);
  }, [suppliers]);

  const confirmDeleteSupplier = (id) => {
    swal({
      title: "Are you sure?",
      text: "Once deleted, you will not be able to recover this entry!",
      icon: "warning",
      buttons: true,
      dangerMode: true,
    }).then(willDelete => {
      if (willDelete) deleteSupplier(id);
    });
  };

  const deleteSupplier = async (id) => {
    try {
      const res = await fetch(`https://invenio-api-production.up.railway.app/api/delete_supplier`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ supplier_id: id }),
        credentials: 'include'
      });

      const body = await res.json();
      if (body.operation === 'success') {
        swal('Success', body.message, 'success');
        fetchSuppliers((tablePage - 1) * 10, sortColumn, sortOrder, searchInput);
      } else {
        swal('Oops!', 'Something went wrong', 'error');
      }
    } catch (err) {
      console.error(err);
      swal('Oops!', 'Server error', 'error');
    }
  };

  const openEditModal = (supplier) => {
    setEditSupplier({
      supplier_id: supplier.supplier_id,
      name: supplier.name,
      address: supplier.address,
      email: supplier.email,
      phone: supplier.phone // Set phone in the edit modal state
    });
    setEditModalShow(true);
  };

  const handleModalClose = () => {
    setEditModalShow(false);
    setEditSupplier({ supplier_id: null, name: '', address: '', email: '', phone: '' }); // Reset phone as well
  };

  const handleInputChange = (field, value) => {
    setEditSupplier(prev => ({ ...prev, [field]: value }));
  };

  const updateSupplier = async () => {
    const { supplier_id, name, address, email, phone } = editSupplier; // Include phone

    if (!name || !email) {
      swal("Oops!", "Name and Email can't be empty", "error");
      return;
    }

    const emailRegex = /^([a-zA-Z0-9_\-\.]+)@([a-zA-Z0-9_\-\.]+)\.([a-zA-z]+)$/;
    if (!emailRegex.test(email)) {
      swal("Oops!", "Please enter a valid email", "error");
      return;
    }

    setEditModalSubmitButton(true);

    try {
      const res = await fetch(`https://invenio-api-production.up.railway.app/api/update_supplier`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ supplier_id, name, address, email, phone }), // Include phone in the body
        credentials: 'include'
      });

      const body = await res.json();
      setEditModalSubmitButton(false);

      if (body.operation === 'success') {
        swal("Success!", "Supplier updated successfully", "success");
        handleModalClose();
        fetchSuppliers((tablePage - 1) * 10, sortColumn, sortOrder, searchInput);
      } else {
        swal("Oops!", body.message || "Update failed", "error");
      }
    } catch (err) {
      setEditModalSubmitButton(false);
      swal("Oops!", "Server error", "error");
    }
  };

  return (
    <div className='suppliers'>
      <div style={{ overflow: "scroll", height: "100%" }}>
        <div className='supplier-header'>
          <div className='title'>Suppliers</div>
          <Link to="/suppliers/addnew" className='btn success' style={{ margin: "0 0.5rem" }}>Add New</Link>
        </div>

        {pageState === 1 ? (
          <Loader />
        ) : pageState === 2 ? (
          <div className="card">
            <div className="container">
              <Table
                headers={['Sl.', 'Name', 'Address', 'Email', 'Phone', 'Added on', 'Action']} // Added 'Phone' header
                columnOriginalNames={["name", "address", "email", "phone", "timeStamp"]} // Included 'phone'
                sortColumn={sortColumn}
                setSortColumn={setSortColumn}
                sortOrder={sortOrder}
                setSortOrder={setSortOrder}
                data={tableData}
                data_count={supplierCount}
                searchInput={searchInput}
                setSearchInput={setSearchInput}
                custom_styles={["3rem", "5rem", "8rem", "5rem", "5rem", "8rem", "10rem"]} // Adjusted column widths
                current_page={tablePage}
                tablePageChangeFunc={setTablePage}
              />
            </div>
          </div>
        ) : (
          <ErrorComponent />
        )}

        <Modal show={editModalShow} onHide={handleModalClose} size="lg" centered>
          <Modal.Header closeButton>
            <Modal.Title className='fs-4 fw-bold' style={{ color: "#2cd498" }}>View / Edit Supplier</Modal.Title>
          </Modal.Header>
          <Modal.Body style={{ backgroundColor: "#fafafa" }}>
            <div className='container d-flex gap-2'>
              <div className='card my_card' style={{ flex: 1 }}>
                <div className='card-body'>
                  <div className='form-group mb-2'>
                    <label className='fst-italic fw-bold'>Name</label>
                    <input className='my_form_control' type='text' value={editSupplier.name} onChange={(e) => handleInputChange("name", e.target.value)} />
                  </div>
                  <div className='form-group mb-2'>
                    <label className='fst-italic fw-bold'>Address</label>
                    <input className='my_form_control' type='text' value={editSupplier.address} onChange={(e) => handleInputChange("address", e.target.value)} />
                  </div>
                  <div className='form-group mb-2'>
                    <label className='fst-italic fw-bold'>Email</label>
                    <input className='my_form_control' type='text' value={editSupplier.email} onChange={(e) => handleInputChange("email", e.target.value)} />
                  </div>
                  <div className='form-group mb-2'>
                    <label className='fst-italic fw-bold'>Phone</label>
                    <input className='my_form_control' type='text' value={editSupplier.phone} onChange={(e) => handleInputChange("phone", e.target.value)} />
                  </div>
                </div>
              </div>
            </div>
          </Modal.Body>
          <Modal.Footer>
            <button className='btn btn-outline-danger' onClick={handleModalClose}>Cancel</button>
            <button className='btn btn-outline-success'
              onClick={() =>
                swal({
                  title: "Are you sure?",
                  text: "Do you want to save these changes?",
                  icon: "warning",
                  buttons: true,
                }).then(confirm => {
                  if (confirm) updateSupplier();
                })
              }
              disabled={editModalSubmitButton}
            >
              {editModalSubmitButton ? 'Updating...' : 'Update'}
            </button>
          </Modal.Footer>
        </Modal>
      </div>
    </div>
  );
};

export default Suppliers;