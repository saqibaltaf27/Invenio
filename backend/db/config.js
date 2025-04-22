// backend/config.js
const config = {
    server: 'localhost', // or your machine name or IP
    database: 'CRM', // change to your actual DB name
    driver: 'msnodesqlv8',
    options: {
        trustedConnection: true,
        trustServerCertificate: true
    }
  };
  
  module.exports = config;
  