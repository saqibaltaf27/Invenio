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

      <Col md={2} sm={6} className="mb-2">
        <Form.Group className="stock-out__form-group">
          <Form.Label>Qty To Remove</Form.Label>
          <Form.Control type="number" value={item.quantity} onChange={handleQtyChangeLocal} min="1" className="form-control" />
        </Form.Group>
      </Col>

      <Col md={2} sm={6} className="mb-2">
        <Form.Group className="stock-out__form-group">
          <Form.Label>Current Stock</Form.Label>
          <Form.Control type="text" value={item.stock} disabled className="form-control" />
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
    (e) => {
      const idx = Number(e.currentTarget.getAttribute('data-index'));
      onRemoveItem(idx);
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
    { product_id: '', name: '', quantity: '', stock: 0, avg_purchase_price: 0 },
  ]);
  const [customerInfo, setCustomerInfo] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successModalVisible, setSuccessModalVisible] = useState(false);
  const [summary, setSummary] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [logsPerPage] = useState(5);
  const [pageState, setPageState] = useState(1);
  const firstLoadRef = useRef(true);

  const productMap = useMemo(() => {
    const map = Object.create(null);
    for (const p of products) map[p.product_id] = p;
    return map;
  }, [products]);

  const totalPages = useMemo(() => Math.ceil(stockOutLogs.length / logsPerPage) || 1, [stockOutLogs.length, logsPerPage]);

  const currentLogs = useMemo(() => {
    const start = (currentPage - 1) * logsPerPage;
    const end = start + logsPerPage;
    return stockOutLogs.slice(start, end);
  }, [stockOutLogs, currentPage, logsPerPage]);

  const fetchData = useCallback(async (opts = { showLoader: false }) => {
    if (opts.showLoader) setPageState(1);
    try {
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
  }, []);

  useEffect(() => {
    fetchData({ showLoader: true });
  }, [fetchData]);

  // Weighted average (by purchase_quantity)
  const calculateAveragePrice = useCallback((purchaseHistory) => {
    if (!purchaseHistory || purchaseHistory.length === 0) return 0;
    const totalValue = purchaseHistory.reduce(
      (sum, record) => sum + (Number(record.purchase_quantity || 0) * Number(record.purchase_price || 0)),
      0
    );
    const totalQuantity = purchaseHistory.reduce((sum, record) => sum + (Number(record.purchase_quantity || 0)), 0);
    return totalQuantity > 0 ? totalValue / totalQuantity : 0;
  }, []);

  const handleProductChange = useCallback(
    (index, product_id) => {
      const selectedProduct = productMap[product_id];
      const avgPrice = selectedProduct ? calculateAveragePrice(selectedProduct.purchase_history) : 0;

      setItems((prev) => {
        const updated = [...prev];
        const current = { ...updated[index] };
        current.product_id = product_id;
        current.name = selectedProduct?.name || '';
        current.stock = selectedProduct?.product_stock || 0;
        current.avg_purchase_price = avgPrice;
        updated[index] = current;
        return updated;
      });
    },
    [productMap, calculateAveragePrice]
  );

  const handleQuantityChange = useCallback((index, value) => {
    setItems((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], quantity: value };
      return updated;
    });
  }, []);

  const addItem = useCallback(() => {
    setItems((prev) => [...prev, { product_id: '', name: '', quantity: '', stock: 0, avg_purchase_price: 0 }]);
  }, []);

  const removeItem = useCallback((index) => setItems((prev) => prev.filter((_, i) => i !== index)), []);

  const validateItems = useCallback(() => {
    const errors = [];
    for (const item of items) {
      if (!item.product_id) errors.push('Please select a product for all items.');
      const parsedQuantity = Number(item.quantity);
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
        await Swal.fire({ icon: 'error', title: 'Validation Errors', html: `<ul style="text-align:left">${errors.map((er) => `<li>${er}</li>`).join('')}</ul>` });
        return;
      }

      const data = {
        customer_info: customerInfo.trim() === '' ? 'N/A' : customerInfo,
        items: items.map(({ product_id, quantity, avg_purchase_price }) => ({
          product_id,
          quantity: parseFloat(quantity),
          purchase_price: avg_purchase_price,
        })),
      };

      setIsSubmitting(true);
      try {
        await axios.post('https://invenio-api-production.up.railway.app/api/stock-out', data);
        setSuccessModalVisible(true);
        setItems([{ product_id: '', name: '', quantity: '', stock: 0, avg_purchase_price: 0 }]);
        setCustomerInfo('');
        setSummary('');
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

  const generateSummary = useCallback(async () => {
    setIsGenerating(true);
    setSummary('');

    const totalItems = items.reduce((s, it) => s + (Number(it.quantity) || 0), 0);
    const totalValue = items.reduce((s, it) => s + (Number(it.quantity) || 0) * (Number(it.avg_purchase_price) || 0), 0);

    const prompt = `You are an AI assistant for an inventory management system. Generate a concise, professional summary (under 100 words) for this stock out.
Customer: ${customerInfo || 'N/A'}
Items:
${items
  .map((item) => `- ${item.name || item.product_id}: ${item.quantity} @ $${Number(item.avg_purchase_price).toFixed(2)}`)
  .join('\n')}
Total Quantity: ${totalItems}
Total Value: $${Number(totalValue).toFixed(2)}
Provide one brief professional suggestion.`;

    const payload = {
      contents: [{ parts: [{ text: prompt }] }],
      tools: [{ google_search: {} }],
      systemInstruction: { parts: [{ text: 'You are a professional inventory management assistant. Summarize the transaction concisely.' }] },
    };

    const apiKey = ""; // add your API key here if available
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;

    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      const generatedText = result?.candidates?.[0]?.content?.parts?.[0]?.text;

      if (generatedText) {
        setSummary(generatedText.trim());
      } else {
        await Swal.fire({ icon: 'error', title: 'Summary Generation Error', text: 'Failed to generate a summary. Please try again.' });
      }
    } catch (error) {
      console.error('Gemini API Error:', error);
      Swal.fire({ icon: 'error', title: 'API Call Failed', text: 'Could not connect to the summary generation service.' });
    } finally {
      setIsGenerating(false);
    }
  }, [items, customerInfo]);

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
    <Container fluid className="stock-out p-4">
      <h2 className="mb-4">Stock Out</h2>

      {pageState === 1 ? (
        <Loader />
      ) : pageState === 2 ? (
        <>
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

          {items.length > 0 && (
            <div>
              <ItemsTable items={items} onRemoveItem={removeItem} />

              <Card className="mt-3 stock-out__card">
                <Card.Body>
                  <h4>Summary</h4>
                  {isGenerating ? (
                    <Loader />
                  ) : summary ? (
                    <p className="stock-out__summary-text">{summary}</p>
                  ) : (
                    <p>Click the button below to generate a summary.</p>
                  )}

                  <Button
                    variant="info"
                    onClick={generateSummary}
                    disabled={isGenerating || items.length === 0 || items.some((item) => !item.product_id || !item.quantity || parseFloat(item.quantity) <= 0)}
                    className="mt-2"
                  >
                    Generate Summary ✨
                  </Button>
                </Card.Body>
              </Card>

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
                        <th>Avg Price</th>
                        <th>Total Value</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentLogs.map((log) => (
                        <tr key={log.so_id}>
                          <td>{new Date(log.created_at).toLocaleString()}</td>
                          <td>{log.customer_info}</td>
                          <td>{log.items.map((it) => <div key={`${log.so_id}-${it.product_id}`}>{it.product_name}</div>)}</td>
                          <td>{log.items.map((it) => <div key={`${log.so_id}-${it.product_id}-qty`}>{it.quantity}</div>)}</td>
                          <td>{log.items.map((it) => <div key={`${log.so_id}-${it.product_id}-price`}>{Number(it.avg_purchase_price).toFixed(2)}</div>)}</td>
                          <td>{log.items.map((it) => <div key={`${log.so_id}-${it.product_id}-val`}>{Number(it.avg_purchase_price * it.quantity).toFixed(2)}</div>)}</td>
                          <td>
                            <Button
                              variant="danger"
                              size="sm"
                              onClick={onDeleteBtnClick}
                              data-id={log.so_id}
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
                  <Pagination.First onClick={() => paginate(1)} disabled={currentPage === 1} />
                  <Pagination.Prev onClick={() => paginate(Math.max(currentPage - 1, 1))} disabled={currentPage === 1} />
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((num) => (
                    <Pagination.Item key={num} active={num === currentPage} onClick={() => paginate(num)}>
                      {num}
                    </Pagination.Item>
                  ))}
                  <Pagination.Next onClick={() => paginate(Math.min(currentPage + 1, totalPages))} disabled={currentPage === totalPages} />
                  <Pagination.Last onClick={() => paginate(totalPages)} disabled={currentPage === totalPages} />
                </Pagination>
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
