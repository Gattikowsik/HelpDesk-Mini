require('dotenv').config();
const express = require('express');
const cors = require('cors');

// Import routes
const authRoutes = require('./src/routes/auth.routes'); 
const ticketRoutes = require('./src/routes/ticket.routes');
const rateLimitMiddleware = require('./src/middlewares/rate.limiter');

const app = express();

app.use(cors());
app.use(express.json());
app.use(rateLimitMiddleware);

// Use routes
app.use('/api/auth', authRoutes);
app.use('/api/tickets', ticketRoutes);

app.get('/', (req, res) => {
  res.send('HelpDesk Mini API is running...');
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on port http://localhost:${PORT}`));