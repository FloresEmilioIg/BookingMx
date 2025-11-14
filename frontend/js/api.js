// Minimal API client for the backend reservations module.
// Kept simple & modular so you can mock/fake it in Jest tests.

const BASE_URL = "http://localhost:8080/api/reservations";

/**
 * Fetches and lists all active reservations from the backend.
 * @returns {Promise<Array<Object>>} A promise that resolves to an array of reservation objects.
 * @throws {Error} Throws an error if the fetch operation fails.
 */
export async function listReservations() {
  const res = await fetch(BASE_URL);
  if (!res.ok) throw new Error("Failed to fetch reservations");
  return res.json();
}

/**
 * Sends a request to create a new reservation.
 * @param {Object} payload The reservation data (guestName, hotelName, checkIn, checkOut).
 * @returns {Promise<Object>} A promise that resolves to the newly created reservation object.
 * @throws {Error} Throws an error if the creation fails (e.g., validation issues).
 */
export async function createReservation(payload) {
  const res = await fetch(BASE_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error((await res.json()).message || "Create failed");
  return res.json();
}

/**
 * Sends a request to update an existing reservation.
 * @param {string | number} id The ID of the reservation to update.
 * @param {Object} payload The updated reservation data.
 * @returns {Promise<Object>} A promise that resolves to the updated reservation object.
 * @throws {Error} Throws an error if the update fails.
 */
export async function updateReservation(id, payload) {
  const res = await fetch(`${BASE_URL}/${encodeURIComponent(id)}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error((await res.json()).message || "Update failed");
  return res.json();
}

/**
 * Sends a request to cancel (delete) a reservation.
 * @param {string | number} id The ID of the reservation to cancel.
 * @returns {Promise<Object>} A promise that resolves upon successful cancellation.
 * @throws {Error} Throws an error if the cancellation fails.
 */
export async function cancelReservation(id) {
  const res = await fetch(`${BASE_URL}/${encodeURIComponent(id)}`, { method: "DELETE" });
  if (!res.ok) throw new Error((await res.json()).message || "Cancel failed");
  return res.json();
}
