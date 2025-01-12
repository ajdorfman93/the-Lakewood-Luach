// markers-minyanim.js
let mapMinyanim, infoWindowMinyanim, autocompleteMinyanim;

function initMinyanimMap() {
  // Create the map
  mapMinyanim = new google.maps.Map(document.getElementById("map"), {
    center: { lat: 40.067, lng: -74.205 }, // Lakewood area
    zoom: 13,
    disableDefaultUI: true,
  });

  // Create a single InfoWindow to reuse
  infoWindowMinyanim = new google.maps.InfoWindow();

  // Setup Autocomplete
  const input = document.getElementById("search-input");
  autocompleteMinyanim = new google.maps.places.Autocomplete(input);
  autocompleteMinyanim.addListener("place_changed", () => {
    const place = autocompleteMinyanim.getPlace();
    if (place.geometry && place.geometry.location) {
      mapMinyanim.setCenter(place.geometry.location);
      mapMinyanim.setZoom(14);
    }
  });
}

// This function reads the raw JSON from #prayerTimesOutput,
// then converts it into a valid GeoJSON FeatureCollection.
function getPrayerTimesGeoJSON() {
  const pre = document.querySelector("#prayerTimesOutput pre");
  if (!pre) {
    console.warn("No <pre> found in #prayerTimesOutput => returning null => remove markers.");
    return null;
  }

  const rawText = pre.innerText.trim();
  if (!rawText) {
    console.warn("Empty prayer times JSON text => returning null => remove markers.");
    return null;
  }

  let data;
  try {
    data = JSON.parse(rawText);
  } catch (err) {
    console.error("Error parsing prayer times JSON:", err);
    return null;
  }

  // Convert to GeoJSON
  const features = data.map((item) => {
    const lat = parseFloat(item.position.lat) || 0;
    const lng = parseFloat(item.position.lng) || 0;
    return {
      type: "Feature",
      properties: {
        Shul: item.Shul,
        Tefilah: item.Tefilah,
        Time: item.Time,
        Data: item.Data,
        Nusach: item.Nusach,
        strCode: item.strCode,
      },
      geometry: {
        type: "Point",
        coordinates: [lng, lat],
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
  // First, clear any existing markers/features
  mapMinyanim.data.forEach((feature) => {
    mapMinyanim.data.remove(feature);
  });

  // If there's no new data, return
  if (!geojson) {
    return;
  }

  // Add new data
  mapMinyanim.data.addGeoJson(geojson);

  // Style the markers
  mapMinyanim.data.setStyle({
    icon: {
      url: "https://maps.google.com/mapfiles/ms/icons/blue-dot.png",
    },
  });

  // InfoWindow on click
  mapMinyanim.data.addListener("click", (event) => {
    const shul = event.feature.getProperty("Shul");
    const time = event.feature.getProperty("Time");
    const address = event.feature.getProperty("Data");
    const nusach = event.feature.getProperty("Nusach");
    const code = event.feature.getProperty("strCode");
    const tefilah = event.feature.getProperty("Tefilah");

    const contentString = `
      <div>
        <strong>Shul:</strong> ${shul}<br/>
        <strong>Time:</strong> ${time}<br/>
        <strong>Address:</strong> ${address}<br/>
        <strong>Nusach:</strong> ${nusach}<br/>
        <strong>code:</strong> ${code}<br/>
        <strong>tefilah:</strong> ${tefilah}<br/>
      </div>
    `;

    infoWindowMinyanim.setContent(contentString);
    infoWindowMinyanim.setPosition(event.latLng);
    infoWindowMinyanim.open(mapMinyanim);
  });
}

// Single function to re-parse #prayerTimesOutput and update markers
function refreshMapMarkers() {
  const geojson = getPrayerTimesGeoJSON();
  addGeoJSONToMap(geojson);
}

// If you have buttons that update #prayerTimesOutput, you can wire them like so:
document.addEventListener("click", (e) => {
  if (e.target.classList.contains("tefilah-button")) {
    // Delay parse => ensures updated <pre> is in DOM before parse
    setTimeout(() => {
      refreshMapMarkers();
    }, 0);
  }
});
