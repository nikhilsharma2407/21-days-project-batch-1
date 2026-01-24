import { useEffect, useState } from "react";
import { getShowSeats, lockSeats, checkout } from "../api";

export default function SeatGrid({ show, onBack }) {
  const [available, setAvailable] = useState([]);
  const [lockedSeats, setLockedSeats] = useState([]);
  const [selected, setSelected] = useState([]);

  useEffect(() => {
    getShowSeats(show._id).then(res => {
      const { availableSeats, lockedSeats } = res.data;
      setAvailable(availableSeats);
      setLockedSeats(lockedSeats)
    });
  }, [show]);

  const toggleSeat = seat => {
    if (!available.includes(seat)) return;
    setSelected(prev =>
      prev.includes(seat)
        ? prev.filter(s => s !== seat)
        : [...prev, seat]
    );
  };

  const book = async () => {
    const { data } = (await lockSeats({ showId: show._id, seats: selected })).data;
    setLockedSeats(prev => [...prev, ...data]);
    await new Promise(resolve => setTimeout(resolve, 500));
    const res = await checkout({ showId: show._id, seats: selected });
    window.location.href = res.data;
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
      <button onClick={onBack}>⬅ Back</button>
      <h2>{show.title}</h2>

      <div className="floating-pay">
        <button disabled={!selected.length} onClick={book}>
          Pay & Book ({selected.length})
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
                        const isAvailable = !lockedSeats.includes(seat) && available.includes(seat);
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

        {/* 🎬 SCREEN */}
        <div className="screen-line"></div>
        <div className="screen-text">SCREEN THIS WAY</div>
      </div>
    </>
  );
}
