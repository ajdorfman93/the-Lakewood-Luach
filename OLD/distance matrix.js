// distanceFilter.js

// We'll store the data globally after fetching
let prayerTimeData = [];

/**
 * 1) Fetch the external JSON (prayertimes.json).
 *    Store it in prayerTimeData for later.
 */
async function loadPrayerTimeData() {
  try {
    const response = await fetch("prayertimes.json");
    if (!response.ok) {
      throw new Error("Network response was not OK");
    }
    prayerTimeData = await response.json();
    console.log("Prayer time data loaded:", prayerTimeData);
  } catch (err) {
    console.error("Error loading prayertimes.json:", err);
  }
}

/**
 * 2) Use the Google Distance Matrix to find the 10 closest records to `address`.
 *    If `address` is empty or geocoding fails, we return **all** records.
 */
function filterClosestRecords(address, callback) {
  // If no address, just return everything
  if (!address || !address.trim()) {
    callback(prayerTimeData);
    return;
  }

  const geocoder = new google.maps.Geocoder();
  geocoder.geocode({ address }, (results, status) => {
    if (status !== "OK" || !results[0]) {
      console.error("Geocoding failed:", status);
      callback(prayerTimeData);
      return;
    }

    const originLatLng = results[0].geometry.location;

    // Prepare the destinations (each record's lat/lng)
    const destinations = prayerTimeData.map((record) =>
      new google.maps.LatLng(record.position.lat, record.position.lng)
    );

    const service = new google.maps.DistanceMatrixService();
    service.getDistanceMatrix(
      {
        origins: [originLatLng],
        destinations: destinations,
        travelMode: google.maps.TravelMode.DRIVING,
      },
      (response, matrixStatus) => {
        if (matrixStatus !== "OK") {
          console.error("Distance Matrix Service failed:", matrixStatus);
          callback(prayerTimeData);
          return;
        }

        // Attach distance to each record
        const elements = response.rows[0].elements; // for single origin
        const enriched = prayerTimeData.map((record, i) => {
          const distanceValue = elements[i]?.distance?.value ?? Number.MAX_VALUE;
          return { ...record, distanceValue };
        });

        // Sort ascending by distance
        enriched.sort((a, b) => a.distanceValue - b.distanceValue);

        // Take top 10
        const closestTen = enriched.slice(0, 10);
        callback(closestTen);
      }
    );
  });
}

/**
 * 3) Build an HTML table from the filtered records
 */
function buildHtmlTable(records) {
  let table = `
    <table>
      <thead>
        <tr>
          <th>Shul</th>
          <th>Tefilah</th>
          <th>Time</th>
          <th>Address</th>
          <th>Code</th>
        </tr>
      </thead>
      <tbody>
  `;

  records.forEach((r) => {
    table += `
      <tr>
        <td>${r.Shul}</td>
        <td>${r.Tefilah}</td>
        <td>${r.Time}</td>
        <td>${r.Data}</td>
        <td>${r.strCode}</td>
      </tr>
    `;
  });

  table += `
      </tbody>
    </table>
  `;

  return table;
}

/**
 * 4) Filter & display the table in .table
 *    This is the main function you might call on button click.
 */
function displayNearestInTable() {
  const addressInput = document.getElementById("search-input").value.trim();

  filterClosestRecords(addressInput, (filteredRecords) => {
    const tableContainer = document.querySelector(".table");
    if (!tableContainer) return;

    // Build the table HTML
    const tableHtml = buildHtmlTable(filteredRecords);

    // Insert the table HTML into the container
    tableContainer.innerHTML = tableHtml;
  });
}
