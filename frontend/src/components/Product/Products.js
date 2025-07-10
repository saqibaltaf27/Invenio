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
  product_id: null,
  name: '',
  type: 'Regular',
  size: '',
  material: '',
  category: '',
  description: '',
  product_stock: '0',
  selling_price: '0',
  purchase_price: '0',
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

  useEffect(() => {
    fetchProducts();
  }, [tablePage, sortColumn, sortOrder, searchInput]);

  useEffect(() => {
    const formattedData = products.map((p, i) => ({
      sl: (tablePage - 1) * 10 + i + 1,
      name: p.name,
      type: p.type,
      size: p.size,
      stock: p.product_stock,
      addedon: moment(p.timeStamp).format('MMM Do, YYYY'),
      action: (
  <>
    <button
      className="btn warning"
      style={{ marginRight: '0.5rem' }}
      onClick={() => openEditModal(p)}
    >
      Edit
    </button>
    <button
      className="btn danger"
      onClick={() => deleteProduct(p.product_id)}
    >
      Delete
    </button>
  </>
),
    }));
    setTableData(formattedData);
  }, [products]);

  const fetchProducts = async () => {
    try {
      const res = await fetch("https://invenio-api-production.up.railway.app/api/get_products", {
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

  const openEditModal = (product) => {
    setEditProduct({
      product_id: product.product_id,
      name: product.name,
      type: product.type || 'Regular',
      size: product.size,
      material: product.material,
      category: product.category,
      description: product.description,
      product_stock: product.product_stock,
      selling_price: product.selling_price.toString(),
      purchase_price: product.purchase_price.toString(),
      oldImage: product.image,
      image: '',
    });
    setPreviewImage(null);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditProduct(initialProduct);
    setPreviewImage(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setEditProduct(p => ({ ...p, image: file }));
    const reader = new FileReader();
    reader.onloadend = () => setPreviewImage(reader.result);
    reader.readAsDataURL(file);
  };

  const validate = () => {
    const { name, purchase_price, product_stock } = editProduct;
    if (!name || purchase_price <= 0 || product_stock < 0) {
      swal("Check Inputs", "Invalid fields", "error");
      return false;
    }
    return true;
  };

  const updateProduct = async () => {
    if (!validate()) return;

    const body = JSON.stringify(editProduct)

    setIsUpdating(true);
    try {
      const res = await fetch( //'http://localhost:5000/api/update_product', {
        'https://invenio-api-production.up.railway.app/api/update_product', {
        method: 'POST',
        headers: {
        'Content-Type': 'application/json',
        },
        body: body,
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
    swal({
      title: "Are you sure?",
      text: "Once deleted, you will not be able to recover this product!",
      icon: "warning",
      buttons: ["Cancel", "Delete"],
      dangerMode: true,
    })
    .then((willDelete) => {
      if (willDelete) {
        fetch( //'http://localhost:5000/api/delete_product', {
          'https://invenio-api-production.up.railway.app/api/delete_product', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ product_id: id }),
          credentials: 'include',
        })
        .then(res => res.json())
        .then(data => {
          if (data.operation === 'success') {
            swal("Deleted!", data.message, "success");
            fetchProducts();
          } else {
            swal("Oops!", "Failed to delete", "error");
          }
        })
        .catch(() => {
          swal("Oops!", "Something went wrong", "error");
        });
      } else {
        swal("Your product is safe!", {
          icon: "info",
        });
      }
    });
  };

  const renderModal = () => (
    <Modal show={showModal} onHide={closeModal} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Edit Product</Modal.Title>
      </Modal.Header>
      <Modal.Body style={{ maxHeight: '70vh', overflowY: 'auto' }} >
        <div className="modal-content">
          {[
          { key: 'name', label: 'Name' },
          { key: 'size', label: 'Size' },
          { key: 'material', label: 'Material' },
          { key: 'category', label: 'Category' },
          { key: 'description', label: 'Description' },
          { key: 'product_stock', label: 'Stock' },
          { key: 'selling_price', label: 'Selling Price' },
          { key: 'purchase_price', label: 'Purchase Price' },
        ].map(({ key, label }) => (
          <div className="input-group" key={key}>
            <label>{label}</label>
            <input
              type="text"
              value={editProduct[key]}
              onChange={(e) =>
                setEditProduct((prev) => ({ ...prev, [key]: e.target.value }))
              }
            />
          </div>
        ))}

          <div className='input-group'>
            <label className='fw-bold'>Type</label>
            <select
              className='form-select'
              value={editProduct.type}
              onChange={(e) => setEditProduct((prev) => ({ ...prev, type: e.target.value }))}
            >
              <option value="regular">Regular</option>
              <option value="foc">Free of Cost</option>
              <option value="discounted">Discounted</option>
              <option value="wastage">Wastage</option>
              <option value="staff">Staff</option>
            </select>
          </div>
          <div className="modal-footer">
            <button className="btn btn-danger" onClick={closeModal}>Cancel</button>
            <button className="btn btn-success" onClick={updateProduct} disabled={isUpdating}>
              {isUpdating ? 'Updating...' : 'Update'}
            </button>
          </div>
        </div>
      </Modal.Body>
    </Modal>
  );

  return (
    <div className='products'>
      <div className='product-header'>
        <div className='title'>Products</div>
        <Link to="/products/addnew" className='btn success'>Add New</Link>
      </div>

      {pageState === 1 && <Loader />}
      {pageState === 2 && (
        <Table
          title="Products"
          headers={['Serial No', 'Name', 'Type', 'Size', 'Stock', 'Added On', 'Action']}
          data={tableData}
          defaultPageSize={10}
          totalRecords={prodCount}
          currentPage={tablePage}
          onSearch={setSearchInput}
          onSort={(column, order) => {
            setSortColumn(column);
            setSortOrder(order);
          }}
          onPageChange={setTablePage}
        />
      )}
      {pageState === 3 && <ErrorComponent />}
      {renderModal()}
    </div>
  );
};

export default Products;
