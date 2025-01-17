// knownLocations.js

function displayKnownLocations() {
  const container = document.getElementById("locations-list");
  if (!container) return;

  // Clear out old content
  container.innerHTML = "";

  // If no known locations, show simple message
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

    // Check the category
    if (loc.category === "minyan") {
      // Show full minyan details
      li.innerHTML = `
        <div class="box">
          <strong>Name:</strong> ${loc.name}<br/>
          <strong>Time:</strong> ${loc.details.time}<br/>
          <strong>Address:</strong> ${loc.details.address}<br/>
          <strong>Nusach:</strong> ${loc.details.nusach}<br/>
          <strong>Tefilah:</strong> ${loc.details.tefilah}
        </div>
      `;
    }
    else if (loc.category === "restaurant") {
      // Show restaurant details
      const d = loc.details;
      li.innerHTML = `
        <div class="box">
          <strong>Name:</strong> ${loc.name}<br/>
          ${d.foodType || ""}<br/>
          ${d.address || ""}<br/>
          ${d.phone || ""}
        </div>
      `;
    }
    else if (loc.category === "business") {
      // Show business details
      const d = loc.details;
      li.innerHTML = `
        <div class="box">
          <strong>Name:</strong> ${loc.name}<br/>
          ${d.description || ""}<br/>
          ${d.subCategory || ""}<br/>
          ${d.phone || ""}
        </div>
      `;
    }
    else {
      // Fallback if no recognized category
      li.innerHTML = `
        <div class="box">
          <strong>Name:</strong> ${loc.name}<br/>
          (No extra details)
        </div>
      `;
    }

    ul.appendChild(li);
  });

  container.appendChild(ul);
}
