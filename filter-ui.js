// filter-ui.js
(function() {
  const filterState = {
    category: null,        // "minyanim", "restaurants", or "businesses"
    denomination: null,    // used by minyanim
    prayerType: null,      // used by minyanim
    cuisine: null,         // used by restaurants
    service: null,         // used by restaurants

    // For "businesses" (single select)
    primaryCat: "",  // chosen category (string)
    subType: ""      // chosen strTyp (string)
  };

  // ===============================
  //  DOMContentLoaded
  // ===============================
  document.addEventListener("DOMContentLoaded", function() {
    // Check if globalData is loaded
    if (!window.globalData || !Array.isArray(globalData.minyanim) || !Array.isArray(globalData.restaurants) || !Array.isArray(globalData.businesses)) {
      console.warn("No globalData or missing arrays (minyanim/restaurants/businesses).");
    }

    // 1) Listen for main category buttons
    document.querySelectorAll(".category-button").forEach(btn => {
      btn.addEventListener("click", () => {
        filterState.category = btn.dataset.category;
        resetSubfilters(filterState.category);
        showRelevantFilters(filterState.category);

        // If user clicked "businesses", populate the dropdowns now
        if (filterState.category === "businesses") {
          initBusinessFilters();
        }

        // Finally, run the overall filter
        runFilterAndDisplay();
      });
    });

    // 2) Minyanim subfilters
    document.querySelectorAll(".nusach-button").forEach(b => {
      b.addEventListener("click", () => {
        const val = (b.dataset.nusach || "").trim();
        filterState.denomination = val.toLowerCase() === "all" ? null : val;
        runFilterAndDisplay();
      });
    });
    document.querySelectorAll(".tefilah-button").forEach(b => {
      b.addEventListener("click", () => {
        filterState.prayerType = (b.dataset.tefilah || "").trim().toLowerCase();
        runFilterAndDisplay();
      });
    });

    // 3) Restaurants subfilters (cuisine, service, etc.)
    document.querySelectorAll(".rest-cuisine").forEach(b => {
      b.addEventListener("click", () => {
        filterState.cuisine = (b.dataset.value || "").trim();
        runFilterAndDisplay();
      });
    });
    watchPricePointDiv(); // Watches the <div id="selectedPricePointOptions"> changes

    // Note: We do **not** call initBusinessFilters() here by default,
    //       only when user actually clicks "businesses".
  });

  // ===============================
  //  RESET SUBFILTERS
  // ===============================
  function resetSubfilters(chosenCat) {
    // Minyanim filters
    if (chosenCat !== "minyanim") {
      filterState.denomination = null;
      filterState.prayerType = null;
    }
    // Restaurant filters
    if (chosenCat !== "restaurants") {
      filterState.cuisine = null;
      filterState.service = null;
    }
    // Businesses filters
    if (chosenCat !== "businesses") {
      filterState.primaryCat = "";
      filterState.subType = "";
    }
  }

  // ===============================
  //  SHOW/HIDE FILTER SECTIONS
  // ===============================
  function showRelevantFilters(cat) {
    document.getElementById("minyanimFilters").style.display    = (cat === "minyanim")    ? "block" : "none";
    document.getElementById("restaurantsFilters").style.display = (cat === "restaurants") ? "block" : "none";
    document.getElementById("businessesFilters").style.display  = (cat === "businesses")  ? "block" : "none";
  }

  // ===============================
  //  MAIN: RUN FILTER & DISPLAY
  // ===============================
  function runFilterAndDisplay() {
    const cat = filterState.category;
    if (!cat) {
      updateOutput([]);
      if (typeof drawMarkers === "function") drawMarkers([]);
      return;
    }

    let rawData = [];
    if (cat === "minyanim") {
      rawData = (globalData.minyanim || []).slice();
    } else if (cat === "restaurants") {
      rawData = (globalData.restaurants || []).slice();
    } else if (cat === "businesses") {
      rawData = (globalData.businesses || []).slice();
    }

    let finalRecords = [];
    // Filter logic per category
    if (cat === "minyanim") {
      finalRecords = filterMinyanim(rawData);
      finalRecords = mergeMinyanimByTefilahAndAddress(finalRecords); 
    } else if (cat === "restaurants") {
      finalRecords = filterRestaurants(rawData);
    } else if (cat === "businesses") {
      finalRecords = filterBusinessesDynamic(rawData);
    }

    // Convert each to a marker
    const finalItems = finalRecords.map(r => recordToMarker(r, cat));
    updateOutput(finalItems);

    // Optional: draw on map
    if (typeof drawMarkers === "function") {
      drawMarkers(finalItems);
    }
  }

  // ===============================
  //  MINYANIM FILTER
  // ===============================
  function filterMinyanim(records) {
    return records.filter(rec => {
      const f = rec.fields || {};
      // Denomination
      if (filterState.denomination) {
        const actualNusach = (f.Nusach || "").toLowerCase();
        const desired = filterState.denomination.toLowerCase();
        if (actualNusach !== desired) return false;
      }
      // Prayer type
      if (filterState.prayerType) {
        const arr = parseTefilahArray(f.Tefilah_Tefilahs || f.Tefilah);
        if (!arr.includes(filterState.prayerType)) return false;
      }
      return true;
    });
  }

  function mergeMinyanimByTefilahAndAddress(records) {
    // your existing logic, if needed...
    return records;
  }

  // ===============================
  //  RESTAURANTS FILTER
  // ===============================
  function filterRestaurants(records) {
    // Build dynamic service options
    const serviceSet = new Set();
    records.forEach(r => {
      const f = r.fields || {};
      (f.Type || []).forEach(t => {
        // skip "L" if needed
        if ((t || "").toLowerCase() !== "l") {
          serviceSet.add(t.trim());
        }
      });
    });

    // Populate the #service-options-container
    const container = document.getElementById("service-options-container");
    if (container) {
      container.innerHTML = "";
      serviceSet.forEach(typeVal => {
        const btn = document.createElement("button");
        btn.className = "rest-service";
        btn.dataset.value = typeVal;
        btn.textContent = typeVal;
        if (filterState.service && filterState.service.toLowerCase() === typeVal.toLowerCase()) {
          btn.classList.add("active");
        }
        btn.addEventListener("click", e => {
          container.querySelectorAll(".rest-service").forEach(sib => sib.classList.remove("active"));
          e.currentTarget.classList.add("active");
          filterState.service = typeVal;
          runFilterAndDisplay();
        });
        container.appendChild(btn);
      });
    }

    // Gather price points from #selectedPricePointOptions
    let selectedPricePoints = [];
    const spDiv = document.getElementById("selectedPricePointOptions");
    if (spDiv) {
      const rawText = spDiv.textContent.trim();
      if (rawText) {
        selectedPricePoints = rawText.split(",").map(pt => pt.trim());
      }
    }

    // Now do the actual record filtering
    return records.filter(r => {
      const f = r.fields || {};

      // price points
      if (selectedPricePoints.length > 0) {
        if (!selectedPricePoints.includes(f.Price_Point_Option_2)) {
          return false;
        }
      }
      // cuisine
      if (filterState.cuisine) {
        const actual = (f.Dairy_Meat || "").toLowerCase();
        const desired = filterState.cuisine.toLowerCase();
        if (desired === "meat") {
          if (!actual.includes("meat") && !actual.includes("fleishig")) {
            return false;
          }
        } else if (desired === "dairy") {
          if (!actual.includes("dairy") && !actual.includes("milchig")) {
            return false;
          }
        }
      }
      // service
      if (filterState.service) {
        const recordTypes = (f.Type || []).map(t => t.toLowerCase()).filter(t => t !== "l");
        if (!recordTypes.includes(filterState.service.toLowerCase())) {
          return false;
        }
      }
      return true;
    });
  }

  // ===============================
  //  BUSINESSES FILTER: INIT
  // ===============================
  function initBusinessFilters() {
    // Single-select dropdowns
    const catSelect = document.getElementById("businessCategorySelect");
    const strTypSelect = document.getElementById("businessStrTypSelect");
    if (!catSelect || !strTypSelect) {
      console.warn("Business filter selects not found in DOM.");
      return;
    }

    // Reset them
    catSelect.innerHTML = "<option value=''>-- Select Category --</option>";
    strTypSelect.innerHTML = "<option value=''>-- Select Type --</option>";

    // Make sure we have data
    if (!window.globalData || !Array.isArray(globalData.businesses) || !globalData.businesses.length) {
      console.warn("No globalData.businesses or it's empty.");
      return;
    }

    // 1) Gather all unique categories
    const categorySet = new Set();
    globalData.businesses.forEach(item => {
      const f = item.fields || {};
      const cats = f.Categories || [];
      cats.forEach(c => {
        // skip empty or "L" if needed
        if (c && c.trim() !== "L") {
          categorySet.add(c.trim());
        }
      });
    });

    const allCategories = Array.from(categorySet).sort();

    // 2) Populate catSelect with those categories
    allCategories.forEach(catName => {
      const opt = document.createElement("option");
      opt.value = catName;
      opt.textContent = catName;
      catSelect.appendChild(opt);
    });

    // 3) On change => update filterState.primaryCat and re-populate the strTyp dropdown
    catSelect.addEventListener("change", () => {
      filterState.primaryCat = catSelect.value || "";
      populateBusinessStrTyps(strTypSelect, filterState.primaryCat);
      // reset the subType
      filterState.subType = "";
      runFilterAndDisplay();
    });

    // 4) On strTyp change => filter
    strTypSelect.addEventListener("change", () => {
      filterState.subType = strTypSelect.value || "";
      runFilterAndDisplay();
    });
  }

  // Populate the strTyp <select> based on the chosen category
  function populateBusinessStrTyps(strTypSelect, chosenCat) {
    // Clear old
    strTypSelect.innerHTML = "<option value=''>-- Select Type --</option>";
    if (!chosenCat) return;

    // Collect all strTyp that appear in that category
    const strTypSet = new Set();
    (globalData.businesses || []).forEach(biz => {
      const f = biz.fields || {};
      const catArr = f.Categories || [];
      if (catArr.includes(chosenCat)) {
        // This record has the chosen category
        if (f.strTyp) {
          strTypSet.add(f.strTyp.trim());
        }
      }
    });

    // Populate
    Array.from(strTypSet).sort().forEach(st => {
      const opt = document.createElement("option");
      opt.value = st;
      opt.textContent = st;
      strTypSelect.appendChild(opt);
    });
  }

  // ===============================
  //  BUSINESSES FILTER: APPLY
  // ===============================
  function filterBusinessesDynamic(records) {
    return records.filter(r => {
      const f = r.fields || {};
      const cats = f.Categories || [];

      // Must match chosen category (if any)
      if (filterState.primaryCat) {
        if (!cats.includes(filterState.primaryCat)) {
          return false;
        }
      }
      // Must match chosen strTyp (if any)
      if (filterState.subType) {
        if ((f.strTyp || "").trim() !== filterState.subType) {
          return false;
        }
      }
      return true;
    });
  }

  // ===============================
  //  RECORD => MARKER
  // ===============================
  function recordToMarker(rec, cat) {
    const f = rec.fields || {};
    let latNum = parseFloat(f.Lat);
    let lngNum = parseFloat(f.Lng);
    if (isNaN(latNum) || isNaN(lngNum)) {
      latNum = 40.095;
      lngNum = -74.222;
    }

    let html = "";
    if (cat === "minyanim") {
      const name = f.StrShulName2 || f.Shul_Name || "Unknown Shul";
      html = `
        <div>
          <strong>Shul:</strong> ${name}<br/>
          Nusach: ${f.Nusach || ""}<br/>
          Address: ${f.Address || ""}
        </div>
      `;
    } else if (cat === "restaurants") {
      const name = f.Name || "Some Restaurant";
      html = `
        <div>
          <strong>Restaurant:</strong><h6>${name}</h6><br/>
          Address: ${f.Address || ""}<br/>
          Phone: ${f.Phone_Number || ""}
        </div>
      `;
    } else if (cat === "businesses") {
      const name = f.Name || "Some Business";
      const c = (f.Categories || []).join(", ");
      html = `
        <div>
          <small>Business:</small> <h6>${name}</h6>
          Categories: ${c}<br/>
          ${f.strTyp || ""}<br/>
          <h5>${f.Phone || ""}</h5>
        </div>
      `;
    }

    return { lat: latNum, lng: lngNum, html };
  }

  // ===============================
  //  OUTPUT JSON (for debugging)
  // ===============================
  function updateOutput(items) {
    const outEl = document.querySelector("#output pre");
    if (outEl) {
      outEl.textContent = JSON.stringify(items, null, 2);
    }
  }

  // ===============================
  //  UTILS
  // ===============================
  function parseTefilahArray(raw) {
    if (!raw) return [];
    if (Array.isArray(raw)) {
      return raw.map(s => s.toLowerCase());
    }
    if (typeof raw === "string") {
      try {
        return JSON.parse(raw.replace(/'/g, '"')).map(s => s.toLowerCase());
      } catch {
        return [raw.toLowerCase()];
      }
    }
    return [String(raw).toLowerCase()];
  }

  function watchPricePointDiv() {
    const spDiv = document.getElementById("selectedPricePointOptions");
    if (!spDiv) return;
    const observer = new MutationObserver(() => {
      runFilterAndDisplay();
    });
    observer.observe(spDiv, {
      childList: true,
      subtree: true,
      characterData: true
    });
  }
})();
