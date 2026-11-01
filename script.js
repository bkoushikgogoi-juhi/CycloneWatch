
document.querySelectorAll(".brand-icon").forEach(icon => {
  icon.textContent = "CW";
  icon.classList.add("brand-logo-icon");
});

const appNav = document.querySelector(".app-nav");
if (appNav) {
  const currentPage = window.location.pathname.split("/").pop() || "index.html";
  appNav.innerHTML = `
    <a href="index.html" data-page="index.html"><span>⌂</span><small>মূল পৃষ্ঠা</small></a>
        <a href="sensors.html" data-page="sensors.html"><span>▥</span><small>সেন্সৰ</small></a>
        <button id="demoNavBtn" type="button"><span class="demo-nav-icon">▶</span><small>ডেমো</small></button>
        <a href="alerts.html" data-page="alerts.html"><span>🔔</span><small>সতৰ্কবাণী</small></a>
        <a href="map.html" data-page="map.html"><span>⌖</span><small>মানচিত্ৰ</small></a>
        <a href="safety.html" data-page="safety.html"><span>◈</span><small>নিরাপত্তা</small></a>
        <button id="bottomSettingsBtn" type="button"><span>⚙</span><small>ছেটিংছ</small></button>
        <a href="about.html" data-page="about.html"><span>ⓘ</span><small>পৰিচয়</small></a>
        <a href="emergency.html" data-page="emergency.html" class="emergency-nav"><span>☎</span><small>জৰুৰীকালীন</small></a>`;
  appNav.querySelector(`[data-page="${currentPage}"]`)?.classList.add("active");
}

if (!document.getElementById("settingsSheet")) {
  document.body.insertAdjacentHTML("beforeend", `
    <div id="settingsSheet" class="settings-sheet" aria-hidden="true">
      <button class="sheet-backdrop" type="button" aria-label="Close settings"></button>
      <section class="sheet-panel" role="dialog" aria-modal="true" aria-labelledby="settingsTitle">
        <div class="sheet-handle"></div>
        <div class="sheet-heading"><div><p class="sheet-kicker">APP SETTINGS</p><h2 id="settingsTitle">Appearance</h2></div><button id="closeSettingsBtn" class="sheet-close" type="button" aria-label="Close settings">×</button></div>
        <p class="settings-label">Choose your theme</p>
        <div class="theme-grid" role="group" aria-label="Theme selector">
          <button class="theme-card active" type="button" data-theme="dark"><span class="theme-preview dark-preview"></span><span>Midnight</span></button>
          <button class="theme-card" type="button" data-theme="blue"><span class="theme-preview blue-preview"></span><span>Ocean</span></button>
          <button class="theme-card" type="button" data-theme="light"><span class="theme-preview light-preview"></span><span>Daylight</span></button>
          <button class="theme-card" type="button" data-theme="storm"><span class="theme-preview storm-preview"></span><span>Storm</span></button>
          <button class="theme-card" type="button" data-theme="sunset"><span class="theme-preview sunset-preview"></span><span>Sunset</span></button>
        </div>
        <p class="settings-label">Language</p>
        <div class="language-grid" role="group" aria-label="Language selector">
          <button class="language-card active" type="button" data-language="as"><span>অসমীয়া</span><small>Assamese</small></button>
          <button class="language-card" type="button" data-language="en"><span>English</span><small>English</small></button>
        </div>
      </section>
    </div>`);
}

const waterValue = document.getElementById("waterValue");
const waterMeter = document.getElementById("waterMeter");
const rainValue = document.getElementById("rainValue");
const windValue = document.getElementById("windValue");

const waterStatus = document.getElementById("waterStatus");
const rainStatus = document.getElementById("rainStatus");
const waterTrend = document.getElementById("waterTrend");

const connectionStatus =
  document.getElementById("connectionStatus");

const connectBtn = document.getElementById("connectBtn");

const alertTitle = document.getElementById("alertTitle");
const alertMessage = document.getElementById("alertMessage");
const alertPanel = document.getElementById("alertPanel");

let demoTimer = null;
let previousWaterLevel = null;

function updateWaterTrend(currentLevel) {
  if (!waterTrend) return;

  let trend = "STABLE";
  let message = "পানীৰ স্তৰ প্ৰায় একে আছে।";
  let trendClass = "stable";

  if (previousWaterLevel !== null && Number.isFinite(previousWaterLevel)) {
    const change = currentLevel - previousWaterLevel;

    if (change > 0.05) {
      trend = "RISING";
      message = "পানীৰ স্তৰ বৃদ্ধি পাইছে।";
      trendClass = "rising";
    } else if (change < -0.05) {
      trend = "FALLING";
      message = "পানীৰ স্তৰ হ্ৰাস পাইছে।";
      trendClass = "falling";
    }
  }

  waterTrend.className = `water-trend ${trendClass}`;
  waterTrend.innerHTML =
    `<strong>${trend}</strong><span>${message}</span>`;
  previousWaterLevel = currentLevel;
}

// Start Demo Mode
function startDemo() {
  if (!connectBtn || !waterValue) {
    window.location.href = "sensors.html";
    return;
  }
  if (demoTimer) {
    clearInterval(demoTimer);
  }

  connectionStatus.textContent = "ডেমো মড সক্ৰিয়";
  connectBtn.textContent = "ডেমো চলি আছে";
  document.querySelector(".status-chip")?.replaceChildren();
  const statusChip = document.querySelector(".status-chip");
  if (statusChip) statusChip.innerHTML = '<i></i> লাইভ সিমুলেশ্বন';
  const liveDot = document.querySelector(".live-dot");
  if (liveDot) liveDot.textContent = "● লাইভ ডেমো";

  alertTitle.textContent = "ডেমো মড";
  alertMessage.textContent =
    "এইবোৰ নমুনা ৰিডিং; বাস্তৱ সেন্সৰৰ পৰিমাপ নহয়।";
  document.getElementById("riskStatus")?.replaceChildren(document.createTextNode("সচেতন"));
  document.getElementById("riskBadge")?.replaceChildren(document.createTextNode("মনিটৰিং"));
  window.updateCycloneMap?.("live", "মনিটৰিং");

  updateReadings("DATA,3.45,620,8");

  demoTimer = setInterval(() => {
    const water = (2 + Math.random() * 2).toFixed(2);
    const rain = Math.floor(400 + Math.random() * 400);
    const wind = Math.floor(Math.random() * 15);

    updateReadings(`DATA,${water},${rain},${wind}`);
  }, 2500);
}

// Connect button
connectBtn?.addEventListener("click", () => {
  startDemo();
});

// Receive Arduino data
function updateReadings(line) {
  if (!waterValue || !rainValue || !windValue) return;
  const parts = line.trim().split(",");

  if (parts.length !== 4 || parts[0] !== "DATA") {
    return;
  }

  const water = parts[1];
  const rain = Number(parts[2]);
  const wind = Number(parts[3]);

  let waterNumber = Number(water);

  if (water === "ERROR") {
    waterValue.textContent = "ত্ৰুটি";
    waterStatus.textContent = "পানীৰ সেন্সৰ পৰীক্ষা কৰক";
    previousWaterLevel = null;
    if (waterTrend) {
      waterTrend.className = "water-trend stable";
      waterTrend.innerHTML =
        "<strong>STABLE</strong><span>পানীৰ স্তৰ প্ৰায় একে আছে।</span>";
    }

    if (waterMeter) {
      waterMeter.style.width = "0%";
    }
  } else {
    if (!Number.isFinite(waterNumber)) return;

    waterValue.innerHTML =
      `${waterNumber.toFixed(2)} <small>ছেমি</small>`;

    waterStatus.textContent = waterNumber < 4
      ? "জলস্তৰ স্বাভাৱিক"
      : waterNumber < 6
        ? "জলস্তৰ বৃদ্ধি পাইছে"
        : "উচ্চ জলস্তৰৰ সতৰ্কবাণী";

    if (waterMeter) {
      const percentage = Math.max(
        0,
        Math.min(100, (waterNumber / 8.12) * 100)
      );

      waterMeter.style.width = percentage + "%";
    }

    updateWaterTrend(waterNumber);
  }

  if (!Number.isFinite(rain) || !Number.isFinite(wind)) {
    return;
  }

  rainValue.innerHTML = `${rain} <small>এমএম</small>`;
  windValue.innerHTML = `${wind} <small>কি.মি./ঘ.</small>`;

  rainStatus.textContent =
    rain < 500 ? "বৃষ্টিপাত কম" : "বৃষ্টিপাত বেছি";

  alertTitle.textContent = "সেন্সৰৰ তথ্য লাভ কৰা হৈছে";
  alertMessage.textContent =
    "ৰিডিং আপডেট হৈছে। বাস্তৱ জৰুৰীকালীন পৰিস্থিতিৰ বাবে চৰকাৰী বতৰ সতৰ্কবাণী মানি চলক।";

  alertPanel.style.borderLeftColor = "#55e0d0";

  const lastUpdated = document.getElementById("lastUpdated");

  if (lastUpdated) {
    lastUpdated.textContent =
      "শেষ আপডেট: " + new Date().toLocaleTimeString("as-IN");
  }

  const riskStatus = document.getElementById("riskStatus");
  const riskBadge = document.getElementById("riskBadge");
  const compactUpdated = document.getElementById("compactUpdated");
  if (waterNumber < 4 && rain < 700 && wind < 12) {
    if (riskStatus) riskStatus.textContent = "সুৰক্ষিত";
    if (riskBadge) riskBadge.textContent = "স্থিৰ";
  } else if (waterNumber >= 6 || rain >= 700 || wind >= 12) {
    if (riskStatus) riskStatus.textContent = "সতৰ্ক প্ৰয়োজন";
    if (riskBadge) riskBadge.textContent = "উচ্চ";
  } else {
    if (riskStatus) riskStatus.textContent = "সচেতন";
    if (riskBadge) riskBadge.textContent = "মনিটৰিং";
  }
  if (compactUpdated) compactUpdated.textContent = new Date().toLocaleTimeString("as-IN", { hour: "2-digit", minute: "2-digit" });

  window.updateCycloneMap?.(
    waterNumber >= 6 || rain >= 700 || wind >= 12 ? "alert" : "live",
    waterNumber >= 6 || rain >= 700 || wind >= 12 ? "সতৰ্ক" : "স্থিৰ"
  );
}


// Android app can call this function later.
window.onArduinoData = function(line) {
  if (demoTimer) {
    clearInterval(demoTimer);
    demoTimer = null;
  }

  connectionStatus.textContent = "Bluetooth: সংযুক্ত";
  connectBtn.textContent = "সংযুক্ত";
  const statusChip = document.querySelector(".status-chip");
  if (statusChip) statusChip.innerHTML = '<i></i> সেন্সৰ সংযুক্ত';
  const liveDot = document.querySelector(".live-dot");
  if (liveDot) liveDot.textContent = "● লাইভ ডাটা";

  updateReadings(line);
};

// App appearance and settings
const themeButtons = document.querySelectorAll(".theme-card");
const settingsSheet = document.getElementById("settingsSheet");
const settingsBtn = document.getElementById("settingsBtn");
const closeSettingsBtn = document.getElementById("closeSettingsBtn");
const sheetBackdrop = settingsSheet?.querySelector(".sheet-backdrop");
const toast = document.getElementById("toast");

function showToast(message) {
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => toast.classList.remove("show"), 2200);
}

function openSettings() {
  settingsSheet?.classList.add("open");
  settingsSheet?.setAttribute("aria-hidden", "false");
}

function closeSettings() {
  settingsSheet?.classList.remove("open");
  settingsSheet?.setAttribute("aria-hidden", "true");
}

settingsBtn?.addEventListener("click", openSettings);
document.getElementById("bottomSettingsBtn")?.addEventListener("click", openSettings);
closeSettingsBtn?.addEventListener("click", closeSettings);
sheetBackdrop?.addEventListener("click", closeSettings);
document.addEventListener("keydown", event => {
  if (event.key === "Escape") closeSettings();
});

function applyTheme(theme) {
  document.body.classList.remove("theme-blue", "theme-light", "theme-storm", "theme-sunset");

  if (theme === "blue") document.body.classList.add("theme-blue");
  if (theme === "light") document.body.classList.add("theme-light");
  if (theme === "storm") document.body.classList.add("theme-storm");
  if (theme === "sunset") document.body.classList.add("theme-sunset");

  themeButtons.forEach(button => {
    button.classList.toggle("active", button.dataset.theme === theme);
  });

  const themeColors = {
    dark: "#071b2c",
    blue: "#081d38",
    light: "#edf5f7",
    storm: "#161b25",
    sunset: "#3b1d4a"
  };

  document.querySelector('meta[name="theme-color"]')
    ?.setAttribute("content", themeColors[theme] || themeColors.dark);
  localStorage.setItem("cyclonewatch-theme", theme);
}

themeButtons.forEach(button => {
  button.addEventListener("click", () => {
    applyTheme(button.dataset.theme);
    showToast(`${button.querySelector("span:last-child")?.textContent || "Theme"} applied`);
  });
});

const savedTheme = localStorage.getItem("cyclonewatch-theme");
applyTheme(savedTheme && ["dark", "blue", "light", "storm", "sunset"].includes(savedTheme) ? savedTheme : "dark");

// Interactive Assam monitoring map
const mapElement = document.getElementById("monitoringMap");
if (mapElement && window.L) {
  const assamPosition = [26.2006, 92.9376];
  const dhemajiPosition = [27.4818, 94.5573];
  const ghilamaraShelter = [27.2870, 94.4750];
  const map = L.map("monitoringMap", {
    zoomControl: true,
    attributionControl: false,
    scrollWheelZoom: false
  }).setView(dhemajiPosition, window.location.pathname.endsWith("map.html") ? 8 : 7);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 18
  }).addTo(map);

  const markerIcon = L.divIcon({
    className: "cyclone-map-marker",
    html: '<span class="map-marker-pulse"></span><span class="map-marker-core">🌀</span>',
    iconSize: [44, 44],
    iconAnchor: [22, 22]
  });

  const monitoringMarker = L.marker(dhemajiPosition, { icon: markerIcon }).addTo(map);
  monitoringMarker.bindPopup("<strong>ডেমো ঘূৰ্ণীবতাহ স্থান</strong><br>ধেমাজি জিলা, অসম").openPopup();

  L.circle(dhemajiPosition, {
    radius: 18000,
    color: "#ff9b73",
    weight: 2,
    fillColor: "#ff806b",
    fillOpacity: 0.12,
    dashArray: "6 8"
  }).addTo(map);

  const shelterIcon = L.divIcon({
    className: "shelter-map-marker",
    html: '<span class="shelter-marker-core">⌂</span>',
    iconSize: [40, 40],
    iconAnchor: [20, 38]
  });

  const shelterMarker = L.marker(ghilamaraShelter, { icon: shelterIcon }).addTo(map);
  shelterMarker.bindPopup("<strong>ঘিলামৰা আশ্ৰয়স্থলী</strong><br>লখিমপুৰ জিলা, অসম<br><small>আনুমানিক স্থান</small>");

  let savedUserLocation = null;
  try {
    savedUserLocation = JSON.parse(localStorage.getItem("cyclonewatch-location"));
  } catch {
    savedUserLocation = null;
  }

  let userMarker = null;
  if (savedUserLocation?.latitude && savedUserLocation?.longitude) {
    const userIcon = L.divIcon({
      className: "user-location-map-marker",
      html: '<span class="user-marker-core">●</span>',
      iconSize: [28, 28],
      iconAnchor: [14, 14]
    });
    const userPosition = [savedUserLocation.latitude, savedUserLocation.longitude];
    userMarker = L.marker(userPosition, { icon: userIcon }).addTo(map);
    userMarker.bindPopup("<strong>আপোনাৰ সংৰক্ষিত স্থান</strong><br>ধেমাজিৰ মনিটৰিং অবস্থাৰ সৈতে সংযুক্ত");
  }

  if (window.location.pathname.endsWith("map.html")) {
    const latitudeStatus = document.getElementById("mapAreaStatus");
    if (latitudeStatus) latitudeStatus.textContent = savedUserLocation ? "ধেমাজি: মনিটৰিং চলি আছে" : "ডেমো জাগ্ৰত";
  }

  if (window.location.pathname.endsWith("map.html")) {
    if (savedUserLocation && new URLSearchParams(window.location.search).get("showLocation") === "1") {
      map.fitBounds(L.latLngBounds([
        dhemajiPosition,
        ghilamaraShelter,
        [savedUserLocation.latitude, savedUserLocation.longitude]
      ]), { padding: [42, 42], maxZoom: 9 });
      userMarker?.openPopup();
    } else {
      map.fitBounds(L.latLngBounds([dhemajiPosition, ghilamaraShelter]), { padding: [42, 42], maxZoom: 9 });
    }
  }

  document.getElementById("locateBtn")?.addEventListener("click", () => {
    map.flyTo(dhemajiPosition, 10, { duration: 1 });
    monitoringMarker.openPopup();
  });

  document.getElementById("shelterLocateBtn")?.addEventListener("click", () => {
    map.flyTo(ghilamaraShelter, 12, { duration: 1 });
    shelterMarker.openPopup();
  });

  document.getElementById("userLocationBtn")?.addEventListener("click", () => {
    if (!savedUserLocation) {
      showToast("প্ৰথমে প্ৰধান পৃষ্ঠাত আপোনাৰ স্থান যোগ কৰক");
      return;
    }
    const userPosition = [savedUserLocation.latitude, savedUserLocation.longitude];
    map.flyTo(userPosition, 11, { duration: 1 });
    userMarker?.openPopup();
  });

  window.updateCycloneMap = function(status, level = "সাধাৰণ") {
    mapElement.classList.toggle("map-alert", status === "alert");
    const mapStatus = document.getElementById("mapStatusText");
    const areaStatus = document.getElementById("mapAreaStatus");
    if (mapStatus) mapStatus.textContent = status === "alert" ? "সতৰ্ক অৱস্থা" : status === "live" ? "লাইভ" : "অপেক্ষাৰত";
    if (areaStatus) areaStatus.textContent = level;
  };
} else if (mapElement) {
  mapElement.innerHTML = '<div class="map-fallback"><span>অসম</span><strong>চিত্ৰ ল’ড কৰি থকা হৈছে…</strong></div>';
}

// Mobile app navigation
const appNavLinks = document.querySelectorAll(".app-nav a");
appNavLinks.forEach(link => {
  link.addEventListener("click", () => {
    appNavLinks.forEach(item => item.classList.remove("active"));
    link.classList.add("active");
  });
});

document.getElementById("demoNavBtn")?.addEventListener("click", () => {
  startDemo();
  document.getElementById("monitoring")?.scrollIntoView({ behavior: "smooth" });
  showToast("ডেমো মড আৰম্ভ হৈছে");
});

// User location tools
const addLocationBtn = document.getElementById("addLocationBtn");
const locationStatusBtn = document.getElementById("locationStatusBtn");
const locationName = document.getElementById("locationName");
const locationCoordinates = document.getElementById("locationCoordinates");
const locationStatusPanel = document.getElementById("locationStatusPanel");
const locationStatusTitle = document.getElementById("locationStatusTitle");
const locationStatusBadge = document.getElementById("locationStatusBadge");
const locationStatusMessage = document.getElementById("locationStatusMessage");
const dhemajiStatusText = document.getElementById("dhemajiStatusText");

const countrySelect = document.getElementById("countrySelect");
const regionSelect = document.getElementById("regionSelect");
const regionOptions = document.getElementById("regionOptions");
const saveRegionBtn = document.getElementById("saveRegionBtn");
const clearRegionBtn = document.getElementById("clearRegionBtn");

const countries = [
  "Afghanistan","Albania","Algeria","Andorra","Angola","Antigua and Barbuda","Argentina","Armenia","Australia","Austria","Azerbaijan",
  "Bahamas","Bahrain","Bangladesh","Barbados","Belarus","Belgium","Belize","Benin","Bhutan","Bolivia","Bosnia and Herzegovina","Botswana","Brazil","Brunei","Bulgaria","Burkina Faso","Burundi",
  "Cabo Verde","Cambodia","Cameroon","Canada","Central African Republic","Chad","Chile","China","Colombia","Comoros","Congo","Costa Rica","Croatia","Cuba","Cyprus","Czechia",
  "Democratic Republic of the Congo","Denmark","Djibouti","Dominica","Dominican Republic",
  "Ecuador","Egypt","El Salvador","Equatorial Guinea","Eritrea","Estonia","Eswatini","Ethiopia",
  "Fiji","Finland","France",
  "Gabon","Gambia","Georgia","Germany","Ghana","Greece","Grenada","Guatemala","Guinea","Guinea-Bissau","Guyana",
  "Haiti","Honduras","Hungary",
  "Iceland","India","Indonesia","Iran","Iraq","Ireland","Israel","Italy","Ivory Coast",
  "Jamaica","Japan","Jordan",
  "Kazakhstan","Kenya","Kiribati","Kuwait","Kyrgyzstan",
  "Laos","Latvia","Lebanon","Lesotho","Liberia","Libya","Liechtenstein","Lithuania","Luxembourg",
  "Madagascar","Malawi","Malaysia","Maldives","Mali","Malta","Marshall Islands","Mauritania","Mauritius","Mexico","Micronesia","Moldova","Monaco","Mongolia","Montenegro","Morocco","Mozambique","Myanmar",
  "Namibia","Nauru","Nepal","Netherlands","New Zealand","Nicaragua","Niger","Nigeria","North Korea","North Macedonia","Norway",
  "Oman",
  "Pakistan","Palau","Palestine","Panama","Papua New Guinea","Paraguay","Peru","Philippines","Poland","Portugal",
  "Qatar",
  "Romania","Russia","Rwanda",
  "Saint Kitts and Nevis","Saint Lucia","Saint Vincent and the Grenadines","Samoa","San Marino","Sao Tome and Principe","Saudi Arabia","Senegal","Serbia","Seychelles","Sierra Leone","Singapore","Slovakia","Slovenia","Solomon Islands","Somalia","South Africa","South Korea","South Sudan","Spain","Sri Lanka","Sudan","Suriname","Sweden","Switzerland","Syria",
  "Taiwan","Tajikistan","Tanzania","Thailand","Timor-Leste","Togo","Tonga","Trinidad and Tobago","Tunisia","Turkey","Turkmenistan","Tuvalu",
  "Uganda","Ukraine","United Arab Emirates","United Kingdom","United States","Uruguay","Uzbekistan",
  "Vanuatu","Vatican City","Venezuela","Vietnam",
  "Yemen",
  "Zambia","Zimbabwe"
];

const subdivisions = {
  "India": ["Andhra Pradesh","Arunachal Pradesh","Assam","Bihar","Chhattisgarh","Goa","Gujarat","Haryana","Himachal Pradesh","Jharkhand","Karnataka","Kerala","Madhya Pradesh","Maharashtra","Manipur","Meghalaya","Mizoram","Nagaland","Odisha","Punjab","Rajasthan","Sikkim","Tamil Nadu","Telangana","Tripura","Uttar Pradesh","Uttarakhand","West Bengal","Andaman and Nicobar Islands","Chandigarh","Dadra and Nagar Haveli and Daman and Diu","Delhi","Jammu and Kashmir","Ladakh","Lakshadweep","Puducherry"],
  "United States": ["Alabama","Alaska","Arizona","Arkansas","California","Colorado","Connecticut","Delaware","District of Columbia","Florida","Georgia","Hawaii","Idaho","Illinois","Indiana","Iowa","Kansas","Kentucky","Louisiana","Maine","Maryland","Massachusetts","Michigan","Minnesota","Mississippi","Missouri","Montana","Nebraska","Nevada","New Hampshire","New Jersey","New Mexico","New York","North Carolina","North Dakota","Ohio","Oklahoma","Oregon","Pennsylvania","Rhode Island","South Carolina","South Dakota","Tennessee","Texas","Utah","Vermont","Virginia","Washington","West Virginia","Wisconsin","Wyoming"]
};

function populateRegions(country) {
  if (!regionOptions) return;
  regionOptions.replaceChildren();
  (subdivisions[country] || []).forEach(region => {
    const option = document.createElement("option");
    option.value = region;
    regionOptions.appendChild(option);
  });
}

if (countrySelect) {
  countries.forEach(country => {
    const option = document.createElement("option");
    option.value = country;
    option.textContent = country;
    countrySelect.appendChild(option);
  });

  countrySelect.addEventListener("change", () => {
    if (regionSelect) regionSelect.value = "";
    populateRegions(countrySelect.value);
  });
}

function saveUserLocation(latitude, longitude, accuracy) {
  const location = { latitude, longitude, accuracy, savedAt: Date.now() };
  localStorage.setItem("cyclonewatch-location", JSON.stringify(location));

  if (locationName) locationName.textContent = "আপোনাৰ বৰ্তমান স্থান";
  if (locationCoordinates) {
    locationCoordinates.textContent =
      `${latitude.toFixed(4)}° N, ${longitude.toFixed(4)}° E · ±${Math.round(accuracy)}মি`;
  }
}

function getSavedLocation() {
  try {
    return JSON.parse(localStorage.getItem("cyclonewatch-location"));
  } catch {
    return null;
  }
}

function distanceInKm(first, second) {
  const earthRadius = 6371;
  const toRadians = degrees => degrees * Math.PI / 180;
  const latitudeDifference = toRadians(second.latitude - first.latitude);
  const longitudeDifference = toRadians(second.longitude - first.longitude);
  const firstLatitude = toRadians(first.latitude);
  const secondLatitude = toRadians(second.latitude);
  const value = Math.sin(latitudeDifference / 2) ** 2 +
    Math.cos(firstLatitude) * Math.cos(secondLatitude) *
    Math.sin(longitudeDifference / 2) ** 2;
  return earthRadius * 2 * Math.atan2(Math.sqrt(value), Math.sqrt(1 - value));
}

function updateSavedLocationDisplay() {
  const savedRegion = getSavedRegion();
  if (savedRegion?.country && savedRegion?.region) {
    if (locationName) locationName.textContent = `${savedRegion.region}, ${savedRegion.country}`;
    if (locationCoordinates) locationCoordinates.textContent = "Selected region saved";
    return;
  }
  const savedLocation = getSavedLocation();
  if (!savedLocation) return;
  if (locationName) locationName.textContent = "আপোনাৰ স্থান সংৰক্ষিত আছে";
  if (locationCoordinates) {
    locationCoordinates.textContent =
      `${savedLocation.latitude.toFixed(4)}° N, ${savedLocation.longitude.toFixed(4)}° E`;
  }
}

function getSavedRegion() {
  try {
    return JSON.parse(localStorage.getItem("cyclonewatch-region"));
  } catch {
    return null;
  }
}

const savedRegion = getSavedRegion();
if (savedRegion) {
  if (countrySelect) {
    countrySelect.value = savedRegion.country || "";
    populateRegions(countrySelect.value);
  }
  if (regionSelect) regionSelect.value = savedRegion.region || "";
}

saveRegionBtn?.addEventListener("click", () => {
  const country = countrySelect?.value || "";
  const region = regionSelect?.value.trim() || "";
  if (!country) {
    showToast("Please select a country");
    countrySelect?.focus();
    return;
  }
  if (!region) {
    showToast("Please select or enter a state / region");
    regionSelect?.focus();
    return;
  }

  localStorage.setItem("cyclonewatch-region", JSON.stringify({ country, region, savedAt: Date.now() }));
  if (locationName) locationName.textContent = `${region}, ${country}`;
  if (locationCoordinates) locationCoordinates.textContent = "Selected region saved";
  showToast("Region saved successfully");
});

clearRegionBtn?.addEventListener("click", () => {
  localStorage.removeItem("cyclonewatch-region");
  if (countrySelect) countrySelect.value = "";
  if (regionSelect) regionSelect.value = "";
  populateRegions("");
  updateSavedLocationDisplay();
  if (!getSavedLocation()) {
    if (locationName) locationName.textContent = "স্থান যোগ কৰা হোৱা নাই";
    if (locationCoordinates) locationCoordinates.textContent = "আপোনাৰ বৰ্তমান স্থান সংৰক্ষণ কৰক";
  }
  showToast("Region cleared");
});

addLocationBtn?.addEventListener("click", () => {
  if (!navigator.geolocation) {
    showToast("এই ডিভাইচত স্থান সেৱা উপলব্ধ নহয়");
    return;
  }

  addLocationBtn.disabled = true;
  addLocationBtn.textContent = "স্থান বিচাৰি আছে…";
  navigator.geolocation.getCurrentPosition(
    position => {
      saveUserLocation(
        position.coords.latitude,
        position.coords.longitude,
        position.coords.accuracy
      );
      addLocationBtn.disabled = false;
      addLocationBtn.textContent = "✓ স্থান আপডেট কৰক";
      showToast("আপোনাৰ স্থান সংৰক্ষণ কৰা হৈছে");
    },
    () => {
      addLocationBtn.disabled = false;
      addLocationBtn.textContent = "⌖ Share your location";
      showToast("স্থান অনুমতি প্ৰদান কৰক বা সঁজুলিৰ অৱস্থান সেৱা অন কৰক");
    },
    { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 }
  );
});

locationStatusBtn?.addEventListener("click", () => {
  const savedLocation = getSavedLocation();
  if (locationStatusPanel) locationStatusPanel.hidden = false;

  if (!savedLocation) {
    if (locationStatusTitle) locationStatusTitle.textContent = "স্থান পোৱা নগ’ল";
    if (locationStatusBadge) locationStatusBadge.textContent = "অজ্ঞাত";
    if (locationStatusMessage) {
      locationStatusMessage.textContent = "প্ৰথমে “আপোনাৰ স্থান যোগ কৰক” বাছনি কৰক। স্থান উপলব্ধ হ’লে পৰ্যালোচনা সঠিককৈ দেখুওৱা হ’ব।";
    }
    locationStatusPanel?.scrollIntoView({ behavior: "smooth", block: "center" });
    return;
  }

  const demoLocation = { latitude: 27.4818, longitude: 94.5573 };
  const distance = distanceInKm(
    { latitude: savedLocation.latitude, longitude: savedLocation.longitude },
    demoLocation
  );
  const nearby = distance <= 100;
  locationStatusPanel?.classList.toggle("alert", nearby);
  if (dhemajiStatusText) {
    dhemajiStatusText.textContent = nearby
      ? "ধেমাজি অঞ্চল: সতৰ্ক মনিটৰিং"
      : "ধেমাজি অঞ্চল: মনিটৰিং চলি আছে";
  }

  if (locationStatusTitle) {
    locationStatusTitle.textContent = nearby ? "নিৰীক্ষণ ক্ষেত্ৰৰ ওচৰত" : "স্থানীয় পৰ্যবেক্ষণ অঞ্চলৰ বাহিৰত";
  }
  if (locationStatusBadge) locationStatusBadge.textContent = nearby ? "সচেতন হোৱা উচিত" : "স্থিতি স্বাভাৱিক";
  if (locationStatusMessage) {
    locationStatusMessage.textContent =
      `আপোনাৰ স্থান ধেমাজি ডেমো মনিটৰিং অঞ্চলৰ পৰা প্ৰায় ${Math.round(distance)} কি.মি. দূৰত। ` +
      (nearby
        ? "এই ক্ষেত্ৰত বতাহ, বৃষ্টি আৰু জলস্তৰ নিয়মিত পৰ্যবেক্ষণ কৰক।"
        : "চৰকাৰী স্থানীয় সতৰ্কবাণী আৰু তেওঁৰ নিৰ্দেশনা মানি চলক।");
  }
  locationStatusPanel?.scrollIntoView({ behavior: "smooth", block: "center" });
});

updateSavedLocationDisplay();

// Assamese interface
const assameseText = {
  "Weather & Flood Monitoring":"বতৰ আৰু বান-পানী পৰ্যবেক্ষণ",
  "SCIENCE PROJECT":"বিজ্ঞান প্ৰকল্প",
  "Home":"মূল পৃষ্ঠা","Sensors":"সেন্সৰ",
  "Alerts":"সতৰ্কবাণী","Emergency":"জৰুৰীকালীন","Safety":"নিরাপত্তা",  "About":"পৰিচয়","Map":"মানচিত্ৰ",
  "Disaster Monitoring Dashboard":"দুৰ্যোগ পৰ্যবেক্ষণ ডেচব’ৰ্ড",
  "COMMUNITY SAFETY MONITOR":"সমুদায় নিরাপত্তা পৰ্যবেক্ষক",
  "Real-time wind, rainfall and water-level overview for your community.":"আপোনাৰ অঞ্চলৰ বতাহ, বৃষ্টিপাত আৰু জলস্তৰৰ লাইভ তথ্য।",
  "Awaiting first reading":"প্ৰথম ৰিডিংৰ বাবে অপেক্ষাৰত",
  "System standby":"চিষ্টেম সাজু আছে",
  "Device Connection":"সঁজুলি সংযোগ",
  "Not connected":"সংযুক্ত নহয়","Demo Mode":"ডেমো মড","Live Sensor Readings":"লাইভ সেন্সৰ ৰিডিং",
  "FloodGuard Mini":"ফ্লাডগাৰ্ড মিনি","Rain Sensor":"বৃষ্টিপাত সেন্সৰ","Wind Sensor":"বতাহ সেন্সৰ",
  "Waiting for data":"তথ্যৰ অপেক্ষাৰত","Pulses / 2 seconds":"প্ৰতি ২ ছেকেণ্ডত পালছ",
  "Monitoring Information":"পৰ্যবেক্ষণ তথ্য","Waiting for readings":"ৰিডিংৰ অপেক্ষাৰত",
  "Start Demo Mode to view sample sensor data.":"নমুনা সেন্সৰ তথ্য চাবলৈ ডেমো মড আৰম্ভ কৰক।",
  "Emergency Safety Guide":"জৰুৰীকালীন নিরাপত্তা নিৰ্দেশিকা",
  "About This Project":"এই প্ৰকল্পৰ বিষয়ে",
  "CycloneWatch is a student science-fair prototype that demonstrates environmental sensor monitoring and community safety information.":"CycloneWatch এক শিক্ষার্থী বিজ্ঞান-মেলা প্ৰোটোটাইপ যিয়ে পৰিবেশ সেন্সৰ পৰ্যবেক্ষণ আৰু সমুদায়ৰ নিৰাপত্তা তথ্য দেখুৱায়।",
  "This prototype does not predict cyclones or replace official weather and emergency warnings.":"এই প্ৰোটোটাইপে ঘূৰ্ণীঝড়ৰ পূৰ্বানুমান নকৰে আৰু চৰকাৰী বতৰ বা জৰুৰী সতৰ্কবাণীৰ সলনি নহয়।",
  "Sensor Dashboard":"সেন্সৰ ডেচব’ৰ্ড","Track local environmental readings.":"স্থানীয় পৰিবেশৰ সেন্সৰ ৰিডিং পৰ্যবেক্ষণ কৰক।",
  "LIVE MONITORING":"লাইভ পৰ্যবেক্ষণ",
  "Stay Safe":"নিরাপদে থাকক","Simple actions for severe weather situations.":"চণ্ডমাৰুত বতৰলৈ সহজ নিৰাপত্তামূলক পদক্ষেপ।",
  "EMERGENCY GUIDE":"জৰুৰীকালীন নিৰ্দেশিকা",
  "Weather Alerts":"বতৰ সতৰ্কবাণী","Review active warnings and recent monitoring notices.":"সক্ৰিয় সতৰ্কবাণী আৰু শেহতীয়া পৰ্যবেক্ষণ তথ্য চাওক।",
  "COMMUNITY UPDATES":"সমুদায়ৰ আপডেট",
  "No active cyclone alerts":"বৰ্তমান কোনো ঘূৰ্ণীঝড় সতৰ্কবাণী নাই",
  "This prototype is not connected to official alert services. Check government weather sources for verified warnings.":"এই প্ৰোটোটাইপ চৰকাৰী সতৰ্কবাণী সেৱাৰ সৈতে সংযুক্ত নহয়। প্ৰমাণিত সতর্কবার্তা জনা সরকারি বতৰ বিভাগৰ উৎস চাওক।",
  "Recent Notices":"শেহতীয়া জাননী",
  "Demo sensor readings":"ডেমো সেন্সৰ ৰিডিং",
  "Sample readings help demonstrate how alert notifications may appear.":"নমুনা ৰিডিংয়ে সতৰ্কবাণী জাননী কেনেকৈ দেখা যাব সেয়া দেখুৱায়।",
  "System ready":"চিষ্টেম সাজু",
  "Weather monitoring is standing by for connection or demo data.":"সংযোগ বা ডেমো ডাটাৰ বাবে বতৰ পৰ্যবেক্ষণ অপেক্ষাৰত আছে।",
  "Emergency Contacts":"জৰুৰীকালীন যোগাযোগ","National Emergency":"ৰাষ্ট্ৰীয় জৰুৰীকালীন",
  "Fire Service":"অগ্নিনিৰ্বাপক সেৱা","Police":"পুলিচ","Call now":"এতিয়া ফোন কৰক",
  "In immediate danger?":"তাৎক্ষণিক বিপদত?",
  "Move to a safe place, follow local evacuation instructions, and contact emergency services immediately.":"নিৰাপদ ঠাইলৈ যাওক, স্থানীয় স্থানান্তৰ নির্দেশ পালন কৰক আৰু তৎক্ষণাৎ জৰুৰীকালীন সেৱাত যোগাযোগ কৰক।",
  "About CycloneWatch":"CycloneWatchৰ বিষয়ে","A community-focused science fair prototype.":"সমুদায়-কেন্দ্ৰিত বিজ্ঞান মেলাৰ প্ৰোটোটাইপ।",
  "Sensor types":"সেন্সৰৰ ধৰণ","Visual themes":"ৰঙৰ থীম","App pages":"এপ পৃষ্ঠা",
  "Project Information":"প্ৰকল্পৰ তথ্য","Appearance":"দৰ্শন",
  "Choose your theme":"থীম বাছনি কৰক","Midnight":"মধ্যৰাতি","Ocean":"মহাসাগৰ",
  "Daylight":"পোহৰ","Storm":"চণ্ডমাৰুত","Sunset":"সূৰ্যাস্ত",
  "APP SETTINGS":"এপ ছেটিংছ","Settings":"ছেটিংছ","Demo":"ডেমো",
  "Demo notifications":"ডেমো জাননী","Show sample activity updates":"নমুনা কাৰ্যকলাপ আপডেট দেখুৱাওক",
  "Close settings":"ছেটিংছ বন্ধ কৰক","Appearance":"দৰ্শন","Theme":"থীম"
};

function translateAssamese(root = document.body) {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  const nodes = [];
  while (walker.nextNode()) nodes.push(walker.currentNode);
  nodes.forEach(node => {
    const original = node.nodeValue.trim();
    if (assameseText[original]) node.nodeValue = node.nodeValue.replace(original, assameseText[original]);
  });
  document.title = document.title.includes("Sensor") ? "সেন্সৰ ডেচব’ৰ্ড · CycloneWatch" :
    document.title.includes("Safety") ? "নিরাপত্তা নিৰ্দেশিকা · CycloneWatch" :
    document.title.includes("Alerts") ? "সতৰ্কবাণী · CycloneWatch" :
    document.title.includes("Emergency") ? "জৰুৰীকালীন · CycloneWatch" :
    document.title.includes("About") ? "পৰিচয় · CycloneWatch" : "CycloneWatch";
}

const originalTextNodes = [];
const originalTitle = document.title;
const originalLang = document.documentElement.lang || "as";
{
  const baselineWalker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  while (baselineWalker.nextNode()) {
    const node = baselineWalker.currentNode;
    originalTextNodes.push([node, node.nodeValue]);
  }
}

const englishFromAssamese = Object.entries(assameseText)
  .reduce((reverse, [english, assamese]) => {
    reverse[assamese] = english;
    return reverse;
  }, {});

function restoreOriginalText(root = document.body) {
  originalTextNodes.forEach(([node, value]) => {
    if (node.isConnected && root.contains(node)) node.nodeValue = value;
  });
  document.title = originalTitle;
}

function translateEnglish(root = document.body) {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  const nodes = [];
  while (walker.nextNode()) nodes.push(walker.currentNode);
  nodes.forEach(node => {
    const original = node.nodeValue.trim();
    if (englishFromAssamese[original]) {
      node.nodeValue = node.nodeValue.replace(original, englishFromAssamese[original]);
    }
  });
}

function applyLanguage(language) {
  const languageButtons = document.querySelectorAll(".language-card");
  languageButtons.forEach(button => {
    button.classList.toggle("active", button.dataset.language === language);
  });

  document.documentElement.lang = language === "en" ? "en" : "as";
  localStorage.setItem("cyclonewatch-language", language);

  if (language === "en") {
    restoreOriginalText();
    translateEnglish();
  } else {
    restoreOriginalText();
    translateAssamese();
  }
}

document.querySelectorAll(".language-card").forEach(button => {
  button.addEventListener("click", () => {
    applyLanguage(button.dataset.language);
  });
});

const savedLanguage = localStorage.getItem("cyclonewatch-language");
applyLanguage(savedLanguage === "en" ? "en" : "as");

// Register service worker for offline app files.
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./service-worker.js")
      .catch(error => {
        console.log("Offline setup:", error);
      });
  });
}
