import { useEffect, useState } from "react";
import { getShowSeats, lockSeats, checkout } from "../api";
import './styles.css';

export default function SeatGrid({ show, onBack }) {
  const [available, setAvailable] = useState([]);
  const [lockedSeats, setLockedSeats] = useState([]);
  const [selected, setSelected] = useState([]);

  // UI feedback state
  const [status, setStatus] = useState(null); 
  // null | "loading" | "success" | "error"
  const [message, setMessage] = useState("");

  useEffect(() => {
    getShowSeats(show._id).then(res => {
      const { availableSeats, lockedSeats } = res.data;
      setAvailable(availableSeats);
      setLockedSeats(lockedSeats);
    });
  }, [show]);

  const toggleSeat = seat => {
    if (!available.includes(seat)) return;
    if (lockedSeats.includes(seat)) return;

    setSelected(prev =>
      prev.includes(seat)
        ? prev.filter(s => s !== seat)
        : [...prev, seat]
    );
  };

  const book = async () => {
    try {
      setStatus("loading");
      setMessage("Locking seats…");

      const lockRes = await lockSeats({
        showId: show._id,
        seats: selected
      });

      const { data: newlyLocked } = lockRes.data;
      setLockedSeats(prev => [...prev, ...newlyLocked]);

      setMessage("Redirecting to payment…");

      await new Promise(r => setTimeout(r, 500));

      const checkoutRes = await checkout({
        showId: show._id,
        seats: selected
      });

      setStatus("success");
      window.location.href = checkoutRes.data;
    } catch (err) {
      setStatus("error");
      setMessage(
        err?.response?.data?.message || "Booking failed. Please try again."
      );

      // Refetch seats to sync state (in case of lock failure due to concurrency)
      const res = await getShowSeats(show._id);
      const { availableSeats, lockedSeats } = res.data;

      setAvailable(availableSeats);
      setLockedSeats(lockedSeats);
      setSelected([]); // clear stale selection
    }
  };

  const groupedSeats = show.seats.reduce((acc, seat) => {
    const row = seat[0];
    acc[row] = acc[row] || [];
    acc[row].push(seat);
    return acc;
  }, {});

  const priceGroups = {};
  Object.entries(show.pricing).forEach(([row, price]) => {
    if (!priceGroups[price]) priceGroups[price] = [];
    priceGroups[price].push(row);
  });

  return (
    <>
      {/* SIMPLE VISUAL FEEDBACK */}
      {status && (
        <div className={`alert alert-${status}`}>
          {status === "loading" && "⏳ "}
          {status === "success" && "✅ "}
          {status === "error" && "❌ "}
          {message}
        </div>
      )}

      <button onClick={onBack}>⬅ Back</button>
      <h2>{show.title}</h2>

      <div className="floating-pay">
        <button
          disabled={!selected.length || status === "loading"}
          onClick={book}
        >
          {status === "loading"
            ? "Processing…"
            : `Pay & Book (${selected.length})`}
        </button>
      </div>

      <div className="theatre">
        {Object.entries(priceGroups)
          .sort((a, b) => Number(b[0]) - Number(a[0]))
          .map(([price, rows]) => (
            <div key={price} className="price-group">
              <div className="price-label">₹{price}</div>

              {rows.map(row => (
                <div key={row} className="seat-row">
                  <div className="row-label">{row}</div>

                  <div className="seat-grid-wrapper">
                    <div className="seat-row-grid">
                      {groupedSeats[row].map(seat => {
                        const isAvailable =
                          available.includes(seat) &&
                          !lockedSeats.includes(seat);
                        const isSelected = selected.includes(seat);

                        return (
                          <div
                            key={seat}
                            className={
                              "seat " +
                              (!isAvailable
                                ? "seat-unavailable"
                                : isSelected
                                ? "seat-selected"
                                : "")
                            }
                            onClick={() => toggleSeat(seat)}
                          >
                            {seat.slice(1)}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ))}

        <div className="screen-line"></div>
        <div className="screen-text">SCREEN THIS WAY</div>
      </div>

      {/* <style>{`
        .alert {
          position: sticky;
          top: 0;
          padding: 12px 16px;
          margin-bottom: 12px;
          border-radius: 6px;
          font-weight: 500;
          z-index: 10;
        }
        .alert-loading {
          background: #eef2ff;
          color: #3730a3;
        }
        .alert-success {
          background: #ecfdf5;
          color: #065f46;
        }
        .alert-error {
          background: #fef2f2;
          color: #991b1b;
        }
      `}</style> */}
    </>
  );
}
