const sql = require('mssql');
const { poolPromise } = require('../db/conn'); 

const getProductChart = async (req, res) => {
	try {
		const pool = await poolPromise;
		const result = await pool.request().query(`
			SELECT 
            p.Name,
            p.category,
            p.product_stock,
            p.timeStamp
        FROM products p
        ORDER BY p.category, p.timeStamp;
		`);

		res.json({ status: 'success', data: result.recordset });
	} catch (err) {
		console.error('Error fetching product chart data:', err);
		res.status(500).json({ status: 'error', message: 'Server error' });
	}
};

const getSupplierChart = async (req, res) => {
	try {
		const pool = await poolPromise;
		const result = await pool.request().query(`
			SELECT 
        FORMAT(s.timeStamp, 'yyyy-MM') AS month,  
        COUNT(s.Name) AS count,                    
        s.Name AS supplierName                   
      FROM suppliers s
      GROUP BY FORMAT(s.timeStamp, 'yyyy-MM'), s.Name
      ORDER BY month;
		`);

        const groupedSuppliers = result.recordset.map(item => ({
            month: item.month,
            count: item.count,
            supplierName: item.supplierName,
          }));

		res.json({ status: 'success', data: groupedSuppliers });
	} catch (err) {
		console.error('Error fetching supplier chart data:', err);
		res.status(500).json({ status: 'error', message: 'Server error' });
	}
};

module.exports = {
	getProductChart,
	getSupplierChart
};
