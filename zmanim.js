// --- Integrated Zmanim for today's date ---
function setDateToToday() {
  const today = new Date();
  const formattedDate = today.toISOString().split("T")[0];
  datePicker.value = formattedDate;
  fetchZmanim(formattedDate);
}

async function fetchZmanim(date) {
  const url = `https://www.hebcal.com/zmanim?cfg=json&geonameid=5100280&date=${date}`;
  try {
      const response = await fetch(url);
      if (!response.ok) {
          throw new Error(`Network response was not ok: ${response.statusText}`);
      }
      const data = await response.json();

      // Map of Zmanim to element IDs
      const zmanimMapping = {
          dawn: "dawn",
          misheyakirMachmir: "misheyakirMachmir",
          sunrise: "sunrise",
          sofZmanShmaMGA: "sofZmanShmaMGA",
          sofZmanShma: "sofZmanShma",
          sofZmanTfilla: "sofZmanTfilla",
          chatzot: "chatzot",
          minchaGedola: "minchaGedola",
          plagHaMincha: "plagHaMincha",
          sunset: "sunset",
          tzeit85deg: "tzeit85deg",
          tzeit72min: "tzeit72min",
      };

      for (const [timeKey, elementId] of Object.entries(zmanimMapping)) {
          const timeValue = data.times[timeKey];
          if (timeValue && document.getElementById(elementId)) {
              document.getElementById(elementId).textContent = formatTime(timeValue);
          }
      }
  } catch (error) {
      console.error("Error fetching zmanim:", error);
  }
}

function formatTime(isoString) {
  const date = new Date(isoString);
  return date.toTimeString().slice(0, 5);
}

setDateToToday();

datePicker.addEventListener("change", () => {
  const selectedDate = datePicker.value;
  if (selectedDate) {
      fetchZmanim(selectedDate);
  }
});
// --- End of integrated Zmanim code ---
