import { Link } from "react-router";

function Events() {
  const events = [
    { id: 1, name: "Birthday" },
    { id: 2, name: "Christmas" },
  ];

  return (
    <>
      <h1>My events</h1>
      <ul>
        {events.map((event) => (
          <li key={event.id}>
            <Link to={`/events/${event.id}`}>{event.name} </Link>
          </li>
        ))}
      </ul>
    </>
  );
}

export default Events;
