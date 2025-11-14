import { sampleData, validateGraphData, buildGraph, getNearbyCities } from "./js/graph.js";
import { listReservations, createReservation, cancelReservation } from "./js/api.js";

// --- Graph UI Elements ---
const form = document.getElementById("graph-form");
const destinationEl = document.getElementById("destination");
const maxDistanceEl = document.getElementById("maxDistance");
const nearbyList = document.getElementById("nearby-list");

// --- Graph Initialization ---
const validation = validateGraphData(sampleData);
const graph = validation.ok ? buildGraph(sampleData.cities, sampleData.edges) : null;

/**
 * Event listener for the city graph form submission.
 * Finds and displays cities nearby the entered destination within the max distance.
 * @param {Event} e - The form submission event.
 */
form.addEventListener("submit", (e) => {
  e.preventDefault();
  if (!graph) return;

  const dest = destinationEl.value.trim();
  const maxD = Number(maxDistanceEl.value);

  const results = getNearbyCities(graph, dest, maxD);

  nearbyList.innerHTML = "";

  if (results.length === 0) {
    nearbyList.innerHTML = `<li>No nearby cities found. Check destination or adjust distance.</li>`;
    return;
  }
    // Render the results list
  for (const r of results) {
    const li = document.createElement("li");
    li.textContent = `${r.city} — ${r.distance} km`;
    nearbyList.appendChild(li);
  }
});

// --- Reservations UI Elements ---
const resForm = document.getElementById("reservation-form");
const refreshBtn = document.getElementById("refresh");
const listEl = document.getElementById("reservation-list");

/**
 * Fetches the current list of reservations from the API and renders them in the list element.
 * Handles loading state and displays errors if the API call fails.
 */
async function refreshReservations() {
  listEl.innerHTML = "<li>Loading...</li>";
  try {
    const items = await listReservations();
    listEl.innerHTML = "";

      // Render the list of reservations
    for (const r of items) {
      const li = document.createElement("li");
      li.innerHTML = `
        <strong>#${r.id}</strong> ${r.guestName} @ ${r.hotelName}
        (${r.checkIn} → ${r.checkOut}) [${r.status}]
        <button data-id=\"${r.id}\" class=\"cancel\">Cancel</button>
      `;
      listEl.appendChild(li);
    }
  } catch (e) {
      // Note: Using console.error instead of alert for better UX in a real app
      listEl.innerHTML = `<li>Error: ${e.message}</li>`;
  }
}

/**
 * Event listener for the reservation creation form submission.
 * Sends data to the API, refreshes the list, and resets the form.
 * @param {Event} e - The form submission event.
 */
resForm.addEventListener("submit", async (e) => {
  e.preventDefault();

    // Gather form data
    const payload = {
        guestName: document.getElementById("guestName").value.trim(),
        hotelName: document.getElementById("hotelName").value.trim(),
        checkIn: document.getElementById("checkIn").value,
        checkOut: document.getElementById("checkOut").value
    };
  try {
    await createReservation(payload);
    await refreshReservations();
    resForm.reset();
  } catch (err) {
    alert(err.message);
  }
});

/**
 * Event delegation listener for handling the 'Cancel' button click on a reservation list item.
 * @param {Event} e - The click event.
 */
listEl.addEventListener("click", async (e) => {
  const btn = e.target.closest(".cancel");
  if (!btn) return;
  const id = btn.getAttribute("data-id");
  try {
    await cancelReservation(id);
    await refreshReservations();
  } catch (err) {
    alert(err.message);
  }
});

// --- Initial Data Load ---
refreshBtn.addEventListener("click", refreshReservations);
refreshReservations();
