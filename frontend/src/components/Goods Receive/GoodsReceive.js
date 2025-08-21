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
} from "react-bootstrap";
import Loader from "../PageStates/Loader"; // Loader component
import "./GoodsReceive.scss"; // SCSS styles

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
  const [loading, setLoading] = useState(true); // true initially to show fullscreen loader

  // States for custom modal/alerts
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [customModalTitle, setCustomModalTitle] = useState("");
  const [customModalMessage, setCustomModalMessage] = useState("");
  const [customModalVariant, setCustomModalVariant] = useState("");
  const [customModalDownloadUrl, setCustomModalDownloadUrl] = useState("");

  const [goodsReceiveLogs, setGoodsReceiveLogs] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [logsPerPage] = useState(5);

  // Modal-based alert system
  const showUserAlert = (message, variant = "danger", title = "") => {
    setCustomModalMessage(message);
    setCustomModalVariant(variant);
    setCustomModalTitle(title);
    setShowCustomModal(true);
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
      showUserAlert(
        err.message || "Error fetching data",
        "danger",
        "Data Fetch Error"
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
    const parsedQty = parseInt(quantity, 10);
    const parsedPrice = parseFloat(purchase_price);

    if (!product_id || !parsedQty || !parsedPrice) {
      showUserAlert(
        "Please provide valid product, quantity, and price.",
        "danger",
        "Input Error"
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
        showUserAlert("Product not found.", "danger", "Error");
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
      showUserAlert("Please select a supplier.", "danger", "Validation Error");
      return;
    }
    if (items.length === 0) {
      showUserAlert(
        "Please add at least one item.",
        "danger",
        "Validation Error"
      );
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

    setLoading(true);
    try {
      const response = await axios.post(
        "https://invenio-api-production.up.railway.app/api/goods_receives",
        payload
      );

      if (response.data && response.data.gr_id) {
        const generatedInvoiceUrl = `https://invenio-api-production.up.railway.app/api/goods_receives/${response.data.gr_id}/invoice`;
        setCustomModalDownloadUrl(generatedInvoiceUrl);
        showUserAlert(
          "Goods Receive created successfully! Click the button to download the invoice.",
          "success",
          "Invoice Ready"
        );

        setItems([]);
        setInvoiceNumber("");
        setNotes("");
        setSelectedSupplierId("");

        const logsResponse = await axios.get(
          "https://invenio-api-production.up.railway.app/api/goods-receive-logs"
        );
        setGoodsReceiveLogs(logsResponse.data);
      } else {
        showUserAlert(
          "Goods Receive created, but invoice generation failed.",
          "warning",
          "Process Warning"
        );
      }
    } catch (err) {
      showUserAlert(
        err.message || "Submission failed",
        "danger",
        "Submission Error"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadInvoice = async () => {
    if (!customModalDownloadUrl) {
      showUserAlert(
        "Download URL is not available.",
        "danger",
        "Download Error"
      );
      return;
    }
    setLoading(true);
    try {
      const pdfResponse = await axios.get(customModalDownloadUrl, {
        responseType: "blob",
      });

      const blob = new Blob([pdfResponse.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Purchase_Invoice_${invoiceNumber || Date.now()}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      setCustomModalDownloadUrl("");
      setShowCustomModal(false);
    } catch (pdfError) {
      showUserAlert(
        `Error downloading invoice: ${pdfError.message}`,
        "danger",
        "Download Error"
      );
    } finally {
      setLoading(false);
    }
  };

  const indexOfLastLog = currentPage * logsPerPage;
  const indexOfFirstLog = indexOfLastLog - logsPerPage;
  const currentLogs = goodsReceiveLogs.slice(
    indexOfFirstLog,
    indexOfLastLog
  );

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const pageNumbers = [];
  for (let i = 1; i <= Math.ceil(goodsReceiveLogs.length / logsPerPage); i++) {
    pageNumbers.push(i);
  }

  // Custom Modal Component
  const CustomModal = ({
    show,
    title,
    message,
    variant,
    downloadUrl,
    onClose,
    onDownload,
  }) => {
    if (!show) return null;

    let headerColor = "#3498db";
    let borderColor = "#e0e0e0";

    if (variant === "success") {
      headerColor = "#2ecc71";
      borderColor = "#2ecc71";
    } else if (variant === "danger") {
      headerColor = "#e74c3c";
      borderColor = "#e74c3c";
    } else if (variant === "warning") {
      headerColor = "#f39c12";
      borderColor = "#f39c12";
    }

    return (
      <div className="custom-modal-overlay">
        <div className="custom-modal-content" style={{ borderColor }}>
          <div
            className="custom-modal-header"
            style={{ backgroundColor: headerColor }}
          >
            <h5 className="custom-modal-title" style={{ color: "white" }}>
              {title}
            </h5>
            <button
              className="custom-modal-close-button"
              onClick={onClose}
              style={{ color: "white" }}
            >
              &times;
            </button>
          </div>
          <div className="custom-modal-body">
            <p>{message}</p>
          </div>
          <div className="custom-modal-footer">
            {downloadUrl && (
              <Button
                variant="primary"
                onClick={onDownload}
                style={{ marginRight: "10px" }}
              >
                Download Invoice
              </Button>
            )}
            <Button variant="secondary" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </div>
    );
  };

  // Full screen loader if loading
  if (loading) {
    return (
     <div className="fullscreen-loader">
        <Loader />
      </div>
    );
  }

  return (
    <Container fluid className="goods-receive-create-page">
      <h2>Create Goods Receive</h2>

      <CustomModal
        show={showCustomModal}
        title={customModalTitle}
        message={customModalMessage}
        variant={customModalVariant}
        downloadUrl={customModalDownloadUrl}
        onClose={() => {
          setShowCustomModal(false);
          setCustomModalDownloadUrl("");
        }}
        onDownload={handleDownloadInvoice}
      />

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
              disabled={loading}
            >
              Submit Goods Receive
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
                    <th>Entry Date</th>
                  </tr>
                </thead>
                <tbody>
                  {currentLogs.map((log, logIndex) =>
                    log.items.map((item) => {
                      const itemTotal =
                        (parseFloat(item.purchase_price) || 0) *
                        (parseInt(item.quantity) || 0);
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
                          <td>{entryDate}</td>
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
