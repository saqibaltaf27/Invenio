  const sql = require('mssql/msnodesqlv8');
  const config = require('./config');
  //const dotenv = require('dotenv');
  //const User = require('../models/user.model');

  const poolPromise = new sql.ConnectionPool(config)
    .connect()
    .then(pool => {
      console.log('✅ Connected to SQL Server (Windows Authentication)');
      return pool;
    })
    .catch(err => {
      console.error('❌ Database Connection Failed:', err);
    });

  module.exports = {sql, poolPromise};