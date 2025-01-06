let map, infoWindow, autocomplete;

function initMap() {
  // Create the map
  map = new google.maps.Map(document.getElementById("map"), {
    center: { lat: 40.067, lng: -74.205 }, // Lakewood area
    zoom: 13,
    disableDefaultUI: true,
  });

  // Create a single InfoWindow to reuse
  infoWindow = new google.maps.InfoWindow();

  // Setup Autocomplete
  const input = document.getElementById("search-input");
  autocomplete = new google.maps.places.Autocomplete(input);
  autocomplete.addListener("place_changed", () => {
    const place = autocomplete.getPlace();
    if (place.geometry && place.geometry.location) {
      map.setCenter(place.geometry.location);
      map.setZoom(14);
    }
  });
}

// This function reads the raw JSON from #prayerTimesOutput, 
// then converts it into a valid GeoJSON FeatureCollection.
function getPrayerTimesGeoJSON() {
  // 1. Grab the JSON text from the <pre> block:
  const rawText = document.querySelector("#prayerTimesOutput pre").innerText.trim();

  // 2. Parse into a JS array of objects:
  let data;
  try {
    data = JSON.parse(rawText);
  } catch (err) {
    console.error("Error parsing prayer times JSON:", err);
    return null;
  }

  // 3. Convert to a GeoJSON FeatureCollection
  const features = data.map((item) => {
    return {
      type: "Feature",
      properties: {
        Shul: item.Shul,
        Tefilah: item.Tefilah,
        Time: item.Time,
        Data: item.Data,
        strCode: item.strCode
      },
      geometry: {
        type: "Point",
        coordinates: [item.position.lng, item.position.lat],
      },
    };
  });

  return {
    type: "FeatureCollection",
    features: features,
  };
}

// Adds the GeoJSON to the map's data layer
function addGeoJSONToMap(geojson) {
  if (!geojson) return;

  // Clear any existing data
  map.data.forEach((feature) => {
    map.data.remove(feature);
  });

  // Add new data
  map.data.addGeoJson(geojson);

  // Optionally, style the points (markers)
  map.data.setStyle({
    icon: {
      url: "https://maps.google.com/mapfiles/ms/icons/blue-dot.png", 
    }
  });

  // When a feature is clicked, show an infoWindow with the details
  map.data.addListener("click", (event) => {
    const props = event.feature.getProperty("Shul");
    const time = event.feature.getProperty("Time");
    const address = event.feature.getProperty("Data");
    
    const contentString = `
      <div>
        <strong>Shul:</strong> ${props}<br/>
        <strong>Time:</strong> ${time}<br/>
        <strong>Address:</strong> ${address}<br/>
      </div>
    `;

    infoWindow.setContent(contentString);
    infoWindow.setPosition(event.latLng);
    infoWindow.open(map);
  });
}

// Button click: parse & add the points to the map
function onCheckPrayerTimesClick() {
  const geojson = getPrayerTimesGeoJSON();
  addGeoJSONToMap(geojson);
}

// Initialize everything once the page has loaded
window.addEventListener("load", () => {
  initMap();
  document.getElementById("checkPrayerTimesButton").addEventListener("click", onCheckPrayerTimesClick);
});