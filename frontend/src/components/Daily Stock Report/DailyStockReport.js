import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import {
    Card,
    Table,
    Button,
    Pagination,
    Spinner,
    Form,
    InputGroup,
    Row,
    Col,
    Alert
} from 'react-bootstrap';
import { debounce } from 'lodash';
import './DailyStockReport.scss';

const DailyStockReport = () => {
    const [reportData, setReportData] = useState([]);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const recordsPerPage = 8;

    const fetchInventoryReport = useCallback(
        debounce(async () => {
            setLoading(true);
            setError('');
            try {
                const params = {
                    page: currentPage,
                    limit: recordsPerPage,
                    ...(startDate && { startDate }),
                    ...(endDate && { endDate }),
                };

                const response = await axios.get('https://invenio-api-production.up.railway.app/api/stock-report', { params });
                const data = response.data;

                setReportData(data.data || []);
                const count = data.totalCount || data.count || (data.data?.length || 0);
                setTotalPages(Math.ceil(count / recordsPerPage));
            } catch (err) {
                setError(err.message || 'Failed to fetch inventory report.');
            } finally {
                setLoading(false);
            }
        }, 400),
        [currentPage, startDate, endDate]
    );

    useEffect(() => {
        fetchInventoryReport();
    }, [fetchInventoryReport]);

    const handleReset = () => {
        setStartDate('');
        setEndDate('');
        setCurrentPage(1);
    };

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    return (
        <Card className="daily-stock-report shadow-sm rounded" style={{ maxWidth: '95%', margin: '20px auto' }}>
            <Card.Header className="bg-dark text-white d-flex justify-content-between align-items-center">
                <h5 className="mb-0">📦 Daily Stock Report</h5>
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
                                    setCurrentPage(1);
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
                                    setCurrentPage(1);
                                }}
                            />
                        </InputGroup>
                    </Col>
                    <Col md={6} className="text-end">
                        <Button variant="primary" onClick={fetchInventoryReport} disabled={loading}>
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
                    <Alert variant="info">No records found for selected date range.</Alert>
                ) : (
                    <>
                        <Table striped bordered hover responsive className="text-center">
                            <thead className="table-dark">
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
                                        <td>{item.purchase_price.toFixed(2)}</td>
                                        <td>{item.stock_in_qty ?? 0}</td>
                                        <td>{item.stock_in_value?.toFixed(2) ?? 0}</td>
                                        <td>{item.stock_out_qty ?? 0}</td>
                                        <td>{item.stock_out_value?.toFixed(2) ?? 0}</td>
                                        <td>{item.current_remaining_stock}</td>
                                        <td>{item.stock_value?.toFixed(2)}</td>
                                        <td>{new Date(item.latest_transaction_date).toLocaleDateString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>

                        {totalPages > 1 && (
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
                        )}
                    </>
                )}
            </Card.Body>
        </Card>
    );
};

export default DailyStockReport;
