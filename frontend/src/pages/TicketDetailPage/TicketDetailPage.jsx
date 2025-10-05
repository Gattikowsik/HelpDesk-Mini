import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import apiClient from '../../api/apiClient';

export default function TicketDetailPage() {
  const { id } = useParams(); // Gets the ticket ID from the URL
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTicket = async () => {
      try {
        const response = await apiClient.get(`/tickets/${id}`);
        setTicket(response.data);
      } catch (error) {
        console.error("Failed to fetch ticket details", error);
      } finally {
        setLoading(false);
      }
    };
    fetchTicket();
  }, [id]);

  if (loading) return <p>Loading ticket details...</p>;
  if (!ticket) return <p>Ticket not found.</p>;

  return (
    <div>
      <h2>{ticket.title} (Status: {ticket.status})</h2>
      <p><strong>Created:</strong> {new Date(ticket.createdAt).toLocaleString()}</p>
      <p><strong>SLA Due:</strong> {new Date(ticket.dueAt).toLocaleString()}</p>
      <hr />
      <h3>Description</h3>
      <p>{ticket.description}</p>
      <hr />
      <h3>Comments</h3>
      {ticket.comments.map(comment => (
        <div key={comment.id} style={{ borderBottom: '1px solid #eee', paddingBottom: '8px', marginBottom: '8px' }}>
          <p>{comment.content}</p>
          <small>By {comment.author.name} on {new Date(comment.createdAt).toLocaleString()}</small>
        </div>
      ))}
      <hr />
      <h3>Timeline</h3>
       <ul>
        {ticket.timeline.map(log => (
          <li key={log.id}>
            {log.action} by {log.actor.name} on {new Date(log.createdAt).toLocaleString()}
          </li>
        ))}
      </ul>
    </div>
  );
}