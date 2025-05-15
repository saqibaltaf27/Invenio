const { sql, poolPromise } = require('../db/conn');

exports.getStockReport = async (req, res) => {
    const { startDate, endDate } = req.query;

    try {
        const pool = await poolPromise;

        const result = await pool.request().query(`
            WITH StockIn AS (
                SELECT 
                    gri.product_id,
                    CONVERT(date, gr.gr_date) AS latest_transaction_date,
                    SUM(gri.quantity) AS stock_in_qty,
                    SUM(gri.quantity * gri.purchase_price) AS stock_in_value
                FROM goods_receive_items gri
                INNER JOIN goods_receives gr ON gr.gr_id = gri.gr_id
                GROUP BY gri.product_id, CONVERT(date, gr.gr_date)
            ),
            StockOut AS (
                SELECT 
                    soi.product_id,
                    CONVERT(date, so.created_at) AS latest_transaction_date,
                    SUM(soi.quantity) AS stock_out_qty,
                    SUM(soi.quantity * p.purchase_price) AS stock_out_value
                FROM stock_out_items soi
                INNER JOIN stock_outs so ON so.so_id = soi.so_id
                INNER JOIN products p ON p.product_id = soi.product_id
                GROUP BY soi.product_id, CONVERT(date, so.created_at)
            )
            SELECT 
                p.product_id,
                p.name AS product_name,
                p.purchase_price,
                si.latest_transaction_date,
                si.stock_in_qty,
                si.stock_in_value,
                so.stock_out_qty,
                so.stock_out_value,
                p.product_stock AS current_remaining_stock,
                (p.product_stock * p.purchase_price) AS stock_value
            FROM StockIn si
            INNER JOIN StockOut so 
                ON si.product_id = so.product_id AND si.latest_transaction_date = so.latest_transaction_date
            INNER JOIN products p ON p.product_id = si.product_id
            WHERE
                (${startDate ? `si.latest_transaction_date >= '${startDate}'` : '1=1'})
                AND (${endDate ? `si.latest_transaction_date <= '${endDate}'` : '1=1'})
            ORDER BY si.latest_transaction_date DESC, p.name;
        `);

        const reportData = result.recordset;
        res.json({ data: reportData });

    } catch (err) {
        console.error('Error fetching report:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
