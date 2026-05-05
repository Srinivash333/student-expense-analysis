const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
const transactionRoutes = require('./routes/transactions');
app.use('/api', transactionRoutes);

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/student_finance_db')
    .then(() => console.log('MongoDB Connected to student_finance_db'))
    .catch(err => console.log('MongoDB Connection Error: ', err));

app.get('/', (req, res) => {
    res.send('Student Finance API Running');
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
