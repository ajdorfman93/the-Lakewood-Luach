class EntryTime {
    constructor(date) {
        this.setDate(date); // Initialize the date
    }

    // Method to update the date object
    setDate(date) {
        // Parse the date string as UTC to avoid timezone mismatches
        const [year, month, day] = date.split('-').map(Number);
        this.date = new Date(Date.UTC(year, month - 1, day)); // Month is zero-based
    }

    // Getter to format date as YYYY-MM-DD
    get dateStr() {
        return this.date.toISOString().split('T')[0];
    }

    // Generate the Hebcal URL based on the current date
    htmlContent() {
        return `https://www.hebcal.com/hebcal?cfg=json&maj=on&min=on&nx=on&start=${this.dateStr}&end=${this.dateStr}&ss=on&mf=on&d=on&c=on&geo=geoname&geonameid=5100280&M=on&s=on&leyning=off`;
    }

    // Getter to return the day of the week as a string
    get dayOfWeek() {
        const weekday = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
        return weekday[this.date.getUTCDay()]; // Use getUTCDay to ensure consistency
    }
}

    
    class Times {
        constructor(htmlContent, dayRef) {
          this.htmlContent = htmlContent;
          this.dayRef = dayRef; // Assuming dayRef is an instance of EntryTime
        }
      
        // Check if the current date is in daylight saving time
        isDST() {
          const date = this.dayRef.date; // Get the date from dayRef
          return new Date(date).getTimezoneOffset() < new Date(new Date(date).getFullYear(), 0, 1).getTimezoneOffset();
        }
      
        isNotDST() {
          return !this.isDST();
        }
      
        checkConditions() {
          const dayOfWeek = this.dayRef.dayOfWeek;
          return {
            'Day of the Week': dayOfWeek,
            'Is DST': this.isDST(),
            'Is Not DST': this.isNotDST(),
          'Day of the Week': dayOfWeek,
          'Monday': dayOfWeek === "Monday",
          'Tuesday': dayOfWeek === "Tuesday",
          'Wednesday': dayOfWeek === "Wednesday",
          'Thursday': dayOfWeek === "Thursday",
          'Friday': dayOfWeek === "Friday",
          'Sunday': dayOfWeek === "Sunday",
          'Saturday': dayOfWeek === "Saturday",
        'Sukkot Day 1': this.htmlContent.includes("סוכות א"),
        'Sukkot Day 2': this.htmlContent.includes("סוכות ב"),
        'Yom Kippur': this.htmlContent.includes("10 Tishrei"),
        'Rosh Hashanah 1': this.htmlContent.includes("1st of Tishrei"),
        'Rosh Hashanah 2': this.htmlContent.includes("ראש השנה ב׳"),
        'Sukkot CH’’M': this.htmlContent.includes("Sukkot") && this.htmlContent.includes("CH’’M"),
        'Simchat Torah': this.htmlContent.includes("Simchat Torah"),
        'Chanukkah': this.Hanukkah(),
        'Hanukkah Day 1': this.htmlContent.includes("25 Kislev"),
        'Hanukkah Day 2': this.htmlContent.includes("26 Kislev"),
        'Hanukkah Day 3': this.htmlContent.includes("27 Kislev"),
        'Hanukkah Day 4': this.htmlContent.includes("28 Kislev"),
        'Hanukkah Day 5': this.htmlContent.includes("29 Kislev"),
        'Hanukkah Day 6': this.htmlContent.includes("30 Kislev"),
        'Hanukkah Day 7': this.htmlContent.includes("1 Tevet"),
        'Hanukkah Day 8': this.htmlContent.includes("2 Tevet"),
        'Shmini Atzeret': this.htmlContent.includes("Shmini Atzeret"),
        'Erev Yom Kippur': this.htmlContent.includes("Erev Yom Kippur"),
        '10 Tevet': this.htmlContent.includes("10 Tevet"),
        '15 Shevat': this.htmlContent.includes("15 Shevat"),
        'Purim': this.htmlContent.includes("14 Adar"),
        'Shushan Purim': this.htmlContent.includes("15 Adar"),
        'Chol HaMoed Pesach': this.htmlContent.includes("Pesach") && this.htmlContent.includes("CH’’M"),
        '7th day of Pesach': this.htmlContent.includes("21 Nisan"),
        '8th day of Pesach': this.htmlContent.includes("22 Nisan"),
        'Lag B’Omer': this.htmlContent.includes("18 Iyar"),
        '1st day of Shavuot': this.htmlContent.includes("6 Sivan"),
        'Fast of Esther': this.htmlContent.includes("13 Adar"),
        '2nd day of Shavuot': this.htmlContent.includes("7 Sivan"),
        '17th of Tammuz': this.htmlContent.includes("17 Tammuz"),
        'Tisha B’Av': this.htmlContent.includes("9 Av"),
        'Tu B’Av': this.htmlContent.includes("15 Av"),
        'Erev Rosh Hashanah': this.htmlContent.includes("29 Elul"),
        'Erev Pesach': this.htmlContent.includes("14 Nisan"),
        'Shabbat HaGadol': this.htmlContent.includes("Shabbat HaGadol"),        
        'Erev Sukkot': this.htmlContent.includes("14 Tishrei"),
        'Minor Fasts': this.is10T() || this.is17Tam() || this.isFstoEs(),
        '16 Nisan': this.htmlContent.includes("16 Nisan"),
        '15 Nisan': this.htmlContent.includes("15 Nisan"),
        'Major Holidays': this.htmlContent.toLowerCase().includes("major"),
        'Rosh Chodesh': this.htmlContent.toLowerCase().includes("roshchodesh"),
        'Bein HaZmanim': this.isBbHzm1(),
        'Bein HaZmanim Summer': this.isBbHzm2(),
        'Shabbat Shuva': this.htmlContent.includes("שבת שובה")
      };
    }
  
    // Helper methods for specific checks
    isBbHzm1() {
      const daysNisanToCheshvan = [
        "1 Nisan", "2 Nisan", "3 Nisan", "4 Nisan", "5 Nisan", "6 Nisan", "7 Nisan", "8 Nisan", "9 Nisan",
        "10 Nisan", "11 Nisan", "12 Nisan", "13 Nisan", "14 Nisan", "15 Nisan", "16 Nisan", "17 Nisan", "18 Nisan", "19 Nisan",
        "20 Nisan", "21 Nisan", "22 Nisan", "23 Nisan", "24 Nisan", "25 Nisan", "26 Nisan", "27 Nisan", "28 Nisan", "29 Nisan",
        "30 Nisan", "1 Iyar", "10 Tishrei", "11 Tishrei", "12 Tishrei", "13 Tishrei", "14 Tishrei", "15 Tishrei", "16 Tishrei",
        "17 Tishrei", "18 Tishrei", "19 Tishrei", "20 Tishrei", "21 Tishrei", "22 Tishrei", "23 Tishrei", "24 Tishrei",
        "25 Tishrei", "26 Tishrei", "27 Tishrei", "28 Tishrei", "29 Tishrei", "30 Tishrei", "1 Cheshvan"
      ];
      return daysNisanToCheshvan.some(day => this.htmlContent.includes(day));
    }

    Hanukkah(){
        const eightdays = [
          "26 Kislev", "27 Kislev", "28 Kislev", "29 Kislev", "30 Kislev", "1 Tevet", "2 Tevet", "25 Kislev"
        ];
        return eightdays.some(day => this.htmlContent.includes(day));
      }
      
    Hanukkah(){
        const eightdays = [
          "26 Kislev", "27 Kislev", "28 Kislev", "29 Kislev", "30 Kislev", "1 Tevet", "2 Tevet", "25 Kislev"
        ];
        return eightdays.some(day => this.htmlContent.includes(day));
      }

    isBbHzm2() {
      const daysAv = [
        "10 Av", "11 Av", "12 Av", "13 Av", "14 Av", "15 Av", "16 Av", "17 Av", "18 Av", "19 Av", "20 Av",
        "21 Av", "22 Av", "23 Av", "24 Av", "25 Av", "26 Av", "27 Av", "28 Av", "29 Av"
      ];
      return daysAv.some(day => this.htmlContent.includes(day));
    }
  
    is10T() {
      return this.htmlContent.includes("10 Tevet");
    }
  
    is17Tam() {
      return this.htmlContent.includes("17 Tammuz");
    }
  
    isFstoEs() {
      return this.htmlContent.includes("13 Adar");
    }
  }
  
  // Function to handle event checking based on date input
  async function checkEvents() {
    const datePicker = document.getElementById('datePicker');
    const eventOutput = document.getElementById('eventOutput');
    const entryTime = new EntryTime(datePicker.value);
  
    try {
      const response = await fetch(entryTime.htmlContent());
      if (!response.ok) {
        throw new Error('Network response was not ok.');
      }
      const htmlContent = await response.text();
      const times = new Times(htmlContent, entryTime);
  
      // Generate HTML table based on conditions
      const conditions = times.checkConditions();
      let tableHtml = '<table><tr><th>Condition</th><th>Occurs?</th></tr>';
      for (let condition in conditions) {
        tableHtml += `<tr><td>${condition}</td><td>${conditions[condition]}</td></tr>`;
      }
      tableHtml += '</table>';
      eventOutput.innerHTML = tableHtml;
    } catch (error) {
      console.error('Error fetching URL content:', error);
      eventOutput.innerHTML = `<p>Error fetching data: ${error.message}</p>`;
    }
  }
  
  // Add event listener for DOM content loaded
  document.addEventListener('DOMContentLoaded', function () {
    const checkButton = document.getElementById('checkEventsButton');
    if (checkButton) {
      checkButton.addEventListener('click', checkEvents);
    }
  });
  