// prayertimes.js
document.addEventListener('DOMContentLoaded', function () {
    // Expose globally so other scripts can call them
    window.loadAndDisplayPrayerTimes = loadAndDisplayPrayerTimes;
    window.getFilteredRecords = () => filteredRecords.slice(); // read-only copy
  
    let filteredRecords = [];
  
    class EntryTime {
      constructor(dateStr) {
        this.setDate(dateStr);
      }
      setDate(dateStr) {
        const [y, m, d] = dateStr.split('-').map(Number);
        this.date = new Date(y, m - 1, d, 0, 0, 0);
      }
      get dateStr() {
        const y = this.date.getFullYear();
        const m = String(this.date.getMonth() + 1).padStart(2, '0');
        const d = String(this.date.getDate()).padStart(2, '0');
        return `${y}-${m}-${d}`;
      }
      get dayOfWeek() {
        return ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"][this.date.getDay()];
      }
      hebcalUrl() {
        return `https://www.hebcal.com/hebcal?cfg=json&maj=on&min=on&nx=on&start=${this.dateStr}&end=${this.dateStr}&ss=on&mf=on&d=on&c=on&geo=geoname&geonameid=5100280&M=on&s=on&leyning=off`;
      }
    }
  
    // Weekday-based condition
    function weekdayFactory(allowed) {
      return (html, etime, rec) => {
        if (html.includes("major") && html.includes("yomtov")) return false;
        if (html.includes("major") && html.includes("Erev") && html.includes("holiday")) {
          const t = rec.Tefilah || "";
          if (t.includes("Mincha") || t.includes("Maariv")) return false;
        }
        return allowed.includes(etime.dayOfWeek);
      };
    }
  
    // Conditions
    const condMap = {
      // Weekday
      '#SF':  weekdayFactory(['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday']),
      '#ST':  weekdayFactory(['Sunday','Monday','Tuesday','Wednesday','Thursday']),
      '#AW':  weekdayFactory(['Monday','Tuesday','Wednesday','Thursday','Friday']),
      '#XMT': weekdayFactory(['Tuesday','Wednesday','Friday']),
      '#MTT': weekdayFactory(['Monday','Tuesday','Wednesday','Thursday']),
      '#MND': weekdayFactory(['Monday']),
      '#TD':  weekdayFactory(['Tuesday']),
      '#WD':  weekdayFactory(['Wednesday']),
      '#TH':  weekdayFactory(['Thursday']),
      '#FR':  weekdayFactory(['Friday']),
      '#SUN': weekdayFactory(['Sunday']),
      '#SHA': weekdayFactory(['Saturday']),
  
      // Holidays
      '#RH1': (h) => h.includes("1st of Tishrei"),
      '#RH2': (h) => h.includes("ראש השנה ב׳"),
      '#YK':  (h) => h.includes("10 Tishrei"),
      '#SUK1': (h) => h.includes("סוכות א"),
      '#SUK2': (h) => h.includes("סוכות ב"),
      '#CHM-SUK': (h) => h.includes("Sukkot") && h.includes("CH’’M"),
      '#SHM-SUK': (h) => h.includes("Shmini Atzeret"),
      '#SIT': (h) => h.includes("Simchat Torah"),
      '#CHAN': (h) => ["25 Kislev","26 Kislev","27 Kislev","28 Kislev","29 Kislev","30 Kislev","1 Tevet","2 Tevet"].some(d => h.includes(d)),
      '#CHAN1': (h) => h.includes("25 Kislev"),
      '#CHAN2': (h) => h.includes("26 Kislev"),
      '#CHAN3': (h) => h.includes("27 Kislev"),
      '#CHAN4': (h) => h.includes("28 Kislev"),
      '#CHAN5': (h) => h.includes("29 Kislev"),
      '#CHAN6': (h) => h.includes("30 Kislev"),
      '#CHAN7': (h) => h.includes("1 Tevet"),
      '#CHAN8': (h) => h.includes("2 Tevet"),
      '#XCH': (h) => !["25 Kislev","26 Kislev","27 Kislev","28 Kislev","29 Kislev","30 Kislev","1 Tevet","2 Tevet"].some(d => h.includes(d)),
      '#BHZ': (h) => [
        "1 Nisan","2 Nisan","3 Nisan","4 Nisan","5 Nisan","6 Nisan","7 Nisan","8 Nisan","9 Nisan",
        "10 Nisan","11 Nisan","12 Nisan","13 Nisan","14 Nisan","15 Nisan","16 Nisan","17 Nisan","18 Nisan","19 Nisan",
        "20 Nisan","21 Nisan","22 Nisan","23 Nisan","24 Nisan","25 Nisan","26 Nisan","27 Nisan","28 Nisan","29 Nisan",
        "30 Nisan","1 Iyar","10 Tishrei","11 Tishrei","12 Tishrei","13 Tishrei","14 Tishrei","15 Tishrei","16 Tishrei",
        "17 Tishrei","18 Tishrei","19 Tishrei","20 Tishrei","21 Tishrei","22 Tishrei","23 Tishrei","24 Tishrei",
        "25 Tishrei","26 Tishrei","27 Tishrei","28 Tishrei","29 Tishrei","30 Tishrei","1 Cheshvan"
      ].some(d => h.includes(d)),
      '#BHSR': (h) => [
        "10 Av","11 Av","12 Av","13 Av","14 Av","15 Av","16 Av","17 Av","18 Av","19 Av",
        "20 Av","21 Av","22 Av","23 Av","24 Av","25 Av","26 Av","27 Av","28 Av","29 Av"
      ].some(d => h.includes(d)),
  
      '#EVY': (h) => h.includes("Erev Yom Kippur"),
      '#EVPS': (h) => h.includes("Erev Pesach"),
      '#EVSUK': (h) => h.includes("Erev Sukkot"),
      '#EVRH': (h) => h.includes("29 Elul"),
      '#RC':   (h) => h.toLowerCase().includes("rosh chodesh"),
      '#XRC':  (h) => !h.toLowerCase().includes("rosh chodesh"),
      '#XFD':  (h) => !["Fast of Esther","10 Tevet","17 Tammuz","9 Av"].some(f => h.includes(f)),
      '#FD':   (h) => h.includes("fast") && !h.includes("major"),
      '#AMH':  (h) => h.includes("major") && h.includes("yomtov"),
  
      // Special codes => handled with custom logic
      '#ERS': null, '#RSE': null, '#UST': null, '#UCT': null, '#RET': null, '#CUT': null
    };
  
    async function loadAndDisplayPrayerTimes(dateVal) {
      const datePicker = document.getElementById("datePicker");
      const chosenDate = dateVal || (datePicker?.value) || "2025-01-01";
      const et = new EntryTime(chosenDate);
  
      try {
        // 1) Holiday info
        const hcData = await fetchJson(et.hebcalUrl());
        const htmlStr = JSON.stringify(hcData);
  
        // 2) Local data
        const localData = await fetchJson("prayertimes.json");
        const records = localData.records || [];
  
        // 3) Filter out/in by codes
        filteredRecords = filterRecords(records, htmlStr, et);
  
        // 4) Special code logic
        await handleERS(filteredRecords, et);
        await handleRSE(filteredRecords, et);
        await handleUST(filteredRecords, et);
        await handleUCT(filteredRecords, et);
        await handleRET(filteredRecords, et);
        await handleCUT(filteredRecords, et);
  
        // 5) Display *all* (but we won't draw markers until Tefilah is clicked)
        displayRecords(filteredRecords);
      } catch (err) {
        console.error("loadAndDisplayPrayerTimes error:", err);
        const c = document.getElementById("prayerTimesOutput");
        if (c) c.innerHTML = `<p>Error: ${err.message}</p>`;
      }
    }
  
    function filterRecords(records, htmlStr, etime) {
      return records.filter((rec) => {
        const codes = parseCodes(rec.fields?.strCode);
        // Exclude if any code => false
        const excluded = codes.some((cd) => {
          const cond = condMap[cd];
          if (typeof cond === "function") return !cond(htmlStr, etime, rec);
          return false;
        });
        if (excluded) return false;
  
        // Must have at least one code => true
        const included = codes.some((cd) => {
          const cond = condMap[cd];
          if (!cond) return true;
          if (typeof cond === "function") return cond(htmlStr, etime, rec);
          if (Array.isArray(cond)) return cond.includes(etime.dayOfWeek);
          return false;
        });
        return included;
      });
    }
  
    function parseCodes(strCode) {
      if (!strCode) return [];
      if (typeof strCode === "string") {
        try {
          return JSON.parse(strCode.replace(/'/g, '"'));
        } catch {
          return [strCode];
        }
      }
      return Array.isArray(strCode) ? strCode : [];
    }
  
    function hasCode(rec, code) {
      const arr = parseCodes(rec.fields?.strCode);
      return arr.includes(code);
    }
  
    // #ERS
    async function handleERS(recs, et) {
      const group = recs.filter(r => hasCode(r, '#ERS'));
      if (!group.length) return;
      const { sunday, friday } = findSunFri(et.date);
      const dataRange = await fetchZmanRange(sunday, friday);
      group.forEach(r => {
        const f = r.fields;
        const earliest = findEarliest(dataRange, f.strZman_Start_Time || "sunrise");
        if (!earliest) return;
        if (f.Time_for_formula) {
          const adj = applyTimeFormula(earliest, f.Time_for_formula);
          f.Time = toAmPm(adj);
        }
      });
    }
  
    // #RSE
    async function handleRSE(recs, et) {
      const group = recs.filter(r => hasCode(r, '#RSE'));
      if (!group.length) return;
      const { sunday, friday } = findSunFri(et.date);
      const dataRange = await fetchZmanRange(sunday, friday);
      group.forEach(r => {
        const f = r.fields;
        const e = findEarliest(dataRange, f.strZman_Start_Time || "sunrise");
        if (!e) return;
        f.Time = toAmPm(round5(e));
      });
    }
  
    // #UST
    async function handleUST(recs, et) {
      const group = recs.filter(r => hasCode(r, '#UST'));
      if (!group.length) return;
      const singleData = await fetchZmanSingle(et.dateStr);
      group.forEach(r => {
        const f = r.fields;
        if (!f.strZman_Start_Time) return;
        const baseIso = singleData[f.strZman_Start_Time.trim()];
        if (!baseIso) return;
        let d = new Date(baseIso);
        if (f.Zman_Start_Adjustment) d = applyTimeFormula(d, f.Zman_Start_Adjustment);
        f.Time = toAmPm(d);
      });
    }
  
    // #UCT (no #RET)
    async function handleUCT(recs, et) {
      const group = recs.filter(r => hasCode(r, '#UCT') && !hasCode(r, '#RET'));
      if (!group.length) return;
      const singleData = await fetchZmanSingle(et.dateStr);
      for (let i = group.length - 1; i >= 0; i--) {
        const f = group[i].fields;
        if (!f.strZman_Cutoff_Time || !f.Time) continue;
        const iso = singleData[f.strZman_Cutoff_Time.trim()];
        if (!iso) continue;
        const recordTime = parseLocalTime(et.date, f.Time);
        let cutoff = new Date(iso);
        if (f.Zman_Cutoff_Adjustment) cutoff = applyTimeFormula(cutoff, f.Zman_Cutoff_Adjustment);
  
        if (cutoff <= recordTime) {
          const idx = recs.indexOf(group[i]);
          if (idx !== -1) recs.splice(idx, 1);
        }
      }
    }
  
    // #RET
    async function handleRET(recs, et) {
      const group = recs.filter(r => hasCode(r, '#RET'));
      if (!group.length) return;
  
      let singleData = {};
      try { singleData = await fetchZmanSingle(et.dateStr); } 
      catch(e){ console.warn("No single-day for #RET", e); }
  
      group.forEach(r => {
        const f = r.fields;
        const [hh, mm] = (f.Time_for_formula || "00:00").split(":").map(Number);
        const interval = hh * 60 + mm;
        const startDate = parseLocalTime(et.date, f.Time);
        if (isNaN(startDate)) return;
  
        let endDate = null;
        if (hasCode(r, '#UCT') && f.strZman_Cutoff_Time && singleData[f.strZman_Cutoff_Time.trim()]) {
          endDate = new Date(singleData[f.strZman_Cutoff_Time.trim()]);
          if (f.Zman_Cutoff_Adjustment) {
            endDate = applyTimeFormula(endDate, f.Zman_Cutoff_Adjustment);
          }
        }
        if (!endDate && f.Cut_off_Time) {
          endDate = parseLocalTime(et.date, f.Cut_off_Time);
        }
        if (!endDate || isNaN(endDate)) {
          endDate = new Date(startDate.getTime() + 12*60*60*1000);
        }
  
        // Use a Set to avoid duplicates
        const timesSet = new Set();
        let current = new Date(startDate);
        while (current <= endDate) {
          const tStr = toAmPm(current);
          timesSet.add(tStr);
          current.setMinutes(current.getMinutes() + interval);
        }
        // Convert the set back to array
        const uniqueTimes = Array.from(timesSet);
        f.Time = uniqueTimes.join(" | ");
      });
    }
  
    // #CUT
    async function handleCUT(recs, et) {
      const group = recs.filter(r => hasCode(r, '#CUT'));
      if (!group.length) return;
      const singleData = await fetchZmanSingle(et.dateStr);
      for (let i = group.length - 1; i >= 0; i--) {
        const f = group[i].fields;
        if (!f.Cut_off_Time || !f.strZman_Start_Time) continue;
        const cutoffLocal = parseLocalTime(et.date, f.Cut_off_Time);
        if (isNaN(cutoffLocal)) continue;
        const iso = singleData[f.strZman_Start_Time.trim()];
        if (!iso) continue;
        let startDt = new Date(iso);
        if (f.Zman_Start_Adjustment) startDt = applyTimeFormula(startDt, f.Zman_Start_Adjustment);
        if (cutoffLocal <= startDt) {
          const idx = recs.indexOf(group[i]);
          if (idx !== -1) recs.splice(idx, 1);
        }
      }
    }
  
    // Utilities
    async function fetchJson(url) {
      const r = await fetch(url);
      if (!r.ok) throw new Error(`Failed to fetch: ${url}`);
      return r.json();
    }
    async function fetchZmanSingle(dateStr) {
      const u = `https://www.hebcal.com/zmanim?cfg=json&geonameid=5100280&date=${dateStr}`;
      const d = await fetchJson(u);
      return d.times || {};
    }
    async function fetchZmanRange(dateA, dateB) {
      const start = toYMD(dateA), end = toYMD(dateB);
      const u = `https://www.hebcal.com/zmanim?cfg=json&geonameid=5100280&start=${start}&end=${end}`;
      return fetchJson(u);
    }
    function findSunFri(d) {
      const day = d.getDay();
      const sunday = new Date(d);
      sunday.setDate(d.getDate() - day);
      const friday = new Date(sunday);
      friday.setDate(sunday.getDate() + 5);
      return { sunday, friday };
    }
    function findEarliest(zmanData, zmanType) {
      const obj = zmanData.times?.[zmanType] || {};
      let earliest = null;
      for (const iso of Object.values(obj)) {
        const dt = new Date(iso);
        if (!earliest || dt < earliest) earliest = dt;
      }
      return earliest;
    }
    function parseLocalTime(baseDate, timeStr) {
      if (!timeStr) return new Date('invalid');
      const [tPart, ampm] = timeStr.split(' ');
      if (!tPart) return new Date('invalid');
      let [h, m] = tPart.split(':').map(Number);
      if (ampm?.toUpperCase() === 'PM' && h < 12) h += 12;
      if (ampm?.toUpperCase() === 'AM' && h === 12) h = 0;
      return new Date(baseDate.getFullYear(), baseDate.getMonth(), baseDate.getDate(), h, m, 0);
    }
    function applyTimeFormula(baseDate, formula) {
      const sign = formula.startsWith('-') ? -1 : 1;
      const clean = formula.replace('-', '');
      const [hh, mm] = clean.split(':').map(Number);
      const out = new Date(baseDate);
      out.setMinutes(out.getMinutes() + sign*(hh*60 + mm));
      return out;
    }
    function toYMD(d) {
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2,'0');
      const dd = String(d.getDate()).padStart(2,'0');
      return `${y}-${m}-${dd}`;
    }
    function round5(d) {
      const ms5 = 5 * 60 * 1000;
      return new Date(Math.round(d.getTime() / ms5) * ms5);
    }
    function toAmPm(dateObj) {
      const d = new Date(dateObj);
      if (isNaN(d.getTime())) return '';
      let hh = d.getHours();
      let mm = d.getMinutes();
      const suf = hh >= 12 ? 'PM' : 'AM';
      hh = hh % 12 || 12;
      return `${hh}:${String(mm).padStart(2,'0')} ${suf}`;
    }
  
    // Display the entire filteredRecords => #prayerTimesOutput
    function displayRecords(records) {
      const c = document.getElementById("prayerTimesOutput");
      if (!c) return;
      if (!records.length) {
        c.innerHTML = `<p>No matching prayer times found.</p>`;
        return;
      }
  
      // Convert to a simpler JSON structure
      const arr = records.map((r) => {
        const f = r.fields || {};
        return {
          Shul: f.StrShulName2 || f.StrShulName || "",
          Tefilah: f.Tefilah_Tefilahs || "",
          Time: f.Time || "",
          Data: `${f.Address || ""}, ${f.City || ""}, ${f.State || ""}`.trim(),
          strCode: f.strCode || "",
          position: { lat: f.Lat || "", lng: f.Lng || "" }
        };
      });
  
      c.innerHTML = `<pre>${JSON.stringify(arr, null, 2)}</pre>`;
    }
  });
  