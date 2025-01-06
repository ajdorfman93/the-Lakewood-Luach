// markers.js
let map, infoWindow, autocomplete;

function initMap() {
  map = new google.maps.Map(document.getElementById("map"), {
    center: { lat: 40.095, lng: -74.222 }, 
    zoom: 12,
    disableDefaultUI: true
  });

  infoWindow = new google.maps.InfoWindow();

  // If you have a search box:
  const input = document.getElementById("search-input");
  if (input) {
    autocomplete = new google.maps.places.Autocomplete(input);
    autocomplete.addListener("place_changed", () => {
      const place = autocomplete.getPlace();
      if (place.geometry?.location) {
        map.setCenter(place.geometry.location);
        map.setZoom(14);
      }
    });
  }
}

/**
 * finalItems = [
 *   { lat, lng, html }
 * ]
 */
function drawMarkers(finalItems) {
  // Clear old data
  map.data.forEach((f) => map.data.remove(f));

  const features = finalItems.map(item => {
    const coords = [
      Number(item.lng) || 0,
      Number(item.lat) || 0
    ];
    return {
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: coords
      },
      properties: {
        html: item.html || "(No details)"
      }
    };
  });

  const geojson = {
    type: "FeatureCollection",
    features
  };

  map.data.addGeoJson(geojson);
  map.data.setStyle({
    icon: { url: "https://maps.google.com/mapfiles/ms/icons/blue-dot.png" }
  });

  map.data.addListener("click", (event) => {
    const content = event.feature.getProperty("html");
    infoWindow.setContent(content);
    infoWindow.setPosition(event.latLng);
    infoWindow.open(map);
  });
}

window.addEventListener("load", () => {
  initMap();
});
