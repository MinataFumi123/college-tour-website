// Initialize the map
const map = L.map('map').setView([51.505, -0.09], 13);

// Load and display tile layers
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© OpenStreetMap'
}).addTo(map);

// Add a marker to the map
const marker = L.marker([51.5, -0.09]).addTo(map);
marker.bindPopup('<b>Welcome to the College Tour!</b><br>This is a great place to start.').openPopup();

// Function to add more markers
function addMarker(lat, lng, message) {
    const newMarker = L.marker([lat, lng]).addTo(map);
    newMarker.bindPopup(message).openPopup();
}

// Example usage of addMarker function
addMarker(51.51, -0.1, 'Another point of interest!');