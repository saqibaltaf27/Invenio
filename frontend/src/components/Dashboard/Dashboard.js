import React, { useEffect, useState } from 'react';
import './Dashboard.scss';
import Feature from './Features/Feature';
import Chart from './chart/Chart';
import Loader from '../PageStates/Loader';
import Error from '../PageStates/Error';
import ErrorComponent from '../PageStates/Error';

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

   

    useEffect(() => {
        let p1 = getReportStats();
        let p2 = getProductStats();

        Promise.all([p1, p2])
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
                                <div className="title">PRODUCT DETAILS</div>
                                <hr className="my-1" style={{ color: "darkgrey" }} />
                                <div className="itme_stats">
                                    <div style={{ flex: "1" }}>
                                        {productStats && (
                                            <div className="row mb-1">
                                                <div className="col-9">Total Number of Items:</div>
                                                <div className="col-3 fw-bold">{productStats.total_products}</div>
                                            </div>
                                        )}
                                        <div className="row"><div className="col-12 text-danger">Low Stock Items:</div></div>
                                        {productStats && Array.isArray(productStats.low_stock_items) &&
                                            productStats.low_stock_items.map((x, i) => (
                                                <div key={i} className="row">
                                                    <div className="col-9">• {x.name}</div>
                                                    <div className="col-3 fw-bold">{x.product_stock}</div>
                                                </div>
                                            ))}
                                    </div>
                                    {productTypeP.length >= 3 &&
                                        productTypeP[0] && productTypeP[1] && productTypeP[2] && (
                                            <div className="d-flex justify-content-center align-items-center" style={{ flex: "1", position: "relative" }}>
                                                <svg width="180px" height="180px" viewBox="0 0 42 42" className="donut">
                                                    <circle className="donut-segment" cx="21" cy="21" r="15.91549430918954"
                                                        fill="transparent" stroke="#516fc9" strokeWidth="5"
                                                        strokeDasharray={`${productTypeP[1].percentage} ${100 - productTypeP[1].percentage}`}
                                                        strokeDashoffset="0" />
                                                    <circle className="donut-segment" cx="21" cy="21" r="15.91549430918954"
                                                        fill="transparent" stroke="#f07fce" strokeWidth="5"
                                                        strokeDasharray={`${productTypeP[0].percentage} ${100 - productTypeP[0].percentage}`}
                                                        strokeDashoffset={-productTypeP[1].percentage} />
                                                    <circle className="donut-segment" cx="21" cy="21" r="15.91549430918954"
                                                        fill="transparent" stroke="#fcbc53" strokeWidth="5"
                                                        strokeDasharray={`${productTypeP[2].percentage} ${100 - productTypeP[2].percentage}`}
                                                        strokeDashoffset={-(productTypeP[1].percentage + productTypeP[0].percentage)} />
                                                </svg>
                                                <div style={{ fontSize: "smaller", position: "absolute" }}>
                                                    <div><div className="me-1" style={{ backgroundColor: "#516fc9", width: "10px", height: "10px", display: "inline-block", borderRadius: "3px" }}></div><span className="me-1">Male:</span> <span>{productTypeP[1].count}</span></div>
                                                    <div><div className="me-1" style={{ backgroundColor: "#f07fce", width: "10px", height: "10px", display: "inline-block", borderRadius: "3px" }}></div><span className="me-1">Female:</span> <span>{productTypeP[0].count}</span></div>
                                                    <div><div className="me-1" style={{ backgroundColor: "#fcbc53", width: "10px", height: "10px", display: "inline-block", borderRadius: "3px" }}></div><span className="me-1">Others:</span> <span>{productTypeP[2].count}</span></div>
                                                </div>
                                            </div>
                                        )}
                                </div>
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
