import { Routes, Route } from "react-router";
import Home from "./pages/Home.jsx";
import Login from "./pages/Login.jsx";
import Layout from "./components/layout/Layout.jsx";
import Register from "./pages/Register.jsx";
import EventDetails from "./pages/EventDetails.jsx";
import Events from "./pages/Events.jsx";
import Wishlist from "./pages/Wishlist.jsx";

function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/events/:id" element={<EventDetails />} />
        <Route path="/events" element={<Events />} />
        <Route path="/wishlist" element={<Wishlist />} />
      </Route>
    </Routes>
  );
}

export default App;
