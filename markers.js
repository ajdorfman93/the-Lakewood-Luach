// combined-markers.js

// ---------------------------
// GLOBAL VARIABLES
// ---------------------------
let map;                  // The single Google Map instance
let infoWindow;           // A single reusable InfoWindow
let autocomplete;         // For Autocomplete on #search-input
let searchMarker;         // Red marker for the “searched location”

/**
 * Initializes the single Google Map, tries to geocode whatever is in #search-input,
 * sets up autocomplete, etc.
 */
function initMap() {
  // 1) Create the map with a default center.
  map = new google.maps.Map(document.getElementById("map"), {
    center: { lat: 40.095, lng: -74.222 },
    zoom: 12,
    disableDefaultUI: true,
  });

  // 2) Create an InfoWindow (reuse for markers)
  infoWindow = new google.maps.InfoWindow();

  // 3) Prepare the #search-input + Autocomplete
  const input = document.getElementById("search-input");
  autocomplete = new google.maps.places.Autocomplete(input);

  // 4) Attempt to geocode whatever is currently in #search-input
  const geocoder = new google.maps.Geocoder();
  const searchValue = input.value.trim();
  if (searchValue) {
    geocoder.geocode({ address: searchValue }, (results, status) => {
      if (status === "OK" && results[0]) {
        // Center + Zoom
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

  // 5) Listen for Autocomplete changes in #search-input
  autocomplete.addListener("place_changed", () => {
    const place = autocomplete.getPlace();
    if (place.geometry && place.geometry.location) {
      // Center the map on the user’s newly selected place
      map.setCenter(place.geometry.location);
      map.setZoom(14);

      // Remove the old marker if any
      if (searchMarker) {
        searchMarker.setMap(null);
      }

      // Place a new red searchMarker
      searchMarker = new google.maps.Marker({
        position: place.geometry.location,
        map,
        icon: "http://maps.google.com/mapfiles/ms/icons/red-dot.png",
        title: "Searched Location",
      });
    }
  });
}

// --------------------------------------------------------------------------------
// MINYANIM-RELATED FUNCTIONS
// --------------------------------------------------------------------------------

/**
 * Reads the raw JSON from #prayerTimesOutput <pre> tag, converts it to a valid 
 * GeoJSON FeatureCollection, **grouping** items by lat/long. 
 * Returns null if something is wrong (missing <pre>, empty JSON, parse error, etc).
 */
function getPrayerTimesGeoJSON() {
  // Find the <pre> inside #prayerTimesOutput
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
  const groupedByLatLng = {};  // key = "lat:lng"
  data.forEach((item) => {
    const lat = parseFloat(item.position.lat) || 0;
    const lng = parseFloat(item.position.lng) || 0;
    const key = `${lat}:${lng}`;

    if (!groupedByLatLng[key]) {
      groupedByLatLng[key] = {
        lat,
        lng,
        Shul: item.Shul,
        Data: item.Data,       // e.g. address
        Nusach: item.Nusach,
        Tefilah: item.Tefilah,
        Times: [ item.Time ],  // Start an array of times
      };
    } else {
      groupedByLatLng[key].Times.push(item.Time);
    }
  });

  // Convert to an array of GeoJSON Features
  const features = Object.values(groupedByLatLng).map((grp) => {
    return {
      type: "Feature",
      properties: {
        Shul: grp.Shul,
        Tefilah: grp.Tefilah,
        Time: grp.Times.join(" | "),
        Data: grp.Data,
        Nusach: grp.Nusach,
      },
      geometry: {
        type: "Point",
        coordinates: [grp.lng, grp.lat],
      },
    };
  });

  // Return the final FeatureCollection
  return {
    type: "FeatureCollection",
    features,
  };
}

/**
 * Adds a GeoJSON FeatureCollection to the map's data layer as **blue** markers,
 * hooking up an InfoWindow with minyanim info.
 */
function addGeoJSONToMap(geojson) {
  // Clear existing data layer features
  map.data.forEach((feature) => {
    map.data.remove(feature);
  });
  if (!geojson) return;

  // Add new data
  map.data.addGeoJson(geojson);

  // Style them (blue-dot icon)
  map.data.setStyle({
    icon: {
      url: "https://maps.google.com/mapfiles/ms/icons/blue-dot.png",
    },
  });

  // When user clicks a minyan marker, show the InfoWindow
  map.data.addListener("click", (event) => {
    const shul    = event.feature.getProperty("Shul");
    const time    = event.feature.getProperty("Time");
    const address = event.feature.getProperty("Data");
    const nusach  = event.feature.getProperty("Nusach");
    const tefilah = event.feature.getProperty("Tefilah");

    const contentString = `
      <div class="box">
        <strong>Shul:</strong> ${shul}<br/>
        <strong>Time:</strong> ${time}<br/>
        <strong>Address:</strong> ${address}<br/>
        <strong>Nusach:</strong> ${nusach}<br/>
        <strong>Tefilah:</strong> ${tefilah}<br/>
      </div>`;
    
    infoWindow.setContent(contentString);
    infoWindow.setPosition(event.latLng);
    infoWindow.open(map);
  });
}

/**
 * Re-parse the #prayerTimesOutput <pre> for minyanim data, convert to GeoJSON, and refresh map.
 * Also updates window.knownLocations with these minyanim locations.
 */
function refreshMapMarkers() {
  const geojson = getPrayerTimesGeoJSON();
  addGeoJSONToMap(geojson);

  // Populate window.knownLocations with minyanim
  window.knownLocations = [];
  if (geojson && geojson.features) {
    geojson.features.forEach((feat) => {
      const [lng, lat] = feat.geometry.coordinates || [0, 0];
      window.knownLocations.push({
        name: feat.properties.Shul || "(No Shul name)",
        lat,
        lng,
        details: feat.properties,
      });
    });
  }

displayKnownLocations();

  console.log("knownLocations updated from Minyanim data:", window.knownLocations);
}

document.addEventListener("click", (e) => {
  if (e.target.classList.contains("tefilah-button")) {
    // Slight delay to ensure <pre> is updated in DOM
    setTimeout(() => {
      refreshMapMarkers();
    }, 0);
  }
});

// GENERIC MARKER DRAWING FROM “finalItems” (restaurants, businesses, etc.)

/**
 * Draws an array of items (finalItems) as **blue** markers on the map's data layer,
 * each item containing lat, lng, and optional html for the InfoWindow.
 * Also updates knownLocations with these items.
 */
function drawMarkers(finalItems) {
  // Clear old data from the map’s data layer
  map.data.forEach((f) => map.data.remove(f));

  // Convert finalItems to GeoJSON
  const features = finalItems.map((item) => {
    return {
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
    };
  });

  const geojson = {
    type: "FeatureCollection",
    features,
  };

  // Add new data to the map
  map.data.addGeoJson(geojson);

  // Style them (blue-dot icon)
  map.data.setStyle({
    icon: { url: "https://maps.google.com/mapfiles/ms/icons/blue-dot.png" },
  });

  // InfoWindow on click
  map.data.addListener("click", (event) => {
    const content = event.feature.getProperty("html");
    infoWindow.setContent(content);
    infoWindow.setPosition(event.latLng);
    infoWindow.open(map);
  });

  // Dynamically populate knownLocations with these items
  window.knownLocations = [];
  finalItems.forEach((item) => {
    window.knownLocations.push({
      name: item.html || "(No details)",
      lat: Number(item.lat) || 0,
      lng: Number(item.lng) || 0,
      details: item,
    });
  });

  // If you have a UI function to show knownLocations:
displayKnownLocations();

  console.log("knownLocations updated from finalItems:", window.knownLocations);
}
