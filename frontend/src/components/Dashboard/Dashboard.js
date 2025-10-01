import React, { useEffect, useState } from 'react';
import './Dashboard.css';
import Feature from './Features/Feature';
import Chart from './chart/Chart';
import Loader from '../PageStates/Loader';
import ErrorComponent from '../PageStates/Error';
import DailyStockReport from '../Daily Stock Report/DailyStockReport'; // Import the DailyStockReport component

function Dashboard() {
    const [pageState, setPageState] = useState(1);
    const [reportStats, setReportStats] = useState(null);
    const [productStats, setProductStats] = useState(null);
    const [graphStats, setGraphStats] = useState(null);
    const [productTypeP, setProductTypeP] = useState([]);

    const getReportStats = async () => {
        try {
            let result = await fetch('https://invenio-api-production.up.railway.app/api/get_report_stats', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
            });
            if (!result.ok) {
                throw new Error('Failed to fetch report stats');
            }
            let body = await result.json();
            setReportStats(body.info);
        } catch (err) {
            console.error(err);
            setPageState(3);
        }
    };

    const getProductStats = async () => {
        try {
            let result = await fetch('https://invenio-api-production.up.railway.app/api/get_product_stats', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include'
            });
            if (!result.ok) throw new Error("Failed to fetch product stats");
            let body = await result.json();
            setProductStats(body.info);
        } catch (err) {
            console.error(err);
            setPageState(3);
        }
    };

    const getGraphStats = async () => {
        try {
            let result = await fetch('https://invenio-api-production.up.railway.app/api/get_graph_stats', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include'
            });
            if (!result.ok) throw new Error("Failed to fetch graph stats");
            let body = await result.json();
            setGraphStats(body.info);
        } catch (err) {
            console.error(err);
        
        }
    };

    useEffect(() => {
        let p1 = getReportStats();
        let p2 = getProductStats();
        let p3 = getGraphStats();

        Promise.all([p1, p2, p3])
            .then(() => {
                setPageState(2);
            })
            .catch((err) => {
                console.log(err);
                setPageState(3);
            });
    }, []);

    useEffect(() => {
        if (productStats && Array.isArray(productStats.low_stock_items)) {
            let data = productStats.low_stock_items;
            let total = data.reduce((p, o) => p + o.count, 0);

            let t = data.map((x) => {
                let temp = { ...x };
                temp["percentage"] = (temp.count * 100) / total;
                return temp;
            });

            setProductTypeP(t);
        }
    }, [productStats]);

    return (
        <div className="dashboard">
            <div style={{ overflow: "scroll", height: "100%", padding: "1rem" }}>
                {pageState === 1 ? (
                    <Loader />
                ) : pageState === 2 ? (
                    <>
                        <Feature reportStats={reportStats} productStats={productStats} />
                        <div className="second_panel">
                            <div className="left">
                              
                            
                                <DailyStockReport />
                        </div>
                        </div>
                        <Chart graphStats={graphStats} />
                    </>
                ) : (
                    <ErrorComponent />
                )}
            </div>
        </div>
    );
}

export default Dashboard;
