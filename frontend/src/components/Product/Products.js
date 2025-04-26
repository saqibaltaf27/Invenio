// src/pages/Products.js

import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import moment from 'moment';
import swal from 'sweetalert';
import Modal from 'react-bootstrap/Modal';

import Table from '../Table/Table';
import Loader from '../PageStates/Loader';
import ErrorComponent from '../PageStates/Error';
import './Products.scss';

const initialProduct = {
  productId: null,
  name: '',
  gender: '',
  size: '',
  material: '',
  category: '',
  description: '',
  stock: '0',
  sellingPrice: '0',
  purchasePrice: '0',
  oldImage: null,
  image: '',
};

const Products = () => {
  const [products, setProducts] = useState([]);
  const [pageState, setPageState] = useState(1);
  const [prodCount, setProdCount] = useState(0);
  const [searchInput, setSearchInput] = useState("");
  const [sortColumn, setSortColumn] = useState("");
  const [sortOrder, setSortOrder] = useState("");
  const [tablePage, setTablePage] = useState(1);
  const [tableData, setTableData] = useState([]);
  const [editProduct, setEditProduct] = useState(initialProduct);
  const [showModal, setShowModal] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const fileInputRef = useRef(null);

  const fetchProducts = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/get_products", {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          start_value: (tablePage - 1) * 10,
          sort_column: sortColumn || 'name',
          sort_order: sortOrder || 'ASC',
          search_value: searchInput.trim(),
        }),
      });

      const data = await res.json();
      if (data?.info?.products) {
        setProducts(data.info.products);
        setProdCount(data.info.count || 0);
        setPageState(2);
      } else throw new Error();
    } catch {
      setPageState(3);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [tablePage, sortColumn, sortOrder, searchInput]);

  useEffect(() => {
    setTableData(products.map((p, i) => ({
      sl: (tablePage - 1) * 10 + i + 1,
      name: p.name,
      gender: p.gender,
      size: p.size,
      stock: p.product_stock,
      addedon: moment(p.timeStamp).format('MMM Do, YYYY'),
      action: (
        <>
          <button className="btn warning" onClick={() => openEditModal(p)}>Edit</button>
          <button className="btn danger" onClick={() => deleteProduct(p.product_id)}>Delete</button>
        </>
      )
    })));
  }, [products]);

  const openEditModal = (product) => {
    setEditProduct({
      productId: product.product_id,
      name: product.name,
      gender: product.gender,
      size: product.size,
      material: product.material,
      category: product.category,
      description: product.description,
      stock: product.product_stock.toString(),
      sellingPrice: product.selling_price.toString(),
      purchasePrice: product.purchase_price.toString(),
      oldImage: product.image,
      image: '',
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditProduct(initialProduct);
    setPreviewImage(null);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setEditProduct(p => ({ ...p, image: file }));
    const reader = new FileReader();
    reader.onloadend = () => setPreviewImage(reader.result);
    reader.readAsDataURL(file);
  };

  const validate = () => {
    const { name, sellingPrice, purchasePrice, stock } = editProduct;
    if (!name || sellingPrice <= 0 || purchasePrice <= 0 || stock < 0) {
      swal("Check Inputs", "Invalid fields", "error");
      return false;
    }
    return true;
  };

  const updateProduct = async () => {
    if (!validate()) return;

    const formData = new FormData();
    Object.entries(editProduct).forEach(([k, v]) => formData.append(k, v));

    setIsUpdating(true);
    try {
      const res = await fetch('http://localhost:5000/api/update_product', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });

      const data = await res.json();
      setIsUpdating(false);
      if (data.operation === 'success') {
        swal("Updated!", "Product updated", "success");
        fetchProducts();
        closeModal();
      } else {
        swal("Oops!", data.message, "error");
      }
    } catch {
      setIsUpdating(false);
      swal("Oops!", "Something went wrong", "error");
    }
  };

  const deleteProduct = async (id) => {
    try {
      const res = await fetch('http://localhost:5000/api/delete_product', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product_id: id }),
        credentials: 'include',
      });
      const data = await res.json();
      if (data.operation === 'success') {
        swal("Deleted!", data.message, "success");
        fetchProducts();
      } else {
        swal("Oops!", "Failed to delete", "error");
      }
    } catch {
      swal("Oops!", "Something went wrong", "error");
    }
  };

  const renderModal = () => (
    <Modal show={showModal} onHide={closeModal} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Edit Product</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="modal-content">
          {Object.entries(editProduct).map(([key, val]) =>
            ['productId', 'oldImage', 'image'].includes(key) ? null : (
              <div className="input-group" key={key}>
                <label>{key.charAt(0).toUpperCase() + key.slice(1)}</label>
                <input type="text" value={val} onChange={(e) => setEditProduct(p => ({ ...p, [key]: e.target.value }))} />
              </div>
            )
          )}
          <div className="input-group">
            <label>Image</label>
            <input type="file" accept="image/*" onChange={handleFileChange} ref={fileInputRef} />
            {previewImage && <img src={previewImage} alt="Preview" />}
          </div>
          <div className="modal-footer">
            <button className="btn cancel" onClick={closeModal}>Cancel</button>
            <button className="btn submit" onClick={updateProduct} disabled={isUpdating}>
              {isUpdating ? 'Updating...' : 'Update'}
            </button>
          </div>
        </div>
      </Modal.Body>
    </Modal>
  );

  return (
    <div className="container">
      <h2>Manage Products</h2>
      {pageState === 1 && <Loader />}
      {pageState === 2 && (
        <>
          <div className="header">
            <input type="text" placeholder="Search..." value={searchInput} onChange={e => setSearchInput(e.target.value)} />
            <Link to="/add-product" className="add-btn">Add Product</Link>
          </div>
          <Table
            columns={['#', 'Name', 'Gender', 'Size', 'Stock', 'Added On', 'Actions']}
            data={tableData}
            page={tablePage}
            setPage={setTablePage}
            count={prodCount}
            sortColumn={sortColumn}
            sortOrder={sortOrder}
            setSortColumn={setSortColumn}
            setSortOrder={setSortOrder}
          />
        </>
      )}
      {pageState === 3 && <ErrorComponent />}
      {renderModal()}
    </div>
  );
};

export default Products;