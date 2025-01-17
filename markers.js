// combined-markers.js

// GLOBAL VARIABLES
let map;                  // The single Google Map instance
let infoWindow;           // A single reusable InfoWindow
let autocomplete;         // For Autocomplete on #search-input
let searchMarker;         // Red marker for the “searched location”

/**
 * Initializes the single Google Map, attempts to geocode whatever is in #search-input,
 * sets up autocomplete, etc.
 */
function initMap() {
  // 1) Create the map with a default center and some minimal UI.
  map = new google.maps.Map(document.getElementById("map"), {
    center: { lat: 40.095, lng: -74.222 },
    zoom: 12,
    disableDefaultUI: true,
  });

  // 2) Create an InfoWindow with a pixelOffset so it appears above the marker.
  infoWindow = new google.maps.InfoWindow({
    content: "",
    pixelOffset: new google.maps.Size(0, -35), // shift it above the marker
  });

  // 3) Prepare #search-input + Autocomplete
  const input = document.getElementById("search-input");
  autocomplete = new google.maps.places.Autocomplete(input);

  // 4) Attempt to geocode whatever is currently in #search-input
  const geocoder = new google.maps.Geocoder();
  const searchValue = input.value.trim();
  if (searchValue) {
    geocoder.geocode({ address: searchValue }, (results, status) => {
      if (status === "OK" && results[0]) {
        map.setCenter(results[0].geometry.location);
        map.setZoom(14);

        // Place a red searchMarker
        searchMarker = new google.maps.Marker({
          position: results[0].geometry.location,
          map,
          icon: "http://maps.google.com/mapfiles/ms/icons/red-dot.png",
          title: "Searched Location",
        });
      } else {
        console.warn("Could not geocode initial input:", status);
      }
    });
  }

  // 5) Listen for Autocomplete selection changes
  autocomplete.addListener("place_changed", () => {
    const place = autocomplete.getPlace();
    if (place.geometry && place.geometry.location) {
      // Move map to new place
      map.setCenter(place.geometry.location);
      map.setZoom(14);

      // Remove old marker (if any)
      if (searchMarker) {
        searchMarker.setMap(null);
      }

      // Place a new red marker at the searched location
      searchMarker = new google.maps.Marker({
        position: place.geometry.location,
        map,
        icon: "http://maps.google.com/mapfiles/ms/icons/red-dot.png",
        title: "Searched Location",
      });
    }
  });
}

// MINYANIM-RELATED FUNCTIONS

/**
 * Reads raw JSON from #prayerTimesOutput <pre>, converts it to valid GeoJSON Features,
 * grouping by lat/long. Returns null if something is wrong or empty.
 */
function getPrayerTimesGeoJSON() {
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

  // Group by lat/lng => accumulate Times
  const groupedByLatLng = {};
  data.forEach((item) => {
    const lat = parseFloat(item.position.lat) || 0;
    const lng = parseFloat(item.position.lng) || 0;
    const key = `${lat}:${lng}`;

    if (!groupedByLatLng[key]) {
      groupedByLatLng[key] = {
        lat,
        lng,
        Name: item.Name,
        Data: item.Data,
        Nusach: item.Nusach,
        Tefilah: item.Tefilah,
        Times: [ item.Time ],
      };
    } else {
      groupedByLatLng[key].Times.push(item.Time);
    }
  });

  // Convert grouped data to GeoJSON Features
  const features = Object.values(groupedByLatLng).map((grp) => ({
    type: "Feature",
    properties: {
      Name: grp.Name,
      Tefilah: grp.Tefilah,
      Time: grp.Times.join(" | "),
      Data: grp.Data,
      Nusach: grp.Nusach,
    },
    geometry: {
      type: "Point",
      coordinates: [grp.lng, grp.lat],
    },
  }));

  return {
    type: "FeatureCollection",
    features,
  };
}

/**
 * Adds a GeoJSON FeatureCollection to the map's data layer as blue markers,
 * hooking up an InfoWindow with minyanim info.
 */
function addGeoJSONToMap(geojson) {
  // Clear existing data layer features first
  map.data.forEach((feature) => {
    map.data.remove(feature);
  });
  if (!geojson) return;

  // Add new data
  map.data.addGeoJson(geojson);

  // Style them (blue-dot icon)
  map.data.setStyle({
    icon: "https://maps.google.com/mapfiles/ms/icons/blue-dot.png",
  });

  // When user clicks a minyan marker, show the InfoWindow above the marker
  map.data.addListener("click", (event) => {
    const name    = event.feature.getProperty("Name");
    const time    = event.feature.getProperty("Time");
    const address = event.feature.getProperty("Data");
    const nusach  = event.feature.getProperty("Nusach");
    const tefilah = event.feature.getProperty("Tefilah");


    const title = `
       ${name}
    `;
    const contentString = `
      <div class="box">
        <strong>Time:</strong> ${time}<br/>
        <strong>Address:</strong> ${address}<br/>
        <strong>Nusach:</strong> ${nusach}<br/>
        <strong>Tefilah:</strong> ${tefilah}<br/>
      </div>
    `;

    // Set content, apply pixelOffset, open above the marker
    infoWindow.setHeaderContent(title);
    infoWindow.setContent(contentString);
    infoWindow.setPosition(event.latLng);
    infoWindow.open(map);
  });
}

/**
 * Re-parse #prayerTimesOutput <pre> for minyanim, convert to GeoJSON, and refresh the map.
 * Also updates window.knownLocations with these minyanim’s lat/lng.
 */
function refreshMapMarkers() {
  const geojson = getPrayerTimesGeoJSON();
  addGeoJSONToMap(geojson);

  // Populate window.knownLocations with the new data
  window.knownLocations = [];
  if (geojson && geojson.features) {
    geojson.features.forEach((feat) => {
      const [lng, lat] = feat.geometry.coordinates || [0, 0];
      window.knownLocations.push({
        name: feat.properties.Name || "(No Shul name)",
        lat,
        lng,
        details: feat.properties.Time,
      });
    });
  }

  // If you have a UI method to display known locations, call it:
  displayKnownLocations();

  console.log("knownLocations updated from Minyanim data:", window.knownLocations);
}

// Update map markers whenever the user clicks a .tefilah-button
document.addEventListener("click", (e) => {
  if (e.target.classList.contains("tefilah-button")) {
    // Slight delay to ensure the <pre> is updated in the DOM
    setTimeout(() => {
      refreshMapMarkers();
    }, 0);
  }
});

// GENERIC MARKER DRAWING FROM “finalItems” (restaurants, businesses, etc.)

/**
 * Draws an array of items (finalItems) as blue markers on the map's data layer.
 * Each item has lat, lng, and optional HTML for the InfoWindow.
 */
function drawMarkers(finalItems) {
  // Clear old data from the map’s data layer
  map.data.forEach((feature) => map.data.remove(feature));

  // Convert finalItems to GeoJSON features
  const features = finalItems.map((item) => ({
    type: "Feature",
    geometry: {
      type: "Point",
      coordinates: [
        Number(item.lng) || 0,
        Number(item.lat) || 0,
      ],
    },
    properties: {
      html: item.html || "(No details)",
    },
  }));

  const geojson = {
    type: "FeatureCollection",
    features,
  };

  // Add new data to map
  map.data.addGeoJson(geojson);

  // Style them (blue-dot icon again)
  map.data.setStyle({
    icon: "https://maps.google.com/mapfiles/ms/icons/blue-dot.png",
  });

  // InfoWindow on click (anchored above the marker via pixelOffset)
  map.data.addListener("click", (event) => {
    const content = event.feature.getProperty("html");
    infoWindow.setContent(content);
    infoWindow.setPosition(event.latLng);
    infoWindow.open(map);
  });

  // Populate knownLocations from finalItems
  window.knownLocations = [];
  finalItems.forEach((item) => {
    window.knownLocations.push({
      name: item.html || "(No details)",
      lat: Number(item.lat) || 0,
      lng: Number(item.lng) || 0,
      details: item,
    });
  });

  // Optional: update your UI
  displayKnownLocations();

  console.log("knownLocations updated from finalItems:", window.knownLocations);
}
