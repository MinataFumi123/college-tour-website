// This file handles the integration with Mapbox, providing functions to initialize the map and display it on the dashboard.

const mapboxgl = require('mapbox-gl');

mapboxgl.accessToken = 'YOUR_MAPBOX_ACCESS_TOKEN';

function initializeMap(containerId, coordinates) {
    const map = new mapboxgl.Map({
        container: containerId,
        style: 'mapbox://styles/mapbox/streets-v11',
        center: coordinates,
        zoom: 15
    });

    // Add navigation controls to the map.
    map.addControl(new mapboxgl.NavigationControl());

    // Add a marker to the map.
    new mapboxgl.Marker()
        .setLngLat(coordinates)
        .addTo(map);
}

function updateMapLocation(map, coordinates) {
    map.setCenter(coordinates);
}

export { initializeMap, updateMapLocation };