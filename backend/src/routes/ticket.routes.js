const express = require('express');
const { createTicket, getAllTickets, getTicketById, updateTicket,addCommentToTicket, } = require('../controllers/ticket.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const router = express.Router();

// This route is now protected. Only logged-in users can create a ticket.
router.post('/', authMiddleware, createTicket);
router.get('/', authMiddleware, getAllTickets);
router.get('/:id', authMiddleware, getTicketById);
router.patch('/:id', authMiddleware, updateTicket);
router.post('/:id/comments', authMiddleware, addCommentToTicket);

module.exports = router;