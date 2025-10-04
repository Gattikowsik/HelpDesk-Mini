const express = require('express');
const { createTicket } = require('../controllers/ticket.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const router = express.Router();

// This route is now protected. Only logged-in users can create a ticket.
router.post('/', authMiddleware, createTicket);

module.exports = router;