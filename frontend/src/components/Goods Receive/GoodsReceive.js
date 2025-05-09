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
  const [totalTaxRate, setTotalTaxRate] = useState(0);

  const showUserAlert = (message, variant = 'danger') => {
    setAlertMessage(message);
    setAlertVariant(variant);
    setShowAlert(true);
  };

  const fetchInitialData = useCallback(async () => {
    setLoading(true);
    try {
      const [suppliersRes, productsRes] = await Promise.all([
        axios.post('http://localhost:5000/api/get_suppliers', {
          start_value: 0,
          sort_column: 'name',
          sort_order: 'ASC',
          search_value: '',
        }),
        axios.post('http://localhost:5000/api/get_products'),
      ]);

      const suppliersData = suppliersRes?.data?.info?.suppliers || [];
      const productsData = productsRes?.data?.info?.products || [];

      setSuppliers(suppliersData);
      setProducts(productsData);
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

  const handleAddItem = () => {
    const { product_id, quantity, purchase_price, tax_rate } = newItem;
    const parsedQty = parseInt(quantity, 10);
    const parsedPrice = parseFloat(purchase_price);
    const parsedTax = parseFloat(tax_rate) || 0;
  
    // Validate inputs
    if (!product_id || !parsedQty || !parsedPrice) {
      showUserAlert('Please provide valid product, quantity, and price.');
      return;
    }
  
    const existing = items.find((item) => item.product_id === product_id);
    const itemTotal = (parsedQty * parsedPrice).toFixed(2);
  
    // Check if the product already exists
    if (existing) {
      setItems((prev) =>
        prev.map((item) =>
          item.product_id === product_id
            ? {
                ...item,
                quantity: item.quantity + parsedQty,
                item_total: ((item.quantity + parsedQty) * item.purchase_price).toFixed(2),
              }
            : item
        )
      );
    } else {
      // Find the selected product from the products list
      const selectedProduct = products.find((p) => p.product_id === product_id.toString());
  
      // Check if product exists in the products list, otherwise show error
      if (!selectedProduct) {
        showUserAlert('Product not found.');
        return;
      }
  
      // Add the new item to the items list
      setItems((prev) => [
        ...prev,
        {
          ...newItem,
          quantity: parsedQty,
          purchase_price: parsedPrice,
          tax_rate: parsedTax,
          item_total: itemTotal,
          tempId: Date.now(),
          name: selectedProduct.name,  // Use the product name from selectedProduct
        },
      ]);
    }
  
    // Reset the new item state and hide alert
    setNewItem(initialItem);
    setShowAlert(false);
  };

  const handleRemoveItem = (tempId) => {
    setItems((prev) => prev.filter((item) => item.tempId !== tempId));
  };

  const calculateTotal = () =>
    items.reduce((sum, item) => sum + parseFloat(item.item_total || 0), 0).toFixed(2);

  const calculateGrandTotal = () => {
    const total = parseFloat(calculateTotal());
    const taxAmount = total * (totalTaxRate / 100);
    return (total + taxAmount).toFixed(2);
  };

  const handlePostGoodsReceive = async () => {
    if (!selectedSupplierId) return showUserAlert('Please select a supplier.');
    if (items.length === 0) return showUserAlert('Please add at least one item.');

    const payload = {
      supplier_id: parseInt(selectedSupplierId),
      invoice_number: invoiceNumber,
      notes,
      total_amount: parseFloat(calculateTotal()),
      total_tax_rate: totalTaxRate,
      items: items.map(({ product_id, quantity, purchase_price, tax_rate, expiry_date }) => ({
        product_id,
        quantity,
        purchase_price,
        tax_rate,
        expiry_date,
      })),
    };

    setLoading(true);
    try {
      await axios.post('http://localhost:5000/api/goods_receives', payload);
      setItems([]);
      setInvoiceNumber('');
      setNotes('');
      setSelectedSupplierId('');
      setTotalTaxRate(0);
      showUserAlert('Goods Receive created!', 'success');
    } catch (err) {
      showUserAlert(err.message || 'Submission failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container fluid className="goods-receive-create-page">
      <h2>Create Goods Receive</h2>

      {loading && <p>Loading...</p>}

      <Alert variant={alertVariant} show={showAlert} onClose={() => setShowAlert(false)} dismissible>
        {alertMessage}
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
        <Card className="mb-4 goods-receive-create-page">
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
                    <td>{item.name}</td>
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
    </Container>
  );
};

export default GoodsReceiveCreate;
