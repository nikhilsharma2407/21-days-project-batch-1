import { useEffect, useState } from "react";
import { getShows } from "./api";
import ShowGrid from "./components/ShowGrid";
import SeatGrid from "./components/SeatGrid";

export default function App() {
  const [shows, setShows] = useState([]);
  const [selectedShow, setSelectedShow] = useState(null);

  useEffect(() => {
    getShows().then(res => {
      console.log("🚀 ~ App ~ res:", res)
      setShows(res.data)
    });
  }, []);

  return (
    <div className="app">
      <h1>🎬 Movie Booking</h1>

      {!selectedShow && (
        <ShowGrid shows={shows} onSelect={setSelectedShow} />
      )}

      {selectedShow && (
        <SeatGrid
          show={selectedShow}
          onBack={() => setSelectedShow(null)}
        />
      )}
    </div>
  );
}
