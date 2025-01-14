// markers-minyanim.js
let mapMinyanim, infoWindowMinyanim, autocompleteMinyanim, searchMarker;

/**
 * Initializes the Google Map, autocomplete, and default center/zoom.
 */
const initMinyanimMap = () => {
  mapMinyanim = new google.maps.Map(document.getElementById("map"), {
    center: { lat: 40.095, lng: -74.222 },
    zoom: 12,
    disableDefaultUI: true,
  });

  infoWindowMinyanim = new google.maps.InfoWindow();

  // Set up Autocomplete on #search-input
  const input = document.getElementById("search-input");
  autocompleteMinyanim = new google.maps.places.Autocomplete(input);
  autocompleteMinyanim.addListener("place_changed", () => {
    const place = autocompleteMinyanim.getPlace();

    if (place.geometry && place.geometry.location) {
      // Center the map on the user’s selected place
      mapMinyanim.setCenter(place.geometry.location);
      mapMinyanim.setZoom(14);

      // ---- NEW CODE: Place a RED marker at the search-input location ----
      if (searchMarker) {
        searchMarker.setMap(null); // remove old marker if any
      }
      searchMarker = new google.maps.Marker({
        position: place.geometry.location,
        map: mapMinyanim,
        icon: "http://maps.google.com/mapfiles/ms/icons/red-dot.png",
        title: "Searched Location",
      });
    }
  });
};

/**
 * Reads the raw JSON from #prayerTimesOutput <pre> tag
 * and converts it into a valid GeoJSON FeatureCollection.
 * @returns {Object|null} GeoJSON FeatureCollection or null
 */
const getPrayerTimesGeoJSON = () => {
  const pre = document.querySelector("#prayerTimesOutput pre");
  if (!pre) {
    console.warn("No <pre> found in #prayerTimesOutput => returning null => remove markers.");
    return null;
  }

  const rawText = pre.innerText.trim();
  if (!rawText) {
    console.warn("Empty prayer times JSON => returning null => remove markers.");
    return null;
  }

  let data;
  try {
    data = JSON.parse(rawText);
  } catch (err) {
    console.error("Error parsing prayer times JSON:", err);
    return null;
  }

  // Convert each item to a GeoJSON Feature
  const features = data.map((item) => {
    const lat = parseFloat(item.position.lat) || 0;
    const lng = parseFloat(item.position.lng) || 0;
    return {
      type: "Feature",
      properties: {
        Shul:    item.Shul,
        Tefilah: item.Tefilah,
        Time:    item.Time,
        Data:    item.Data,
        Nusach:  item.Nusach,
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
    features,
  };
};

/**
 * Adds a GeoJSON FeatureCollection to the map's data layer.
 * @param {Object} geojson - The GeoJSON data
 */
const addGeoJSONToMap = (geojson) => {
  // Clear existing markers/features
  mapMinyanim.data.forEach((feature) => {
    mapMinyanim.data.remove(feature);
  });

  // If there's no new data, we stop here
  if (!geojson) return;

  // Add new data to the map
  mapMinyanim.data.addGeoJson(geojson);

  // Style the markers (blue icon)
  mapMinyanim.data.setStyle({
    icon: {
      url: "https://maps.google.com/mapfiles/ms/icons/blue-dot.png",
    },
  });

  // Reuse the same InfoWindow on marker click
  mapMinyanim.data.addListener("click", (event) => {
    const shul    = event.feature.getProperty("Shul");
    const time    = event.feature.getProperty("Time");
    const address = event.feature.getProperty("Data");
    const nusach  = event.feature.getProperty("Nusach");
    const code    = event.feature.getProperty("strCode");
    const tefilah = event.feature.getProperty("Tefilah");

    const contentString = 
      `<div>
        <strong>Shul:</strong> ${shul}<br/>
        <strong>Time:</strong> ${time}<br/>
        <strong>Address:</strong> ${address}<br/>
        <strong>Nusach:</strong> ${nusach}<br/>
        <strong>code:</strong> ${code}<br/>
        <strong>tefilah:</strong> ${tefilah}<br/>
      </div>`;

    infoWindowMinyanim.setContent(contentString);
    infoWindowMinyanim.setPosition(event.latLng);
    infoWindowMinyanim.open(mapMinyanim);
  });
};

/**
 * Re-parse #prayerTimesOutput, convert to GeoJSON, and refresh all markers.
 */
const refreshMapMarkers = () => {
  const geojson = getPrayerTimesGeoJSON();
  addGeoJSONToMap(geojson);

  // Dynamically populate knownLocations
  if (geojson && geojson.features) {
    window.knownLocations = [];

    // Map each feature into knownLocations
    geojson.features.forEach((feat) => {
      const [lng, lat] = feat.geometry.coordinates || [0, 0];
      window.knownLocations.push({
        name:    feat.properties.Shul || "(No Shul name)",
        lat,
        lng,
        details: feat.properties,
      });
    });

    // Now call displayKnownLocations() to show them in #locations-list
    displayKnownLocations();

    // (Optional) Another loop for additional data. If not needed, remove.
    geojson.features.forEach((feat) => {
      const [lng, lat] = feat.geometry.coordinates || [0, 0];
      window.knownLocations.push({
        name:    feat.properties.Shul || "(No Shul name)",
        lat,
        lng,
        details: feat.properties,
      });
    });

    console.log("knownLocations updated from Minyanim data:", window.knownLocations);
  }
};

// Listen for clicks on elements that have class="tefilah-button"
document.addEventListener("click", (e) => {
  if (e.target.classList.contains("tefilah-button")) {
    // Delay parse => ensures updated <pre> is in DOM before parse
    setTimeout(() => {
      refreshMapMarkers();
    }, 0);
  }
});
