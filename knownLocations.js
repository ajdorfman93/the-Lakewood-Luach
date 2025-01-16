function displayKnownLocations() {
    const container = document.getElementById("locations-list");
    if (!container) return;

    // Clear out old content
    container.innerHTML = "";

    // If there are no locations, show a simple message
    if (!window.knownLocations || window.knownLocations.length === 0) {
      container.innerHTML = "<p>No known locations available.</p>";
      return;
    }

    // Otherwise, build an <ul>
    const ul = document.createElement("ul");

    window.knownLocations.forEach((loc, i) => {
      const li = document.createElement("li");
      li.innerHTML = `
        <div class="box">
        ${loc.name}<br />${loc.address1}
        <!-- you can display any other 'details' from loc.details -->
        </div>
      `;
      ul.appendChild(li);
    });

    container.appendChild(ul);
  }