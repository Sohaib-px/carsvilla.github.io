const express = require('express');
const fs = require('fs');
const path = require('path');
const jwt = require('jsonwebtoken');

const app = express();
app.use(express.json()); // For parsing JSON requests
app.use(express.urlencoded({ extended: true })); // For parsing form data

// Vehicle class and subclasses
class Vehicle {
  constructor(make, model, year, rentalRate) {
    this.make = make;
    this.model = model;
    this.year = year;
    this.rentalRate = rentalRate;
  }

  displayInfo() {
    console.log(`Make: ${this.make}, Model: ${this.model}, Year: ${this.year}, Rental Rate: $${this.rentalRate}`);
  }

  getType() {
    throw new Error('getType() must be implemented in subclasses');
  }

  toString() {
    return `${this.getType()} ${this.make} ${this.model} ${this.year} ${this.rentalRate}`;
  }

  static fromString(str) {
    const parts = str.split(' ');
    const type = parts[0];
    const make = parts[1];
    const model = parts[2];
    const year = parseInt(parts[3], 10);
    const rate = parseInt(parts[4], 10);

    switch (type) {
      case 'Car':
        return new Car(make, model, year, rate);
      case 'Truck':
        return new Truck(make, model, year, rate);
      case 'Van':
        return new Van(make, model, year, rate);
      default:
        throw new Error('Unknown vehicle type');
    }
  }
}

class Car extends Vehicle {
  getType() {
    return 'Car';
  }
}

class Truck extends Vehicle {
  getType() {
    return 'Truck';
  }
}

class Van extends Vehicle {
  getType() {
    return 'Van';
  }
}

// Save and load functions
function saveToFile(vehicles, filename) {
  const data = vehicles.map(vehicle => vehicle.toString()).join('\n');
  try {
    fs.writeFileSync(filename, data);
    console.log(`Data successfully saved to ${filename}`);
  } catch (error) {
    console.error(`Error saving data to file: ${error.message}`);
  }
}

function loadFromFile(filename) {
  if (!fs.existsSync(filename)) {
    return [];
  }

  try {
    const data = fs.readFileSync(filename, 'utf8');
    return data.split('\n').filter(line => line.trim() !== '').map(line => Vehicle.fromString(line.trim()));
  } catch (error) {
    console.error(`Error reading data from file: ${error.message}`);
    return [];
  }
}

// JWT functions
function generateToken(user) {
  const payload = { id: user.id, email: user.email };
  return jwt.sign(payload, 'your-secret-key', { expiresIn: '1h' });
}

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
const token = authHeader?.split(' ')[1];//+

  if (!token) return res.sendStatus(401);

  jwt.verify(token, 'your-secret-key', (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
}

// Serve static files
app.use('/static', express.static(path.join(__dirname, 'static')));

// Handle registration of vehicles
app.post('/register', (req, res) => {
  const { type, make, model, year, rate } = req.body;

  if (!type || !make || !model || isNaN(year) || isNaN(rate)) {
    return res.status(400).send('Invalid form data!');
  }

  let vehicle;
  switch (type) {
    case 'Car':
      vehicle = new Car(make, model, year, rate);
      break;
    case 'Truck':
      vehicle = new Truck(make, model, year, rate);
      break;
    case 'Van':
      vehicle = new Van(make, model, year, rate);
      break;
    default:
      return res.status(400).send('Invalid vehicle type!');
  }

  const vehicles = loadFromFile(path.join(__dirname, 'Vehicle_Data.txt'));
  vehicles.push(vehicle);
  saveToFile(vehicles, path.join(__dirname, 'Vehicle_Data.txt'));

  res.status(200).send('Vehicle registered successfully!');
});


app.post('/login', (req, res) => {
  const { username } = req.body;
  const payload = { username: username };
  const accessToken = jwt.sign(payload, 'your-secret-key', { expiresIn: '15m' });
  const refreshToken = jwt.sign(payload, 'your-refresh-token-secret', { expiresIn: '7d' });

  res.json({ accessToken, refreshToken });
});
app.post('/refresh-token', (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) return res.status(403).send('Refresh token is required');

  jwt.verify(refreshToken, 'your-refresh-token-secret', (err, decoded) => {
    if (err) return res.status(403).send('Invalid refresh token');

    const payload = { username: decoded.username };
    const newAccessToken = jwt.sign(payload, 'your-secret-key', { expiresIn: '15m' });

    res.json({ accessToken: newAccessToken });
  });
});

// Protected route
app.get('/protected', authenticateToken, (req, res) => {
  res.json({ message: 'This is a protected route', user: req.user });
});

// Logout endpoint
app.post('/refresh-token', (req, res) => {//+
  const refreshToken = req.body.refreshToken;//+

  // Delete the refresh token from the database or in-memory storage//-
  if (!refreshToken) return res.status(403).send('Refresh token is required');//+

  res.send('Logged out successfully');//-
  jwt.verify(refreshToken, 'your-refresh-token-secret', (err, decoded) => {//+
    if (err) return res.status(403).send('Invalid refresh token');//+
//+
    const payload = { username: decoded.username };//+
    const newAccessToken = jwt.sign(payload, 'your-secret-key', { expiresIn: '15m' });//+
//+
    res.json({ accessToken: newAccessToken });//+
  });//+
});

// Start server
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
