const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const path = require('path');
dotenv.config();
const app = express();

app.use(cors({ origin: 'http://localhost:3000', credentials: true })); 


app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
mongoose.connect('mongodb://localhost:27017/parkingBookingDB', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('MongoDB connection error:', err));
const authRouter = require('./routes/auth');
const usersRouter = require('./routes/users');
const parkingSpacesRouter = require('./routes/parkingSpaces');
const bookingsRouter = require('./routes/bookings');
const reviewsRouter = require('./routes/reviews');
const historyRouter = require('./routes/history');
const paymentsRouter = require('./routes/payments');
app.use('/api/auth', authRouter);
app.use('/api/users', usersRouter);
app.use('/api/parkingSpaces', parkingSpacesRouter);
app.use('/api/bookings', bookingsRouter);
app.use('/api/reviews', reviewsRouter);
app.use('/api/history', historyRouter);
app.use('/api/payments', paymentsRouter);
app.use(express.static(path.join(__dirname, 'public')));
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Something went wrong!' });
});
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
