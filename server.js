const express = require('express');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const bodyParser = require('body-parser');
const sql = require('mssql');
const dbConfig = require('./dbConfig');
const jwt = require('jsonwebtoken');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 1433;

// Middleware to parse request body and serve static files
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

// Serve the main HTML file (index.html) on the root route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Handle vehicle data submission and save it to the database
app.post('/save-vehicle', async (req, res) => {
    try {
        const { type, make, model, year, rate } = req.body;

        // Connect to the database
        await sql.connect(dbConfig);

        // Create a new SQL request
        const request = new sql.Request();

        // Insert data into the database
        const query = `
            INSERT INTO Vehicles (Type, Make, Model, Year, RentalRate)
            VALUES (@type, @make, @model, @year, @rate)
        `;

        request.input('type', sql.VarChar, type);
        request.input('make', sql.VarChar, make);
        request.input('model', sql.VarChar, model);
        request.input('year', sql.Int, year);
        request.input('rate', sql.Int, rate);

        await request.query(query);

        res.status(200).send('Vehicle data saved successfully to the database!');
    } catch (err) {
        console.error('Error saving vehicle data:', err);
        res.status(500).send('Error saving vehicle data.');
    }
});

// Handle vehicle data submission and save it to a text file
app.post('/submit-vehicle-data', (req, res) => {
    const { make, model, year, color } = req.body;

    const vehicleData = `
Make: ${make}
Model: ${model}
Year: ${year}
Color: ${color}
---------------------------
`;

    fs.appendFile('Vehicle_Data.txt', vehicleData, (err) => {
        if (err) {
            res.status(500).send('500 - Internal Server Error');
        } else {
            res.status(200).send('Vehicle data saved successfully!');
        }
    });
});

// Handle user registration with hashed password
app.post('/apply', async (req, res) => {
    try {
        const { UserName, email, password, confirmpassword } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        const hashedConfirmPassword = await bcrypt.hash(confirmpassword, 10);

        const pool = await sql.connect(dbConfig);
        await pool.request()
            .input('UserName', sql.NVarChar, UserName)
            .input('Email', sql.NVarChar, email)
            .input('PasswordHash', sql.NVarChar, hashedPassword)
            .input('ConfirmPasswordHash', sql.NVarChar, hashedConfirmPassword)
            .query('INSERT INTO Users (UserName, Email, PasswordHash, ConfirmPassword) VALUES (@UserName, @Email, @PasswordHash, @ConfirmPassword)');

        res.status(201).send('User Registered Successfully');
    } catch (err) {
        console.error('SQL error', err);
        res.status(500).send('Something went wrong');
    }
});

// Handle basic registration (write to users.txt)
app.post('/register', (req, res) => {
    const { username, contact } = req.body;

    if (!username || !contact) {
        return res.status(400).send('Username and contact are required.');
    }

    const filePath = path.join(__dirname, 'users.txt');

    try {
        fs.appendFileSync(filePath, `${username} ${contact}\n`);
        res.status(201).send('Registration successful!');
    } catch (error) {
        console.error('Error writing to file', error);
        res.status(500).send('Internal Server Error');
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
