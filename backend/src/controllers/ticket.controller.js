const { PrismaClient } = require('@prisma/client');
const { Prisma } = require('@prisma/client'); // Import Prisma for error handling
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
    const { status, search } = req.query;
    
    // Build the filter object
    const where = {};

    if (status) {
      where.status = status.toUpperCase();
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        // This checks if 'some' of the related comments match the search term
        { comments: { some: { content: { contains: search, mode: 'insensitive' } } } },
      ];
    }

    const tickets = await prisma.ticket.findMany({
      where,
      take: limit,
      skip: offset,
      orderBy: { createdAt: 'desc' },
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

// Update a ticket's status or assignment (with optimistic locking)
exports.updateTicket = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, assignedToId, version } = req.body;
    const actorId = req.user.id;

    if (typeof version !== 'number') {
      return res.status(400).json({ error: { code: 'VERSION_REQUIRED', field: 'version', message: 'The current ticket version is required for an update.' } });
    }

    const ticketBeforeUpdate = await prisma.ticket.findUnique({ where: { id } });
    if (!ticketBeforeUpdate) {
        return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Ticket not found.' } });
    }

    const updatedTicket = await prisma.$transaction(async (tx) => {
      const ticket = await tx.ticket.update({
        where: {
          id: id,
          version: version, // This is the optimistic lock!
        },
        data: {
          status: status,
          assignedToId: assignedToId,
          version: { increment: 1 }, // Increment version on successful update
        },
      });

      const timelineLogs = [];
      if (status && ticketBeforeUpdate.status !== status) {
        timelineLogs.push(tx.timelineLog.create({ data: { ticketId: id, actorId, action: 'STATUS_CHANGED', details: { from: ticketBeforeUpdate.status, to: status } } }));
      }
      if (assignedToId && ticketBeforeUpdate.assignedToId !== assignedToId) {
        timelineLogs.push(tx.timelineLog.create({ data: { ticketId: id, actorId, action: 'ASSIGNED', details: { to: assignedToId } } }));
      }
      await Promise.all(timelineLogs);

      return ticket;
    });

    res.status(200).json(updatedTicket);
  } catch (error) {
    // This specific Prisma error code means the 'where' condition (id + version) was not met.
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return res.status(409).json({ error: { code: 'CONFLICT', message: 'This ticket has been updated by someone else. Please refresh and try again.' } });
    }
    next(error);
  }
};

// Add a comment to a ticket
exports.addCommentToTicket = async (req, res, next) => {
  try {
    const { id: ticketId } = req.params;
    const { content } = req.body;
    const authorId = req.user.id;

    if (!content) {
      return res.status(400).json({ error: { code: 'FIELD_REQUIRED', field: 'content', message: 'Comment content cannot be empty.' } });
    }

    const [newComment] = await prisma.$transaction(async (tx) => {
      const comment = await tx.comment.create({
        data: {
          content,
          ticketId,
          authorId,
        },
      });

      await tx.timelineLog.create({
        data: {
          ticketId,
          actorId: authorId,
          action: 'COMMENT_ADDED',
        },
      });
      return [comment];
    });

    res.status(201).json(newComment);
  } catch (error) {
    next(error);
  }
};