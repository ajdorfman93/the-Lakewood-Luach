(function(){
    window.globalData = {
      minyanim: [],
      restaurants: [],
      businesses: []
    };
  
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
  
        // After loading, build dynamic buttons for business categories & sub-types
        buildBusinessFilterButtons(globalData.businesses);
  
        console.log("All JSON data loaded into globalData!");
      } catch(err) {
        console.error("Error loading data:", err);
      }
    });
  
    /**
     * Build unique sets of primary categories (fields.Categories) and sub-types (fields.strTyp).
     * Create <button> elements inside #businessPrimaryContainer and #businessSubTypeContainer.
     */
    function buildBusinessFilterButtons(bizArray) {
      const primaryDiv = document.getElementById("businessPrimaryContainer");
      const subTypeDiv = document.getElementById("businessSubTypeContainer");
      if (!primaryDiv || !subTypeDiv) return;
  
      const primarySet = new Set();
      const subTypeSet = new Set();
  
      for (const rec of bizArray) {
        const f = rec.fields || {};
        // f.Categories might be array: ["Professional Services","Marketing & Media"]
        if (Array.isArray(f.Categories)) {
          for (const catName of f.Categories) {
            if (catName) primarySet.add(catName.trim());
          }
        }
        // f.strTyp => e.g. "Accountants"
        if (f.strTyp) {
          subTypeSet.add(f.strTyp.trim());
        }
      }
  
      // Now build the primary-cat buttons
      primarySet.forEach(catName => {
        const btn = document.createElement("button");
        btn.classList.add("biz-primary-cat"); // we'll listen for this class
        btn.dataset.value = catName;
        btn.textContent = catName;
        primaryDiv.appendChild(btn);
      });
  
      // Build the sub-type buttons
      subTypeSet.forEach(stName => {
        const btn = document.createElement("button");
        btn.classList.add("biz-subtype-cat"); // we'll listen for this class
        btn.dataset.value = stName;
        btn.textContent = stName;
        subTypeDiv.appendChild(btn);
      });
  
      console.log("Dynamic business buttons created!");
    }
  
  })();
  