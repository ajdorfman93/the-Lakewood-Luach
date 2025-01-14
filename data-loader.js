(function () {
  // Store global data in a global object
  window.globalData = {
    restaurants: [],
    businesses: [],
    minyanim: [] // If you have minyanim data, load it here too
  };

  // This map holds category => Set of subTypes
  window.bizCategoryMap = {};

  document.addEventListener("DOMContentLoaded", async function () {
    try {
      // 1) Load Restaurants
      const restResp = await fetch("restaurants.json");
      if (!restResp.ok) throw new Error("Failed to load restaurants.json");
      const restJson = await restResp.json();
      // Store them in globalData (adjust if your JSON differs)
      globalData.restaurants = restJson.records || [];

      // 2) Load Businesses
      const busResp = await fetch("businesses.json");
      if (!busResp.ok) throw new Error("Failed to load businesses.json");
      const busJson = await busResp.json();
      globalData.businesses = busJson.records || [];

      // (Optional) 3) Load Minyanim
      // const minyResp = await fetch("minyanim.json");
      // if (!minyResp.ok) throw new Error("Failed to load minyanim.json");
      // const minyJson = await minyResp.json();
      // globalData.minyanim = minyJson.records || [];

      // 4) Build our map of categories => subTypes for businesses
      buildBusinessCategoryMap(globalData.businesses);

      // 5) Create the primary category buttons for businesses
      createPrimaryCatButtons();

      console.log("All JSON data loaded into globalData, and category map is built!");
    } catch (err) {
      console.error("Error loading data:", err);
    }
  });

  /**
   * Build a map:  { "Accounting": Set(["Accountants", "Bookkeeping"]), ... }
   * Each record's f.Categories can have multiple entries, e.g. ["Accounting", "Tax Service"]
   */
  function buildBusinessCategoryMap(bizArray) {
    for (const rec of bizArray) {
      const f = rec.fields || {};
      const catArr = Array.isArray(f.Categories) ? f.Categories : [];
      const subTyp = (f.strTyp || "").trim();

      catArr.forEach((cat) => {
        const catName = cat.trim();
        if (!catName) return;

        if (!bizCategoryMap[catName]) {
          bizCategoryMap[catName] = new Set();
        }

        // If we have a sub-type (f.strTyp), add it to that category's set
        if (subTyp) {
          bizCategoryMap[catName].add(subTyp);
        }
      });
    }
  }

  /**
   * Dynamically create one button per primary category,
   * putting them inside #businessPrimaryContainer.
   */
  function createPrimaryCatButtons() {
    const container = document.getElementById("businessPrimaryContainer");
    if (!container) return;

    // bizCategoryMap keys => distinct categories
    Object.keys(bizCategoryMap).forEach((catName) => {
      const btn = document.createElement("button");
      btn.classList.add("biz-primary-cat");
      btn.dataset.value = catName;
      btn.textContent = catName;
      container.appendChild(btn);
    });
  }
})();
