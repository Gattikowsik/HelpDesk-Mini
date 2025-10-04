require('dotenv').config();
const express = require('express');
const cors = require('cors');
const authRoutes = require('./src/routes/auth.routes'); 

const app = express();

app.use(cors());
app.use(express.json());

// Add the auth routes to the server
app.use('/api/auth', authRoutes);

app.get('/', (req, res) => {
  res.send('HelpDesk Mini API is running...');
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on port http://localhost:${PORT}`));