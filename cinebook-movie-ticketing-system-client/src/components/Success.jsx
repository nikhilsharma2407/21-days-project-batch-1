import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import "./ticket.css";
import { getSuccessBooking } from "../api";

export default function Success() {
  const [params] = useSearchParams();
  const sessionId = params.get("session_id");

  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    getSuccessBooking(sessionId)
      .then(res => setData(res.data))
      .catch(err =>
        setError(err.response?.data?.message || "Failed to load booking")
      );
  }, [sessionId]);

  if (error) return <p>{error}</p>;
  if (!data) return <p>Loading ticket…</p>;

  return (
    <div className="ticket-card success">
      <h1>✅ Booking Confirmed</h1>

      <p className="ticket-title">{data.show.title}</p>
      <p>Screen: {data.show.screen}</p>
      <p>
        Show Time: {new Date(data.show.startTime).toLocaleString()}
      </p>

      <h3>Seats</h3>
      <div className="seats">
        {data.seats.map(seat => (
          <span key={seat} className="seat">
            {seat}
          </span>
        ))}
      </div>

      <div className="meta">
        <p>
          Paid: {data.show.currency} {data.amount}
        </p>
        <p>Payment Status: {data.paymentStatus}</p>
      </div>
    </div>
  );
}
