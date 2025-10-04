const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Create a new ticket
exports.createTicket = async (req, res, next) => {
  try {
    const { title, description } = req.body;
    const createdById = req.user.id; // From our authMiddleware

    if (!title || !description) {
      return res.status(400).json({ error: { code: 'FIELDS_REQUIRED', message: 'Title and description are required.' } });
    }

    // Calculate SLA due date (e.g., 24 hours from now)
    const dueAt = new Date();
    dueAt.setDate(dueAt.getDate() + 1);

    // Use a transaction to ensure both ticket and timeline log are created
    const newTicket = await prisma.$transaction(async (tx) => {
      const ticket = await tx.ticket.create({
        data: {
          title,
          description,
          createdById,
          dueAt,
        },
      });

      await tx.timelineLog.create({
        data: {
          ticketId: ticket.id,
          actorId: createdById,
          action: 'CREATED',
          details: { title: ticket.title }
        }
      });

      return ticket;
    });

    res.status(201).json(newTicket);
  } catch (error) {
    next(error);
  }
};

// Get a list of all tickets with pagination
exports.getAllTickets = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const offset = parseInt(req.query.offset) || 0;
    
    // Optional filter by status
    const where = req.query.status ? { status: req.query.status.toUpperCase() } : {};

    const tickets = await prisma.ticket.findMany({
      where,
      take: limit,
      skip: offset,
      orderBy: {
        createdAt: 'desc',
      },
    });

    const totalTickets = await prisma.ticket.count({ where });

    res.status(200).json({
      items: tickets,
      total: totalTickets,
      next_offset: (offset + tickets.length < totalTickets) ? offset + tickets.length : null,
    });
  } catch (error) {
    next(error);
  }
};

// Get a single ticket by its ID
exports.getTicketById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const ticket = await prisma.ticket.findUnique({
      where: { id },
      include: {
        // Include related comments and timeline logs for a full view
        comments: {
          orderBy: { createdAt: 'asc' },
          include: { author: { select: { id: true, name: true } } },
        },
        timeline: {
          orderBy: { createdAt: 'asc' },
          include: { actor: { select: { id: true, name: true } } },
        },
      },
    });

    if (!ticket) {
      return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Ticket not found.' } });
    }

    res.status(200).json(ticket);
  } catch (error) {
    next(error);
  }
};