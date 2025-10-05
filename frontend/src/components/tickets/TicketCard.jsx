import React from 'react';
import { Link } from 'react-router-dom';

// A simple CSS file for the card, we'll create this next.
import './TicketCard.css'; 

export default function TicketCard({ ticket }) {
  return (
    <Link to={`/tickets/${ticket.id}`} className="ticket-card-link">
      <div className="ticket-card">
        <h3>{ticket.title}</h3>
        <div className="ticket-card-details">
          <span>Status: <span className={`status status-${ticket.status.toLowerCase()}`}>{ticket.status}</span></span>
          <span>Created: {new Date(ticket.createdAt).toLocaleDateString()}</span>
        </div>
      </div>
    </Link>
  );
}