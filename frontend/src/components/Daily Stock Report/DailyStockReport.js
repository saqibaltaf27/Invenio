import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import {
    Card,
    Table,
    Button,
    Spinner,
    Form,
    InputGroup,
    Row,
    Col,
    Alert,
    ButtonGroup
} from 'react-bootstrap';
import { debounce } from 'lodash';

const DailyStockReport = () => {

    const today = new Date().toISOString().split('T')[0]; // Get today's date in YYYY-MM-DD format

    const [reportData, setReportData] = useState([]);
    const [reportType, setReportType] = useState('stockIn'); 
    const [startDate, setStartDate] = useState(today);
    const [endDate, setEndDate] = useState(today);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(today);

    const fetchReport = useCallback(
        debounce(async () => {
            setLoading(true);
            setError('');
            try {
                let url = '';
                let params = {};

                if (reportType === 'stockIn') {
                    url = 'https://invenio-api-production.up.railway.app/api/stock-in-report';
                    params = {
                        ...(startDate && { startDate }),
                        ...(endDate && { endDate }),
                    };
                } else if (reportType === 'stockOut') {
                    url = 'https://invenio-api-production.up.railway.app/api/stock-out-report';
                    params = {
                        ...(startDate && { startDate }),
                        ...(endDate && { endDate }),
                    };
                } else if (reportType === 'dailyStock') {
                   // url = 'http://localhost:5000/api/daily-stock-report';
                     url = 'https://invenio-api-production.up.railway.app/api/daily-stock-report';
                    params = { ...(startDate && { startDate }) }; // ✅ only one date needed
                }

                const response = await axios.get(url, { params });
                setReportData(response.data.data || response.data || []);
            } catch (err) {
                setError(err.message || 'Failed to fetch report.');
            } finally {
                setLoading(false);
            }
        }, 400),
        [reportType, startDate, endDate]
    );

    useEffect(() => {
        fetchReport();
    }, [fetchReport]);

    const handleReset = () => {
        setStartDate('');
        setEndDate('');
        fetchReport();
    };

    const handleReportTypeChange = (type) => {
        setReportType(type);
        setReportData([]);
    };

    return (
        <Card className="shadow-sm rounded" style={{ maxWidth: '95%', margin: '20px auto' }}>
            <Card.Header className="text-black d-flex justify-content-between align-items-center">
                <h5 className="mb-0">
                    {reportType === 'stockIn'
                        ? '📥 Stock-In Report'
                        : reportType === 'stockOut'
                        ? '📤 Stock-Out Report'
                        : '📊 Daily Stock Report'}
                </h5>
                <ButtonGroup aria-label="Report Type Selection">
                    <Button
                        variant={reportType === 'stockIn' ? 'primary' : 'outline-primary'}
                        onClick={() => handleReportTypeChange('stockIn')}
                        disabled={loading}
                    >
                        Stock In
                    </Button>
                    <Button
                        variant={reportType === 'stockOut' ? 'primary' : 'outline-primary'}
                        onClick={() => handleReportTypeChange('stockOut')}
                        disabled={loading}
                    >
                        Stock Out
                    </Button>
                    <Button
                        variant={reportType === 'dailyStock' ? 'primary' : 'outline-primary'}
                        onClick={() => handleReportTypeChange('dailyStock')}
                        disabled={loading}
                    >
                        Daily Stock
                    </Button>
                </ButtonGroup>
            </Card.Header>

            <Card.Body>
                <Row className="mb-4 align-items-center">
                    {reportType === 'dailyStock' ? (
                        <Col md={3}>
                            <InputGroup>
                                <InputGroup.Text>Report Date</InputGroup.Text>
                                <Form.Control
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                />
                            </InputGroup>
                        </Col>
                    ) : (
                        <>
                            <Col md={3}>
                                <InputGroup>
                                    <InputGroup.Text>From</InputGroup.Text>
                                    <Form.Control
                                        type="date"
                                        value={startDate}
                                        onChange={(e) => setStartDate(e.target.value)}
                                    />
                                </InputGroup>
                            </Col>
                            <Col md={3}>
                                <InputGroup>
                                    <InputGroup.Text>To</InputGroup.Text>
                                    <Form.Control
                                        type="date"
                                        value={endDate}
                                        onChange={(e) => setEndDate(e.target.value)}
                                    />
                                </InputGroup>
                            </Col>
                        </>
                    )}

                    <Col md={6} className="text-end">
                        <Button variant="primary" onClick={fetchReport} disabled={loading}>
                            {loading ? 'Filtering...' : 'Apply Filter'}
                        </Button>{' '}
                        <Button variant="outline-secondary" onClick={handleReset} disabled={loading}>
                            Reset
                        </Button>
                    </Col>
                </Row>

                {loading ? (
                    <div className="text-center">
                        <Spinner animation="border" role="status" />
                        <p className="mt-2">Loading report...</p>
                    </div>
                ) : error ? (
                    <Alert variant="danger">{error}</Alert>
                ) : reportData.length === 0 ? (
                    <Alert variant="info">No records found for the selected date range and report type.</Alert>
                ) : (
                    <Table striped bordered hover responsive className="text-center">
                        <thead className="table-White">
                            <tr>
                                {reportType === 'dailyStock' ? (
                                    <>
                                        
                                        <th>Item</th>
                                        <th>Old Stock Qty</th>
                                        <th>Stock In Qty</th>
                                        <th>Stock Out Qty</th>
                                        <th>Stock In Value</th>
                                        <th>Stock Out Value</th>
                                        <th>Remaining Stock</th>
                                        <th>Avg Price</th>
                                    </>
                                ) : (
                                    <>
                                        <th>Product</th>
                                        <th>Purchase Price</th>
                                        {reportType === 'stockIn' ? (
                                            <>
                                                <th>Total Stock In Qty</th>
                                                <th>Total Stock In Value</th>
                                            </>
                                        ) : (
                                            <>
                                                <th>Total Stock Out Qty</th>
                                                <th>Total Stock Out Value</th>
                                            </>
                                        )}
                                        <th>Transaction Date</th>
                                    </>
                                )}
                            </tr>
                        </thead>
                        <tbody>
                            {reportData.map((item, index) => (
                                <tr key={index}>
                                    {reportType === 'dailyStock' ? (
                                        <>
                                        
                                            <td>{item.ItemName}</td>
                                            <td>{item.OldStockQty}</td>
                                            <td>{item.StockInQty}</td>
                                            <td>{item.StockOutQty}</td>
                                            <td>{item.StockInValue?.toFixed(2)}</td>
                                            <td>{item.StockOutValue?.toFixed(2)}</td>
                                            <td>{item.RemainingStock}</td>
                                            <td>{item.AvgPrice?.toFixed(2)}</td>
                                        </>
                                    ) : (
                                        <>
                                            <td>{item.product_name}</td>
                                            <td>{item.purchase_price?.toFixed(2)}</td>
                                            {reportType === 'stockIn' ? (
                                                <>
                                                    <td>{item.total_stock_in_qty}</td>
                                                    <td>{item.total_stock_in_value?.toFixed(2)}</td>
                                                </>
                                            ) : (
                                                <>
                                                    <td>{item.total_stock_out_qty}</td>
                                                    <td>{item.total_stock_out_value?.toFixed(2)}</td>
                                                </>
                                            )}
                                            <td>{new Date(item.transaction_date).toLocaleDateString()}</td>
                                        </>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                )}
            </Card.Body>
        </Card>
    );
};

export default DailyStockReport;
