export default function ShowGrid({ shows, onSelect }) {
  return (
    <div className="show-grid">
      {shows.map(show => (
        <div key={show._id} className="show-card" onClick={() => onSelect(show)}>
          <img src={show.posterUrl} alt={show.title} />
          <h3>{show.title}</h3>
          <p>{new Date(show.startTime).toLocaleString()}</p>
        </div>
      ))}
    </div>
  );
}