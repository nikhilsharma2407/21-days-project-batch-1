import axios from "axios";

const api = axios.create({
  baseURL: "",
});

/* SHOWS */
export const getShows = () => api.get("/shows");
export const getShowSeats = (id) => api.get(`/shows/${id}/seats`);

/* BOOKINGS */
export const lockSeats = (payload) =>
  api.post("/bookings/book-seats", payload);

export const checkout = (payload) =>
  api.post("/bookings/checkout", payload);

/* RESULT PAGES */
export const getSuccessBooking = (sessionId) =>
  api.get("/bookings/success", {
    params: { session_id: sessionId },
  });

export const getCancelBooking = (sessionId) =>
  api.get("/bookings/cancel", {
    params: { session_id: sessionId },
  });

export default api;
