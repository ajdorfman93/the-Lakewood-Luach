// markers.js

let map;              // The single Google Map instance
let infoWindow;       // A single reusable InfoWindow
let markerCluster;    // MarkerClusterer instance
let markers = [];     // Current array of google.maps.Marker objects

/**
 * Initializes the map, the search autocomplete, 
 * the marker clusterer, etc.
 */
function initMap() {
  // 1) Create the map with a default center and some minimal UI.
  map = new google.maps.Map(document.getElementById("map"), {
    center: { lat: 40.095, lng: -74.222 },
    zoom: 12,
    disableDefaultUI: true,
  });

  window.__mapInitialized = true;

  // 2) Create an InfoWindow with a pixelOffset so it appears above the marker.
  infoWindow = new google.maps.InfoWindow({
    content: "",
    pixelOffset: new google.maps.Size(0, -1),
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
  // Wire the shared search input up to this map instance.
  if (typeof window.setSearchMap === "function") {
    window.setSearchMap(map);
  } else if (typeof window.initSearchInput === "function") {
    window.initSearchInput();
  }

  // 6) Create the MarkerClusterer.
  markerCluster = new MarkerClusterer(map, [], {
    // This imagePath is for the markerclustererplus library:
    imagePath: "https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m",
  });

  // Listen for .tefilah-button clicks -> refresh minyan markers
  document.addEventListener("click", (e) => {
    if (e.target.classList.contains("tefilah-button")) {
      // tiny delay so any dynamic content is in the <pre>
      setTimeout(() => {
        refreshMapMarkers();
      }, 0);
    }
  });
}

// ===========================================
//  MINYANIM-RELATED FUNCTIONS
// ===========================================

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

  // Convert grouped data into GeoJSON Features
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
 * Clears existing markers, then adds new minyanim markers 
 * based on the given GeoJSON FeatureCollection.
 */
function addGeoJSONToMap(geojson) {
  // Clear old markers
  markerCluster.clearMarkers();
  markers.forEach((m) => m.setMap(null));
  markers = [];

  if (!geojson) return;

  // Create markers from geojson
  geojson.features.forEach((feat) => {
    const [lng, lat] = feat.geometry.coordinates || [0, 0];

    const name = feat.properties.Name;
    const time = feat.properties.Time;
    const address = feat.properties.Data;
    const nusach = feat.properties.Nusach;
    const tefilah = feat.properties.Tefilah;

    const marker = new google.maps.Marker({
      position: { lat, lng },
      icon: "https://maps.google.com/mapfiles/ms/icons/blue-dot.png",
      title: name,
      // Store any custom data you need on the marker:
      minyanData: {
        name,
        time,
        address,
        nusach,
        tefilah,
      },
    });

    // On marker click => open the InfoWindow with the same appearance as the original code
    marker.addListener("click", () => {
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
      infoWindow.open({
        anchor: marker,
        map,
        shouldFocus: false,
      });
    });

    markers.push(marker);
  });

  // Add new markers to cluster
  markerCluster.addMarkers(markers);
}

/**
 * Re-parse #prayerTimesOutput <pre> for minyanim, convert to GeoJSON,
 * and refresh the map with new set of minyanim markers.
 * Also updates window.knownLocations with these minyanim’s lat/lng.
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

      // We'll store the minyan data as an object
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
          tefilah,
        },
      });
    });
  }

  // Update side list (if you have it)
  if (typeof displayKnownLocations === "function") {
    displayKnownLocations();
  }

  console.log("knownLocations updated from Minyanim data:", window.knownLocations);
}

function drawMarkers(finalItems) {
  // Clear old markers
  markerCluster.clearMarkers();
  markers.forEach((m) => m.setMap(null));
  markers = [];

  // Populate knownLocations (regardless of address1)
  window.knownLocations = finalItems.map((item) => ({
    category: item.category || "",
    name: item.head || "(No name)",
    lat: Number(item.lat) || 0,
    lng: Number(item.lng) || 0,
    details: {
      address1: item.address1 || "",
      phoneNumber: item.phoneNumber || "",
      weekday: item.weekday || "",
      weekend: item.weekend || "",
      dairyMeat: item.dairyMeat || "",
      website: item.website || "",
      pricePoint: item.pricePoint || "",
      categories: item.categories || "",
      strTyp: item.strTyp || "",
      email: item.email || "",
      phone: item.phone || "",
      fax: item.fax || "",
      sponsored: item.sponsored || ""
    },
  }));

  // Build new google.maps.Marker objects
  finalItems.forEach((item) => {
    // Exclude this item from marker creation if address1 is empty
    if (!item.address1 || !item.address1.trim()) {
      return; // Do not create a marker for this item
    }

    const lat = Number(item.lat) || 0;
    const lng = Number(item.lng) || 0;
    const head = item.head || "(No title)";
    const html = item.html || "";

    // Choose marker color based on `sponsored` property
    const iconUrl =
      item.sponsored === "True"
        ? "https://maps.google.com/mapfiles/ms/icons/green-dot.png"
        : "https://maps.google.com/mapfiles/ms/icons/blue-dot.png";

    const marker = new google.maps.Marker({
      position: { lat, lng },
      icon: iconUrl,
      title: head,
      metaData: {
        category: item.category || "",
        address1: item.address1 || "",
        phoneNumber: item.phoneNumber || "",
        weekday: item.weekday || "",
        weekend: item.weekend || "",
        dairyMeat: item.dairyMeat || "",
        website: item.website || "",
        pricePoint: item.pricePoint || "",
        categories: item.categories || "",
        strTyp: item.strTyp || "",
        email: item.email || "",
        phone: item.phone || "",
        fax: item.fax || "",
        sponsored: item.sponsored || "",
        logo: item.logo || ""
      },
      htmlContent: html,
    });




    // On click => show InfoWindow
    marker.addListener("click", () => {
      infoWindow.setHeaderContent(head);
      infoWindow.setContent(html);
      infoWindow.open({
        anchor: marker,
        map,
        shouldFocus: false,
      });
    });

    markers.push(marker);
  });

  // Add all markers to cluster
  markerCluster.addMarkers(markers);

  // If you have a side list, update it
  if (typeof displayKnownLocations === "function") {
    displayKnownLocations();
  }

  console.log("knownLocations updated from finalItems:", window.knownLocations);
}

// Expose key functions for other scripts.
window.initMarkersMap = initMap;
window.initMinyanimMap = function initMinyanimMap() {
  if (!map) {
    initMap();
    return;
  }
  refreshMapMarkers();
};
