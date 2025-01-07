(function(){
    window.globalData = {
      minyanim: [],
      restaurants: [],
      businesses: []
    };
    window.bizCategoryMap = {};
    document.addEventListener("DOMContentLoaded", async function(){
      try {
        // 1) Load Minyanim
        const ptResp = await fetch("prayertimes.json");
        if (!ptResp.ok) throw new Error("Failed to load prayertimes.json");
        const ptJson = await ptResp.json();
        globalData.minyanim = ptJson.records || [];
  
        // 2) Load Restaurants
        const restResp = await fetch("restaurants.json");
        if (!restResp.ok) throw new Error("Failed to load restaurants.json");
        const restJson = await restResp.json();
        // your snippet => restJson.records
        globalData.restaurants = restJson.records || [];
  
        // 3) Load Businesses
        const busResp = await fetch("businesses.json");
        if (!busResp.ok) throw new Error("Failed to load businesses.json");
        const busJson = await busResp.json();
        globalData.businesses = busJson.records || [];
  
        // 2) Build our big mapping for businesses
        buildBusinessCategoryMap(globalData.businesses);
  
        // 3) Create only the *Primary* category buttons (one for each unique category)
        createPrimaryCatButtons();
  
        console.log("All JSON data loaded into globalData (and category map built)!");
      } catch(err) {
        console.error("Error loading data:", err);
      }
    });
  
    /**
     * Creates a map of:
     *   bizCategoryMap[primaryCatName] = new Set of subTypes
     *
     * For each record, for each cat in fields.Categories => add fields.strTyp to that cat’s set.
     */
    function buildBusinessCategoryMap(bizArray) {
      for (const rec of bizArray) {
        const f = rec.fields || {};
        const catArr = Array.isArray(f.Categories) ? f.Categories : [];
        const subTyp = (f.strTyp || "").trim();
        catArr.forEach(cat => {
          const catName = cat.trim();
          if (!catName) return;
          if (!bizCategoryMap[catName]) {
            bizCategoryMap[catName] = new Set();
          }
          // e.g. "Accountants"
          if (subTyp) {
            bizCategoryMap[catName].add(subTyp);
          }
        });
      }
    }
  
    /**
     * Creates dynamic <button class="biz-primary-cat" data-value="..." /> for each key in bizCategoryMap
     * and appends to #businessPrimaryContainer
     */
    function createPrimaryCatButtons() {
      const container = document.getElementById("businessPrimaryContainer");
      if (!container) return;
  
      // The keys of bizCategoryMap are all the distinct categories
      Object.keys(bizCategoryMap).forEach(catName => {
        const btn = document.createElement("button");
        btn.classList.add("biz-primary-cat");
        btn.dataset.value = catName;
        btn.textContent = catName;
        container.appendChild(btn);
      });
    }
  
  })();
  