// backend/config.js
const config = {
    user: 'saqib',
    password: 'AdmTsg@25',
    server: 'mssql-196323-0.cloudclusters.net', 
    port: 19996,
    database: 'CRM', 
    driver: 'tedious',
    options: {
        trustedConnection: true,
        trustServerCertificate: true
    }
  };
  
  module.exports = config;
  