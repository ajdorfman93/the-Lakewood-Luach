// filter-ui.js
(function(){
  // Filter states
  const filterState = {
    category: null,        // 'minyanim', 'restaurants', 'businesses'
    denomination: null,    // "Sephardi", "Ashkenaz", "Chassidish"
    pricePoint: null,      // "Affordable", "Mid-range", "Premium"
    cuisine: null,         // "Dairy", "Meat"
    service: null,         // "Dine-in", "Takeout"
    bizType: null          // "Retail", "Services", "Wholesale"
  };

  document.addEventListener("DOMContentLoaded", function(){
    // MAIN CATEGORY Buttons
    document.querySelectorAll(".category-button").forEach(btn => {
      btn.addEventListener("click", () => {
        filterState.category = btn.dataset.category;
        resetSubfilters(filterState.category);
        showRelevantFilters(filterState.category);
        runFilterAndDisplay();
      });
    });

    // MINYANIM subfilters
    document.querySelectorAll(".minyanim-denomination").forEach(b => {
      b.addEventListener("click", () => {
        filterState.denomination = b.dataset.value;
        runFilterAndDisplay();
      });
    });

    // RESTAURANTS subfilters
    document.querySelectorAll(".rest-price").forEach(b => {
      b.addEventListener("click", () => {
        filterState.pricePoint = b.dataset.value;
        runFilterAndDisplay();
      });
    });
    document.querySelectorAll(".rest-cuisine").forEach(b => {
      b.addEventListener("click", () => {
        filterState.cuisine = b.dataset.value;
        runFilterAndDisplay();
      });
    });
    document.querySelectorAll(".rest-service").forEach(b => {
      b.addEventListener("click", () => {
        filterState.service = b.dataset.value;
        runFilterAndDisplay();
      });
    });

    // BUSINESSES subfilters
    const primaryDiv = document.getElementById("businessPrimaryContainer");
    if (primaryDiv) {
      primaryDiv.addEventListener("click", (e) => {
        if (e.target.classList.contains("biz-primary-cat")) {
          filterState.primaryCat = e.target.dataset.value;
          filterState.subType = null; // reset if switching primary cat
          buildBusinessSubTypes(filterState.primaryCat); 
          runFilterAndDisplay();
        }
      });
    }
   // Sub-types => .biz-subtype-cat, but we build them dynamically when picking primary
   const subDiv = document.getElementById("businessSubTypeContainer");
   if (subDiv) {
     subDiv.addEventListener("click", (e) => {
       if (e.target.classList.contains("biz-subtype-cat")) {
         filterState.subType = e.target.dataset.value;
         runFilterAndDisplay();
       }
     });
   }

    // Optionally default to "minyanim" or none:
    // filterState.category = "minyanim";
    // showRelevantFilters("minyanim");
    // runFilterAndDisplay();
  });

  /**
   * Clears subfilters for the *other* categories
   */
  function resetSubfilters(chosenCat) {
    if (chosenCat !== "minyanim") {
      filterState.denomination = null;
      filterState.prayerType = null;
    }
    if (chosenCat !== "restaurants") {
      filterState.pricePoint = null;
      filterState.cuisine = null;
      filterState.service = null;
    }
    if (chosenCat !== "businesses") {
      filterState.primaryCat = null;
      filterState.subType = null;
      const subDiv = document.getElementById("businessSubTypeContainer");
      if (subDiv) subDiv.innerHTML = "";
    }
  }

  // Show/hide the relevant filter panel
  function showRelevantFilters(cat) {
    document.getElementById("minyanimFilters").style.display    = (cat === "minyanim")    ? "block" : "none";
    document.getElementById("restaurantsFilters").style.display = (cat === "restaurants") ? "block" : "none";
    document.getElementById("businessesFilters").style.display  = (cat === "businesses")  ? "block" : "none";
  }
  function buildBusinessSubTypes(primaryCat) {
    const subDiv = document.getElementById("businessSubTypeContainer");
    if (!subDiv) return;
    subDiv.innerHTML = ""; // clear old

    if (!primaryCat || !window.bizCategoryMap[primaryCat]) return;

    const stSet = window.bizCategoryMap[primaryCat]; // a Set of e.g. "Accountants","Bookkeeping", ...
    stSet.forEach(stName => {
      const btn = document.createElement("button");
      btn.classList.add("biz-subtype-cat");
      btn.dataset.value = stName;
      btn.textContent = stName;
      subDiv.appendChild(btn);
    });
  }
  /**
   * Called whenever we change category or a subfilter.
   * Grabs the relevant data from globalData, applies filters, merges (for minyanim),
   * converts to marker shapes, updates the #output <pre>, and draws markers (if drawMarkers).
   */
  function runFilterAndDisplay() {
    const cat = filterState.category;
    if (!cat) {
      updateOutput([]);
      if (typeof drawMarkers === "function") drawMarkers([]);
      return;
    }

    let finalRecords = [];

    // 1) Based on category, get a fresh copy of the underlying data
    //    so we don't permanently modify times, etc.
    let rawData = [];
    if (cat === "minyanim") {
      rawData = globalData.minyanim.slice(); // shallow copy array
    } else if (cat === "restaurants") {
      rawData = globalData.restaurants.slice();
    } else if (cat === "businesses") {
      rawData = globalData.businesses.slice();
    }

    // 2) Filter
    if (cat === "minyanim") {
      finalRecords = filterMinyanim(rawData, filterState);
      finalRecords = applyStrCodeLogic(finalRecords);
      finalRecords = mergeMinyanimByTefilahAndAddress(finalRecords);
    } else if (cat === "restaurants") {
      finalRecords = filterRestaurants(rawData, filterState);
    } else if (cat === "businesses") {
      rawData = globalData.businesses.slice();
      finalRecords = filterBusinessesDynamic(rawData, filterState);
    }



    // 3) Convert => marker shape
    const finalItems = finalRecords.map(r => recordToMarker(r, cat));

    // 4) Show + draw
    updateOutput(finalItems);
    if (typeof drawMarkers === "function") {
      drawMarkers(finalItems);
    }
  }

  // ----------------- MINYANIM FILTERING -----------------
  function filterMinyanim(records, fs) {
    return records.filter(rec => {
      const f = rec.fields || {};
      // Denomination => f.Nusach
      if (fs.denomination) {
        if ((f.Nusach || "").toLowerCase() !== fs.denomination.toLowerCase()) {
          return false;
        }
      }
      // Tefilah => in f.Tefilah_Tefilahs
      if (fs.prayerType) {
        const arr = parseTefilahArray(f.Tefilah_Tefilahs || f.Tefilah);
        if (!arr.includes(fs.prayerType.toLowerCase())) return false;
      }
      return true;
    });
  }

  // Simplified code logic (#ST, #XRC, etc.)
  function applyStrCodeLogic(minyanRecords) {
    const dayOfWeek = new Date().getDay(); 
    const isRoshChodesh = false; // Hard-coded for demo

    // We can clone each record so we don't re-append times or modify originals
    const output = [];

    for (const rec of minyanRecords) {
      const f = rec.fields || {};
      const codes = parseStrCode(f.strCode);
      let exclude = false;

      for (const c of codes) {
        if (c === "#ST") {
          // #ST => Sunday..Thursday => exclude if dayOfWeek=5 (Fri) or 6 (Sat)
          if (dayOfWeek === 5 || dayOfWeek === 6) exclude = true;
        }
        if (c === "#XRC") {
          // Exclude on rosh chodesh
          if (isRoshChodesh) exclude = true;
        }
      }
      if (!exclude) output.push(rec);
    }

    return output;
  }

  function parseStrCode(strCode) {
    if (!strCode) return [];
    if (typeof strCode === "string") {
      try {
        return JSON.parse(strCode.replace(/'/g, '"'));
      } catch {
        return [strCode];
      }
    }
    if (Array.isArray(strCode)) return strCode;
    return [];
  }

  /**
   * Merge Minyanim that share Tefilah_Tefilahs + Address => combine "Time".
   * Important: we create brand-new objects so we don't permanently modify the original.
   */
  function mergeMinyanimByTefilahAndAddress(records) {
    // Step 1: transform each record into a "clone" so changes to Time won't accumulate
    const clones = records.map(r => {
      return JSON.parse(JSON.stringify(r)); 
      // deep clone => so we can safely modify r.fields.Time
    });

    const mapKey = new Map();

    for (const rec of clones) {
      const f = rec.fields || {};
      const tefArr = parseTefilahArray(f.Tefilah_Tefilahs || f.Tefilah).sort();
      const tefilahKey = tefArr.join("|");

      const addr = (f.Address || "").toLowerCase().trim();
      const key = tefilahKey + "::" + addr;

      if (!mapKey.has(key)) {
        // store times in an array
        mapKey.set(key, {
          recObj: rec,
          timesSet: new Set([ f.Time || "" ])
        });
      } else {
        const existing = mapKey.get(key);
        existing.timesSet.add(f.Time || "");
      }
    }

    // Step 2: build final array
    const merged = [];
    for (const { recObj, timesSet } of mapKey.values()) {
      const f = recObj.fields || {};
      // Convert timesSet => array => join
      const timesArr = Array.from(timesSet).filter(Boolean); 
      f.Time = timesArr.join(" | ");
      merged.push(recObj);
    }
    return merged;
  }

  // ----------------- RESTAURANTS -----------------
  function filterRestaurants(records, fs) {
    return records.filter(r => {
      const f = r.fields || {};
      if (fs.pricePoint) {
        const price = (f.Price_Point_Option_2 || "").toLowerCase();
        if (!price.includes(fs.pricePoint.toLowerCase())) return false;
      }
      if (fs.cuisine) {
        const actual = (f.Dairy_Meat || "").toLowerCase();
        const desired = fs.cuisine.toLowerCase();
        if (desired === "meat") {
          if (!actual.includes("meat") && !actual.includes("fleishig")) return false;
        } else if (desired === "dairy") {
          if (!actual.includes("dairy") && !actual.includes("milchig")) return false;
        }
      }
      // fs.service => not implemented
      return true;
    });
  }

  // -------------- BUSINESSES --------------
  function filterBusinessesDynamic(records, fs) {
    return records.filter(r => {
      const f = r.fields || {};

      // If user selected a primaryCat => must appear in f.Categories
      if (fs.primaryCat) {
        const catArr = Array.isArray(f.Categories) ? f.Categories.map(s => s.toLowerCase()) : [];
        if (!catArr.includes(fs.primaryCat.toLowerCase())) {
          return false;
        }
      }

      // If user selected a subType => must match f.strTyp
      if (fs.subType) {
        const st = (f.strTyp || "").toLowerCase();
        if (st !== fs.subType.toLowerCase()) return false;
      }

      return true;
    });
  }


  // ----------------- RECORD => MARKER ---------------
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
      const shul = f.StrShulName2 || f.Shul_Name || "Unknown Shul";
      const time = f.Time || "";
      const data = f.Address || "";
      html = `
      <div>
        <strong>Shul:</strong> ${shul}<br/>
        <strong>Time:</strong> ${time}<br/>
        <strong>Address:</strong> ${data}
      </div>
      `;
    } else if (cat === "restaurants") {
      const name = f.Name || "Some Restaurant";
      html = `
      <div>
        <strong>Restaurant:</strong> ${name}<br/>
        Address: ${f.Address || "No address"}<br/>
        Phone: ${f.Phone_Number || ""}<br/>
        Price_Point: ${f.Price_Point_Option_2 || ""}<br/>
        Dairy_Meat: ${f.Dairy_Meat || ""}
      </div>
      `;
    } else if (cat === "businesses") {
      const name = f.Name || "Some Business";
      const phone = f.Phone || "";
      html = `
      <div>
        <strong>Business:</strong> ${name}<br/>
        Category: ${f.Category || ""}<br/>
        Phone: ${phone}
      </div>
      `;
    }

    return {
      lat: latNum,
      lng: lngNum,
      html
    };
  }

  function updateOutput(items) {
    const outEl = document.querySelector("#output pre");
    if (outEl) {
      outEl.textContent = JSON.stringify(items, null, 2);
    }
  }

  // Reuse parse logic
  function parseTefilahArray(raw) {
    if (!raw) return [];
    if (Array.isArray(raw)) return raw.map(t => t.toLowerCase());
    if (typeof raw === "string") {
      try {
        return JSON.parse(raw.replace(/'/g, '"')).map(t => t.toLowerCase());
      } catch {
        return [raw.toLowerCase()];
      }
    }
    return [String(raw).toLowerCase()];
  }

})();
