import { useParams } from "react-router";

function EventDetails() {
  const { id } = useParams();

  return <h1>Event Details: {id}</h1>;
}

export default EventDetails;
