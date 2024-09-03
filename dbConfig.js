const sql = require('mssql');

const dbConfig = {
    server: 'DESKTOP-N0L88ML\\SQLEXPRESS', // Correctly escaped backslash
    database: 'vehicle_management', // Removed leading space
    options: {
        encrypt: true, // Use this if you're on Windows Azure
        trustServerCertificate: true // Change to false for production
    }
};

const poolPromise = new sql.ConnectionPool(dbConfig) // Corrected the reference to dbConfig
    .connect()
    .then(pool => {
        console.log('Connected to SQL Server');
        return pool;
    })
    .catch(err => console.log('Database Connection Failed! Bad Config: ', err));

module.exports = {
    sql, 
    poolPromise
};
