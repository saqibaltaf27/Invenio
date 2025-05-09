import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import {
  Button,
  Alert,
  Table,
  Form,
  Card,
  Container,
  Row,
  Col,
  Modal,
  Pagination,
} from 'react-bootstrap';
import './StockOut.scss';

const StockOutItem = ({ item, index, products, onProductChange, onQuantityChange, onRemoveItem }) => {
  useEffect(() => {
    if (item.product_id && products.length > 0) {
      const selectedProduct = products.find((p) => p.product_id === item.product_id);
      if (selectedProduct) {
        // You can use this to handle any specific logic based on the selected product
      }
    }
  }, [item.product_id, products]);

  return (
    <Row key={index} className="stock-out__item-row">
      <Col md={3}>
        <Form.Group>
          <Form.Label>Product</Form.Label>
          <Form.Select
            value={item.product_id}
            onChange={(e) => onProductChange(index, e.target.value)}
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
      <Col md={2}>
        <Form.Group>
          <Form.Label>Qty To Remove</Form.Label>
          <Form.Control
            type="number"
            value={item.quantity}
            onChange={(e) => onQuantityChange(index, e.target.value)}
          />
        </Form.Group>
      </Col>
      <Col md={2}>
        <Form.Group>
          <Form.Label>Current Stock</Form.Label>
          <Form.Control
            type="text"
            value={item.stock}
            disabled
          />
        </Form.Group>
      </Col>
      <Col md={1} className="align-self-end">
        <Button variant="danger" size="sm" onClick={() => onRemoveItem(index)}>
          Remove
        </Button>
      </Col>
    </Row>
  );
};

const ItemsTable = ({ items, onRemoveItem }) => (
  <Card className="mb-4">
    <Card.Body>
      <h4>Items List</h4>
      <Table bordered className="stock-out__table">
        <thead>
          <tr>
            <th>Product</th>
            <th>Qty To Remove</th>
            <th>Current Stock</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, index) => (
            <tr key={index}>
              <td>{item.name}</td>
              <td>{item.quantity}</td>
              <td>{item.stock}</td>
              <td>
                <Button variant="danger" size="sm" onClick={() => onRemoveItem(index)}>
                  Remove
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
      <Row className="stock-out__total-row mt-3">
        <Col md={6}>
          <h5>Total Quantity: {items.reduce((sum, item) => sum + (parseInt(item.quantity) || 0), 0)}</h5>
        </Col>
      </Row>
    </Card.Body>
  </Card>
);

// --- Main Component ---

const StockOut = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [items, setItems] = useState([{ product_id: '', name: '', quantity: '', stock: 0 }]);
  const [stockOutLogs, setStockOutLogs] = useState([]);  // State for stock out logs
  const [customerInfo, setCustomerInfo] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successModalVisible, setSuccessModalVisible] = useState(false); // Modal visibility state
  const [isError, setIsError] = useState(false);  // To handle error alerts

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [logsPerPage] = useState(5); // Number of logs per page

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const res = await axios.get('http://localhost:5000/api/products-with-stock');
        setProducts(res.data);
      } catch (err) {
        setError(err.message || 'Error fetching products');
      } finally {
        setLoading(false);
      }
    };

    const fetchStockOutLogs = async () => {
      setLoading(true);
      try {
        const url = 'http://localhost:5000/api/stock-out-logs';
        console.log("Fetching logs from:", url);
        const response = await axios.get(url);
        console.log("Logs response:", response);
        setStockOutLogs(response.data);
      } catch (error) {
        console.error("Failed to fetch stock out logs:", error);
        setError(`Failed to fetch stock out logs.  Error: ${error.message}.  URL: http://localhost:5000/api/stock-out-logs`);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
    fetchStockOutLogs();
  }, []);

  const handleProductChange = useCallback((index, value) => {
    const selectedProduct = products.find((p) => p.product_id === value);
    const updatedItems = [...items];
    updatedItems[index].product_id = value;
    updatedItems[index].name = selectedProduct?.name || '';
    updatedItems[index].stock = selectedProduct?.product_stock || 0;
    setItems(updatedItems);
  }, [items, products]);

  const handleQuantityChange = useCallback((index, value) => {
    const updatedItems = [...items];
    updatedItems[index].quantity = value;
    setItems(updatedItems);
  }, [items, setItems]);

  const addItem = useCallback(() => {
    setItems([...items, { product_id: '', name: '', quantity: '', stock: 0 }]);
  }, [items, setItems]);

  const removeItem = useCallback((index) => {
    setItems((prevItems) => prevItems.filter((_, i) => i !== index));
  }, [setItems]);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();

    if (!customerInfo) return setIsError(true);
    if (items.some(item => !item.product_id || !item.quantity || item.quantity <= 0)) {
      return setIsError(true);
    }

    const data = {
      customer_info: customerInfo,
      items: items.map(({ product_id, quantity }) => ({
        product_id,
        quantity: parseInt(quantity, 10),
      })),
    };

    setIsSubmitting(true);
    try {
      await axios.post('http://localhost:5000/api/stock-out', data);
      setSuccessModalVisible(true);
      setItems([{ product_id: '', name: '', quantity: '', stock: 0 }]);
      setCustomerInfo('');

      const logsResponse = await axios.get('http://localhost:5000/api/stock-out-logs');
      setStockOutLogs(logsResponse.data);

    } catch (err) {
      setIsError(true);
    } finally {
      setIsSubmitting(false);
    }
  }, [customerInfo, items]);

  // Get current logs for pagination
  const indexOfLastLog = currentPage * logsPerPage;
  const indexOfFirstLog = indexOfLastLog - logsPerPage;
  const currentLogs = stockOutLogs.slice(indexOfFirstLog, indexOfLastLog);

  // Change page
  const paginate = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const pageNumbers = [];
  for (let i = 1; i <= Math.ceil(stockOutLogs.length / logsPerPage); i++) {
    pageNumbers.push(i);
  }

  return (
    <Container fluid className="stock-out" style={{ maxHeight: '700px', overflowY: 'auto' }}>
      <h2>Stock Out</h2>

      {loading && <p>Loading products and logs...</p>}
      {error && <Alert variant="danger">{error}</Alert>}
      {isError && <Alert variant="danger">Please complete all items with valid quantities</Alert>}

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

      <Card className="stock-out__card" >
        <Card.Body>
          <Form.Group className="stock-out__form-group">
            <Form.Label>Customer Information</Form.Label>
            <Form.Control
              type="text"
              value={customerInfo}
              onChange={(e) => setCustomerInfo(e.target.value)}
            />
          </Form.Group>
        </Card.Body>
      </Card>

      <Card className="stock-out__card">
        <Card.Body className="stock-out__add-section">
          <h4>Add Items for Stock Out</h4>
          {items.map((item, index) => (
            <StockOutItem
              key={index}
              item={item}
              index={index}
              products={products}
              onProductChange={handleProductChange}
              onQuantityChange={handleQuantityChange}
              onRemoveItem={removeItem}
            />
          ))}
          <Button variant="primary" onClick={addItem} className="stock-out__add-button">
            Add Item
          </Button>
        </Card.Body>
      </Card>

      {items.length > 0 && (
        <ItemsTable items={items} onRemoveItem={removeItem} />
      )}

      <Button
        variant="success"
        onClick={handleSubmit}
        className="stock-out__submit-button mt-3"
        disabled={isSubmitting}
      >
        {isSubmitting ? 'Submitting...' : 'Submit Stock Out'}
      </Button>

      {stockOutLogs.length > 0 && (
        <Card className="mt-4">
          <Card.Body>
            <h4>Stock Out Logs</h4>
            <Table bordered className="stock-out__table stock-out__logs-table">
              <thead>
                <tr>
                  <th>Time</th>
                  <th>Customer</th>
                  <th>Product</th>
                  <th>Quantity</th>
                </tr>
              </thead>
              <tbody>
                {currentLogs.map((log, index) => (
                  <tr key={index}>
                    <td>{new Date(log.created_at).toLocaleString()}</td>
                    <td>{log.customer_info}</td>
                    <td>
                      {log.items.map(item => (
                        <div key={item.product_id}>
                          {item.product_name}
                        </div>
                      ))}
                    </td>
                    <td>
                      {log.items.map(item => (
                        <div key={item.product_id}>
                          {item.quantity}
                        </div>
                      ))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
            {/* Pagination */}
            <Pagination className="mt-3 justify-content-center">
              {pageNumbers.map(number => (
                <Pagination.Item
                  key={number}
                  active={number === currentPage}
                  onClick={() => paginate(number)}
                >
                  {number}
                </Pagination.Item>
              ))}
            </Pagination>
          </Card.Body>
        </Card>
      )}
    </Container>
  );
};

export default StockOut;

