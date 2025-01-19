// markers.js

let map;          // The single Google Map instance
let infoWindow;   // A single reusable InfoWindow
let autocomplete; // For Autocomplete on #search-input
let searchMarker; // Red marker for the “searched location”

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
    pixelOffset: new google.maps.Size(0, -35),
  });

  // Create a helper to set header + body content together:
  infoWindow.setCustomContent = function(headerText, bodyHtml) {
    const wrapper = document.createElement("div");

    // Header
    const headerEl = document.createElement("h4");
    headerEl.textContent = headerText;
    headerEl.style.marginTop = "0";
    wrapper.appendChild(headerEl);

    // Body
    const bodyEl = document.createElement("div");
    bodyEl.innerHTML = bodyHtml;
    wrapper.appendChild(bodyEl);

    this.setContent(wrapper);
  };

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

// ==========================
//  MINYANIM-RELATED FUNCTIONS
// ==========================

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
        Times: [item.Time],
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
 * Adds a GeoJSON FeatureCollection to the map's data layer (blue markers),
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

  // When user clicks a minyan marker, show the InfoWindow
  map.data.addListener("click", (event) => {
    const name = event.feature.getProperty("Name");
    const time = event.feature.getProperty("Time");
    const address = event.feature.getProperty("Data");
    const nusach = event.feature.getProperty("Nusach");
    const tefilah = event.feature.getProperty("Tefilah");

    const bodyHtml = `
      <div class="box">
        <small>Nusach ${nusach}</small><br/>
        <small>${tefilah}</small><br/>
        <h5>${time}</h5>
        <h5>${address}</h5>
      </div>
    `;
    infoWindow.setHeaderContent(name);
    infoWindow.setContent(bodyHtml);
    infoWindow.setPosition(event.latLng);
    infoWindow.open(map);
  });
}

/**
 * Re-parse #prayerTimesOutput <pre> for minyanim, convert to GeoJSON,
 * and refresh the map. Also updates window.knownLocations with these minyanim’s lat/lng.
 */
function refreshMapMarkers() {
  const geojson = getPrayerTimesGeoJSON();
  addGeoJSONToMap(geojson);

  // Clear out knownLocations
  window.knownLocations = [];

  if (geojson && geojson.features) {
    geojson.features.forEach((feat) => {
      const [lng, lat] = feat.geometry.coordinates || [0, 0];

      const name = feat.properties.Name || "(No Shul name)";
      const time = feat.properties.Time || "(No Time)";
      const address = feat.properties.Data || "(No Address)";
      const nusach = feat.properties.Nusach || "(No Nusach)";
      const tefilah = feat.properties.Tefilah || "(No Tefilah)";

      // We'll store the minyan data as an object (category = "minyan")
      window.knownLocations.push({
        category: "minyan",
        lat,
        lng,
        name,
        details: {
          name,
          time,
          address,
          nusach,
          tefilah
        },
      });
    });
  }

  // Update the side list if you have it
  displayKnownLocations();
  console.log("knownLocations updated from Minyanim data:", window.knownLocations);
}

// Update map markers whenever the user clicks a .tefilah-button
document.addEventListener("click", (e) => {
  if (e.target.classList.contains("tefilah-button")) {
    setTimeout(() => {
      refreshMapMarkers();
    }, 0);
  }
});

/**
 * Draws an array of items (finalItems) as *blue markers* on the map's data layer.
 * Each item must have: lat, lng, head (marker title), html (popup content), category, etc.
 */
function drawMarkers(finalItems) {
  // Clear old data
  map.data.forEach((feature) => map.data.remove(feature));

  // Convert finalItems to GeoJSON
  const features = finalItems.map((item) => ({
    type: "Feature",
    geometry: {
      type: "Point",
      coordinates: [Number(item.lng) || 0, Number(item.lat) || 0],
    },
    properties: {
      head: item.head || "",   // The marker title
      html: item.html || "",   // The popup body content
      category: item.category || "",
      
      // Restaurants:
      address1: item.address1 || "",
      phoneNumber: item.phoneNumber || "",
      weekday: item.weekday || "",
      weekend: item.weekend || "",
      dairyMeat: item.dairyMeat || "",
      website: item.website || "",
      pricePoint: item.pricePoint || "",

      // Businesses:
      strTyp: item.strTyp || "",
      categories: item.categories || "",
      email: item.email || "",
      fax: item.fax || ""
    },
  }));

  const geojson = {
    type: "FeatureCollection",
    features,
  };

  map.data.addGeoJson(geojson);

  // Style them (blue-dot icon)
  map.data.setStyle({
    icon: "https://maps.google.com/mapfiles/ms/icons/blue-dot.png",
  });

  // InfoWindow on click
  map.data.addListener("click", (event) => {
    const head = event.feature.getProperty("head");
    const content = event.feature.getProperty("html");
    infoWindow.setHeaderContent(head);
    infoWindow.setContent(content);
    infoWindow.setPosition(event.latLng);
    infoWindow.open(map);
  });

  // Populate knownLocations from finalItems
  window.knownLocations = finalItems.map((item) => ({
    category: item.category || "",
    name: item.head || "(No name)",
    lat: Number(item.lat) || 0,
    lng: Number(item.lng) || 0,
    details: {
      // RESTAURANT FIELDS (if category=restaurants)
      address1: item.address1 || "",
      phoneNumber: item.phoneNumber || "",
      weekday: item.weekday || "",
      weekend: item.weekend || "",
      dairyMeat: item.dairyMeat || "",
      website: item.website || "",
      pricePoint: item.pricePoint || "",
      
      // BUSINESS FIELDS (if category=businesses)
      strTyp: item.strTyp || "",
      categories: item.categories || "",
      email: item.email || "",
      phone: item.phone || "",
      fax: item.fax || ""
    }
  }));

  // Show them in side list
  if (typeof displayKnownLocations === "function") {
    displayKnownLocations();
  }

  console.log("knownLocations updated from finalItems:", window.knownLocations);
}
