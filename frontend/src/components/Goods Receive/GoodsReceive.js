import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import {
  Button,
  Table,
  Form,
  Card,
  Container,
  Row,
  Col,
  Pagination,
  Spinner,
  Modal
} from "react-bootstrap";
import Loader from "../PageStates/Loader";
import Swal from "sweetalert2";
import "./GoodsReceive.css";

const initialItem = {
  product_id: "",
  product_name: "",
  quantity: 1,
  purchase_price: "",
  entry_date: "",
};

const GoodsReceiveCreate = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedSupplierId, setSelectedSupplierId] = useState("");
  const [items, setItems] = useState([]);
  const [newItem, setNewItem] = useState(initialItem);
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false); // New state for submission loading
  const [deletingId, setDeletingId] = useState(null);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [generatedInvoiceData, setGeneratedInvoiceData] = useState(null);

  const [goodsReceiveLogs, setGoodsReceiveLogs] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [logsPerPage] = useState(5);

  // SweetAlert2 based alert system
  const showAlert = (title, message, icon = "error", confirmButtonText = "OK") => {
    return Swal.fire({
      title,
      text: message,
      icon,
      confirmButtonText,
      confirmButtonColor: "#0ea5e9",
    });
  };

  const showSuccessAlert = (title, message) => {
    return Swal.fire({
      title,
      text: message,
      icon: "success",
      confirmButtonText: "OK",
      confirmButtonColor: "#10b981",
    });
  };

  // Fetch suppliers, products, logs
  const fetchInitialData = useCallback(async () => {
    setLoading(true);
    try {
      const [suppliersRes, productsRes, logsRes] = await Promise.all([
        axios.post(
          "https://invenio-api-production.up.railway.app/api/get_suppliers",
          {
            start_value: 0,
            sort_column: "name",
            sort_order: "ASC",
            search_value: "",
          }
        ),
        axios.post(
          "https://invenio-api-production.up.railway.app/api/get_products"
        ),
        axios.get(
          "https://invenio-api-production.up.railway.app/api/goods-receive-logs"
        ),
      ]);

      setSuppliers(suppliersRes?.data?.info?.suppliers || []);
      setProducts(productsRes?.data?.info?.products || []);
      setGoodsReceiveLogs(logsRes?.data || []);
    } catch (err) {
      showAlert(
        "Data Fetch Error",
        err.message || "Error fetching data"
      );
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
    const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    const randomPart = Math.floor(1000 + Math.random() * 9000);
    return `GR-${datePart}-${randomPart}`;
  };

  const handleAddItem = () => {
    const { product_id, quantity, purchase_price } = newItem;
    const parsedQty = parseFloat(quantity, 10);
    const parsedPrice = parseFloat(purchase_price);

    if (!product_id || !parsedQty || !parsedPrice) {
      showAlert(
        "Input Error",
        "Please provide valid product, quantity, and price."
      );
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
                item_total: (
                  (item.quantity + parsedQty) *
                  item.purchase_price
                ).toFixed(2),
              }
            : item
        )
      );
    } else {
      const selectedProduct = products.find(
        (p) => p.product_id === product_id.toString()
      );

      if (!selectedProduct) {
        showAlert("Error", "Product not found.");
        return;
      }

      setItems((prev) => [
        ...prev,
        {
          ...newItem,
          quantity: parsedQty,
          purchase_price: parsedPrice,
          item_total: (parsedQty * parsedPrice).toFixed(2),
          tempId: Date.now(),
          product_name: selectedProduct.name,
        },
      ]);
    }

    setNewItem(initialItem);
  };

  const handleRemoveItem = (tempId) => {
    setItems((prev) => prev.filter((item) => item.tempId !== tempId));
  };

  const calculateTotal = () => {
    return items
      .reduce((sum, item) => sum + parseFloat(item.item_total || 0), 0)
      .toFixed(2);
  };

  const handlePostGoodsReceive = async () => {
    if (!selectedSupplierId) {
      showAlert("Validation Error", "Please select a supplier.");
      return;
    }
    if (items.length === 0) {
      showAlert("Validation Error", "Please add at least one item.");
      return;
    }

    const autoInvoiceNumber = invoiceNumber || generateInvoiceNumber();
    setInvoiceNumber(autoInvoiceNumber);

    const payload = {
      supplier_id: selectedSupplierId,
      invoice_number: autoInvoiceNumber,
      notes,
      items: items.map((item) => ({
        product_id: item.product_id,
        quantity: item.quantity,
        purchase_price: item.purchase_price,
        entry_date: item.entry_date,
      })),
    };

    setSubmitting(true);
    try {
      const response = await axios.post(
        "https://invenio-api-production.up.railway.app/api/goods_receives",
        payload
      );

      if (response.data && response.data.gr_id) {
        // Generate invoice data for frontend display
        const selectedSupplier = suppliers.find(s => s.supplier_id === parseInt(selectedSupplierId));
        const invoiceData = {
          invoiceNumber: autoInvoiceNumber,
          supplier: selectedSupplier,
          items: items,
          total: calculateTotal(),
          notes: notes,
          date: new Date().toLocaleDateString(),
          time: new Date().toLocaleTimeString()
        };
        
        setGeneratedInvoiceData(invoiceData);
        setShowInvoiceModal(true);

        // Reset form
        setItems([]);
        setInvoiceNumber("");
        setNotes("");
        setSelectedSupplierId("");

        // Refresh logs
        const logsResponse = await axios.get(
          "https://invenio-api-production.up.railway.app/api/goods-receive-logs"
        );
        setGoodsReceiveLogs(logsResponse.data);
        
        showSuccessAlert("Success", "Goods Receive created successfully!");
      } else {
        showAlert(
          "Process Warning",
          "Goods Receive created, but there was an issue.",
          "warning"
        );
      }
    } catch (err) {
      showAlert(
        "Submission Error",
        err.message || "Submission failed"
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteGoodsReceive = async (gr_id) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "This will permanently delete the Goods Receive record!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#6c757d",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel"
    });

    if (!result.isConfirmed) return;

    setDeletingId(gr_id);
    try {
      const res = await axios.delete(
        `https://invenio-api-production.up.railway.app/api/goods_receives/${gr_id}`
      );

      if (res.data.success) {
        Swal.fire({
          icon: "success",
          title: "Deleted!",
          text: res.data.message,
          timer: 2000,
          showConfirmButton: false,
        });

        const logsResponse = await axios.get(
          "https://invenio-api-production.up.railway.app/api/goods-receive-logs"
        );
        setGoodsReceiveLogs(logsResponse.data);
      } else {
        showAlert(
          "Delete Error",
          res.data.message || "Failed to delete Goods Receive"
        );
      }
    } catch (err) {
      showAlert(
        "Delete Error",
        err.message || "Error deleting Goods Receive"
      );
    } finally {
      setDeletingId(null);
    }
  };

  const handlePrintInvoice = () => {
    const invoiceElement = document.getElementById('invoice-content');
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Invoice ${generatedInvoiceData?.invoiceNumber}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .invoice-header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 20px; }
            .invoice-details { display: flex; justify-content: space-between; margin-bottom: 30px; }
            .invoice-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            .invoice-table th, .invoice-table td { border: 1px solid #ddd; padding: 12px; text-align: left; }
            .invoice-table th { background-color: #f8f9fa; }
            .invoice-total { text-align: right; margin-top: 20px; font-size: 1.2em; font-weight: bold; }
            .invoice-footer { margin-top: 40px; text-align: center; color: #666; }
          </style>
        </head>
        <body>
          ${invoiceElement.innerHTML}
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  };

  const handleDownloadInvoice = () => {
    const invoiceElement = document.getElementById('invoice-content');
    const opt = {
      margin: 1,
      filename: `invoice-${generatedInvoiceData?.invoiceNumber}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
    };

    // You can use html2pdf library here if installed
    // html2pdf().from(invoiceElement).set(opt).save();
    
    // For now, we'll use print as fallback
    handlePrintInvoice();
  };

  const indexOfLastLog = currentPage * logsPerPage;
  const indexOfFirstLog = indexOfLastLog - logsPerPage;
  const currentLogs = goodsReceiveLogs.slice(indexOfFirstLog, indexOfLastLog);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const pageNumbers = [];
  for (let i = 1; i <= Math.ceil(goodsReceiveLogs.length / logsPerPage); i++) {
    pageNumbers.push(i);
  }

  return (
    <Container fluid className="goods-receive-create-page">
      {/* Fullscreen Loader for initial data */}
      {loading && (
        <div className="fullscreen-loader">
          <Loader />
        </div>
      )}

      {/* Submission Loading Modal */}
      <Modal show={submitting} centered className="submission-modal">
        <Modal.Body className="text-center">
          <div className="submission-loader">
            <Loader size={40} />
            <h5 className="mt-3">Submitting Goods Receive...</h5>
            <p className="text-muted">Please wait while we process your request</p>
          </div>
        </Modal.Body>
      </Modal>

      {/* Invoice Modal */}
      <Modal show={showInvoiceModal} onHide={() => setShowInvoiceModal(false)} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>Invoice Generated</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div id="invoice-content" className="invoice-container">
            <div className="invoice-header">
              <h2>GOODS RECEIVE NOTE</h2>
              <p className="invoice-number">Invoice #: {generatedInvoiceData?.invoiceNumber}</p>
            </div>
            
            <div className="invoice-details">
              <div className="supplier-info">
                <h5>Supplier Information</h5>
                <p><strong>Name:</strong> {generatedInvoiceData?.supplier?.name}</p>
                <p><strong>Contact:</strong> {generatedInvoiceData?.supplier?.contact_info || 'N/A'}</p>
              </div>
              <div className="invoice-meta">
                <p><strong>Date:</strong> {generatedInvoiceData?.date}</p>
                <p><strong>Time:</strong> {generatedInvoiceData?.time}</p>
              </div>
            </div>

            <div className="invoice-items">
              <h5>Items Received</h5>
              <table className="invoice-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Quantity</th>
                    <th>Unit Price</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {generatedInvoiceData?.items.map((item, index) => (
                    <tr key={index}>
                      <td>{item.product_name}</td>
                      <td>{item.quantity}</td>
                      <td>${parseFloat(item.purchase_price).toFixed(2)}</td>
                      <td>${parseFloat(item.item_total).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="invoice-total">
              <h4>Grand Total: ${parseFloat(generatedInvoiceData?.total).toFixed(2)}</h4>
            </div>

            {generatedInvoiceData?.notes && (
              <div className="invoice-notes">
                <h5>Notes</h5>
                <p>{generatedInvoiceData.notes}</p>
              </div>
            )}

            <div className="invoice-footer">
              <p>Thank you for your business!</p>
              <p>Generated on {new Date().toLocaleDateString()}</p>
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowInvoiceModal(false)}>
            Close
          </Button>
          <Button variant="primary" onClick={handlePrintInvoice}>
            Print Invoice
          </Button>
          <Button variant="success" onClick={handleDownloadInvoice}>
            Download PDF
          </Button>
        </Modal.Footer>
      </Modal>

      <h2>Create Goods Receive</h2>

      {/* Supplier Selection */}
      <Card className="mb-4 goods-receive-create-page__card">
        <Card.Body>
          <Row>
            <Col md={12}>
              <h4 className="mb-3">Supplier Information</h4>
              <Form.Group className="mb-4 goods-receive-create-page__form-group">
                <Form.Label>Supplier</Form.Label>
                <Form.Select
                  value={selectedSupplierId}
                  onChange={(e) => setSelectedSupplierId(e.target.value)}
                >
                  <option value="">Select Supplier</option>
                  {suppliers.map(({ supplier_id, name }) => (
                    <option key={supplier_id} value={supplier_id}>
                      {name}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>

          {/* Add Items */}
          <h4 className="mb-3">Add Items</h4>
          <Row className="add-item-form-row mb-3">
            <Col md={3}>
              <Form.Group>
                <Form.Label>Product</Form.Label>
                <Form.Select
                  name="product_id"
                  value={newItem.product_id}
                  onChange={handleNewItemChange}
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
            <Col md={3}>
              <Form.Group>
                <Form.Label>Quantity</Form.Label>
                <Form.Control
                  type="number"
                  name="quantity"
                  value={newItem.quantity}
                  onChange={handleNewItemChange}
                />
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group>
                <Form.Label>Purchase Price</Form.Label>
                <Form.Control
                  type="number"
                  name="purchase_price"
                  value={newItem.purchase_price}
                  onChange={handleNewItemChange}
                />
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group>
                <Form.Label>Entry Date</Form.Label>
                <Form.Control
                  type="date"
                  name="entry_date"
                  value={newItem.entry_date}
                  onChange={handleNewItemChange}
                />
              </Form.Group>
            </Col>
          </Row>
          <Button variant="primary" onClick={handleAddItem} className="mt-2">
            Add Item
          </Button>
        </Card.Body>
      </Card>

      {/* Items List */}
      {items.length > 0 && (
        <Card className="mb-4 goods-receive-create-page__card">
          <Card.Body>
            <h4>Items List</h4>
            <div className="table-responsive">
              <Table bordered>
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Quantity</th>
                    <th>Price</th>
                    <th>Entry Date</th>
                    <th>Total</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => (
                    <tr key={item.tempId}>
                      <td>{item.product_name}</td>
                      <td>{item.quantity}</td>
                      <td>{item.purchase_price}</td>
                      <td>{item.entry_date}</td>
                      <td>{item.item_total}</td>
                      <td>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleRemoveItem(item.tempId)}
                        >
                          Remove
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
            <Row>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Invoice #</Form.Label>
                  <Form.Control
                    value={invoiceNumber}
                    onChange={(e) => setInvoiceNumber(e.target.value)}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Notes</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={2}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </Form.Group>
              </Col>
            </Row>
            <Row className="mt-3">
              <Col md={12} className="text-end">
                <h5>Total: {calculateTotal()}</h5>
                <h5>Grand Total: {calculateTotal()}</h5>
              </Col>
            </Row>
            <Button
              variant="success"
              className="mt-3"
              onClick={handlePostGoodsReceive}
              disabled={submitting}
            >
              {submitting ? "Submitting..." : "Submit Goods Receive"}
            </Button>
          </Card.Body>
        </Card>
      )}

      {/* Logs */}
      {goodsReceiveLogs.length > 0 && (
        <Card className="mt-4 goods-receive-create-page__card">
          <Card.Body>
            <h4>Goods Receive Logs</h4>
            <div className="table-responsive">
              <Table bordered>
                <thead>
                  <tr>
                    <th>Time</th>
                    <th>Supplier</th>
                    <th>Invoice #</th>
                    <th>Product</th>
                    <th>Quantity</th>
                    <th>Purchase Price</th>
                    <th>Item Total</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {currentLogs.map((log, logIndex) =>
                    log.items.map((item) => {
                      const itemTotal =
                        (parseFloat(item.purchase_price) || 0) *
                        (parseFloat(item.quantity) || 0);
                      const entryDate = item.entry_date
                        ? new Date(item.entry_date).toLocaleDateString()
                        : "N/A";
                      return (
                        <tr key={`${logIndex}-${item.product_id}`}>
                          <td>{new Date(log.created_at).toLocaleString()}</td>
                          <td>{log.supplier_info}</td>
                          <td>{log.invoice_number}</td>
                          <td>{item.product_name}</td>
                          <td>{item.quantity}</td>
                          <td>{item.purchase_price}</td>
                          <td>{itemTotal.toFixed(2)}</td>
                          <td>
                            <Button
                              variant="danger"
                              size="sm"
                              className="w-100 w-md-auto"
                              onClick={() => handleDeleteGoodsReceive(log.gr_id)}
                              disabled={deletingId === log.gr_id}
                            >
                              {deletingId === log.gr_id ? (
                                <>
                                  <Spinner animation="border" size="sm" className="me-1" />
                                  Deleting...
                                </>
                              ) : (
                                "Delete"
                              )}
                            </Button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </Table>
            </div>
            <Pagination className="mt-3 justify-content-center">
              {pageNumbers.map((number) => (
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