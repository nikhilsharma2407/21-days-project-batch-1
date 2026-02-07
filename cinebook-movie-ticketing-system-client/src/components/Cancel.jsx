import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { getCancelBooking } from "../api";
import "./ticket.css";

export default function Cancel() {
  const [params] = useSearchParams();
  const sessionId = params.get("session_id");

  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    getCancelBooking(sessionId)
      .then(res => setData(res.data))
      .catch(err =>
        setError(err.response?.data?.message || "Failed to load booking")
      );
  }, [sessionId]);

  if (error) return <p>{error}</p>;
  if (!data) return <p>Loading…</p>;

  return (
    <div className="ticket-card cancel">
      <h1>❌ Booking Cancelled</h1>

      <p className="ticket-title">{data.show.title}</p>

      <h3>Seats Released</h3>
      <div className="seats">
        {data.seats.map(seat => (
          <span key={seat} className="seat">
            {seat}
          </span>
        ))}
      </div>

      <p className="meta">No payment was completed.</p>

      <Link to="/" className="back-link">
        ← Back to Home
      </Link>
    </div>
  );
}
