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

/**
 * Converts an ISO date-string to "HH:MM" (24-hour),
 * then to "h:mm AM/PM" using our custom function.
 */
function formatTime(isoString) {
  const date = new Date(isoString);
  const time24 = date.toTimeString().slice(0, 5); // e.g. "13:05"
  return convertToAmPmZmanim(time24);
}

/**
 * Renamed function to avoid conflict:
 * Convert "HH:mm" (24-hour) => "h:mm AM/PM"
 */
function convertToAmPmZmanim(time24) {
  if (typeof time24 !== 'string') {
    console.warn("convertToAmPmZmanim() expected a string, got:", time24);
    return '';
  }
  const [hoursStr, minutesStr] = time24.split(':');
  let hours = parseInt(hoursStr, 10);
  const minutes = parseInt(minutesStr, 10);

  const suffix = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12 || 12;
  return `${hours}:${String(minutes).padStart(2, '0')} ${suffix}`;
}

setDateToToday();

datePicker.addEventListener("change", () => {
  const selectedDate = datePicker.value;
  if (selectedDate) {
    fetchZmanim(selectedDate);
  }
});
// --- End of integrated Zmanim code ---
