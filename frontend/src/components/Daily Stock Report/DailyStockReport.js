import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Card, Table, Button, Pagination, Spinner, Form } from 'react-bootstrap';
import './DailyStockReport.scss';
import { debounce } from 'lodash'; // Import debounce

const DailyStockReport = () => {
    const [reportData, setReportData] = useState([]);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const recordsPerPage = 8;

    // Debounced fetch function
    const debouncedFetchInventoryReport = useCallback(
        debounce(async () => {
            setLoading(true);
            setError('');
            
            try {
                const params = {
                    page: currentPage,
                    limit: recordsPerPage,
                };

                if (startDate) params.startDate = startDate;
                if (endDate) params.endDate = endDate;

                const response = await axios.get('https://invenio-api-production.up.railway.app/api/stock-report', { params });

                const data = response.data;

                setReportData(data.data || []);
                const count = data.totalCount || data.count || 0;
                const total = Math.ceil(count / recordsPerPage);
                setTotalPages(total);
            } catch (err) {
                setError(err.message || 'Failed to fetch inventory report.');
            } finally {
                setLoading(false);
            }
        }, 500), [currentPage, startDate, endDate] // Adjust debounce delay (500ms)
    );

    useEffect(() => {
        debouncedFetchInventoryReport();
    }, [debouncedFetchInventoryReport]);

    const handleStartDateChange = (e) => setStartDate(e.target.value);
    const handleEndDateChange = (e) => setEndDate(e.target.value);
    const handlePageChange = (page) => setCurrentPage(page);

    return (
        <Card className="daily-stock-report" style={{ maxWidth: '90%', margin: '0 auto', padding: '10px' }}>
            <Card.Header className="d-flex justify-content-between align-items-center">
                <Card.Title>Stock Report</Card.Title>
                <div className="d-flex gap-2 align-items-center">
                    <Form.Label className="mb-0">From:</Form.Label>
                    <Form.Control
                        type="date"
                        value={startDate}
                        onChange={handleStartDateChange}
                        className="form-control"
                        aria-label="Start Date"
                    />
                    <Form.Label className="mb-0">To:</Form.Label>
                    <Form.Control
                        type="date"
                        value={endDate}
                        onChange={handleEndDateChange}
                        className="form-control"
                        aria-label="End Date"
                    />
                    <Button
                        variant="secondary"
                        onClick={debouncedFetchInventoryReport}
                        disabled={loading}
                        aria-label="Apply date filter"
                    >
                        {loading ? 'Applying...' : 'Filter'}
                    </Button>
                </div>
            </Card.Header>
            <Card.Body style={{ padding: '15px' }}>
                {loading ? (
                    <div className="text-center">
                        <Spinner animation="border" />
                        <p>Loading report...</p>
                    </div>
                ) : error ? (
                    <p className="text-danger">{error}</p>
                ) : (
                    <>
                        <Table striped bordered hover responsive>
                            <thead>
                                <tr>
                                    <th>Product</th>
                                    <th>Purchase Price</th>
                                    <th>Stock In Qty</th>
                                    <th>Stock In Value</th>
                                    <th>Stock Out Qty</th>
                                    <th>Stock Out Value</th>
                                    <th>Remaining Stock</th>
                                    <th>Stock Value</th>
                                    <th>Last Transaction</th>
                                </tr>
                            </thead>
                            <tbody>
                                {reportData.map((item) => (
                                    <tr key={item.product_id}>
                                        <td>{item.product_name}</td>
                                        <td>{item.purchase_price}</td>
                                        <td>{item.stock_in_qty}</td>
                                        <td>{item.stock_in_value}</td>
                                        <td>{item.stock_out_qty}</td>
                                        <td>{item.stock_out_value}</td>
                                        <td>{item.current_remaining_stock}</td>
                                        <td>{item.stock_value}</td>
                                        <td>{new Date(item.latest_transaction_date).toLocaleString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>

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
                    </>
                )}
            </Card.Body>
        </Card>
    );
};

export default DailyStockReport;
