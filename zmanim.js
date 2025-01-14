    // ------------------------
    // 1) Integrated Zmanim
    // ------------------------
    async function fetchZmanim(date) {
      const url = `https://www.hebcal.com/zmanim?cfg=json&geonameid=5100280&date=${date}`;
      try {
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`Network response was not ok: ${response.statusText}`);
        }
        const data = await response.json();

        // 1A) Update our English Date container from the "data.date" field.
        if (data.date) {
          const englishDateDiv = document.getElementById("englishDate");
          if (englishDateDiv) {
            englishDateDiv.textContent = formatEnglishDate(data.date);
          }
        }

        // 1B) Map of Zmanim to element IDs
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

        // 1C) Loop through each zmanim key -> DOM element
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

    // ------------------------
    // 2) Hebrew Date
    // ------------------------
    async function fetchHebrewDate(date) {
      const hebcalUrl = `https://www.hebcal.com/hebcal?cfg=json&start=${date}&end=${date}&maj=on&min=on&nx=on&ss=on&mf=on&d=on&c=on&geo=geoname&geonameid=5100280&M=on&s=on&leyning=off`;
      try {
        const response = await fetch(hebcalUrl);
        if (!response.ok) {
          throw new Error(`Network response was not ok: ${response.statusText}`);
        }
        const data = await response.json();
        const items = data.items || [];

        // Grab our #hebrewDate div
        const hebrewDateDiv = document.getElementById('hebrewDate');
        if (!hebrewDateDiv) return;

        // 2A) Check for "heDateParts"
        const itemWithParts = items.find(item => item.heDateParts);
        if (itemWithParts?.heDateParts) {
          const { d, m, y } = itemWithParts.heDateParts;
          // Example: "א׳ תשרי תשפ״ו"
          hebrewDateDiv.textContent = `${d} ${m} ${y}`;
        } else {
          // 2B) Fallback to old "hebrew" field
          const itemWithHebrew = items.find(item => item.hebrew);
          if (itemWithHebrew?.hebrew) {
            hebrewDateDiv.textContent = itemWithHebrew.hebrew;
          } else {
            hebrewDateDiv.textContent = "";
          }
        }
      } catch (error) {
        console.error("Error fetching Hebrew date from Hebcal:", error);
      }
    }

    // ------------------------
    // 3) Helper: Format English date
    // ------------------------
    function formatEnglishDate(dateStr) {
      // Parse the date string (e.g. "2025-09-23")
      const dateObj = new Date(dateStr + "T00:00:00");

      const dayNames = [
        "Sunday", "Monday", "Tuesday", "Wednesday",
        "Thursday", "Friday", "Saturday"
      ];
      const monthNames = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
      ];

      const dayOfWeek = dayNames[dateObj.getDay()];
      const month = monthNames[dateObj.getMonth()];
      const day = dateObj.getDate();
      const year = dateObj.getFullYear();

      return `${dayOfWeek}, ${month} ${addOrdinalSuffix(day)}, ${year}`;
    }

    function addOrdinalSuffix(day) {
      // Special case for teens
      if (day > 3 && day < 21) return day + "th";
      switch (day % 10) {
        case 1: return day + "st";
        case 2: return day + "nd";
        case 3: return day + "rd";
        default: return day + "th";
      }
    }

    // ------------------------
    // 4) Initialization
    // ------------------------
    const datePicker = document.getElementById("datePicker");

    function setDateToToday() {
      const today = new Date();
      const formattedDate = today.toISOString().split("T")[0];
      datePicker.value = formattedDate;

      // Fetch both Zmanim + Hebrew date
      fetchZmanim(formattedDate);
      fetchHebrewDate(formattedDate);
    }

    // Automatically set & fetch for today's date on load
    setDateToToday();

    // Also fetch whenever user picks a new date
    datePicker.addEventListener("change", () => {
      const selectedDate = datePicker.value;
      if (selectedDate) {
        fetchZmanim(selectedDate);
        fetchHebrewDate(selectedDate);
      }
    });