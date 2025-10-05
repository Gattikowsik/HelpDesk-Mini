import React, { useState, useEffect } from 'react';
import apiClient from '../api/apiClient';
import TicketCard from '../components/tickets/TicketCard';

export default function TicketsListPage() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const response = await apiClient.get('/tickets');
        setTickets(response.data.items);
      } catch (error) {
        console.error("Failed to fetch tickets", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTickets();
  }, []);

  if (loading) return <p>Loading tickets...</p>;

  return (
    <div>
      <h1>Tickets</h1>
      <div>
        {tickets.length > 0 ? (
          tickets.map((ticket) => (
            <TicketCard key={ticket.id} ticket={ticket} />
          ))
        ) : (
          <p>No tickets found.</p>
        )}
      </div>
    </div>
  );
}