const express = require('express');
const { createTicket, getAllTickets, getTicketById } = require('../controllers/ticket.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const router = express.Router();

// This route is now protected. Only logged-in users can create a ticket.
router.post('/', authMiddleware, createTicket);
router.get('/', authMiddleware, getAllTickets);
router.get('/:id', authMiddleware, getTicketById);

module.exports = router;