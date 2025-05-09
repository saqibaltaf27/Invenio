import "./Feature.scss";
import {
    PersonOutlined,
    ShoppingCartOutlined,
    AssignmentLateOutlined,
    PlaylistAddCheckOutlined,
} from "@mui/icons-material";
import { Link } from "react-router-dom";

export default function Feature({ reportStats = [], productStats = [] }) {
    console.log("reportStats raw:", reportStats);
    console.log("ProductStats raw:", productStats);

    const {
        employee_count = 0,
        supplier_count = 0
    } = reportStats[0] || {};

    const { total_products = 0, low_stock_items = [] } = productStats || {};

    const infoCard = (title, icon, link, label, value, color) => (
        <div className="d-flex gap-2">
            <div className="d-flex align-items-center">
                {icon}
            </div>
            {link ? (
                <Link to={link} className="link">
                    <span className="text-hover-primary">{label}</span>
                </Link>
            ) : (
                <span className="text-hover-primary">{label}</span>
            )}
            <span style={{ color }}>{value}</span>
        </div>
    );

    return (
        <div className="featured">

            {/* USERS */}
            <div className="featuredItem">
                <span className="featuredTitle">Users</span>
                <div className="featuredMoneyContainer flex-column flex-start">
                    {infoCard(
                        "Employees",
                        <PersonOutlined className="cardIcon" style={{ backgroundColor: "rgba(255,0,0,0.3)" }} />,
                        "/employees",
                        "Employees:",
                        employee_count
                    )}
                    {infoCard(
                        "Suppliers",
                        <PersonOutlined className="cardIcon" style={{ backgroundColor: "rgba(0,0,255,0.3)" }} />,
                        "/suppliers",
                        "Suppliers:",
                        supplier_count
                    )}
                </div>
                <div className="d-flex justify-content-end align-items-center">
                    <div style={{ backgroundColor: "rgba(255,102,0,0.3)", borderRadius: 5, padding: 3, color: "#5e5708" }}>
                        <PersonOutlined />
                    </div>
                </div>
            </div>

            {/* INVENTORY */}
            <div className="featuredItem">
                <span className="featuredTitle">Inventory</span>
                <div className="featuredMoneyContainer flex-column flex-start">
                    {infoCard(
                        "Total Items",
                        <PlaylistAddCheckOutlined className="cardIcon" style={{ backgroundColor: "rgba(70,130,180,0.3)" }} />,
                        "/products",
                        "Total Items:",
                        total_products
                    )}
                    {infoCard(
                        "Low Stock",
                        <AssignmentLateOutlined className="cardIcon" style={{ backgroundColor: "rgba(255,165,0,0.3)" }} />,
                        "/products",
                        "Low Stock:",
                        `${low_stock_items.length} item(s)`,
                        "orange"
                    )}
                </div>
                <div className="d-flex justify-content-end align-items-center">
                    <div style={{ backgroundColor: "rgba(70,130,180,0.3)", borderRadius: 5, padding: 3, color: "#4682B4" }}>
                        <ShoppingCartOutlined />
                    </div>
                </div>
            </div>

            {/* ALERTS */}
            <div className="featuredItem">
                <span className="featuredTitle">Alerts</span>
                <div className="featuredMoneyContainer flex-column flex-start">
                    {infoCard(
                        "Pending Restock",
                        <AssignmentLateOutlined className="cardIcon" style={{ backgroundColor: "rgba(255,99,71,0.3)" }} />,
                        null,
                        "Pending Restock:",
                        low_stock_items.length,
                        "tomato"
                    )}
                </div>
                <div className="d-flex justify-content-end align-items-center">
                    <div style={{ backgroundColor: "rgba(255,99,71,0.3)", borderRadius: 5, padding: 3, color: "#FF6347" }}>
                        <AssignmentLateOutlined />
                    </div>
                </div>
            </div>

        </div>
    );
}
