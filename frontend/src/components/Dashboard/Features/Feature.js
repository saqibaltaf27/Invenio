import "./Feature.css";
import {
    PersonOutlined,
    ShoppingCartOutlined,
    AssignmentLateOutlined,
    PlaylistAddCheckOutlined,
    Inventory2Outlined,
    LocalAtmOutlined,
    ReceiptLongOutlined,
    ExpandMore,
} from "@mui/icons-material";
import {
    Accordion,
    AccordionSummary,
    AccordionDetails,
    TextField,
} from "@mui/material";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";

export default function Feature({
    reportStats = [],
    productStats = [],
    stockOutValue = {},
}) {
    const baseStats = Array.isArray(reportStats)
  ? (reportStats[0] ?? {})
  : (reportStats ?? {});

const {
  employee_count = 0,
  supplier_count = 0,
} = baseStats;
    const { total_products = 0, low_stock_items = [] } = productStats || {};

    const today = new Date().toISOString().split("T")[0];
    const [stockOutDate, setStockOutDate] = useState(today);
    const [expenseDate, setExpenseDate] = useState(today);

    const API_BASE = "https://invenio-api-production.up.railway.app";

    const [stockOutTotal, setStockOutTotal] = useState(stockOutValue?.stock_out_value || 0);
    const [expenseTotal, setExpenseTotal] = useState(0);
    const [allInventory, setAllInventory] = useState([]);

    const totalInventoryCount = allInventory.length || 0;
    const totalInventoryValue = allInventory.reduce((acc, item) => acc + (item.total_value || 0), 0);

    const fetchStockOutValue = async (date) => {
        try {
            const res = await axios.post(`${API_BASE}/api/get_stockout_value`, { date });
            setStockOutTotal(res.data.info.stock_out_value || 0);
        } catch (err) {
            console.error("Error fetching stock out value:", err);
        }
    };

    const fetchExpenseValue = async (date) => {
        try {
            const res = await axios.post(`${API_BASE}/api/get_expense_valye`, { date });
            setExpenseTotal(res.data.info.total_expense_value || 0);
        } catch (err) {
            console.error("Error fetching expense value:", err);
        }
    };

    useEffect(() => {
        fetchStockOutValue(stockOutDate);
        fetchExpenseValue(expenseDate);
        fetchAllInventory();
    }, []);

    const fetchAllInventory = async () => {
        try {
            const res = await axios.get(`${API_BASE}/api/get_all_inventory`);
            if (Array.isArray(res.data.info)) {
                setAllInventory(res.data.info);
            }
        } catch (err) {
            console.error("Error fetching all inventory:", err);
        }
    };

    const infoCard = (title, icon, link, label, value, color, extraControl = null) => (
        <div className="infoCard">
            <div className="infoIcon">{icon}</div>
            <div className="infoContent">
                {link ? (
                    <Link to={link} className="link">
                        <span className="infoLabel">{label}</span>
                    </Link>
                ) : (
                    <span className="infoLabel">{label}</span>
                )}
                <span className="infoValue" style={{ color }}>{value}</span>
            </div>
            {extraControl && <div className="infoControl">{extraControl}</div>}
        </div>
    );

    return (
        <div className="featured">

            {/* USERS */}
            <div className="featuredItem">
                <span className="featuredTitle">Users</span>
                <div className="featuredMoneyContainer">
                    {infoCard(
                        "Employees",
                        <PersonOutlined className="cardIcon red" />,
                        "/employees",
                        "Employees:",
                        employee_count,
                        "#d32f2f" // red color
                    )}
                    {infoCard(
                        "Suppliers",
                        <PersonOutlined className="cardIcon blue" />,
                        "/suppliers",
                        "Suppliers:",
                        supplier_count,
                        "#1976d2" // blue color
                    )}
                </div>
            </div>

            {/* INVENTORY */}
            <div className="featuredItem">
                <span className="featuredTitle">Inventory</span>
                <div className="featuredMoneyContainer inventoryFlex">

                    {/* Total Items */}
                    {infoCard(
                        "Total Items",
                        <PlaylistAddCheckOutlined className="cardIcon steelblue" />,
                        "/products",
                        "Total Items:",
                        total_products,
                        "steelblue"
                    )}

                    {/* All Inventory Accordion */}
                    <Accordion className="inventoryAccordion">
                        <AccordionSummary expandIcon={<ExpandMore />}>
                            <div className="infoCard">
                                <div className="infoIcon">
                                    <Inventory2Outlined className="cardIcon green" />
                                </div>
                                <div className="infoContent">
                                    <span className="infoLabel">All Inventory Value:</span>
                                    <span className="infoValue green"> Rs. {totalInventoryValue?.toLocaleString()}</span>
                                </div>
                            </div>
                        </AccordionSummary>
                        <AccordionDetails>
                            <table className="inventoryTable">
                                <thead>
                                    <tr>
                                        <th>Name</th>
                                        <th>Stock</th>
                                        <th>Price</th>
                                        <th>Total Value</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {allInventory.map((item, idx) => (
                                        <tr key={idx}>
                                            <td>{item.name}</td>
                                            <td>{item.product_stock}</td>
                                            <td>Rs. {item.purchase_price?.toLocaleString()}</td>
                                            <td>Rs. {item.total_value?.toLocaleString()}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </AccordionDetails>
                    </Accordion>

                </div>
            </div>

            {/* FINANCIALS */}
            <div className="featuredItem">
                <span className="featuredTitle">Financials</span>
                <div className="featuredMoneyContainer">
                    {infoCard(
                        "Total Expense Value",
                        <ReceiptLongOutlined className="cardIcon orange" />,
                        "/expenses",
                        "Total Expense Value:",
                        `Rs. ${expenseTotal.toLocaleString()}`,
                        "#FF6B35",
                        <TextField
                            type="date"
                            size="small"
                            value={expenseDate}
                            onChange={(e) => {
                                const newDate = e.target.value;
                                setExpenseDate(newDate);
                                fetchExpenseValue(newDate);
                            }}
                            sx={{
                                "& .MuiInputBase-input": {
                                    padding: "8px",
                                    fontSize: "0.875rem"
                                }
                            }}
                        />
                    )}
                    {infoCard(
                        "Stock Out Value",
                        <LocalAtmOutlined className="cardIcon red" />,
                        null,
                        "Stock Out Value:",
                        `Rs. ${stockOutTotal.toLocaleString()}`,
                        "red",
                        <TextField
                            type="date"
                            size="small"
                            value={stockOutDate}
                            onChange={(e) => {
                                const newDate = e.target.value;
                                setStockOutDate(newDate);
                                fetchStockOutValue(newDate);
                            }}
                            sx={{
                                "& .MuiInputBase-input": {
                                    padding: "8px",
                                    fontSize: "0.875rem"
                                }
                            }}
                        />
                    )}
                </div>
            </div>

            {/* ALERTS */}
            <div className="featuredItem">
                <span className="featuredTitle">Alerts</span>
                <div className="featuredMoneyContainer">
                    {infoCard(
                        "Pending Restock",
                        <AssignmentLateOutlined className="cardIcon tomato" />,
                        null,
                        "Pending Restock:",
                        low_stock_items.length,
                        "tomato"
                    )}
                </div>
            </div>

        </div>
    );
}