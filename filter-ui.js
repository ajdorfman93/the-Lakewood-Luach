// filter-ui.js

(function() {
  // ===============================
  //  GLOBAL FILTER STATE
  // ===============================
  const filterState = {
    category: null,        // "minyanim", "restaurants", or "businesses"
    denomination: null,    // used by minyanim
    prayerType: null,      // used by minyanim
    cuisine: null,         // used by restaurants
    service: null,         // used by restaurants

    // For "businesses" (single select)
    primaryCat: "",        // chosen category
    subType: "",            // chosen strTyp
  };

  // ===============================
  //  DOMContentLoaded
  // ===============================
  document.addEventListener("DOMContentLoaded", function() {
    // Check if globalData is loaded
    if (!window.globalData ||
        !Array.isArray(globalData.minyanim) ||
        !Array.isArray(globalData.restaurants) ||
        !Array.isArray(globalData.businesses)) {
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

    // Restaurants subfilters (cuisine, service, etc.)
    document.querySelectorAll(".rest-cuisine").forEach(b => {
      b.addEventListener("click", () => {
        filterState.cuisine = (b.dataset.value || "").trim();
        runFilterAndDisplay();
      });
    });

    // Watch the <div id="selectedPricePointOptions">
    watchPricePointDiv();
  });

  // ===============================
  //  RESET SUBFILTERS WHEN MAIN CATEGORY CHANGES
  // ===============================
  function resetSubfilters(chosenCat) {
    // Minyanim
    if (chosenCat !== "minyanim") {
      filterState.denomination = null;
      filterState.prayerType = null;
    }
    // Restaurants
    if (chosenCat !== "restaurants") {
      filterState.cuisine = null;
      filterState.service = null;
    }
    // Businesses
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
      // Clear everything
      updateOutput([]);
      displayKnownLocations([]);
      if (typeof drawMarkers === "function") {
        drawMarkers([]);
      }
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

    // Filter
    let finalRecords = [];
    if (cat === "minyanim") {
      finalRecords = rawData; // no custom minyan filters yet
    }
    else if (cat === "restaurants") {
      finalRecords = filterRestaurants(rawData);
    }
    else if (cat === "businesses") {
      finalRecords = filterBusinessesDynamic(rawData);
    }

    // Convert each to marker data
    const finalItems = finalRecords.map(r => recordToMarker(r, cat));

    // Update debug snippet + known-locations
    updateOutput(finalRecords, cat);
    displayKnownLocations(finalRecords, cat);

    // Draw map markers
    if (typeof drawMarkers === "function") {
      drawMarkers(finalItems);
    }
  }

  // ===============================
  //  RESTAURANTS FILTER
  // ===============================
  function filterRestaurants(records) {
    // Build dynamic "service" options
    const serviceSet = new Set();
    records.forEach(r => {
      const f = r.fields || {};
      (f.Type || []).forEach(t => {
        if ((t || "").toLowerCase() !== "l") {
          serviceSet.add(t.trim());
        }
      });
    });

    // Populate #service-options-container
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

    // Price points from #selectedPricePointOptions
    let selectedPricePoints = [];
    const spDiv = document.getElementById("selectedPricePointOptions");
    if (spDiv) {
      const rawText = spDiv.textContent.trim();
      if (rawText) {
        selectedPricePoints = rawText.split(",").map(pt => pt.trim());
      }
    }

    return records.filter(r => {
      const f = r.fields || {};

      // Price point
      if (selectedPricePoints.length > 0) {
        if (!selectedPricePoints.includes(f.Price_Point_Option_2)) {
          return false;
        }
      }
      // Cuisine filter
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
      // Service type filter
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
    const catSelect = document.getElementById("businessCategorySelect");
    const strTypSelect = document.getElementById("businessStrTypSelect");
    if (!catSelect || !strTypSelect) {
      console.warn("Business filter selects not found.");
      return;
    }

    // Reset
    catSelect.innerHTML = "<option value=''>-- Select Category --</option>";
    strTypSelect.innerHTML = "<option value=''>-- Select Type --</option>";

    // Make sure we have data
    if (!window.globalData || !Array.isArray(globalData.businesses) || !globalData.businesses.length) {
      console.warn("No globalData.businesses or it's empty.");
      return;
    }

    // Gather all unique categories
    const categorySet = new Set();
    globalData.businesses.forEach(item => {
      const f = item.fields || {};
      (f.Categories || []).forEach(c => {
        if (c && c.trim() !== "L") {
          categorySet.add(c.trim());
        }
      });
    });

    const allCategories = Array.from(categorySet).sort();
    allCategories.forEach(catName => {
      const opt = document.createElement("option");
      opt.value = catName;
      opt.textContent = catName;
      catSelect.appendChild(opt);
    });

    catSelect.addEventListener("change", () => {
      filterState.primaryCat = catSelect.value || "";
      populateBusinessStrTyps(strTypSelect, filterState.primaryCat);
      filterState.subType = "";
      runFilterAndDisplay();
    });

    strTypSelect.addEventListener("change", () => {
      filterState.subType = strTypSelect.value || "";
      runFilterAndDisplay();
    });
  }

  function populateBusinessStrTyps(strTypSelect, chosenCat) {
    strTypSelect.innerHTML = "<option value=''>-- Select Type --</option>";
    if (!chosenCat) return;

    const strTypSet = new Set();
    (globalData.businesses || []).forEach(biz => {
      const f = biz.fields || {};
      const catArr = f.Categories || [];
      if (catArr.includes(chosenCat)) {
        if (f.strTyp) {
          strTypSet.add(f.strTyp.trim());
        }
      }
    });

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

      // Must match chosen primaryCat
      if (filterState.primaryCat) {
        if (!cats.includes(filterState.primaryCat)) {
          return false;
        }
      }
      // Must match chosen subType
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
    const latNum = parseFloat(f.Lat) || 40.095;
    const lngNum = parseFloat(f.Lng) || -74.222;

    // Prepare name & infoWindow HTML
    let name = "";
    let html = "";

    // We'll also store new fields for knownLocations + marker properties

    if (cat === "minyanim") {
      name = f.Name || "Some Minyan";
      html = `
        <div class="box">
          <small>Denomination: ${f.Denomination || ""}</small><br/>
          <small>Prayer Type: ${f.Prayer_Type || ""}</small><br/>
          <h5>${f.Address || ""}</h5>
        </div>
      `;
      return {
        head: name,
        html,
        category: "minyan",
        lat: latNum,
        lng: lngNum,
      };
    }
    else if (cat === "restaurants") {
      // Required fields from your request:
      // Address1, Phone_Number, Weekday, Weekend, Dairy_Meat, Website, Price_Point_Option_2
      name = f.Name || "Some Restaurant";
      const address1 = f.Address || "";
      const phoneNumber = f.Phone_Number || "";
      const weekday = f.Weekday || "";
      const weekend = f.Weekend || "";
      const dairyMeat = f.Dairy_Meat || "";
      const website = f.Website || "";
      const pricePoint = f.Price_Point_Option_2 || "";

      html = `
        <div class="box">
          <small>${dairyMeat}</small></br>
          <small>${pricePoint}</small>
          <h5>${address1}</h5>
          ${phoneNumber}
          <h5><strong>Weekday Hours:</strong> ${weekday}</h5>
          <h5><strong>Weekend Hours:</strong> ${weekend}</h5>
          <h5><a href="${website}">${website}</a></h5>
        </div>
      `;

      return {
        head: name,
        html,
        category: "restaurants",
        lat: latNum,
        lng: lngNum,

        // For knownLocations:
        address1,
        phoneNumber,
        weekday,
        weekend,
        dairyMeat,
        website,
        pricePoint
      };
    }
    else if (cat === "businesses") {
      // Required fields from your request:
      // strTyp, Categories, Website, Email, Phone, Fax
      name = f.Name || "Some Business";
      const categories = (f.Categories || [])
      .filter(c => c.trim() !== "L")
      .join(", ");
      const website = f.Website || "";
      const email = f.Email || "";
      const phone = f.Phone || "";
      const fax = f.Fax || "";
      const strTyp = f.strTyp || "";
      const address1 = f.Address1 && f.Address1.trim() !== "" ? f.Address2 : null;
      const sponsored = f.Sponsored || "";
      const logo = f.Logo || "";


      html = `
        <div class="box">
          <small>${categories}</small>
          <h5>${strTyp}</h5>
          <h5><span class="fa fa-phone"></span>${phone}</h5>
          ${fax}
          <h5>${email}</h5>
          <h5><a href="${website}">${website}</a></h5>          
          <h5>${address1}</h5>
          <h5 style="display: none">${sponsored}</h5>
          <img src="${logo}" style="width:80px; height:auto; position: absolute; top: 32px; right: 0;">
        </div>
      `;

      return {
        head: name,
        html,
        category: "businesses",
        lat: latNum,
        lng: lngNum,

        // For knownLocations:
        strTyp,
        categories,
        website,
        email,
        phone,
        fax,
        address1,
        sponsored,
        logo
      };
    }

    // Fallback
    return {
      head: "(No Name)",
      html: "<div class='box'>(No Data)</div>",
      category: cat,
      lat: latNum,
      lng: lngNum,
    };
  }

  // ===============================
  //  DISPLAY KNOWN LOCATIONS
  // ===============================
  function displayKnownLocations(records, cat) {
    const container = document.getElementById("knownLocations");
    if (!container) return;

    container.innerHTML = "";
    if (!records || !records.length) {
      container.innerHTML = "<p>No records found.</p>";
      return;
    }

    records.forEach(r => {
      const f = r.fields || {};
      let block = "";

      if (cat === "restaurants") {
        block = `
          <div class="box">
            <h2>${f.Name || ""}</h2>
            <h5> ${f.Address || ""}</h5>
            <h5><strong>Phone:</strong> ${f.Phone_Number || ""}</h5>
            <h5><strong>Weekday:</strong> ${f.Weekday || ""}</h5>
            <h5><strong>Weekend:</strong> ${f.Weekend || ""}</h5>
            <h5><strong>Type:</strong> ${f.Dairy_Meat || ""}</h5>
            <h5><strong>Price Range:</strong> ${f.Price_Point_Option_2 || ""}</h5>
            <h5><strong>Website:</strong> ${f.Website || ""}</h5>
          </div>
        `;
      }
      else if (cat === "businesses") {
        const c = (f.Categories || []).join(", ");
        block = `
          <div class="box">
            <h5><strong>${f.Name || ""}</strong></h5>
            <p><strong>Categories:</strong> ${c}</p>
            <p><strong>Type:</strong> ${f.strTyp || ""}</p>
            <p><strong>Phone:</strong> ${f.Phone || ""}</p>
            <p><strong>Fax:</strong> ${f.Fax || ""}</p>
            <p><strong>Email:</strong> ${f.Email || ""}</p>
            <p><strong>Website:</strong> ${f.Website || ""}</p>
          </div>
        `;
      }
      else if (cat === "minyanim") {
        block = `
          <div class="box">
            <h5><strong>${f.Name || "Some Minyan"}</strong></h5>
            <p>${f.Address || ""}</p>
          </div>
        `;
      }

      container.innerHTML += block;
    });
  }

  // ===============================
  //  OUTPUT PRE (DEBUG VIEW)
  // ===============================
  function updateOutput(records, cat) {
    const outEl = document.querySelector("#output pre");
    if (!outEl) return;

    if (!records || !records.length) {
      outEl.textContent = "[]";
      return;
    }

    let outputHtml = "";
    // Build a snippet for each record
    records.forEach(r => {
      const f = r.fields || {};
      if (cat === "restaurants") {
        outputHtml += `
          <div class="box">
            <p><strong>${f.Name || ""}</strong></p>
            <p>${f.Address || ""}</p>
            <p>Phone: ${f.Phone_Number || ""}</p>
            <p>Weekday: ${f.Weekday || ""}</p>
            <p>Weekend: ${f.Weekend || ""}</p>
            <p>Type: ${f.Dairy_Meat || ""}</p>
            <p>Price: ${f.Price_Point_Option_2 || ""}</p>
            <p>Website: ${f.Website || ""}</p>
          </div>
        `;
      }
      else if (cat === "businesses") {
        const c = (f.Categories || []).join(", ");
        outputHtml += `
          <div class="box">
            <p><strong>${f.Name || ""}</strong></p>
            <p>Categories: ${c}</p>
            <p>Type: ${f.strTyp || ""}</p>
            <p>Phone: ${f.Phone || ""}</p>
            <p>Fax: ${f.Fax || ""}</p>
            <p>Email: ${f.Email || ""}</p>
            <p>Website: ${f.Website || ""}</p>
          </div>
        `;
      }
      else if (cat === "minyanim") {
        outputHtml += `
          <div class="box">
            <p><strong>${f.Name || "Some Minyan"}</strong></p>
            <p>${f.Address || ""}</p>
          </div>
        `;
      }
    });

    outEl.innerHTML = outputHtml;
  }

  // ===============================
  //  WATCH PRICE POINT DIV (IF ANY)
  // ===============================
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
