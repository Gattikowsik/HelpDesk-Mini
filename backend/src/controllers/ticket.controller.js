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