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
import Loader from '../PageStates/Loader'; // Corrected path to Loader
import './StockOut.scss'; // Corrected path to StockOut.scss

// --- StockOutItem Component (Nested) ---
const StockOutItem = ({ item, index, products, onProductChange, onSupplierChange, onQuantityChange, onRemoveItem }) => {
    const selectedProduct = products.find((p) => p.product_id === item.product_id);
    const purchaseHistory = selectedProduct?.purchase_history || [];

    return (
        <Row key={index} className="stock-out__item-row">
            <Col md={3} sm={12}>
                <Form.Group className="stock-out__form-group">
                    <Form.Label>Product</Form.Label>
                    <Form.Select
                        value={item.product_id}
                        onChange={(e) => onProductChange(index, e.target.value)}
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
            <Col md={2} sm={6}>
                <Form.Group className="stock-out__form-group">
                    <Form.Label>Qty To Remove</Form.Label>
                    <Form.Control
                        type="number"
                        value={item.quantity}
                        onChange={(e) => onQuantityChange(index, e.target.value)}
                        min="1"
                        className="form-control"
                    />
                </Form.Group>
            </Col>
            <Col md={2} sm={6}>
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
            <Col md={2} sm={6}>
                <Form.Group className="stock-out__form-group">
                    <Form.Label>Supplier</Form.Label>
                    <Form.Select
                        value={`${item.supplier_id || ''}-${item.purchase_price || ''}`}
                        onChange={(e) => onSupplierChange(index, e.target.value, purchaseHistory)}
                        disabled={!item.product_id || purchaseHistory.length === 0}
                        className="form-control"
                    >
                        <option value="">Select Supplier/Price</option>
                        {purchaseHistory.map((ph, idx) => (
                            <option
                                key={`${ph.supplier_id}-${ph.purchase_price}-${idx}`}
                                value={`${ph.supplier_id}-${ph.purchase_price}`}
                            >
                                {ph.supplier_name} (Price: {ph.purchase_price.toFixed(2)} - Qty: {ph.purchase_quantity})
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
                        value={item.purchase_price ? `${item.purchase_price.toFixed(2)}` : 'N/A'}
                        disabled
                        className="form-control"
                    />
                </Form.Group>
            </Col>
            <Col md={1} sm={12} className="d-flex align-items-end justify-content-center mt-md-0 mt-3">
                <Button variant="danger" size="sm" onClick={() => onRemoveItem(index)}>
                    Remove
                </Button>
            </Col>
        </Row>
    );
};

// --- ItemsTable Component (Nested) ---
const ItemsTable = ({ items, onRemoveItem }) => (
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
                            <tr key={index}>
                                <td>{item.name}</td>
                                <td>{item.quantity}</td>
                                <td>{item.stock}</td>
                                <td>{item.purchase_price ? `${item.purchase_price.toFixed(2)}` : 'N/A'}</td>
                                <td>{item.supplier_name || 'N/A'}</td>
                                <td>
                                    <Button variant="danger" size="sm" onClick={() => onRemoveItem(index)}>
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
                    <h5>Total Quantity: {items.reduce((sum, item) => sum + (parseInt(item.quantity) || 0), 0)}</h5>
                </Col>
            </Row>
        </Card.Body>
    </Card>
);

// --- Main StockOut Component ---
const StockOut = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [items, setItems] = useState([
        { product_id: '', name: '', quantity: '', stock: 0, supplier_id: '', supplier_name: '', purchase_price: 0 }
    ]);
    const [stockOutLogs, setStockOutLogs] = useState([]);
    const [customerInfo, setCustomerInfo] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [successModalVisible, setSuccessModalVisible] = useState(false);

    const [currentPage, setCurrentPage] = useState(1);
    const [logsPerPage] = useState(5);

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const productsRes = await axios.get('https://invenio-api-production.up.railway.app/api/products-full-details');
            setProducts(productsRes.data);

            const logsRes = await axios.get('https://invenio-api-production.up.railway.app/api/stock-out-logs');
            setStockOutLogs(logsRes.data);
        } catch (err) {
            console.error("Error fetching data:", err);
            setError(err.response?.data?.message || err.message || 'Error fetching products or logs');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleProductChange = useCallback((index, product_id) => {
        const selectedProduct = products.find((p) => p.product_id === product_id);
        setItems(prevItems => {
            const updatedItems = [...prevItems];
            updatedItems[index] = {
                ...updatedItems[index],
                product_id: product_id,
                name: selectedProduct?.name || '',
                stock: selectedProduct?.product_stock || 0,
                supplier_id: '',
                supplier_name: '',
                purchase_price: 0,
            };

            if (selectedProduct && selectedProduct.purchase_history.length > 0) {
                const defaultPurchase = selectedProduct.purchase_history[0];
                updatedItems[index].supplier_id = defaultPurchase.supplier_id;
                updatedItems[index].supplier_name = defaultPurchase.supplier_name;
                updatedItems[index].purchase_price = defaultPurchase.purchase_price;
            }
            return updatedItems;
        });
    }, [products]);

    const handleSupplierChange = useCallback((index, selectedValue, purchaseHistoryForProduct) => {
        const [supplier_id, purchase_price_str] = selectedValue.split('-');
        const purchase_price = parseFloat(purchase_price_str);

        const selectedPurchaseRecord = purchaseHistoryForProduct.find(
            (ph) =>
                String(ph.supplier_id) === String(supplier_id) &&
                ph.purchase_price === purchase_price
        );

        setItems(prevItems => {
            const updatedItems = [...prevItems];
            updatedItems[index] = {
                ...updatedItems[index],
                supplier_id: selectedPurchaseRecord?.supplier_id || '',
                supplier_name: selectedPurchaseRecord?.supplier_name || 'N/A',
                purchase_price: selectedPurchaseRecord?.purchase_price || 0,
            };
            return updatedItems;
        });
    }, []);

    const handleQuantityChange = useCallback((index, value) => {
        setItems(prevItems => {
            const updatedItems = [...prevItems];
            updatedItems[index].quantity = value;
            return updatedItems;
        });
    }, []);

    const addItem = useCallback(() => {
        setItems(prevItems => [...prevItems, { product_id: '', name: '', quantity: '', stock: 0, supplier_id: '', supplier_name: '', purchase_price: 0 }]);
    }, []);

    const removeItem = useCallback((index) => {
        setItems((prevItems) => prevItems.filter((_, i) => i !== index));
    }, []);

    const handleSubmit = useCallback(async (e) => {
        e.preventDefault();
        setError('');

        for (const item of items) {
            if (!item.product_id) {
                setError("Please select a product for all items.");
                return;
            }
            if (!item.supplier_id || item.purchase_price === 0) {
                setError(`Please select a specific supplier and purchase price for product: ${item.name || item.product_id}.`);
                return;
            }
            const parsedQuantity = parseInt(item.quantity, 10);
            if (isNaN(parsedQuantity) || parsedQuantity <= 0) {
                setError(`Quantity for product ${item.name || item.product_id} must be a positive number.`);
                return;
            }
            if (parsedQuantity > item.stock) {
                setError(`Not enough stock for product ${item.name || item.product_id}. Available: ${item.stock}, Requested: ${parsedQuantity}.`);
                return;
            }
        }

        const data = {
            customer_info: customerInfo.trim() === '' ? 'N/A' : customerInfo,
            items: items.map(({ product_id, quantity, supplier_id, purchase_price }) => ({
                product_id,
                quantity: parseInt(quantity, 10),
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
            await fetchData();
        } catch (err) {
            console.error("Stock out submission error:", err.response?.data?.message || err.message);
            setError(err.response?.data?.message || "Failed to process stock out. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    }, [customerInfo, items, fetchData]);

    const indexOfLastLog = currentPage * logsPerPage;
    const indexOfFirstLog = indexOfLastLog - logsPerPage;
    const currentLogs = stockOutLogs.slice(indexOfFirstLog, indexOfLastLog);
    const totalPages = Math.ceil(stockOutLogs.length / logsPerPage);
    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    const pageNumbers = [];
    for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
    }

    return (
        <Container fluid className="stock-out">
            <h2>Stock Out</h2>

            {loading && <Loader />}
            {error && <Alert variant="danger">{error}</Alert>}

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
                            key={index}
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

            {items.length > 0 && (
                <ItemsTable items={items} onRemoveItem={removeItem} />
            )}

            <Button
                variant="success"
                onClick={handleSubmit}
                className="stock-out__submit-button mt-3"
                disabled={isSubmitting || items.length === 0 || items.some(item => !item.product_id || !item.quantity || parseInt(item.quantity, 10) <= 0 || !item.supplier_id || item.purchase_price === 0)}
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
                                    </tr>
                                </thead>
                                <tbody>
                                    {currentLogs.map((log) => (
                                        <tr key={log.so_id}>
                                            <td>{new Date(log.created_at).toLocaleString()}</td>
                                            <td>{log.customer_info}</td>
                                            <td>
                                                {log.items.map(item => (
                                                    <div key={item.product_id}>{item.product_name}</div>
                                                ))}
                                            </td>
                                            <td>
                                                {log.items.map(item => (
                                                    <div key={item.product_id}>{item.quantity}</div>
                                                ))}
                                            </td>
                                            <td>
                                                {log.items.map(item => (
                                                    <div key={item.product_id}>
                                                        {item.purchase_price ? `${item.purchase_price.toFixed(2)}` : 'N/A'}
                                                    </div>
                                                ))}
                                            </td>
                                            <td>
                                                {log.items.map(item => (
                                                    <div key={item.product_id}>{item.supplier_name || 'N/A'}</div>
                                                ))}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                        </div>
                        {pageNumbers.length > 1 && (
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
                        )}
                    </Card.Body>
                </Card>
            )}
        </Container>
    );
};

export default StockOut;
