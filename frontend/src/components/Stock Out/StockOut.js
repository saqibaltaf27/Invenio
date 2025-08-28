import React, { useState, useEffect, useMemo, useCallback, useRef, startTransition } from 'react';
import axios from 'axios';
import {
  Button,
  Table,
  Form,
  Card,
  Container,
  Row,
  Col,
  Modal,
  Pagination,
} from 'react-bootstrap';
import Loader from '../PageStates/Loader';
import ErrorComponent from '../PageStates/Error';
import Swal from 'sweetalert2';
import './StockOut.scss';

/**
 * PERFORMANCE STRATEGY
 * - React.memo for row/table components
 * - useMemo for derived data (product map, paginated logs, totals)
 * - O(1) product lookup instead of Array.find
 * - Stable handlers via useCallback; avoid inline lambdas in lists
 * - Keep UI responsive with startTransition around heavy setState
 * - Avoid unnecessary pageState flicker during background refreshes
 * - Optional server-side pagination (fallback to client-side slice)
 */

// --- StockOutItem (memoized) ---
const StockOutItem = React.memo(function StockOutItem({
  item,
  index,
  products,
  onProductChange,
  onSupplierChange,
  onQuantityChange,
  onRemoveItem,
}) {
  const selectedProduct = products.find((p) => p.product_id === item.product_id);
  const purchaseHistory = selectedProduct?.purchase_history || [];

  const handleProductChangeLocal = useCallback(
    (e) => onProductChange(index, e.target.value),
    [onProductChange, index]
  );

  const handleQtyChangeLocal = useCallback(
    (e) => onQuantityChange(index, e.target.value),
    [onQuantityChange, index]
  );

  const handleSupplierChangeLocal = useCallback(
    (e) => onSupplierChange(index, e.target.value, purchaseHistory),
    [onSupplierChange, index, purchaseHistory]
  );

  const handleRemoveLocal = useCallback(() => onRemoveItem(index), [onRemoveItem, index]);

  return (
    <Row className="stock-out__item-row">
      <Col md={3} sm={12}>
        <Form.Group className="stock-out__form-group">
          <Form.Label>Product</Form.Label>
          <Form.Select value={item.product_id} onChange={handleProductChangeLocal} className="form-control">
            <option value="">Select Product</option>
            {products.map(({ product_id, name }) => (
              <option key={product_id} value={product_id}>
                {name}
              </option>
            ))}
          </Form.Select>
        </Form.Group>
      </Col>

      <Col md={2} sm={6}>
        <Form.Group className="stock-out__form-group">
          <Form.Label>Qty To Remove</Form.Label>
          <Form.Control type="number" value={item.quantity} onChange={handleQtyChangeLocal} min="1" className="form-control" />
        </Form.Group>
      </Col>

      <Col md={2} sm={6}>
        <Form.Group className="stock-out__form-group">
          <Form.Label>Current Stock</Form.Label>
          <Form.Control type="text" value={item.stock} disabled className="form-control" />
        </Form.Group>
      </Col>

      <Col md={2} sm={6}>
        <Form.Group className="stock-out__form-group">
          <Form.Label>Supplier</Form.Label>
          <Form.Select
            value={`${item.supplier_id || ''}-${item.purchase_price || ''}`}
            onChange={handleSupplierChangeLocal}
            disabled={!item.product_id || purchaseHistory.length === 0}
            className="form-control"
          >
            <option value="">Select Supplier/Price</option>
            {purchaseHistory.map((ph, idx) => (
              <option key={`${ph.supplier_id}-${ph.purchase_price}-${idx}`} value={`${ph.supplier_id}-${ph.purchase_price}`}>
                {ph.supplier_name} (Price: {Number(ph.purchase_price).toFixed(2)} - Qty: {ph.purchase_quantity})
              </option>
            ))}
          </Form.Select>
        </Form.Group>
      </Col>

      <Col md={2} sm={6}>
        <Form.Group className="stock-out__form-group">
          <Form.Label>Purchase Price</Form.Label>
          <Form.Control
            type="text"
            value={item.purchase_price ? `${Number(item.purchase_price).toFixed(2)}` : 'N/A'}
            disabled
            className="form-control"
          />
        </Form.Group>
      </Col>

      <Col md={1} sm={12} className="d-flex align-items-end justify-content-center mt-md-0 mt-3">
        <Button variant="danger" size="sm" onClick={handleRemoveLocal}>
          Remove
        </Button>
      </Col>
    </Row>
  );
});

// --- ItemsTable (memoized) ---
const ItemsTable = React.memo(function ItemsTable({ items, onRemoveItem }) {
  const totalQty = useMemo(
    () => items.reduce((sum, item) => sum + (parseFloat(item.quantity) || 0), 0),
    [items]
  );

  const handleRemove = useCallback(
    (e) => {
      const idx = Number(e.currentTarget.getAttribute('data-index'));
      onRemoveItem(idx);
    },
    [onRemoveItem]
  );

  return (
    <Card className="stock-out__card">
      <Card.Body>
        <h4>Items for Stock Out</h4>
        <div className="table-responsive">
          <Table bordered className="stock-out__table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Qty To Remove</th>
                <th>Current Stock</th>
                <th>Purchase Price</th>
                <th>Supplier</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, index) => (
                <tr key={`${item.product_id || 'new'}-${index}`}>
                  <td>{item.name}</td>
                  <td>{item.quantity}</td>
                  <td>{item.stock}</td>
                  <td>{item.purchase_price ? `${Number(item.purchase_price).toFixed(2)}` : 'N/A'}</td>
                  <td>{item.supplier_name || 'N/A'}</td>
                  <td>
                    <Button variant="danger" size="sm" data-index={index} onClick={handleRemove}>
                      Remove
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
        <Row className="stock-out__total-row mt-3">
          <Col md={6}>
            <h5>Total Quantity: {totalQty}</h5>
          </Col>
        </Row>
      </Card.Body>
    </Card>
  );
});

// --- Main Component ---
export default function StockOut() {
  const [products, setProducts] = useState([]);
  const [stockOutLogs, setStockOutLogs] = useState([]);
  const [items, setItems] = useState([
    { product_id: '', name: '', quantity: '', stock: 0, supplier_id: '', supplier_name: '', purchase_price: 0 },
  ]);
  const [customerInfo, setCustomerInfo] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successModalVisible, setSuccessModalVisible] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [logsPerPage] = useState(5);

  // Page states: 1 = loading, 2 = loaded, 3 = error
  const [pageState, setPageState] = useState(1);
  const firstLoadRef = useRef(true);

  // Derived lookups
  const productMap = useMemo(() => {
    const map = Object.create(null);
    for (const p of products) map[p.product_id] = p;
    return map;
  }, [products]);

  const totalPages = useMemo(
    () => Math.ceil(stockOutLogs.length / logsPerPage) || 1,
    [stockOutLogs.length, logsPerPage]
  );

  const currentLogs = useMemo(() => {
    const start = (currentPage - 1) * logsPerPage;
    const end = start + logsPerPage;
    return stockOutLogs.slice(start, end);
  }, [stockOutLogs, currentPage, logsPerPage]);

  const fetchData = useCallback(async (opts = { showLoader: false }) => {
    if (opts.showLoader) setPageState(1);
    try {
      // OPTIONAL: If your backend supports server pagination, use it:
      // const [productsRes, logsRes] = await Promise.all([
      //   axios.get('/api/products-full-details'),
      //   axios.get('/api/stock-out-logs', { params: { page: currentPage, limit: logsPerPage } })
      // ]);

      const [productsRes, logsRes] = await Promise.all([
        axios.get('https://invenio-api-production.up.railway.app/api/products-full-details'),
        axios.get('https://invenio-api-production.up.railway.app/api/stock-out-logs'),
      ]);

      startTransition(() => {
        setProducts(productsRes.data || []);
        setStockOutLogs(logsRes.data || []);
        if (firstLoadRef.current || opts.showLoader) setPageState(2);
        firstLoadRef.current = false;
      });
    } catch (err) {
      console.error('Error fetching data:', err);
      setPageState(3);
    }
  }, [/* currentPage, logsPerPage */]);

  useEffect(() => {
    // Initial mount shows loader
    fetchData({ showLoader: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handlers
  const handleProductChange = useCallback(
    (index, product_id) => {
      const selectedProduct = productMap[product_id];
      setItems((prev) => {
        const updated = [...prev];
        const current = { ...updated[index] };
        current.product_id = product_id;
        current.name = selectedProduct?.name || '';
        current.stock = selectedProduct?.product_stock || 0;
        current.supplier_id = '';
        current.supplier_name = '';
        current.purchase_price = 0;

        // Preselect first purchase history record if available
        const ph = selectedProduct?.purchase_history?.[0];
        if (ph) {
          current.supplier_id = ph.supplier_id;
          current.supplier_name = ph.supplier_name;
          current.purchase_price = ph.purchase_price;
        }

        updated[index] = current;
        return updated;
      });
    },
    [productMap]
  );

  const handleSupplierChange = useCallback((index, selectedValue, purchaseHistoryForProduct) => {
    const [supplier_id, purchase_price_str] = String(selectedValue).split('-');
    const purchase_price = parseFloat(purchase_price_str);

    const selectedPurchaseRecord = purchaseHistoryForProduct?.find(
      (ph) => String(ph.supplier_id) === String(supplier_id) && Number(ph.purchase_price) === Number(purchase_price)
    );

    setItems((prev) => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        supplier_id: selectedPurchaseRecord?.supplier_id || '',
        supplier_name: selectedPurchaseRecord?.supplier_name || 'N/A',
        purchase_price: selectedPurchaseRecord?.purchase_price || 0,
      };
      return updated;
    });
  }, []);

  const handleQuantityChange = useCallback((index, value) => {
    setItems((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], quantity: value };
      return updated;
    });
  }, []);

  const addItem = useCallback(() => {
    setItems((prev) => [
      ...prev,
      { product_id: '', name: '', quantity: '', stock: 0, supplier_id: '', supplier_name: '', purchase_price: 0 },
    ]);
  }, []);

  const removeItem = useCallback((index) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const validateItems = useCallback(() => {
    const errors = [];
    for (const item of items) {
      if (!item.product_id) errors.push('Please select a product for all items.');
      if (!item.supplier_id || Number(item.purchase_price) === 0)
        errors.push(`Please select a supplier/price for product: ${item.name || item.product_id}`);
      const parsedQuantity = parseFloat(item.quantity);
      if (isNaN(parsedQuantity) || parsedQuantity <= 0)
        errors.push(`Quantity for product ${item.name || item.product_id} must be a positive number.`);
      if (parsedQuantity > Number(item.stock))
        errors.push(
          `Not enough stock for product ${item.name || item.product_id}. Available: ${item.stock}, Requested: ${parsedQuantity}.`
        );
    }
    return errors;
  }, [items]);

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      const errors = validateItems();
      if (errors.length) {
        await Swal.fire({ icon: 'error', title: 'Validation Errors', html: `<ul style="text-align:left">${errors
          .map((e) => `<li>${e}</li>`)
          .join('')}</ul>` });
        return;
      }

      const data = {
        customer_info: customerInfo.trim() === '' ? 'N/A' : customerInfo,
        items: items.map(({ product_id, quantity, supplier_id, purchase_price }) => ({
          product_id,
          quantity: parseFloat(quantity),
          supplier_id,
          purchase_price,
        })),
      };

      setIsSubmitting(true);
      try {
        await axios.post('https://invenio-api-production.up.railway.app/api/stock-out', data);
        setSuccessModalVisible(true);
        setItems([{ product_id: '', name: '', quantity: '', stock: 0, supplier_id: '', supplier_name: '', purchase_price: 0 }]);
        setCustomerInfo('');
        // Refresh data without flicker
        fetchData({ showLoader: false });
      } catch (err) {
        console.error('Stock out submission error:', err);
        Swal.fire({ icon: 'error', title: 'Error', text: 'Failed to process stock out. Please try again.' });
      } finally {
        setIsSubmitting(false);
      }
    },
    [customerInfo, items, validateItems, fetchData]
  );

  // Delete handlers
  const handleDeleteClick = useCallback(async (id) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: 'This will permanently delete the stock-out log!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel',
    });

    if (!result.isConfirmed) return;

    try {
      await axios.delete(`https://invenio-api-production.up.railway.app/api/stock-out/${id}`);
      await Swal.fire({
        icon: 'success',
        title: 'Deleted!',
        text: 'The stock-out log has been deleted.',
        timer: 1500,
        showConfirmButton: false,
      });
      fetchData({ showLoader: false });
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Error', text: 'Failed to delete stock-out log.' });
      console.error(err);
    }
  }, [fetchData]);

  const onDeleteBtnClick = useCallback(
    (e) => {
      const id = e.currentTarget.getAttribute('data-id');
      if (id) handleDeleteClick(id);
    },
    [handleDeleteClick]
  );

  const paginate = useCallback((pageNumber) => setCurrentPage(pageNumber), []);

  return (
    <Container fluid className="stock-out">
      <h2>Stock Out</h2>

      {pageState === 1 ? (
        <Loader />
      ) : pageState === 2 ? (
        <>
          {/* Success Modal */}
          <Modal show={successModalVisible} onHide={() => setSuccessModalVisible(false)} centered>
            <Modal.Header closeButton>
              <Modal.Title>Stock Out Successful</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <p>Your stock-out has been successfully processed!</p>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={() => setSuccessModalVisible(false)}>
                Close
              </Button>
            </Modal.Footer>
          </Modal>

          {/* Stock Out Form */}
          <Card className="stock-out__card">
            <Card.Body>
              <h4 className="mb-3">Stock Out Details</h4>
              <Row className="mb-4">
                <Col md={12}>
                  <Form.Group className="stock-out__form-group">
                    <Form.Label>Customer Information (Optional)</Form.Label>
                    <Form.Control
                      type="text"
                      value={customerInfo}
                      onChange={(e) => setCustomerInfo(e.target.value)}
                      placeholder="e.g., John Doe / Sale Invoice #123"
                    />
                  </Form.Group>
                </Col>
              </Row>

              <h4 className="mb-3">Add Items for Stock Out</h4>
              {items.map((item, index) => (
                <StockOutItem
                  key={`item-${index}`}
                  item={item}
                  index={index}
                  products={products}
                  onProductChange={handleProductChange}
                  onSupplierChange={handleSupplierChange}
                  onQuantityChange={handleQuantityChange}
                  onRemoveItem={removeItem}
                />
              ))}
              <Button variant="primary" onClick={addItem} className="stock-out__add-button mt-2">
                Add Item
              </Button>
            </Card.Body>
          </Card>

          {items.length > 0 && <ItemsTable items={items} onRemoveItem={removeItem} />}

          <Button
            variant="success"
            onClick={handleSubmit}
            className="stock-out__submit-button mt-3"
            disabled={
              isSubmitting ||
              items.length === 0 ||
              items.some(
                (item) => !item.product_id || !item.quantity || parseFloat(item.quantity) <= 0 || !item.supplier_id || Number(item.purchase_price) === 0
              )
            }
          >
            {isSubmitting ? 'Submitting...' : 'Submit Stock Out'}
          </Button>

          {stockOutLogs.length > 0 && (
            <Card className="mt-4">
              <Card.Body>
                <h4>Stock Out Logs</h4>
                <div className="table-responsive">
                  <Table bordered className="stock-out__table stock-out__logs-table">
                    <thead>
                      <tr>
                        <th>Time</th>
                        <th>Customer</th>
                        <th>Product</th>
                        <th>Quantity</th>
                        <th>Purchase Price</th>
                        <th>Supplier</th>
                        <th>Total Value</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentLogs.map((log) => (
                        <tr key={log.so_id}>
                          <td>{new Date(log.created_at).toLocaleString()}</td>
                          <td>{log.customer_info}</td>
                          <td>{log.items.map((it) => (
                            <div key={`${log.so_id}-${it.product_id}`}>{it.product_name}</div>
                          ))}</td>
                          <td>{log.items.map((it) => (
                            <div key={`${log.so_id}-${it.product_id}`}>{it.quantity}</div>
                          ))}</td>
                          <td>{log.items.map((it) => (
                            <div key={`${log.so_id}-${it.product_id}`}>{it.purchase_price ? Number(it.purchase_price).toFixed(2) : 'N/A'}</div>
                          ))}</td>
                          <td>{log.items.map((it) => (
                            <div key={`${log.so_id}-${it.product_id}`}>{it.supplier_name || 'N/A'}</div>
                          ))}</td>
                          <td>{log.items.map((it) => (
                            <div key={`${log.so_id}-${it.product_id}`}>{(Number(it.quantity) * Number(it.purchase_price)).toFixed(2)}</div>
                          ))}</td>
                          <td>
                            <Button variant="danger" size="sm" data-id={log.so_id} onClick={onDeleteBtnClick}>
                              Delete
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
                {totalPages > 1 && (
                  <Pagination className="mt-3 justify-content-center">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((number) => (
                      <Pagination.Item key={number} active={number === currentPage} onClick={() => paginate(number)}>
                        {number}
                      </Pagination.Item>
                    ))}
                  </Pagination>
                )}
              </Card.Body>
            </Card>
          )}
        </>
      ) : (
        <ErrorComponent />
      )}
    </Container>
  );
}
