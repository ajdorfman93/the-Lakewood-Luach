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
          <h2> ${loc.details.name}</h2>
          <small>Nusach  ${loc.details.nusach}</small></br>
          <small> ${loc.details.tefilah}</small>
          <h5> ${loc.details.time}</h5>
          <h5> ${loc.details.address}</h5>
        </div>
      `;
    }



    // FALLBACK
    else {
      li.innerHTML = `
        <div class="box">
          ${loc.name}
        </div>
      `;
    }

    ul.appendChild(li);
  });

  container.appendChild(ul);
}
