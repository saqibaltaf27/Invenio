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
    Pagination
} from 'react-bootstrap';
import './GoodsReceive.scss';

const initialItem = {
    product_id: '',
    product_name: '',
    quantity: 1,
    purchase_price: '',
    tax_rate: '',
    expiry_date: '',
};

const GoodsReceiveCreate = () => {
    const [suppliers, setSuppliers] = useState([]);
    const [products, setProducts] = useState([]);
    const [selectedSupplierId, setSelectedSupplierId] = useState('');
    const [items, setItems] = useState([]);
    const [newItem, setNewItem] = useState(initialItem);
    const [invoiceNumber, setInvoiceNumber] = useState('');
    const [notes, setNotes] = useState('');
    const [loading, setLoading] = useState(false);
    const [alertMessage, setAlertMessage] = useState('');
    const [alertVariant, setAlertVariant] = useState('danger');
    const [showAlert, setShowAlert] = useState(false);
    const [alertTitle, setAlertTitle] = useState(''); // Added for conditional rendering
    const [totalTaxRate, setTotalTaxRate] = useState(0);
    const [goodsReceiveLogs, setGoodsReceiveLogs] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [logsPerPage] = useState(5);
    const [downloadUrl, setDownloadUrl] = useState(''); // To store the download URL


    const showUserAlert = (message, variant = 'danger', title = '') => { // Added title
        setAlertMessage(message);
        setAlertVariant(variant);
        setShowAlert(true);
        setAlertTitle(title); // Set title
    };

    const fetchInitialData = useCallback(async () => {
        setLoading(true);
        try {
            const [suppliersRes, productsRes, logsRes] = await Promise.all([
                axios.post('https://invenio-api-production.up.railway.app/api/get_suppliers', {
                    start_value: 0,
                    sort_column: 'name',
                    sort_order: 'ASC',
                    search_value: '',
                }),
                axios.post('https://invenio-api-production.up.railway.app/api/get_products'),
                axios.get('https://invenio-api-production.up.railway.app/api/goods-receive-logs')
            ]);

            const suppliersData = suppliersRes?.data?.info?.suppliers || [];
            const productsData = productsRes?.data?.info?.products || [];
            const logsData = logsRes?.data || [];

            setSuppliers(suppliersData);
            setProducts(productsData);
            setGoodsReceiveLogs(logsData);
        } catch (err) {
            showUserAlert(err.message || 'Error fetching data');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchInitialData();
    }, [fetchInitialData]);

    const handleNewItemChange = (e) => {
        const { name, value } = e.target;
        setNewItem((prev) => ({ ...prev, [name]: value }));
    };

    const generateInvoiceNumber = () => {
    const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const randomPart = Math.floor(1000 + Math.random() * 9000); // 4-digit random
    return `GR-${datePart}-${randomPart}`;
    };

    const handleAddItem = () => {
        const { product_id, quantity, purchase_price } = newItem;
        const parsedQty = parseInt(quantity, 10);
        const parsedPrice = parseFloat(purchase_price);

        if (!product_id || !parsedQty || !parsedPrice) {
            showUserAlert('Please provide valid product, quantity, and price.');
            return;
        }

        const existing = items.find((item) => item.product_id === product_id);

        if (existing) {
            setItems((prev) =>
                prev.map((item) =>
                    item.product_id === product_id
                        ? {
                            ...item,
                            quantity: item.quantity + parsedQty,
                            item_total: ((item.quantity + parsedQty) * item.purchase_price * (1 + (item.tax_rate || 0) / 100)).toFixed(2),
                        }
                        : item
                )
            );
        } else {
            const selectedProduct = products.find((p) => p.product_id === product_id.toString());

            if (!selectedProduct) {
                showUserAlert('Product not found.');
                return;
            }

            setItems((prev) => [
                ...prev,
                {
                    ...newItem,
                    quantity: parsedQty,
                    purchase_price: parsedPrice,
                    item_total: (parsedQty * parsedPrice * (1 + (newItem.tax_rate || 0) / 100)).toFixed(2),
                    tempId: Date.now(),
                    product_name: selectedProduct.name,
                },
            ]);
        }

        setNewItem(initialItem);
        setShowAlert(false);
    };

    const handleRemoveItem = (tempId) => {
        setItems((prev) => prev.filter((item) => item.tempId !== tempId));
    };

    const calculateTotal = () => {
        return items.reduce((sum, item) => sum + parseFloat(item.item_total || 0), 0).toFixed(2);
    };

    const calculateGrandTotal = () => {
        const total = parseFloat(calculateTotal());
        const taxAmount = total * (totalTaxRate / 100);
        return (total + taxAmount).toFixed(2);
    };

    const handlePostGoodsReceive = async () => {
        if (!selectedSupplierId) return showUserAlert('Please select a supplier.');
        if (items.length === 0) return showUserAlert('Please add at least one item.');

        const autoInvoiceNumber = invoiceNumber || generateInvoiceNumber();
        setInvoiceNumber(autoInvoiceNumber);

        const payload = {
            supplier_id: selectedSupplierId,
            invoice_number: autoInvoiceNumber, // Include invoice number
            notes,
            items: items.map(item => ({
                product_id: item.product_id,
                quantity: item.quantity,
                purchase_price: item.purchase_price,
                tax_rate: item.tax_rate,
                expiry_date: item.expiry_date,
            })),
        };

        setLoading(true);
        try {
            const response = await axios.post('https://invenio-api-production.up.railway.app/api/goods_receives', payload);

            if (response.data && response.data.gr_id) {
                // Set the download URL
                setDownloadUrl(`https://invenio-api-production.up.railway.app/api/goods_receives/${response.data.gr_id}/invoice`);
                showUserAlert(
                    'Goods Receive created successfully!  Click the button to download the invoice.',
                    'success',
                    'Invoice Ready' 
                );


                setItems([]);
                setInvoiceNumber('');
                setNotes('');
                setSelectedSupplierId('');
                setTotalTaxRate(0);

                const logsResponse = await axios.get('https://invenio-api-production.up.railway.app/api/goods-receive-logs');
                setGoodsReceiveLogs(logsResponse.data);
            } else {
                showUserAlert('Goods Receive created, but invoice generation failed.', 'warning');
            }

        } catch (err) {
            showUserAlert(err.message || 'Submission failed');
        } finally {
            setLoading(false);
        }
    };

    const handleDownloadInvoice = async () => {
        if (!downloadUrl) {
            showUserAlert("Download URL is not available.", "danger");
            return;
        }
        setLoading(true);
        try {
            const pdfResponse = await axios.get(downloadUrl, {
                responseType: 'blob', // Expect binary data
            });

            // Handle the PDF file
            const blob = new Blob([pdfResponse.data], { type: 'application/pdf' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `Purchase_Invoice_${invoiceNumber || Date.now()}.pdf`; // Use a fallback filename
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
            setDownloadUrl(''); 
        } catch (pdfError) {
            console.error("Error downloading PDF:", pdfError);
            showUserAlert(`Error downloading invoice: ${pdfError.message}`, 'error');
        } finally {
            setLoading(false);
        }
    }

    const indexOfLastLog = currentPage * logsPerPage;
    const indexOfFirstLog = indexOfLastLog - logsPerPage;
    const currentLogs = goodsReceiveLogs.slice(indexOfFirstLog, indexOfLastLog);

    const paginate = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    const pageNumbers = [];
    for (let i = 1; i <= Math.ceil(goodsReceiveLogs.length / logsPerPage); i++) {
        pageNumbers.push(i);
    }

    return (
        <Container fluid className="goods-receive-create-page">
            <h2>Create Goods Receive</h2>

            {loading && <p>Loading...</p>}

            <Alert variant={alertVariant} show={showAlert} onClose={() => setShowAlert(false)} dismissible>
                <Alert.Heading>{alertTitle}</Alert.Heading> {/* Display the title */}
                {alertMessage}
                {downloadUrl && ( // Show button only when downloadUrl is available
                    <div className="d-flex justify-content-end">
                        <Button variant="primary" onClick={handleDownloadInvoice} className="mt-2">
                            Download Invoice
                        </Button>
                    </div>
                )}
            </Alert>

            <Card className="mb-4">
                <Card.Body>
                    <Form.Group className="mb-3">
                        <Form.Label>Supplier</Form.Label>
                        <Form.Select value={selectedSupplierId} onChange={(e) => setSelectedSupplierId(e.target.value)}>
                            <option value="">Select Supplier</option>
                            {suppliers.map(({ supplier_id, name }) => (
                                <option key={supplier_id} value={supplier_id}>
                                    {name}
                                </option>
                            ))}
                        </Form.Select>
                    </Form.Group>
                </Card.Body>
            </Card>

            <Card className="mb-4">
                <Card.Body>
                    <h4>Add Items</h4>
                    <Row>
                        <Col md={3}><Form.Group><Form.Label>Product</Form.Label>
                            <Form.Select name="product_id" value={newItem.product_id} onChange={handleNewItemChange}>
                                <option value="">Select Product</option>
                                {products.map(({ product_id, name }) => (
                                    <option key={product_id} value={product_id}>{name}</option>
                                ))}
                            </Form.Select></Form.Group></Col>
                        <Col md={2}><Form.Group><Form.Label>Quantity</Form.Label>
                            <Form.Control type="number" name="quantity" value={newItem.quantity} onChange={handleNewItemChange} /></Form.Group></Col>
                        <Col md={3}><Form.Group><Form.Label>Purchase Price</Form.Label>
                            <Form.Control type="number" name="purchase_price" value={newItem.purchase_price} onChange={handleNewItemChange} /></Form.Group></Col>
                        <Col md={2}><Form.Group><Form.Label>Tax Rate (%)</Form.Label>
                            <Form.Control type="number" name="tax_rate" value={newItem.tax_rate} onChange={handleNewItemChange} /></Form.Group></Col>
                        <Col md={2}><Form.Group><Form.Label>Expiry Date</Form.Label>
                            <Form.Control type="date" name="expiry_date" value={newItem.expiry_date} onChange={handleNewItemChange} /></Form.Group></Col>
                    </Row>
                    <Button variant="primary" onClick={handleAddItem} className="mt-3">Add Item</Button>
                </Card.Body>
            </Card>

            {items.length > 0 && (
                <Card className="mb-4">
                    <Card.Body>
                        <h4>Items List</h4>
                        <Table bordered className='item-table'>
                            <thead>
                                <tr>
                                    <th>Product</th><th>Quantity</th><th>Price</th><th>Tax Rate</th><th>Expiry</th><th>Total</th><th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {items.map((item) => (
                                    <tr key={item.tempId}>
                                        <td>{item.product_name}</td>
                                        <td>{item.quantity}</td>
                                        <td>{item.purchase_price}</td>
                                        <td>{item.tax_rate}%</td>
                                        <td>{item.expiry_date}</td>
                                        <td>{item.item_total}</td>
                                        <td><Button variant="danger" size="sm" onClick={() => handleRemoveItem(item.tempId)}>Remove</Button></td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                        <Row>
                            <Col md={4}><Form.Group><Form.Label>Invoice #</Form.Label>
                                <Form.Control value={invoiceNumber} onChange={(e) => setInvoiceNumber(e.target.value)} /></Form.Group></Col>
                            <Col md={4}><Form.Group><Form.Label>Notes</Form.Label>
                                <Form.Control as="textarea" rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} /></Form.Group></Col>
                            <Col md={4}><Form.Group><Form.Label>Total Tax Rate (%)</Form.Label>
                                <Form.Control type="number" value={totalTaxRate} onChange={(e) => setTotalTaxRate(parseFloat(e.target.value) || 0)} /></Form.Group></Col>
                        </Row>
                        <Row className="mt-3">
                            <Col md={6}><h5>Total: {calculateTotal()}</h5></Col>
                            <Col md={6}><h5>Grand Total (incl. tax): {calculateGrandTotal()}</h5></Col>
                        </Row>
                        <Button variant="success" className="mt-3" onClick={handlePostGoodsReceive}>Submit Goods Receive</Button>
                    </Card.Body>
                </Card>
            )}
            {goodsReceiveLogs.length > 0 && (
                <Card className="mt-4">
                    <Card.Body>
                        <h4>Goods Receive Logs</h4>
                        <Table bordered 
                         className="stock-out__table stock-out__logs-table">
                            <thead>
                                <tr>
                                    <th>Time</th>
                                    <th>Supplier</th>
                                    <th>Invoice #</th>
                                    <th>Product</th>
                                    <th>Quantity</th>
                                    <th>Purchase Price</th>
                                    <th>Tax Rate</th>
                                    <th>Item Total</th>
                                    <th>Expiry Date</th>
                                </tr>
                            </thead>
                            <tbody>
                            {currentLogs.map((log, logIndex) =>
                                log.items.map((item, itemIndex) => {
                                const itemTotal =
                                    (parseFloat(item.purchase_price) || 0) *
                                    (parseInt(item.quantity) || 0) *
                                    (1 + (parseFloat(item.tax_rate) || 0) / 100);
                                const expiryDate = item.expiry_date
                                    ? new Date(item.expiry_date).toLocaleDateString()
                                    : 'N/A';

                                return (
                                    <tr key={`${logIndex}-${item.product_id}`}>
                                    <td>{new Date(log.created_at).toLocaleString()}</td>
                                    <td>{log.supplier_info}</td>
                                    <td>{log.invoice_number}</td>
                                    <td>{item.product_name}</td>
                                    <td>{item.quantity}</td>
                                    <td>{item.purchase_price}</td>
                                    <td>{item.tax_rate}</td>
                                    <td>{itemTotal.toFixed(2)}</td>
                                    <td>{expiryDate}</td>
                                    </tr>
                                );
                                })
                            )}
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

export default GoodsReceiveCreate;
