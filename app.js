const express = require('express');
const bodyParser = require('body-parser');
const customersData = require('./customers.json'); // Load sample data

const app = express();
app.use(bodyParser.json());

// Helper function to find a customer by ID
function findCustomerById(id) {
  return customersData.find(customer => customer.id === id);
}

// Helper function to find customers by search criteria and paginate results
function searchCustomers(searchParams, page = 1, limit = 10) {
  const { first_name, last_name, city } = searchParams;
  let results = customersData;

  if (first_name) {
    results = results.filter(customer => customer.first_name.includes(first_name));
  }

  if (last_name) {
    results = results.filter(customer => customer.last_name.includes(last_name));
  }

  if (city) {
    results = results.filter(customer => customer.city.includes(city));
  }

  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const paginatedResults = results.slice(startIndex, endIndex);

  return paginatedResults;
}

// List API with search and pagination
app.get('/api/customers', (req, res) => {
  const { first_name, last_name, city, page, limit } = req.query;
  const searchParams = { first_name, last_name, city };
  const parsedPage = parseInt(page) || 1;
  const parsedLimit = parseInt(limit) || 10;

  const paginatedResults = searchCustomers(searchParams, parsedPage, parsedLimit);

  res.json(paginatedResults);
});

// API to get single customer data by ID
app.get('/api/customers/:id', (req, res) => {
  const customerId = parseInt(req.params.id);
  const customer = findCustomerById(customerId);

  if (customer) {
    res.json(customer);
  } else {
    res.status(404).json({ message: 'Customer not found' });
  }
});

// API to list unique cities with the number of customers from each city
app.get('/api/cities', (req, res) => {
  const cityCounts = {};

  customersData.forEach(customer => {
    const { city } = customer;
    if (!cityCounts[city]) {
      cityCounts[city] = 1;
    } else {
      cityCounts[city]++;
    }
  });

  res.json(cityCounts);
});

// API to add a customer with validations
app.post('/api/customers', (req, res) => {
  const { id, first_name, last_name, city, company } = req.body;

  if (!id || !first_name || !last_name || !city || !company) {
    res.status(400).json({ message: 'All fields are required' });
    return;
  }

  const existingCustomer = findCustomerById(id);

  if (existingCustomer) {
    res.status(400).json({ message: 'Customer with the same ID already exists' });
    return;
  }

  const existingCity = customersData.some(customer => customer.city === city);
  const existingCompany = customersData.some(customer => customer.company === company);

  if (!existingCity || !existingCompany) {
    res.status(400).json({ message: 'City and company should already exist' });
    return;
  }

  const newCustomer = { id, first_name, last_name, city, company };
  customersData.push(newCustomer);

  res.status(201).json(newCustomer);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
