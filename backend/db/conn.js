  const sql = require('mssql');
  const config = require('./config');

  const poolPromise = new sql.ConnectionPool(config)
    .connect()
    .then(pool => {
      console.log('✅ Connected to SQL Server');
      return pool;
    })
    .catch(err => {
      console.error('❌ Database Connection Failed:', err);
      throw new Error('Database connection failed');
    });

  module.exports = {sql, poolPromise};