const { sql, poolPromise } = require('../db/conn');
const uniqid = require('uniqid');

class Supplier {
	constructor() {}

	// Get Suppliers (already shared previously)
	getSuppliers = async (req, res) => {
		try {
		  const pool = await poolPromise;
		  let whereClause = '';
		  if (req.body.search_value != '') {
			whereClause = `WHERE name LIKE @search OR address LIKE @search`;
		  }
	  
		  let orderByClause  = '';
		  if (req.body.sort_column && req.body.sort_order) {
			orderByClause  = `ORDER BY ${req.body.sort_column} ${req.body.sort_order}`;
		  }
	  
		  const query = `
			SELECT * FROM suppliers 
			${whereClause} 
			${orderByClause} 
		  `;
	  
		  const request = pool.request()
			.input('search', sql.NVarChar, `%${req.body.search_value}%`)
			.input('start', sql.Int, req.body.start_value || 0);
	  
		  const result = await request.query(query);
	  
		  if (req.body.search_value != '') {
			const countResult = await pool.request()
                    .input('search', sql.NVarChar, `%${req.body.search_value}%`)
                    .query(`SELECT COUNT(*) AS val FROM suppliers ${whereClause}`);
			return res.send({
			  operation: 'success',
			  message: 'Search results',
			  info: {
				suppliers: result.recordset || [],  
				count: countResult.recordset[0].val || 0 
			  }
			});
		  }
	  

		  const countResult = await pool.request().query('SELECT COUNT(*) AS val FROM suppliers');
	  
		  res.send({
			operation: 'success',
			message: 'Suppliers fetched',
			info: {
			  suppliers: result.recordset || [], 
			  count: countResult.recordset[0].val || 0 
			}
		  });
		} catch (err) {
		  console.error(err);
		  res.send({ operation: 'error', message: 'Something went wrong' });
		}
	  };

	addSupplier = async (req, res) => {
		try {
			const pool = await poolPromise;
			const uniqueSupplierId = uniqid('sup_');

			const request = pool.request()
				.input('supplier_id', sql.NVarChar, uniqueSupplierId)
				.input('name', sql.NVarChar, req.body.name)
				.input('email', sql.NVarChar, req.body.email)
				.input('phone', sql.NVarChar, req.body.phone)
				.input('address', sql.NVarChar, req.body.address);

			await request.query(`
				INSERT INTO suppliers (supplier_id, name, email, phone, address)
				VALUES (@supplier_id, @name, @email, @phone, @address)
			`);

			res.send({ operation: 'success', message: 'Supplier added' });
		} catch (err) {
			console.error(err);
			res.send({ operation: 'error', message: 'Something went wrong' });
		}
	};

	updateSupplier = async (req, res) => {
		try {
			console.log("Received update request body:", req.body);
			const pool = await poolPromise;
			const request = pool.request()
				.input('supplier_id', sql.NVarChar, req.body.supplier_id)
				.input('name', sql.NVarChar, req.body.name)
				.input('email', sql.NVarChar, req.body.email)
				.input('phone', sql.NVarChar, req.body.phone)
				.input('address', sql.NVarChar, req.body.address);
	
			const query = `
				UPDATE suppliers
				SET name = @name, email = @email, phone = @phone, address = @address
				WHERE supplier_id = @supplier_id
			`;
	
			console.log("Executing SQL:", query);
	
			const result = await request.query(query);
			console.log("Update result:", result);
	
			res.send({ operation: 'success', message: 'Supplier updated' });
		} catch (err) {
			console.error(err);
			res.send({ operation: 'error', message: 'Something went wrong' });
		}
	};

	
	deleteSupplier = async (req, res) => {
		try {
			const pool = await poolPromise;
			const request = pool.request().input('Supplier_id', sql.NVarChar, req.body.supplier_id);

			await request.query(`DELETE FROM suppliers WHERE supplier_id = @supplier_id`);

			res.send({ operation: 'success', message: 'Supplier deleted' });
		} catch (err) {
			console.error(err);
			res.send({ operation: 'error', message: 'Something went wrong' });
		}
	};
}

module.exports = Supplier;
