const {poolPromise} = require('../db/conn');
class Dashboard {
	constructor() {
		console.log('Dashboard object initialized');
	}

	getReportStats = async (req, res) => {
		try {
			const pool = await poolPromise;

			const employeeCustomerSupplierQuery = `
				SELECT 
					(SELECT COUNT(*) FROM [user] WHERE user_role = 'employee') AS employee_count,
					(SELECT COUNT(*) FROM customers) AS customer_count,
					(SELECT COUNT(*) FROM suppliers) AS supplier_count
			`;

			const orderStatsQuery = `
				SELECT 
					(SELECT SUM(grand_total) FROM orders WHERE MONTH(timeStamp) = MONTH(GETDATE()) AND YEAR(timeStamp) = YEAR(GETDATE())) AS current_month,
					(SELECT SUM(grand_total) FROM orders WHERE MONTH(timeStamp) = MONTH(DATEADD(MONTH, -1, GETDATE())) AND YEAR(timeStamp) = YEAR(DATEADD(MONTH, -1, GETDATE()))) AS previous_month
			`;

			const expenseStatsQuery = `
				SELECT 
					(SELECT SUM(grand_total) FROM expenses WHERE MONTH(timeStamp) = MONTH(GETDATE()) AND YEAR(timeStamp) = YEAR(GETDATE())) AS current_month,
					(SELECT SUM(grand_total) FROM expenses WHERE MONTH(timeStamp) = MONTH(DATEADD(MONTH, -1, GETDATE())) AND YEAR(timeStamp) = YEAR(DATEADD(MONTH, -1, GETDATE()))) AS previous_month
			`;

			const [employeeCustomerSupplierResult, orderStatsResult, expenseStatsResult] = await Promise.all([
				pool.request().query(employeeCustomerSupplierQuery),
				pool.request().query(orderStatsQuery),
				pool.request().query(expenseStatsQuery)
			]);

			res.send({
				operation: "success",
				message: 'Data for employees, customers, suppliers, orders, and expenses retrieved',
				info: [
					employeeCustomerSupplierResult.recordset[0],
					orderStatsResult.recordset[0],
					expenseStatsResult.recordset[0]
				]
			});
		} catch (error) {
			console.error(error);
			res.send({ operation: "error", message: 'Something went wrong' });
		}
	};


	getProductStats = async (req, res) => {
		try {
			const pool = await poolPromise;

			const totalResult = await pool
				.request()
				.query('SELECT COUNT(*) AS total_products FROM products');
	
			const lowStockResult = await pool
				.request()
				.query('SELECT name, product_stock FROM products WHERE product_stock < 10 ORDER BY product_stock ASC');
	
			res.send({
				operation: "success",
				message: "Total products and low stock items",
				info: {
					total_products: totalResult.recordset[0].total_products,
					low_stock_items: lowStockResult.recordset,
				},
			});
		} catch (error) {
			console.error(error);
			res.send({ operation: "error", message: 'Something went wrong' });
		}
	};
	
}

module.exports = Dashboard;