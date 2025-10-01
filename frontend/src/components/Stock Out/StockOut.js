import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
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
import './StockOut.css';

// --- StockOutItem (memoized) ---
const StockOutItem = React.memo(function StockOutItem({
  item,
  index,
  products,
  onProductChange,
  onQuantityChange,
  onRemoveItem,
}) {
  const handleProductChangeLocal = useCallback(
    (e) => onProductChange(index, e.target.value),
    [onProductChange, index]
  );

  const handleQtyChangeLocal = useCallback(
    (e) => onQuantityChange(index, e.target.value),
    [onQuantityChange, index]
  );

  const handleRemoveLocal = useCallback(() => onRemoveItem(index), [onRemoveItem, index]);

  return (
    <Row className="stock-out__item-row align-items-end">
      <Col md={4} sm={12} className="mb-2">
        <Form.Group className="stock-out__form-group">
          <Form.Label>Product</Form.Label>
          <Form.Select 
            value={item.product_id} 
            onChange={handleProductChangeLocal} 
            className="form-control"
          >
            <option value="">Select Product</option>
            {products.map(({ product_id, name }) => (
              <option key={product_id} value={product_id}>
                {name}
              </option>
            ))}
          </Form.Select>
        </Form.Group>
      </Col>

      <Col md={2} sm={6} className="mb-2">
        <Form.Group className="stock-out__form-group">
          <Form.Label>Qty To Remove</Form.Label>
          <Form.Control 
            type="number" 
            value={item.quantity} 
            onChange={handleQtyChangeLocal} 
            min="1" 
            className="form-control" 
          />
        </Form.Group>
      </Col>

      <Col md={2} sm={6} className="mb-2">
        <Form.Group className="stock-out__form-group">
          <Form.Label>Current Stock</Form.Label>
          <Form.Control 
            type="text" 
            value={item.stock} 
            disabled 
            className="form-control" 
          />
        </Form.Group>
      </Col>

      <Col md={3} sm={6} className="mb-2">
        <Form.Group className="stock-out__form-group">
          <Form.Label>Avg Purchase Price</Form.Label>
          <Form.Control
            type="text"
            value={item.avg_purchase_price ? Number(item.avg_purchase_price).toFixed(2) : 'N/A'}
            disabled
            className="form-control"
          />
        </Form.Group>
      </Col>

      <Col md={1} sm={12} className="d-flex align-items-end justify-content-center mb-2">
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
    (index) => {
      onRemoveItem(index);
    },
    [onRemoveItem]
  );

  return (
    <Card className="stock-out__card mt-3">
      <Card.Body>
        <h4>Items for Stock Out</h4>
        <div className="table-responsive">
          <Table bordered className="stock-out__table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Qty To Remove</th>
                <th>Current Stock</th>
                <th>Avg Price</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, index) => (
                <tr key={`${item.product_id || 'new'}-${index}`}>
                  <td>{item.name}</td>
                  <td>{item.quantity}</td>
                  <td>{item.stock}</td>
                  <td>{item.avg_purchase_price ? Number(item.avg_purchase_price).toFixed(2) : 'N/A'}</td>
                  <td>
                    <Button 
                      variant="danger" 
                      size="sm" 
                      onClick={() => handleRemove(index)}
                    >
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

// --- Logs Table Component ---
const StockOutLogsTable = React.memo(function StockOutLogsTable({ 
  logs, 
  onDeleteClick, 
  paginationItems, 
  currentPage, 
  totalPages, 
  onPaginate 
}) {
  return (
    <Card className="mt-4 stock-out__card">
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
                <th>Avg Price Used</th>
                <th>Total Value</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.so_id}>
                  <td>{new Date(log.created_at).toLocaleString()}</td>
                  <td>{log.customer_info}</td>
                  <td>
                    {log.items.map((it) => (
                      <div key={`${log.so_id}-${it.product_id}`} className="log-product-name">
                        {it.product_name}
                      </div>
                    ))}
                  </td>
                  <td>
                    {log.items.map((it) => (
                      <div key={`${log.so_id}-${it.product_id}-qty`}>
                        {it.quantity}
                      </div>
                    ))}
                  </td>
                  <td>
                    {log.items.map((it) => (
                      <div key={`${log.so_id}-${it.product_id}-price`} className="log-price">
                        {/* Display avg_purchase_price from the stock-out API response */}
                        {it.avg_purchase_price ? Number(it.avg_purchase_price).toFixed(2) : 
                         it.purchase_price ? Number(it.purchase_price).toFixed(2) : '0.00'}
                      </div>
                    ))}
                  </td>
                  <td>
                    {log.items.map((it) => {
                      // Calculate total value using avg_purchase_price or purchase_price
                      const price = it.avg_purchase_price || it.purchase_price || 0;
                      const itemValue = (parseFloat(it.quantity) || 0) * (parseFloat(price) || 0);
                      return (
                        <div key={`${log.so_id}-${it.product_id}-val`} className="log-value">
                          {itemValue.toFixed(2)}
                        </div>
                      );
                    })}
                  </td>
                  <td>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => onDeleteClick(log.so_id)}
                      className="stock-out__delete-button"
                    >
                      Delete
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>

        <Pagination className="justify-content-center mt-3">
          <Pagination.First onClick={() => onPaginate(1)} disabled={currentPage === 1} />
          <Pagination.Prev onClick={() => onPaginate(Math.max(currentPage - 1, 1))} disabled={currentPage === 1} />
          {paginationItems}
          <Pagination.Next onClick={() => onPaginate(Math.min(currentPage + 1, totalPages))} disabled={currentPage === totalPages} />
          <Pagination.Last onClick={() => onPaginate(totalPages)} disabled={currentPage === totalPages} />
        </Pagination>
      </Card.Body>
    </Card>
  );
});

// --- Main Component ---
export default function StockOut() {
  const [products, setProducts] = useState([]);
  const [stockOutLogs, setStockOutLogs] = useState([]);
  const [items, setItems] = useState([
    { product_id: '', name: '', quantity: '', stock: 0, avg_purchase_price: 0 },
  ]);
  const [customerInfo, setCustomerInfo] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successModalVisible, setSuccessModalVisible] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [logsPerPage] = useState(5);
  const [pageState, setPageState] = useState(1);
  const firstLoadRef = useRef(true);

  // Memoized computations
  const productMap = useMemo(() => {
    const map = {};
    products.forEach(p => map[p.product_id] = p);
    return map;
  }, [products]);

  const totalPages = useMemo(() => 
    Math.ceil(stockOutLogs.length / logsPerPage) || 1, 
    [stockOutLogs.length, logsPerPage]
  );

  const currentLogs = useMemo(() => {
    const start = (currentPage - 1) * logsPerPage;
    const end = start + logsPerPage;
    return stockOutLogs.slice(start, end);
  }, [stockOutLogs, currentPage, logsPerPage]);

  // Optimized data fetching
  const fetchData = useCallback(async (opts = { showLoader: false }) => {
    if (opts.showLoader) setPageState(1);
    
    try {
      const [productsRes, logsRes] = await Promise.all([
        axios.get('https://invenio-api-production.up.railway.app/api/products-full-details'),
        axios.get('https://invenio-api-production.up.railway.app/api/stock-out-logs'),
      ]);

      setProducts(productsRes.data || []);
      
      // Process logs to ensure we have the avg_purchase_price
      const processedLogs = (logsRes.data || []).map(log => ({
        ...log,
        items: log.items.map(item => ({
          ...item,
          // Ensure avg_purchase_price is available, fallback to purchase_price
          avg_purchase_price: item.avg_purchase_price || item.purchase_price
        }))
      }));
      
      setStockOutLogs(processedLogs);
      
      if (firstLoadRef.current || opts.showLoader) {
        setPageState(2);
      }
      firstLoadRef.current = false;
    } catch (err) {
      console.error('Error fetching data:', err);
      setPageState(3);
    }
  }, []);

  useEffect(() => {
    fetchData({ showLoader: true });
  }, [fetchData]);

  // Optimized average price calculation
  const calculateAveragePrice = useCallback((purchaseHistory) => {
    if (!purchaseHistory || purchaseHistory.length === 0) return 0;
    
    let totalValue = 0;
    let totalQuantity = 0;
    
    for (const record of purchaseHistory) {
      const quantity = Number(record.purchase_quantity || 0);
      const price = Number(record.purchase_price || 0);
      totalValue += quantity * price;
      totalQuantity += quantity;
    }
    
    return totalQuantity > 0 ? totalValue / totalQuantity : 0;
  }, []);

  // Optimized handlers
  const handleProductChange = useCallback((index, product_id) => {
    const selectedProduct = productMap[product_id];
    const avgPrice = selectedProduct ? calculateAveragePrice(selectedProduct.purchase_history) : 0;

    setItems(prev => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        product_id,
        name: selectedProduct?.name || '',
        stock: selectedProduct?.product_stock || 0,
        avg_purchase_price: avgPrice
      };
      return updated;
    });
  }, [productMap, calculateAveragePrice]);

  const handleQuantityChange = useCallback((index, value) => {
    setItems(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], quantity: value };
      return updated;
    });
  }, []);

  const addItem = useCallback(() => {
    setItems(prev => [...prev, { 
      product_id: '', 
      name: '', 
      quantity: '', 
      stock: 0, 
      avg_purchase_price: 0 
    }]);
  }, []);

  const removeItem = useCallback((index) => {
    setItems(prev => prev.filter((_, i) => i !== index));
  }, []);

  // Optimized validation
  const validateItems = useCallback(() => {
    const errors = [];
    
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (!item.product_id) {
        errors.push('Please select a product for all items.');
        continue;
      }
      
      const parsedQuantity = Number(item.quantity);
      if (isNaN(parsedQuantity) || parsedQuantity <= 0) {
        errors.push(`Quantity for product ${item.name || item.product_id} must be a positive number.`);
        continue;
      }
      
      if (parsedQuantity > Number(item.stock)) {
        errors.push(
          `Not enough stock for product ${item.name || item.product_id}. Available: ${item.stock}, Requested: ${parsedQuantity}.`
        );
      }
    }
    
    return errors;
  }, [items]);

  // Optimized submission - Send both purchase_price and avg_purchase_price
  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    const errors = validateItems();
    
    if (errors.length > 0) {
      await Swal.fire({ 
        icon: 'error', 
        title: 'Validation Errors', 
        html: `<ul style="text-align:left">${errors.map((er) => `<li>${er}</li>`).join('')}</ul>` 
      });
      return;
    }

    const data = {
      customer_info: customerInfo.trim() === '' ? 'N/A' : customerInfo,
      items: items.map(({ product_id, quantity, avg_purchase_price }) => ({
        product_id,
        quantity: parseFloat(quantity),
        purchase_price: avg_purchase_price, // Store as purchase_price
        avg_purchase_price: avg_purchase_price, // Also store as avg_purchase_price for clarity
      })),
    };

    setIsSubmitting(true);
    try {
      await axios.post('https://invenio-api-production.up.railway.app/api/stock-out', data);
      setSuccessModalVisible(true);
      setItems([{ product_id: '', name: '', quantity: '', stock: 0, avg_purchase_price: 0 }]);
      setCustomerInfo('');
      fetchData({ showLoader: false });
    } catch (err) {
      console.error('Stock out submission error:', err);
      Swal.fire({ 
        icon: 'error', 
        title: 'Error', 
        text: 'Failed to process stock out. Please try again.' 
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [customerInfo, items, validateItems, fetchData]);

  // Optimized delete handler
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
      
      // Optimistic update - remove from local state immediately
      setStockOutLogs(prev => prev.filter(log => log.so_id !== id));
      
      await Swal.fire({
        icon: 'success',
        title: 'Deleted!',
        text: 'The stock-out log has been deleted.',
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (err) {
      // Revert optimistic update on error
      fetchData({ showLoader: false });
      Swal.fire({ 
        icon: 'error', 
        title: 'Error', 
        text: 'Failed to delete stock-out log.' 
      });
    }
  }, [fetchData]);

  const paginate = useCallback((pageNumber) => {
    setCurrentPage(pageNumber);
  }, []);

  // Memoized pagination items
  const paginationItems = useMemo(() => {
    const items = [];
    for (let i = 1; i <= totalPages; i++) {
      items.push(
        <Pagination.Item 
          key={i} 
          active={i === currentPage} 
          onClick={() => paginate(i)}
        >
          {i}
        </Pagination.Item>
      );
    }
    return items;
  }, [totalPages, currentPage, paginate]);

  if (pageState === 1) {
    return (
      <Container fluid className="stock-out p-4">
        <Loader />
      </Container>
    );
  }

  if (pageState === 3) {
    return (
      <Container fluid className="stock-out p-4">
        <ErrorComponent />
      </Container>
    );
  }

  return (
    <Container fluid className="stock-out p-4">
      <h2 className="mb-4">Stock Out</h2>

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
              onQuantityChange={handleQuantityChange}
              onRemoveItem={removeItem}
            />
          ))}

          <Button variant="primary" onClick={addItem} className="stock-out__add-button mt-2">
            Add Item
          </Button>
        </Card.Body>
      </Card>

      {items.length > 0 && items.some(item => item.product_id) && (
        <div>
          <ItemsTable items={items.filter(item => item.product_id)} onRemoveItem={removeItem} />

          <Button
            variant="success"
            onClick={handleSubmit}
            className="stock-out__submit-button mt-3"
            disabled={isSubmitting || items.length === 0 || items.some((item) => !item.product_id || !item.quantity || parseFloat(item.quantity) <= 0)}
          >
            {isSubmitting ? 'Submitting...' : 'Submit Stock Out'}
          </Button>
        </div>
      )}

      {stockOutLogs.length > 0 && (
        <StockOutLogsTable
          logs={currentLogs}
          onDeleteClick={handleDeleteClick}
          paginationItems={paginationItems}
          currentPage={currentPage}
          totalPages={totalPages}
          onPaginate={paginate}
        />
      )}
    </Container>
  );
}