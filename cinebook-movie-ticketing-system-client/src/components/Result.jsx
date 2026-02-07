import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { getCancelBooking, getSuccessBooking } from "../api";
import "./ticket.css";

export default function Result() {
  const [params] = useSearchParams();
  const sessionId = params.get("session_id");
  const isCancelled = params.get("isCancelled") === "true";

  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!sessionId) return;

    const fetchResult = async () => {
      try {
        const res = isCancelled
          ? await getCancelBooking(sessionId)
          : await getSuccessBooking(sessionId);

        setData(res.data);
      } catch (err) {
        setError(
          err.response?.data?.message || "Failed to load booking"
        );
      }
    };

    fetchResult();
  }, [sessionId, isCancelled]);

  if (error) return <p>{error}</p>;
  if (!data) return <p>Loading ticket…</p>;

  const { show, status } = data;
  const seats =
    status === "cancelled" ? data.seatsReleased : data.seats;

  return (
    <div
      className={`ticket-card ${
        status === "cancelled" ? "cancel" : "success"
      }`}
    >
      <h1>
        {status === "cancelled"
          ? "❌ Booking Cancelled"
          : "✅ Booking Confirmed"}
      </h1>

      {/* 🎬 SHOW INFO */}
      <div className="show-header">
        <img
          src={show.posterUrl}
          alt={show.title}
          style={{ width: 120, borderRadius: 8, marginBottom: 12 }}
        />
        <p className="ticket-title">{show.title}</p>
        <p>{show.screen}</p>
        <p>{new Date(show.startTime).toLocaleString()}</p>
      </div>

      {/* 💺 SEATS */}
      <h3>
        {status === "cancelled" ? "Seats Released" : "Seats"}
      </h3>
      <div className="seats">
        {seats.map((seat) => (
          <span key={seat} className="seat">
            {seat}
          </span>
        ))}
      </div>

      {/* 🧾 META */}
      {status === "cancelled" ? (
        <p className="meta">No payment was completed.</p>
      ) : (
        <div className="meta">
          <p>
            Paid: {show.currency} {data.amount}
          </p>
          <p>Payment Status: {data.paymentStatus}</p>
        </div>
      )}

      <Link to="/" className="back-link">
        ← Back to Home
      </Link>
    </div>
  );
}
