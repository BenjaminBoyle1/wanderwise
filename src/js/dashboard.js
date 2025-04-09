import { includeHTML } from './include.js';

includeHTML("/partials/header.html", "header");
includeHTML("/partials/footer.html", "footer");

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
const GOOGLE_MAP_ID = import.meta.env.VITE_GOOGLE_MAP_ID;

let map;
let markers = [];
let selectedLatLng = null;
let geocoder;
let fullAddress = "";
let selectedLocationName = "";

// DOM refs
const tripList = document.getElementById("trip-list");
const form = document.getElementById("trip-form");
const tripInput = document.getElementById("trip-title");
const travelersInput = document.getElementById("trip-travelers");
const startDateInput = document.getElementById("trip-start");
const endDateInput = document.getElementById("trip-end");
const saveBtn = document.getElementById("save-trip-btn");
const floatingBtn = document.getElementById("floating-add-trip");

// 🧠 Load Google Maps dynamically
function loadGoogleMaps() {
  return new Promise((resolve, reject) => {
    if (window.google && window.google.maps) return resolve();

    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&callback=initMap&libraries=marker`;
    script.async = true;
    script.defer = true;
    script.onerror = reject;
    document.head.appendChild(script);

    // Expose globally so Google can find it
    window.initMap = () => resolve();
  });
}

// ✅ Initialize map after load
window.addEventListener("load", async () => {
  await loadGoogleMaps();
  initMap();
});

function initMap() {
  map = new google.maps.Map(document.getElementById("map"), {
    center: { lat: 20.0, lng: 0.0 },
    zoom: 2,
    mapId: GOOGLE_MAP_ID || undefined // Optional: use if you’ve set up a custom map
  });

  geocoder = new google.maps.Geocoder();

  map.addListener("click", (e) => {
    selectedLatLng = e.latLng;
    form.style.display = "block";
    tripInput.value = "Loading location name...";
    fullAddress = "";
    selectedLocationName = "";

    geocoder.geocode({ location: selectedLatLng }, (results, status) => {
      if (status === "OK" && results[0]) {
        const components = results[0].address_components;
        let city = "";
        let state = "";
        let country = "";

        components.forEach(comp => {
          if (comp.types.includes("locality")) city = comp.long_name;
          if (comp.types.includes("administrative_area_level_1")) state = comp.short_name;
          if (comp.types.includes("country")) country = comp.long_name;
        });

        const locationName = [city, state || country].filter(Boolean).join(", ");
        tripInput.value = locationName || results[0].formatted_address;
        fullAddress = results[0].formatted_address;
        selectedLocationName = locationName;
      } else {
        tripInput.value = "";
        fullAddress = "";
      }
    });
  });

  loadTrips();
}

// ➕ Floating Add Trip
floatingBtn.addEventListener("click", () => {
  selectedLatLng = null;
  tripInput.value = "";
  fullAddress = "";
  form.style.display = "block";
  tripInput.focus();
});

// 💾 Save trip to localStorage
saveBtn.addEventListener("click", () => {
  const name = tripInput.value.trim();
  const travelers = parseInt(travelersInput.value) || 1;
  const startDate = startDateInput.value;
  const endDate = endDateInput.value;

  if (!name || !startDate || !endDate) return;

  const coords = selectedLatLng
    ? { lat: selectedLatLng.lat(), lng: selectedLatLng.lng() }
    : { lat: 0, lng: 0 };

  const trips = JSON.parse(localStorage.getItem("trips")) || [];
  const trip = {
    name,
    coords,
    fullAddress,
    location: selectedLocationName,
    travelers,
    startDate,
    endDate
  };

  trips.push(trip);
  localStorage.setItem("trips", JSON.stringify(trips));
  localStorage.setItem("currentTrip", JSON.stringify(trip));

  tripInput.value = "";
  travelersInput.value = "1";
  startDateInput.value = "";
  endDateInput.value = "";
  fullAddress = "";
  form.style.display = "none";
  loadTrips();
});

// 📍 Add Marker
function addMarker(trip) {
  const { AdvancedMarkerElement } = google.maps.marker;

  const pin = document.createElement("div");
  pin.className = "custom-marker";
  pin.innerHTML = `
    <div class="marker-label">
      📍 ${trip.name}
    </div>
  `;

  const marker = new AdvancedMarkerElement({
    map,
    position: trip.coords,
    content: pin
  });

  markers.push(marker);
}



function clearMarkers() {
  markers.forEach(marker => marker.map = null);
  markers = [];
}

// 🗂 Load trips
function loadTrips() {
  const trips = JSON.parse(localStorage.getItem("trips")) || [];
  tripList.innerHTML = "";
  clearMarkers();

  trips.forEach((trip, index) => {
    const li = document.createElement("li");
    const tripLength = getTripLength(trip);
    li.innerHTML = `
      <span>📍 ${trip.name}</span>
      <br><small>👥 ${trip.travelers} | 🗓️ ${tripLength} day${tripLength > 1 ? "s" : ""}</small>
      <button class="btn btn-sm danger" data-index="${index}">Remove</button>
    `;
    li.addEventListener("click", () => {
      localStorage.setItem("currentTrip", JSON.stringify(trip));
    });
    tripList.appendChild(li);
    addMarker(trip);
  });

  // Remove trip
  tripList.querySelectorAll("button").forEach(button => {
    button.addEventListener("click", () => {
      const index = parseInt(button.getAttribute("data-index"));
      const trips = JSON.parse(localStorage.getItem("trips")) || [];
      trips.splice(index, 1);
      localStorage.setItem("trips", JSON.stringify(trips));
      loadTrips();
    });
  });
}

// 🧮 Trip Length
function getTripLength(trip) {
  const start = new Date(trip.startDate);
  const end = new Date(trip.endDate);
  const diff = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
  return Math.max(diff, 1);
}
