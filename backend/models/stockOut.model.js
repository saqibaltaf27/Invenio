const sql = require('mssql');
const config = require('../db/config');

async function getProductsWithStock() {
  const pool = await sql.connect(config);
  const result = await pool.request().query(
    'SELECT product_id, name, product_stock FROM products'
  );
  return result.recordset;
}

async function createStockOut(customer_info, items) {
  const pool = await sql.connect(config);
  const transaction = new sql.Transaction(pool);

  try {
    await transaction.begin();

    const soResult = await transaction.request()
      .input('customer_info', sql.NVarChar, customer_info || null)
      .query('INSERT INTO stock_outs (customer_info) OUTPUT INSERTED.so_id VALUES (@customer_info)');

    const so_id = soResult.recordset[0].so_id;
    console.log(`Stock-out created with SO ID: ${so_id}`);

    for (const item of items) {
      const { product_id, quantity } = item;

      const stockCheck = await transaction.request()
        .input('product_id', sql.NVarChar, product_id)
        .query('SELECT product_stock FROM products WHERE product_id = @product_id');

      const available = stockCheck.recordset[0]?.product_stock || 0;

      if (available < quantity) {
        throw new Error(`Not enough stock for product ID ${product_id}. Available: ${available}, Requested: ${quantity}`);
      }
    }

    for (const item of items) {
      const { product_id, quantity } = item;

      await transaction.request()
        .input('so_id', sql.Int, so_id)
        .input('product_id', sql.VarChar(255), product_id)
        .input('quantity', sql.Int, quantity)
        .query('INSERT INTO stock_out_items (so_id, product_id, quantity) VALUES (@so_id, @product_id, @quantity)');

      await transaction.request()
        .input('product_id', sql.VarChar(255), product_id)
        .input('quantity', sql.Int, quantity)
        .query('UPDATE products SET product_stock = product_stock - @quantity WHERE product_id = @product_id');

      await transaction.request()
        .input('so_id', sql.Int, so_id)
        .input('product_id', sql.VarChar(255), product_id)
        .input('quantity', sql.Int, quantity)
        .query('INSERT INTO stock_out_log (so_id, product_id, quantity) VALUES (@so_id, @product_id, @quantity)');
    }


    await transaction.commit();
    console.log('Transaction committed, stock-out processed successfully');
    return { success: true, so_id };
  } catch (err) {
    await transaction.rollback();
    console.error('Transaction rolled back due to error:', err.message);
    throw err;
  }
}

async function getStockOutLogs() {
  const pool = await sql.connect(config);
  const result = await pool.request().query(`
    SELECT 
  so.so_id,
  so.customer_info,
  so.created_at,
  soi.product_id,
  p.name AS product_name,
  soi.quantity
FROM stock_outs so
INNER JOIN stock_out_items soi ON so.so_id = soi.so_id
INNER JOIN products p ON p.product_id = soi.product_id
ORDER BY so.created_at DESC;
  `);

  const logsMap = new Map();

  result.recordset.forEach(row => {
    const { so_id, customer_info, created_at, product_id, product_name, quantity } = row;

    if (!logsMap.has(so_id)) {
      logsMap.set(so_id, {
        so_id,
        customer_info,
        created_at,
        items: []
      });
    }

    logsMap.get(so_id).items.push({
      product_id,
      product_name,
      quantity
    });
  });

  return Array.from(logsMap.values());
}

module.exports = {
  getProductsWithStock,
  createStockOut,
  getStockOutLogs
};
