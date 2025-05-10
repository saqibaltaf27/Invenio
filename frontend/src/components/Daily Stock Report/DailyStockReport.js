import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, Table, Button, Pagination, Dropdown } from 'react-bootstrap';
import './DailyStockReport.scss'; // You can create this CSS file

const DailyStockReport = ({ credentials }) => {
    const [stockOutLogs, setStockOutLogs] = useState([]);
    const [goodsReceiveLogs, setGoodsReceiveLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [currentPageStockOut, setCurrentPageStockOut] = useState(1);
    const [logsPerPage] = useState(5);
    const [currentPageGoodsReceive, setCurrentPageGoodsReceive] = useState(1);
    const [showStockIn, setShowStockIn] = useState(false);
    const [showStockOut, setShowStockOut] = useState(true);

    useEffect(() => {
        const fetchDailyStockReportData = async () => {
            setLoading(true);
            setError('');
            try {
                const stockOutResponse = await axios.get('https://invenio-api-production.up.railway.app/api/stock-out-logs');
                setStockOutLogs(stockOutResponse.data);
                const goodsReceiveResponse = await axios.get('https://invenio-api-production.up.railway.app/api/goods-receive-logs');
                setGoodsReceiveLogs(goodsReceiveResponse.data);
            } catch (err) {
                setError(err.message || 'Failed to fetch daily stock report data.');
            } finally {
                setLoading(false);
            }
        };

        fetchDailyStockReportData();
    }, [credentials]);

    // Pagination for Stock Out Logs
    const indexOfLastStockOutLog = currentPageStockOut * logsPerPage;
    const indexOfFirstStockOutLog = indexOfLastStockOutLog - logsPerPage;
    const currentStockOutLogs = stockOutLogs.slice(indexOfFirstStockOutLog, indexOfLastStockOutLog);
    const paginateStockOut = (pageNumber) => setCurrentPageStockOut(pageNumber);
    const pageNumbersStockOut = [];
    for (let i = 1; i <= Math.ceil(stockOutLogs.length / logsPerPage); i++) {
        pageNumbersStockOut.push(i);
    }

    // Pagination for Goods Receive Logs
    const indexOfLastGoodsReceiveLog = currentPageGoodsReceive * logsPerPage;
    const indexOfFirstGoodsReceiveLog = indexOfLastGoodsReceiveLog - logsPerPage;
    const currentGoodsReceiveLogs = goodsReceiveLogs.slice(indexOfFirstGoodsReceiveLog, indexOfLastGoodsReceiveLog);
    const paginateGoodsReceive = (pageNumber) => setCurrentPageGoodsReceive(pageNumber);
    const pageNumbersGoodsReceive = [];
    for (let i = 1; i <= Math.ceil(goodsReceiveLogs.length / logsPerPage); i++) {
        pageNumbersGoodsReceive.push(i);
    }

    const handleShowStockIn = () => {
        setShowStockIn(true);
        setShowStockOut(false);
    };

    const handleShowStockOut = () => {
        setShowStockIn(false);
        setShowStockOut(true);
    };

    if (loading) {
        return <p>Loading Daily Stock Report...</p>;
    }

    if (error) {
        return <p className="text-danger">Error loading Daily Stock Report: {error}</p>;
    }

    return (
        <Card className="daily-stock-report">
            <Card.Header>
                <div className="d-flex justify-content-between align-items-center">
                    <Card.Title>Daily Stock Report</Card.Title>
                    <div>
                        <Dropdown>
                            <Dropdown.Toggle variant="outline-secondary" id="dropdown-basic">
                                View Transactions
                            </Dropdown.Toggle>

                            <Dropdown.Menu>
                                <Dropdown.Item onClick={handleShowStockOut}>Stock Out</Dropdown.Item>
                                <Dropdown.Item onClick={handleShowStockIn}>Stock In (Goods Receive)</Dropdown.Item>
                            </Dropdown.Menu>
                        </Dropdown>
                    </div>
                </div>
            </Card.Header>
            <Card.Body>
                {showStockOut && (
                    <div>
                        <h4>Stock Out Transactions</h4>
                        {stockOutLogs.length > 0 ? (
                            <Table striped bordered hover responsive>
                                <thead>
                                    <tr>
                                        <th>Time</th>
                                        <th>Customer</th>
                                        <th>Product</th>
                                        <th>Quantity</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {currentStockOutLogs.map((log) => (
                                        <tr key={log.id}>
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
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                        ) : (
                            <p>No stock out transactions found.</p>
                        )}
                        {stockOutLogs.length > logsPerPage && (
                            <Pagination className="mt-3 justify-content-center">
                                {pageNumbersStockOut.map(number => (
                                    <Pagination.Item key={number} active={number === currentPageStockOut} onClick={() => paginateStockOut(number)}>
                                        {number}
                                    </Pagination.Item>
                                ))}
                            </Pagination>
                        )}
                    </div>
                )}

                {showStockIn && (
                    <div>
                        <h4>Goods Receive Transactions</h4>
                        {goodsReceiveLogs.length > 0 ? (
                            <Table striped bordered hover responsive>
                                <thead>
                                    <tr>
                                        <th>Time</th>
                                        <th>Supplier</th>
                                        <th>Invoice #</th>
                                        <th>Product</th>
                                        <th>Quantity</th>
                                        <th>Purchase Price</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {currentGoodsReceiveLogs.map((log) => (
                                        <tr key={log.id}>
                                            <td>{new Date(log.created_at).toLocaleString()}</td>
                                            <td>{log.supplier_info}</td>
                                            <td>{log.invoice_number}</td>
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
                                                    <div key={item.product_id}>{item.purchase_price}</div>
                                                ))}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                        ) : (
                            <p>No goods receive transactions found.</p>
                        )}
                        {goodsReceiveLogs.length > logsPerPage && (
                            <Pagination className="mt-3 justify-content-center">
                                {pageNumbersGoodsReceive.map(number => (
                                    <Pagination.Item key={number} active={number === currentPageGoodsReceive} onClick={() => paginateGoodsReceive(number)}>
                                        {number}
                                    </Pagination.Item>
                                ))}
                            </Pagination>
                        )}
                    </div>
                )}
            </Card.Body>
        </Card>
    );
};

export default DailyStockReport;