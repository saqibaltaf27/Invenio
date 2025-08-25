import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import {
    Card,
    Table,
    Button,
    // Pagination, // Keeping Pagination in imports, but not using it for now due to backend changes
    Spinner,
    Form,
    InputGroup,
    Row,
    Col,
    Alert,
    ButtonGroup // New import for grouping buttons
} from 'react-bootstrap';
import { debounce } from 'lodash';
// Removed SCSS import as it caused a compilation error in a self-contained environment.
// Custom styles will be handled inline or with Bootstrap classes.

const DailyStockReport = () => {
    // State to hold the data for the currently selected report
    const [reportData, setReportData] = useState([]);
    // State for the selected report type: 'stockIn' or 'stockOut'
    const [reportType, setReportType] = useState('stockIn');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    // Removed pagination states as backend model functions no longer support it
    // const [currentPage, setCurrentPage] = useState(1);
    // const [totalPages, setTotalPages] = useState(1);
    // const recordsPerPage = 8; // No longer used for fetching

    // useCallback and debounce are used for efficient API calls
    const fetchReport = useCallback(
        debounce(async () => {
            setLoading(true);
            setError('');
            try {
                // Determine the API endpoint based on the selected report type
                const url = reportType === 'stockIn'
                    ? 'https://invenio-api-production.up.railway.app/api/stock-in-report'
                    : 'https://invenio-api-production.up.railway.app/api/stock-out-report';

                const params = {
                    // Removed pagination params as backend doesn't support them in new endpoints
                    // page: currentPage,
                    // limit: recordsPerPage,
                    ...(startDate && { startDate }),
                    ...(endDate && { endDate }),
                };

                const response = await axios.get(url, { params });
                // The backend now returns { data: [...] } for both reports
                setReportData(response.data.data || []); 
                
                // Removed pagination logic as it's not supported by the current backend model functions
                // const count = response.data.totalCount || response.data.count || (response.data.data?.length || 0);
                // setTotalPages(Math.ceil(count / recordsPerPage));

            } catch (err) {
                setError(err.message || `Failed to fetch ${reportType === 'stockIn' ? 'stock-in' : 'stock-out'} report.`);
            } finally {
                setLoading(false);
            }
        }, 400),
        [reportType, startDate, endDate] // Dependencies for useCallback
    );

    // Effect hook to fetch data whenever reportType, startDate, or endDate changes
    useEffect(() => {
        fetchReport();
    }, [fetchReport]);

    // Handle resetting filters
    const handleReset = () => {
        setStartDate('');
        setEndDate('');
        // setCurrentPage(1); // Removed as pagination is not used
        fetchReport(); // Re-fetch report with reset filters
    };

    // Handle report type change
    const handleReportTypeChange = (type) => {
        setReportType(type);
        // setCurrentPage(1); // Reset page when changing report type
        setReportData([]); // Clear previous data
        // No need to call fetchReport explicitly here, it will be called by useEffect
    };

    // Removed handlePageChange as pagination is not used
    // const handlePageChange = (page) => {
    //     setCurrentPage(page);
    // };

    return (
        <Card className="shadow-sm rounded" style={{ maxWidth: '95%', margin: '20px auto' }}>
            <Card.Header className="text-black d-flex justify-content-between align-items-center">
                <h5 className="mb-0">
                    {reportType === 'stockIn' ? '📥 Stock-In Report' : '📤 Stock-Out Report'}
                </h5>
                {/* Button Group to switch between reports */}
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
                </ButtonGroup>
            </Card.Header>

            <Card.Body>
                <Row className="mb-4 align-items-center">
                    <Col md={3}>
                        <InputGroup>
                            <InputGroup.Text>From</InputGroup.Text>
                            <Form.Control
                                type="date"
                                value={startDate}
                                onChange={(e) => {
                                    setStartDate(e.target.value);
                                    // setCurrentPage(1); // Reset page
                                }}
                            />
                        </InputGroup>
                    </Col>
                    <Col md={3}>
                        <InputGroup>
                            <InputGroup.Text>To</InputGroup.Text>
                            <Form.Control
                                type="date"
                                value={endDate}
                                onChange={(e) => {
                                    setEndDate(e.target.value);
                                    // setCurrentPage(1); // Reset page
                                }}
                            />
                        </InputGroup>
                    </Col>
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
                    <>
                        <Table striped bordered hover responsive className="text-center">
                            <thead className="table-White">
                                <tr>
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
                                </tr>
                            </thead>
                            <tbody>
                                {reportData.map((item, index) => (
                                    <tr key={item.product_id + '-' + item.transaction_date + '-' + index}>
                                        <td>{item.product_name}</td>
                                        <td>{item.purchase_price ? item.purchase_price.toFixed(2) : '0.00'}</td>
                                        {reportType === 'stockIn' ? (
                                            <>
                                                <td>{item.total_stock_in_qty ?? 0}</td>
                                                <td>{item.total_stock_in_value ? item.total_stock_in_value.toFixed(2) : '0.00'}</td>
                                            </>
                                        ) : (
                                            <>
                                                <td>{item.total_stock_out_qty ?? 0}</td>
                                                <td>{item.total_stock_out_value ? item.total_stock_out_value.toFixed(2) : '0.00'}</td>
                                            </>
                                        )}
                                        <td>{new Date(item.transaction_date).toLocaleDateString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>

                        {/* Removed pagination UI as it's not supported by the current backend model functions */}
                        {/* {totalPages > 1 && (
                            <Pagination className="justify-content-center mt-3">
                                {[...Array(totalPages)].map((_, i) => (
                                    <Pagination.Item
                                        key={i + 1}
                                        active={currentPage === i + 1}
                                        onClick={() => handlePageChange(i + 1)}
                                    >
                                        {i + 1}
                                    </Pagination.Item>
                                ))}
                            </Pagination>
                        )} */}
                    </>
                )}
            </Card.Body>
        </Card>
    );
};

export default DailyStockReport;
