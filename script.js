const SHEET_ID = "1h8dFkYDwzoMRpmptydtS1tKcSAndV-mHDsY18HAfK3I";
const SHEET_TAB = "RRPro V5";
const VERSION = "6.0.1";

const COL = {
  YEAR: 0,
  DIFFERENTIAL: 1,
  DATE: 2,
  EVENT: 3,
  LEGACY_TRACK_NAME: 4,
  MOST_RECENT_TRACK_NAME: 5,
  FINISH: 6,
  CAR_NUMBER: 7,
  START: 8,
  DRIVER: 9,
  MANUFACTURER: 10,
  SPONSOR: 11,
  TEAM: 12,
  LAPS_COMPLETED: 13,
  ERA_DECADE: 14,
  GENERATION: 15,
  SERIES: 16,
  TRACK_LOCATION_STATE: 17,
  SURFACE_TYPE: 18,
  WIN: 19,
  TOP_3: 20,
  TOP_5: 21,
  TOP_10: 22,
  TOP_20: 23,
  TOP_30: 24,
  TOP_40: 25,
  LAST_PLACE: 26,
  RANK_OF_TEAM: 27,
  BEST_OF_TEAM: 28,
  WORST_OF_TEAM: 29,
  RANK_OF_MANUFACTURER: 30,
  BEST_OF_MANUFACTURER: 31,
  WORST_OF_MANUFACTURER: 32,
  DRIVER_HOMETOWN: 33,
  DRIVER_BIRTHDATE: 34,
  DATE_OF_DEATH: 35,
  TRACK_TYPE: 36,
  TRACK_DISTANCE: 37,
  MILES_LED: 38,
  MILES_COMPLETED: 39,
  TOTAL_POSSIBLE_MILES: 40,
  SPONSOR_DUPLICATE: 41,
  PROMOTION: 42,
  STATUS: 43,
  LAPS_LED: 44,
  LAPS: 45,
  SPEC: 46,
  SPRING: 47,
  SUMMER_FALL: 48,
  OCCURANCE: 49,
  POLE: 50
};

const VERSION_NOTES = [
  {
    version: "6.0.1",
    type: "Bug Fix",
    note: "Updated fixed column indexes after Event moved to Column D. Event now reads Column D and every shifted RRPro V5 field was re-indexed."
  },
  {
    version: "6.0.0",
    type: "Theme Change",
    note: "Changed the full interface to a minimalist black and white theme with subtle blue accents, cleaner typography, tighter layouts, and more information density."
  },
  {
    version: "5.0.0",
    type: "New Feature",
    note: "Rebuilt data access to use fixed RRPro V5 column indexes for every major field. Event Name now reads Column Q only."
  },
  {
    version: "4.6.0",
    type: "Revision",
    note: "Corrected Driver Profile streak logic, fixed special-event win matching, added Top 5 and Top 10 streak race lists, improved typed sorting, and added minimize/expand panel controls."
  },
  {
    version: "4.5.0",
    type: "Revision",
    note: "Updated Driver Profile with draggable stat cards, cleaned first/most recent race blurbs, fixed Event Name mapping, and added calculated accolades."
  },
  {
    version: "4.4.0",
    type: "Revision",
    note: "Expanded Driver Profile with optional birth/death dates, first and most recent race blurbs, clickable stat cards, sortable results grids, column checkboxes, and reset controls."
  },
  {
    version: "4.3.0",
    type: "Revision",
    note: "Added driver profile hometown plus Starts, Wins, Top 5s, and Top 10s using RRPro V5 columns."
  },
  {
    version: "4.2.1",
    type: "Bug Fix",
    note: "Removed the track map feature and fixed breadcrumb path navigation so parent and child items can be clicked."
  },
  {
    version: "4.2.0",
    type: "Revision",
    note: "Added a hidden homepage version-note panel with session history and versioning rules."
  },
  {
    version: "4.1.0",
    type: "Revision",
    note: "Converted Year, Driver, and Track sections from popups into full-page app views with Back and Forward controls."
  },
  {
    version: "4.0.0",
    type: "New Feature",
    note: "Added unique blank profile pages for clicked years, drivers, and tracks."
  },
  {
    version: "3.2.0",
    type: "Revision",
    note: "Added parent/child path text to show how each screen was reached."
  },
  {
    version: "3.1.0",
    type: "Revision",
    note: "Changed the loading screen timing from 5 seconds to 2.5 seconds per 5% increment."
  },
  {
    version: "3.0.0",
    type: "Theme Change",
    note: "Changed the design direction from ESPN-style to a Fox Sports-inspired theme."
  },
  {
    version: "2.2.0",
    type: "Revision",
    note: "Added Year, Driver, and Track entry screens, with search for drivers and tracks."
  },
  {
    version: "2.1.0",
    type: "Revision",
    note: "Removed visible Google Sheet controls so the page automatically targets the RRPro V5 tab."
  },
  {
    version: "2.0.0",
    type: "New Feature",
    note: "Added a black circular loading percentage splash screen."
  },
  {
    version: "1.0.0",
    type: "New Feature",
    note: "Built the first local HTML, CSS, and JavaScript dashboard that reads the Google Sheet from the browser."
  }
];

const DRIVER_RESULT_COLUMNS = [
  { label: "YEAR", index: COL.YEAR },
  { label: "DATE", index: COL.DATE },
  { label: "TRACK", index: COL.MOST_RECENT_TRACK_NAME },
  { label: "EVENT", index: COL.EVENT },
  { label: "FINISH", index: COL.FINISH },
  { label: "NUMBER", index: COL.CAR_NUMBER },
  { label: "TEAM", index: COL.TEAM },
  { label: "SPONSOR", index: COL.SPONSOR },
  { label: "MANUFACTURER", index: COL.MANUFACTURER }
];

let rows = [];
let displayedPercent = 0;
let percentTimer;
let trulyDoneLoading = false;

let historyStack = [{ page: "homePage", path: ["Home"], payload: null }];
let historyIndex = 0;

let currentDriverName = "";
let currentDriverRows = [];
let currentDriverResultType = "";
let driverSortState = { index: null, direction: "asc" };
let driverVisibleColumns = {};

document.addEventListener("DOMContentLoaded", () => {
  const versionToggle = document.getElementById("versionToggle");
  if (versionToggle) versionToggle.textContent = `v${VERSION}`;

  renderVersionNotes();
  wireButtons();
  startLoadingPercent();
  renderCurrentRoute();
  loadSheet();
});

function wireButtons() {
  document.getElementById("yearBtn").addEventListener("click", () => navigateTo("yearPage", ["Home", "Year"]));
  document.getElementById("driverBtn").addEventListener("click", () => navigateTo("driverPage", ["Home", "Driver"]));
  document.getElementById("trackBtn").addEventListener("click", () => navigateTo("trackPage", ["Home", "Track"]));

  document.getElementById("backBtn").addEventListener("click", goBack);
  document.getElementById("forwardBtn").addEventListener("click", goForward);

  document.getElementById("driverSearch").addEventListener("input", renderDrivers);
  document.getElementById("trackSearch").addEventListener("input", renderTracks);

  const versionToggle = document.getElementById("versionToggle");
  if (versionToggle) {
    versionToggle.addEventListener("click", () => {
      document.getElementById("versionPanel").classList.toggle("open");
    });
  }

  document.querySelectorAll("[data-driver-stat]").forEach(button => {
    button.addEventListener("click", () => {
      if (button.dataset.wasDragged === "true") {
        button.dataset.wasDragged = "false";
        return;
      }
      showDriverResults(button.dataset.driverStat);
    });
  });

  setupStatCardDragging();

  document.querySelectorAll("[data-collapse-target]").forEach(button => {
    button.addEventListener("click", () => toggleCollapse(button));
  });

  document.getElementById("driverResultsReset").addEventListener("click", resetDriverResultsGrid);
}

function renderVersionNotes() {
  const versionNotes = document.getElementById("versionNotes");
  if (!versionNotes) return;

  versionNotes.innerHTML = VERSION_NOTES.map(item => `
    <div class="version-item">
      <strong>v${escapeHtml(item.version)} | ${escapeHtml(item.type)}</strong>
      <span>${escapeHtml(item.note)}</span>
    </div>
  `).join("");
}

function startLoadingPercent() {
  updatePercent(0);

  percentTimer = setInterval(() => {
    if (trulyDoneLoading) return;

    if (displayedPercent < 94) {
      displayedPercent += 5;

      if (displayedPercent >= 94) {
        displayedPercent = 99;
      }

      updatePercent(displayedPercent);
    } else {
      displayedPercent = 99;
      updatePercent(displayedPercent);
    }
  }, 2500);
}

function finishLoadingPercent() {
  trulyDoneLoading = true;
  clearInterval(percentTimer);
  displayedPercent = 100;
  updatePercent(displayedPercent);

  setTimeout(() => {
    document.getElementById("splash").classList.add("hidden");
  }, 350);
}

function updatePercent(value) {
  document.getElementById("loadPercent").textContent = `${value}%`;
}

async function loadSheet() {
  const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&sheet=${encodeURIComponent(SHEET_TAB)}`;

  try {
    const response = await fetch(url);
    const text = await response.text();

    if (!response.ok || text.includes("Unable to open")) {
      throw new Error("RRPro V5 could not be opened.");
    }

    const json = parseGoogleTableResponse(text);
    const table = json.table;

    rows = table.rows.map(row => {
      const cells = [];

      for (let i = 0; i <= COL.POLE; i++) {
        const cell = row.c[i];
        cells[i] = cell ? (cell.f || cell.v || "") : "";
      }

      return { cells };
    }).filter(row => row.cells.some(value => String(value).trim() !== ""));

    renderYears();
    renderDrivers();
    renderTracks();
    finishLoadingPercent();
  } catch (error) {
    console.error(error);
    renderEmptyState();
    finishLoadingPercent();
  }
}

function parseGoogleTableResponse(text) {
  return JSON.parse(text.substring(text.indexOf("{"), text.lastIndexOf("}") + 1));
}

function get(row, index) {
  if (!row || !Array.isArray(row.cells)) return "";
  return row.cells[index] ?? "";
}

function getEventName(row) {
  return get(row, COL.EVENT);
}

function renderEmptyState() {
  document.getElementById("yearList").innerHTML = `<div class="list-item">RRPro V5 could not load. Make sure the sheet is public.</div>`;
  document.getElementById("driverList").innerHTML = `<div class="list-item">RRPro V5 could not load. Make sure the sheet is public.</div>`;
  document.getElementById("trackList").innerHTML = `<div class="list-item">RRPro V5 could not load. Make sure the sheet is public.</div>`;
}

function navigateTo(page, path, payload = null) {
  historyStack = historyStack.slice(0, historyIndex + 1);
  historyStack.push({ page, path, payload });
  historyIndex++;
  renderCurrentRoute();
}

function goBack() {
  if (historyIndex > 0) {
    historyIndex--;
    renderCurrentRoute();
  }
}

function goForward() {
  if (historyIndex < historyStack.length - 1) {
    historyIndex++;
    renderCurrentRoute();
  }
}

function renderCurrentRoute() {
  const route = historyStack[historyIndex];

  document.querySelectorAll(".page").forEach(page => page.classList.remove("active"));
  document.getElementById(route.page).classList.add("active");

  renderPath(route);

  if (route.page === "yearProfilePage") {
    document.getElementById("yearProfileTitle").textContent = route.payload?.value || "";
  }

  if (route.page === "driverProfilePage") {
    renderDriverProfile(route.payload?.value || "");
  }

  if (route.page === "trackProfilePage") {
    document.getElementById("trackProfileTitle").textContent = route.payload?.value || "";
  }

  updateNavigation();
}

function renderPath(route) {
  const parts = route.path.map((label, index) => {
    const isLast = index === route.path.length - 1;

    if (isLast) {
      return `<span class="path-current">${escapeHtml(label)}</span>`;
    }

    return `<button class="path-link" type="button" data-path-index="${index}">${escapeHtml(label)}</button>`;
  });

  document.getElementById("pathLine").innerHTML = parts.join(`<span class="path-separator">/</span>`);

  document.querySelectorAll("[data-path-index]").forEach(button => {
    button.addEventListener("click", () => {
      const index = Number(button.dataset.pathIndex);
      const targetPath = route.path.slice(0, index + 1);
      const targetPage = getPageForPath(targetPath);
      const targetPayload = getPayloadForPath(targetPath);
      navigateTo(targetPage, targetPath, targetPayload);
    });
  });
}

function getPageForPath(path) {
  const section = path[1];

  if (path.length === 1) return "homePage";
  if (path.length === 2 && section === "Year") return "yearPage";
  if (path.length === 2 && section === "Driver") return "driverPage";
  if (path.length === 2 && section === "Track") return "trackPage";
  if (path.length >= 3 && section === "Year") return "yearProfilePage";
  if (path.length >= 3 && section === "Driver") return "driverProfilePage";
  if (path.length >= 3 && section === "Track") return "trackProfilePage";

  return "homePage";
}

function getPayloadForPath(path) {
  if (path.length < 3) return null;

  return {
    type: String(path[1]).toLowerCase(),
    value: path[2]
  };
}

function updateNavigation() {
  document.getElementById("backBtn").disabled = historyIndex === 0;
  document.getElementById("forwardBtn").disabled = historyIndex >= historyStack.length - 1;
}

function renderYears() {
  const years = [...new Set(
    rows
      .map(row => String(get(row, COL.YEAR)).trim())
      .filter(value => /^\d{4}$/.test(value))
  )].sort((a, b) => Number(b) - Number(a));

  document.getElementById("yearList").innerHTML = years.length
    ? years.map(year => `<button class="data-pill" type="button" data-year="${escapeAttribute(year)}">${escapeHtml(year)}</button>`).join("")
    : `<div class="list-item">No four-digit years found in Column A.</div>`;

  document.querySelectorAll("[data-year]").forEach(button => {
    button.addEventListener("click", () => {
      const year = button.dataset.year;
      navigateTo("yearProfilePage", ["Home", "Year", year], { type: "year", value: year });
    });
  });
}

function renderDrivers() {
  const search = document.getElementById("driverSearch").value.toLowerCase();

  const drivers = [...new Set(
    rows
      .map(row => String(get(row, COL.DRIVER)).trim())
      .filter(Boolean)
  )].sort((a, b) => a.localeCompare(b));

  const filtered = drivers
    .filter(driver => driver.toLowerCase().includes(search))
    .slice(0, 500);

  document.getElementById("driverList").innerHTML = filtered.length
    ? filtered.map(driver => `<div class="list-item" data-driver="${escapeAttribute(driver)}">${escapeHtml(driver)}</div>`).join("")
    : `<div class="list-item">No matching drivers.</div>`;

  document.querySelectorAll("[data-driver]").forEach(item => {
    item.addEventListener("click", () => {
      const driver = item.dataset.driver;
      navigateTo("driverProfilePage", ["Home", "Driver", driver], { type: "driver", value: driver });
    });
  });
}

function renderTracks() {
  const search = document.getElementById("trackSearch").value.toLowerCase();

  const tracks = [...new Set(
    rows
      .map(row => String(get(row, COL.MOST_RECENT_TRACK_NAME)).trim())
      .filter(Boolean)
  )].sort((a, b) => a.localeCompare(b));

  const filtered = tracks
    .filter(track => track.toLowerCase().includes(search))
    .slice(0, 500);

  document.getElementById("trackList").innerHTML = filtered.length
    ? filtered.map(track => `<div class="list-item" data-track="${escapeAttribute(track)}">${escapeHtml(track)}</div>`).join("")
    : `<div class="list-item">No matching tracks.</div>`;

  document.querySelectorAll("[data-track]").forEach(item => {
    item.addEventListener("click", () => {
      const track = item.dataset.track;
      navigateTo("trackProfilePage", ["Home", "Track", track], { type: "track", value: track });
    });
  });
}

function renderDriverProfile(driverName) {
  currentDriverName = driverName;
  document.getElementById("driverProfileTitle").textContent = driverName;

  currentDriverRows = rows.filter(row => String(get(row, COL.DRIVER)).trim() === driverName);

  if (!driverName || !currentDriverRows.length) {
    setDriverProfileValues("", "", 0, 0, 0, 0);
    renderDriverHistory([]);
    renderDriverAccolades([]);
    closeDriverResultsPanel();
    return;
  }

  const hometown = firstValue(currentDriverRows, COL.DRIVER_HOMETOWN);
  const birthdate = firstValue(currentDriverRows, COL.DRIVER_BIRTHDATE);
  const deathdate = firstValue(currentDriverRows, COL.DATE_OF_DEATH);
  const lifeDates = formatLifeDates(birthdate, deathdate);

  const starts = currentDriverRows.length;
  const wins = currentDriverRows.filter(row => isWin(row)).length;
  const top5s = currentDriverRows.filter(row => isTop5(row)).length;
  const top10s = currentDriverRows.filter(row => isTop10(row)).length;

  setDriverProfileValues(hometown, lifeDates, starts, wins, top5s, top10s);
  renderDriverHistory(currentDriverRows);
  renderDriverAccolades(currentDriverRows);
  closeDriverResultsPanel();
}

function firstValue(rowSet, index) {
  const row = rowSet.find(item => String(get(item, index)).trim());
  return row ? String(get(row, index)).trim() : "";
}

function setDriverProfileValues(hometown, lifeDates, starts, wins, top5s, top10s) {
  document.getElementById("driverProfileHometown").textContent = hometown;
  document.getElementById("driverLifeDates").textContent = lifeDates;
  document.getElementById("driverStarts").textContent = starts.toLocaleString();
  document.getElementById("driverWins").textContent = wins.toLocaleString();
  document.getElementById("driverTop5s").textContent = top5s.toLocaleString();
  document.getElementById("driverTop10s").textContent = top10s.toLocaleString();
}

function formatLifeDates(birthdate, deathdate) {
  if (birthdate && deathdate) return `${birthdate} - ${deathdate}`;
  if (birthdate) return `Born ${birthdate}`;
  if (deathdate) return `Died ${deathdate}`;
  return "";
}

function renderDriverHistory(driverRows) {
  const historyBox = document.getElementById("driverHistory");

  if (!driverRows.length) {
    historyBox.innerHTML = "";
    return;
  }

  const sorted = [...driverRows].sort((a, b) => dateSortValue(get(a, COL.DATE)) - dateSortValue(get(b, COL.DATE)));
  const first = sorted[0];
  const recent = sorted[sorted.length - 1];

  historyBox.innerHTML = `
    <p>${buildRaceBlurb("First race", first)}</p>
    <p>${buildRaceBlurb("Most Recent race", recent)}</p>
  `;
}

function buildRaceBlurb(label, row) {
  const date = escapeHtml(get(row, COL.DATE) || "Unknown Date");
  const track = escapeHtml(get(row, COL.MOST_RECENT_TRACK_NAME) || get(row, COL.LEGACY_TRACK_NAME) || "Unknown Track");
  const number = escapeHtml(get(row, COL.CAR_NUMBER) || "");
  const manufacturer = escapeHtml(get(row, COL.MANUFACTURER) || "");
  const team = escapeHtml(get(row, COL.TEAM) || "");

  const numberPart = number ? `the number ${number}` : "an unknown number";
  const manufacturerPart = manufacturer || "unknown manufacturer";
  const teamPart = team || "unknown team";

  return `${label} on ${date} at ${track}, driving ${numberPart} ${manufacturerPart} for ${teamPart}`;
}

function renderDriverAccolades(driverRows) {
  const box = document.getElementById("driverAccolades");

  if (!driverRows.length) {
    box.innerHTML = "";
    return;
  }

  const allRaceTimeline = getRaceTimelineRows();
  const driverTimelineRows = [...driverRows].sort((a, b) => dateSortValue(get(a, COL.DATE)) - dateSortValue(get(b, COL.DATE)));

  const startStreak = longestConsecutiveStartsAcrossAllRaces(allRaceTimeline, currentDriverName);
  const winStreak = longestConsecutive(driverTimelineRows, row => isWin(row));
  const top5Streak = longestConsecutive(driverTimelineRows, row => isTop5(row));
  const top10Streak = longestConsecutive(driverTimelineRows, row => isTop10(row));

  const specialEvents = [
    { title: "Coca-Cola 600 Wins", tests: ["coca-cola 600", "coca cola 600", "world 600"] },
    { title: "Daytona 500 Wins", tests: ["daytona 500"] },
    { title: "Southern 500 Wins", tests: ["southern 500"] },
    { title: "Bristol Summer Wins", tests: ["bristol", "night race", "bass pro shops night race", "irwin tools night race", "sharpie 500", "food city 500"] }
  ].map(eventDef => {
    const wins = driverTimelineRows.filter(row => {
      const event = normalizeText(getEventName(row));
      return isWin(row) && eventDef.tests.some(test => event.includes(test));
    });

    return {
      title: eventDef.title,
      value: wins.length ? `${wins.length}` : "0",
      list: wins.map(row => formatRaceLine(row))
    };
  });

  const accolades = [
    {
      title: "Most Consecutive Starts",
      value: formatStreak(startStreak),
      list: []
    }
  ];

  if (winStreak.count >= 1) {
    accolades.push({
      title: "Most Consecutive Wins",
      value: formatStreak(winStreak),
      list: winStreak.rows.map(row => formatRaceLine(row))
    });
  }

  accolades.push({
    title: "Most Consecutive Top 5s",
    value: formatStreak(top5Streak),
    list: top5Streak.rows.map(row => formatRaceLine(row))
  });

  accolades.push({
    title: "Most Consecutive Top 10s",
    value: formatStreak(top10Streak),
    list: top10Streak.rows.map(row => formatRaceLine(row))
  });

  accolades.push(...specialEvents);

  box.innerHTML = `
    <div class="accolade-grid">
      ${accolades.map(item => `
        <div class="accolade-card">
          <strong>${escapeHtml(item.title)}</strong>
          <span>${escapeHtml(item.value)}</span>
          ${item.list && item.list.length ? `<ul class="accolade-race-list">${item.list.map(line => `<li>${escapeHtml(line)}</li>`).join("")}</ul>` : ""}
        </div>
      `).join("")}
    </div>
  `;
}

function getRaceTimelineRows() {
  const raceMap = new Map();

  rows.forEach(row => {
    const key = [
      String(get(row, COL.DATE)).trim(),
      String(getEventName(row)).trim(),
      String(get(row, COL.MOST_RECENT_TRACK_NAME)).trim()
    ].join("||");

    if (!raceMap.has(key)) raceMap.set(key, []);
    raceMap.get(key).push(row);
  });

  return [...raceMap.values()]
    .map(raceRows => ({
      raceRows,
      sample: raceRows[0],
      sortValue: dateSortValue(get(raceRows[0], COL.DATE))
    }))
    .sort((a, b) => a.sortValue - b.sortValue);
}

function longestConsecutiveStartsAcrossAllRaces(raceTimeline, driverName) {
  let best = [];
  let current = [];

  raceTimeline.forEach(race => {
    const driverRow = race.raceRows.find(row => String(get(row, COL.DRIVER)).trim() === driverName);

    if (driverRow) {
      current.push(driverRow);
      if (current.length > best.length) best = [...current];
    } else {
      current = [];
    }
  });

  return {
    count: best.length,
    first: best[0] || null,
    last: best[best.length - 1] || null,
    rows: best
  };
}

function longestConsecutive(sortedRows, predicate) {
  let best = [];
  let current = [];

  sortedRows.forEach(row => {
    if (predicate(row)) {
      current.push(row);
      if (current.length > best.length) best = [...current];
    } else {
      current = [];
    }
  });

  return {
    count: best.length,
    first: best[0] || null,
    last: best[best.length - 1] || null,
    rows: best
  };
}

function formatStreak(streak) {
  if (!streak || !streak.count) return "0";

  if (streak.count === 1) {
    return `1 at ${formatYearDateEvent(streak.first)}`;
  }

  return `${streak.count} from ${formatYearDateEvent(streak.first)} through ${formatYearDateEvent(streak.last)}`;
}

function formatYearDateEvent(row) {
  const year = get(row, COL.YEAR) ? `${get(row, COL.YEAR)} ` : "";
  const date = get(row, COL.DATE) || "Unknown Date";
  const event = getEventName(row) || "Unknown Event";
  return `${year}${date} - ${event}`;
}

function formatRaceLine(row) {
  const year = get(row, COL.YEAR) || "";
  const event = getEventName(row) || "";
  const date = get(row, COL.DATE) || "";
  const finish = get(row, COL.FINISH) || "";
  return `${year} - ${event} - ${date} - ${finish}`;
}

function showDriverResults(type) {
  currentDriverResultType = type;
  driverSortState = { index: null, direction: "asc" };
  resetVisibleDriverColumns();

  const labelMap = {
    starts: "Starts",
    wins: "Wins",
    top5s: "Top 5s",
    top10s: "Top 10s"
  };

  document.getElementById("driverResultsTitle").textContent = `${currentDriverName} ${labelMap[type] || "Results"}`;
  document.getElementById("driverResultsPanel").classList.add("open");
  document.getElementById("driverResultsPanel").classList.remove("collapsed");

  const resultsToggle = document.querySelector('[data-collapse-target="driverResultsContent"]');
  if (resultsToggle) resultsToggle.textContent = "Minimize";

  renderDriverColumnControls();
  renderDriverResultsGrid();
}

function closeDriverResultsPanel() {
  currentDriverResultType = "";
  document.getElementById("driverResultsPanel").classList.remove("open");
  document.getElementById("driverResultsGrid").innerHTML = "";
  document.getElementById("driverColumnControls").innerHTML = "";
}

function resetDriverResultsGrid() {
  driverSortState = { index: null, direction: "asc" };
  resetVisibleDriverColumns();
  renderDriverColumnControls();
  renderDriverResultsGrid();
}

function resetVisibleDriverColumns() {
  driverVisibleColumns = {};
  DRIVER_RESULT_COLUMNS.forEach(col => {
    driverVisibleColumns[col.index] = true;
  });
}

function renderDriverColumnControls() {
  document.getElementById("driverColumnControls").innerHTML = DRIVER_RESULT_COLUMNS.map(col => `
    <label>
      <input type="checkbox" data-driver-column="${col.index}" ${driverVisibleColumns[col.index] ? "checked" : ""}>
      ${escapeHtml(col.label)}
    </label>
  `).join("");

  document.querySelectorAll("[data-driver-column]").forEach(box => {
    box.addEventListener("change", () => {
      driverVisibleColumns[Number(box.dataset.driverColumn)] = box.checked;
      renderDriverResultsGrid();
    });
  });
}

function renderDriverResultsGrid() {
  const rowsToShow = getDriverRowsByType(currentDriverResultType);
  const visibleColumns = DRIVER_RESULT_COLUMNS.filter(col => driverVisibleColumns[col.index]);

  if (!visibleColumns.length) {
    document.getElementById("driverResultsGrid").innerHTML = `<div class="list-item">No columns selected.</div>`;
    return;
  }

  let sortedRows = [...rowsToShow];

  if (driverSortState.index !== null) {
    sortedRows.sort((a, b) => compareValuesTyped(get(a, driverSortState.index), get(b, driverSortState.index), driverSortState.direction, driverSortState.index));
  }

  document.getElementById("driverResultsGrid").innerHTML = `
    <table>
      <thead>
        <tr>
          ${visibleColumns.map(col => `<th data-sort-index="${col.index}">${escapeHtml(col.label)}${driverSortState.index === col.index ? ` ${driverSortState.direction === "asc" ? "▲" : "▼"}` : ""}</th>`).join("")}
        </tr>
      </thead>
      <tbody>
        ${sortedRows.map(row => `
          <tr>
            ${visibleColumns.map(col => `<td>${escapeHtml(get(row, col.index))}</td>`).join("")}
          </tr>
        `).join("")}
      </tbody>
    </table>
  `;

  document.querySelectorAll("[data-sort-index]").forEach(header => {
    header.addEventListener("click", () => {
      const index = Number(header.dataset.sortIndex);

      if (driverSortState.index === index) {
        driverSortState.direction = driverSortState.direction === "asc" ? "desc" : "asc";
      } else {
        driverSortState.index = index;
        driverSortState.direction = getDefaultSortDirection(index);
      }

      renderDriverResultsGrid();
    });
  });
}

function getDefaultSortDirection(index) {
  if (index === COL.DATE) return "asc";
  if ([COL.YEAR, COL.FINISH, COL.CAR_NUMBER, COL.START, COL.LAPS, COL.LAPS_LED].includes(index)) return "desc";
  return "asc";
}

function getDriverRowsByType(type) {
  if (type === "wins") return currentDriverRows.filter(row => isWin(row));
  if (type === "top5s") return currentDriverRows.filter(row => isTop5(row));
  if (type === "top10s") return currentDriverRows.filter(row => isTop10(row));
  return currentDriverRows;
}

function isWin(row) {
  return isTruthyStat(get(row, COL.WIN)) || numberValue(get(row, COL.FINISH)) === 1;
}

function isTop5(row) {
  return isTruthyStat(get(row, COL.TOP_5)) || (numberValue(get(row, COL.FINISH)) > 0 && numberValue(get(row, COL.FINISH)) <= 5);
}

function isTop10(row) {
  return isTruthyStat(get(row, COL.TOP_10)) || (numberValue(get(row, COL.FINISH)) > 0 && numberValue(get(row, COL.FINISH)) <= 10);
}

function setupStatCardDragging() {
  const grid = document.querySelector(".driver-stat-grid");
  let draggedCard = null;

  document.querySelectorAll(".driver-stat-card").forEach(card => {
    card.addEventListener("dragstart", event => {
      draggedCard = card;
      card.classList.add("dragging");
      grid.classList.add("reordering");
      event.dataTransfer.effectAllowed = "move";
    });

    card.addEventListener("dragend", () => {
      if (draggedCard) draggedCard.dataset.wasDragged = "true";
      card.classList.remove("dragging");
      grid.classList.remove("reordering");
      draggedCard = null;

      setTimeout(() => {
        document.querySelectorAll(".driver-stat-card").forEach(item => item.dataset.wasDragged = "false");
      }, 50);
    });

    card.addEventListener("dragover", event => {
      event.preventDefault();
      const afterElement = getDragAfterElement(grid, event.clientX);
      if (!draggedCard) return;

      if (afterElement == null) {
        grid.appendChild(draggedCard);
      } else {
        grid.insertBefore(draggedCard, afterElement);
      }
    });
  });
}

function getDragAfterElement(container, x) {
  const draggableElements = [...container.querySelectorAll(".driver-stat-card:not(.dragging)")];

  return draggableElements.reduce((closest, child) => {
    const box = child.getBoundingClientRect();
    const offset = x - box.left - box.width / 2;

    if (offset < 0 && offset > closest.offset) {
      return { offset, element: child };
    }

    return closest;
  }, { offset: Number.NEGATIVE_INFINITY }).element;
}

function toggleCollapse(button) {
  const targetId = button.dataset.collapseTarget;
  const target = document.getElementById(targetId);
  const panel = target.closest(".collapsible-panel");

  panel.classList.toggle("collapsed");
  button.textContent = panel.classList.contains("collapsed") ? "Expand" : "Minimize";
}

function compareValuesTyped(a, b, direction, index) {
  let result;

  if (index === COL.DATE) {
    result = dateSortValue(a) - dateSortValue(b);
  } else if (isNumberLike(a) && isNumberLike(b)) {
    result = numberValue(a) - numberValue(b);
  } else {
    result = String(a ?? "").localeCompare(String(b ?? ""), undefined, { numeric: true, sensitivity: "base" });
  }

  return direction === "asc" ? result : -result;
}

function dateSortValue(value) {
  const parsed = Date.parse(value);
  if (!Number.isNaN(parsed)) return parsed;

  const year = Number(String(value ?? "").match(/\d{4}/)?.[0]);
  return Number.isFinite(year) ? new Date(year, 0, 1).getTime() : 0;
}

function isNumberLike(value) {
  return String(value ?? "").trim().match(/^-?[\d,.]+$/);
}

function normalizeText(value) {
  return String(value ?? "")
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function isTruthyStat(value) {
  const clean = String(value ?? "").trim().toLowerCase();
  return clean === "1" || clean === "yes" || clean === "true" || clean === "y" || clean === "x";
}

function numberValue(value) {
  const n = Number(String(value ?? "").replace(/[^0-9.-]/g, ""));
  return Number.isFinite(n) ? n : 0;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function escapeAttribute(value) {
  return escapeHtml(value);
}
