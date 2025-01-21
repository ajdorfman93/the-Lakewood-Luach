// knownLocations.js

function displayKnownLocations() {
  // ======== 1) Display all known locations ========
  const container = document.getElementById("locations-list");
  
  if (!container) return;

  // Clear out old content in the main container
  container.innerHTML = "";

  // If no known locations, show a simple message
  if (!window.knownLocations || window.knownLocations.length === 0) {
    container.innerHTML = "<p>No known locations available.</p>";
  } else {
    // Build an <ul>
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
            <h5>${loc.details.phoneNumber}</h5>
            <h5><strong>Weekday Hours:</strong> ${loc.details.weekday}</h5>
            <h5><strong>Weekend Hours:</strong> ${loc.details.weekend}</h5>
            <h5><a href="${loc.details.website}" target="_blank" rel="noopener">${loc.details.website}</a></h5>
          </div>
        `;
      }
      // BUSINESSES
      else if (loc.category === "businesses" && loc.details) {
        // loc.details includes:
        //  strTyp, categories, website, email, phone, fax, sponsored
        li.innerHTML = `
          <div class="box">
            <h2><strong>${loc.name}</strong></h2>
            <small>${loc.details.categories}</small>
            <h5>${loc.details.strTyp}</h5>
            <h5><span class="fa fa-phone"></span> ${loc.details.phone}</h5>
            <p>${loc.details.fax}</p>
            <p>${loc.details.email}</p>
            <h5><a href="${loc.details.website}" target="_blank" rel="noopener">${loc.details.website}</a></h5>
            <h5>${loc.details.address1}</h5>
            <h5 style="display: none">${loc.details.sponsored}</h5>
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

  // ======== 2) Display only sponsored businesses ========
  const sponsoredContainer = document.getElementById("location-businesses-sponsored");
  
  if (!sponsoredContainer) return;

  // Clear out old content for sponsored container
  sponsoredContainer.innerHTML = "";

  // Filter for only businesses that have details.sponsored === "True"
  const sponsoredBusinesses = (window.knownLocations || []).filter(
    (loc) => loc.category === "businesses" && 
             loc.details && 
             loc.details.sponsored === "True"
  );

  if (sponsoredBusinesses.length === 0) {
    sponsoredContainer.innerHTML = "<p>No sponsored businesses available.</p>";
  } else {
    // Build an <ul> for sponsored businesses
    const ulSponsored = document.createElement("ul");
    ulSponsored.classList.add("locations-ul");

    sponsoredBusinesses.forEach((loc) => {
      const li = document.createElement("li");
      li.classList.add("locations-li");

      // Using the same layout logic for a business
      li.innerHTML = `
        <div class="box">
          <h1><strong>${loc.name}</strong></h1>
          <small>${loc.details.categories}</small>
          <h5>${loc.details.strTyp}</h5>
          <h5><span class="fa fa-phone"></span> ${loc.details.phone}</h5>
          <p>${loc.details.fax}</p>
          <p>${loc.details.email}</p>
          <h5><a href="${loc.details.website}" target="_blank" rel="noopener">${loc.details.website}</a></h5>
          <h5>${loc.details.address1}</h5>
          <h5 style="display: none">${loc.details.sponsored}</h5>
        </div>
      `;
      ulSponsored.appendChild(li);
    });

    sponsoredContainer.appendChild(ulSponsored);
  }
}
