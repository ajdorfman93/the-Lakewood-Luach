// knownLocations.js

function displayKnownLocations() {
  const container = document.getElementById("locations-list");
  if (!container) return;

  // Clear out old content
  container.innerHTML = "";

  // If no known locations, show a simple message
  if (!window.knownLocations || window.knownLocations.length === 0) {
    container.innerHTML = "<p>No known locations available.</p>";
    return;
  }

  // Otherwise, build an <ul>
  const ul = document.createElement("ul");
  ul.classList.add("locations-ul");

  window.knownLocations.forEach((loc) => {
    const li = document.createElement("li");
    li.classList.add("locations-li");

    // MINYAN
    if (loc.category === "minyan" && loc.details) {
      // We rely on loc.details = { name, time, address, nusach, tefilah }
      li.innerHTML = `
        <div class="box">
          <h2><strong>${loc.details.name}</strong></h2>
          <small>Nusach: ${loc.details.nusach}</small><br/>
          <small>${loc.details.tefilah}</small>
          <h5>${loc.details.time}</h5>
          <h5>${loc.details.address}</h5>
        </div>
      `;
    }
    // RESTAURANTS
    else if (loc.category === "restaurants" && loc.details) {
      // loc.details includes:
      //  address1, phoneNumber, weekday, weekend, dairyMeat, website, pricePoint
      li.innerHTML = `
        <div class="box">
          <h2><strong>${loc.name}</strong></h2>
          <small>${loc.details.dairyMeat}</small><br/>
          <small>${loc.details.pricePoint}</small>
          <h5>${loc.details.address1}</h5>
          <h5><span class="fa fa-phone"></span>${loc.details.phoneNumber}</h5>
          <h5><strong>Weekday Hours:</strong> ${loc.details.weekday}</h5>
          <h5><strong>Weekend Hours:</strong> ${loc.details.weekend}</h5>
          <h5><a>${loc.details.website}</a></h5>
        </div>
      `;
    }
    // BUSINESSES
    else if (loc.category === "businesses" && loc.details) {
      // loc.details includes:
      //  strTyp, categories, website, email, phone, fax
      li.innerHTML = `
        <div class="box">
          <h2><strong>${loc.name}</strong></h2>
          <h5>${loc.details.strTyp}</h5>
          <h5>${loc.details.categories}</h5>
          <h5><span class="fa fa-phone"></span>${loc.details.phone}</h5>
          <h5><strong>Fax:</strong> ${loc.details.fax}</h5>
          <h5><span class="fa fa-envelope"></span>${loc.details.email}</h5>
          <h5><a>${loc.details.website}</a></h5>
        </div>
      `;
    }
    // FALLBACK
    else {
      li.innerHTML = `
        <div class="box">
          <strong>${loc.name}</strong>
        </div>
      `;
    }

    ul.appendChild(li);
  });

  container.appendChild(ul);
}
