// dynamic-filters.js
document.addEventListener("DOMContentLoaded", function(){

    // Wait a bit or ensure data is loaded. One approach is setTimeout or a MutationObserver,
    // or we can do a small "poll" until globalData.services is populated:
    setTimeout(initializeDropdowns, 500); 
  
    function initializeDropdowns() {
      const data = globalData.services || [];
      if (!data.length) {
        console.warn("No data yet. Possibly not loaded. Try again or increase delay.");
        return;
      }
  
      // 1) Gather unique primary categories from fields.Categories
      const primaryCatsSet = new Set();
      // 2) Gather unique sub-types from fields.strTyp
      const subTypesSet = new Set();
  
      data.forEach(rec => {
        const f = rec.fields || {};
        // Categories => array of strings
        if (Array.isArray(f.Categories)) {
          f.Categories.forEach(cat => primaryCatsSet.add(cat));
        }
        // strTyp => single string
        if (f.strTyp) {
          subTypesSet.add(f.strTyp);
        }
      });
  
      // Convert sets => arrays, sort them
      const primaryCats = Array.from(primaryCatsSet).sort();
      const subTypes    = Array.from(subTypesSet).sort();
  
      // 3) Populate the <select> for primary categories
      const primarySelect = document.getElementById("primarySelect");
      if (primarySelect) {
        primaryCats.forEach(cat => {
          const opt = document.createElement("option");
          opt.value = cat;
          opt.textContent = cat;
          primarySelect.appendChild(opt);
        });
  
        primarySelect.addEventListener("change", onFiltersChange);
      }
  
      // 4) Populate the <select> for subType
      const subTypeSelect = document.getElementById("subTypeSelect");
      if (subTypeSelect) {
        subTypes.forEach(st => {
          const opt = document.createElement("option");
          opt.value = st;
          opt.textContent = st;
          subTypeSelect.appendChild(opt);
        });
  
        subTypeSelect.addEventListener("change", onFiltersChange);
      }
  
      console.log("Dropdowns initialized with dynamic data!");
    }
  
    // This function runs whenever a dropdown changes
    function onFiltersChange() {
      // 1) Read current selections
      const primaryVal = document.getElementById("primarySelect")?.value || "";
      const subTypeVal = document.getElementById("subTypeSelect")?.value || "";
  
      // 2) Filter data
      const raw = globalData.services || [];
      const filtered = raw.filter(rec => {
        const f = rec.fields || {};
  
        // If primaryVal is set => must be in f.Categories
        if (primaryVal) {
          if (!Array.isArray(f.Categories)) return false;
          if (!f.Categories.includes(primaryVal)) return false;
        }
        // If subTypeVal is set => must match f.strTyp
        if (subTypeVal) {
          if ((f.strTyp || "") !== subTypeVal) return false;
        }
        return true;
      });
  
      // 3) Convert => marker shape
      const finalMarkers = filtered.map(recordToMarker);
  
      // 4) Update output
      updateOutput(finalMarkers);
  
      // 5) Optionally draw markers
      if (typeof drawMarkers === "function") {
        drawMarkers(finalMarkers);
      }
    }
  
    /**
     * Convert each record => { lat, lng, html } for markers.
     * Adjust as needed for your fields. 
     */
    function recordToMarker(rec) {
      const f = rec.fields || {};
      let lat = parseFloat(f.Lat || 0);
      let lng = parseFloat(f.Lng || 0);
  
      if (isNaN(lat) || isNaN(lng) || (lat === 0 && lng === 0)) {
        lat = 40.095; // fallback
        lng = -74.222;
      }
  
      const nm   = f.Name || "Untitled";
      const addr = f.Address2 || "";
      const cat  = (f.Categories || []).join(", ");
      const st   = f.strTyp || "";
      const phone= f.Phone || "";
  
      const html = `
        <div>
          <strong>Name:</strong> ${nm}<br/>
          <strong>Categories:</strong> ${cat}<br/>
          <strong>Type (strTyp):</strong> ${st}<br/>
          <strong>Address2:</strong> ${addr}<br/>
          <strong>Phone:</strong> ${phone}
        </div>
      `;
  
      return { lat, lng, html };
    }
  
    // Display in #output <pre>
    function updateOutput(items) {
      const outEl = document.querySelector("#output pre");
      if (!outEl) return;
      outEl.textContent = JSON.stringify(items, null, 2);
    }
  
  })();
  