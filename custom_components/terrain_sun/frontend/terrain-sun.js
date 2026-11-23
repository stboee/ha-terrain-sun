/* Terrain Sun dashboard cards. Chart geometry is based on the server model. */
const TYPES = {
  "terrain-sun-today": ["Sol i dag", "Sun today"],
  "terrain-sun-horizon": ["Lokal horisont", "Local horizon"],
  "terrain-sun-year": ["Solåret", "Solar year"],
};
const WORDS = {
  no: {
    title: "Tittel", graphHeight: "Grafhøyde", compact: "Kompakt", normal: "Normal", tall: "Høy",
    profileChoice: "Profil", compareProfile: "Sammenlign med", followDefault: "Følg standardprofil", noComparison: "Ingen",
    directDifference: "Forskjell i direkte soltid", sameDuration: "Samme soltid", transition: "Neste overgang", dailySun: "Direkte sol per dag (timer)",
    minElevation: "Nedre gradgrense", maxElevation: "Øvre gradgrense", autoElevation: "La feltet stå tomt for automatisk skalering.",
    horizonView: "Startvisning", viewMode: "Grafvisning", invalidView: "Velg en gyldig startvisning.",
    moonPath: "Månebane", showTwilight: "Vis skumring", showMoon: "Vis månen", moon: "Månen",
    sunCenter: "solsentrum", invalidHeight: "Velg Kompakt, Normal eller Høy.",
    invalidLimits: "Gradgrensene må være mellom −90° og 90°, med nedre grense under øvre grense.",
    direct: "Direkte sol", terrain_shade: "Dagslys i terrengskygge", daylight: "Dagslengde ved fri horisont",
    daylight_phase: "Dagslys", civil: "Borgerlig skumring", nautical: "Nautisk skumring",
    astronomical: "Astronomisk skumring", night: "Natt", golden: "Gyllen time",
    nextSun: "Neste direkte sol", nextShade: "Sola forsvinner", noChange: "Ingen overgang innen i morgen",
    noSun: "Ingen direkte sol", sunNow: "Direkte sol nå", behind: "Sola er under terrenghorisonten",
    periods: "Solperioder", phases: "Lysfaser", fromYesterday: "Endring fra i går", toTomorrow: "Endring til i morgen",
    fromPreviousDay: "Endring fra dagen før", toFollowingDay: "Endring til neste dag",
    lastWeek: "Endring siste 7 dager", nextWeek: "Endring neste 7 dager",
    similarSun: "Neste gang det er så lyst", nextSunDate: "Neste dato med direkte sol", noMatch: "Ingen tilsvarende dato funnet",
    noSunFound: "Ingen dato med direkte sol funnet", lookupFailed: "Kunne ikke beregne datoen",
    yearTotals: "Årssummer", annualSun: "Mulig direkte sol", annualDaylight: "Dagslys ved fri horisont",
    seasons: "Neste solverv og jevndøgn", solstices: "Solverv", equinoxes: "Jevndøgn", eveningSun: "Kveldssol",
    spring_equinox: "Vårjevndøgn", summer_solstice: "Sommersolverv", autumn_equinox: "Høstjevndøgn", winter_solstice: "Vintersolverv",
    daySingle: "dag", dayPlural: "dager",
    evening: "Klokkeslett for kveldssol", lastEvening: "Siste dato med direkte sol på dette klokkeslettet",
    elevation: "Øvre solrand", terrain: "Terrenghøyde", bearing: "Azimut", profile: "Terrengprofil",
    sunPath: "Solbane", area: "Utsnitt", circle: "360°", clock: "Klokkeslett", duration: "Varighet",
    year: "År", date: "Dato", graph: "Årsgraf", dayTrack: "Døgnstripe", hour: "t", minute: "min",
    loading: "Beregner …", unavailable: "Data er utilgjengelige. Kontroller at Terrain Sun er satt opp.",
    retry: "Prøv igjen", prev: "Forrige dag", next: "Neste dag", today: "I dag", directions: ["N", "Ø", "S", "V", "N"],
  },
  en: {
    title: "Title", graphHeight: "Chart height", compact: "Compact", normal: "Normal", tall: "Tall",
    profileChoice: "Profile", compareProfile: "Compare with", followDefault: "Follow default profile", noComparison: "None",
    directDifference: "Difference in direct sun", sameDuration: "Same duration", transition: "Next transition", dailySun: "Direct sun per day (hours)",
    minElevation: "Lower elevation limit", maxElevation: "Upper elevation limit", autoElevation: "Leave blank for automatic scaling.",
    horizonView: "Initial view", viewMode: "Chart view", invalidView: "Choose a valid initial view.",
    moonPath: "Moon path", showTwilight: "Show twilight", showMoon: "Show the moon", moon: "Moon",
    sunCenter: "sun center", invalidHeight: "Choose Compact, Normal, or Tall.",
    invalidLimits: "Elevation limits must be between −90° and 90°, with the lower limit below the upper limit.",
    direct: "Direct sun", terrain_shade: "Daylight in terrain shade", daylight: "Daylight with a clear horizon",
    daylight_phase: "Daylight", civil: "Civil twilight", nautical: "Nautical twilight",
    astronomical: "Astronomical twilight", night: "Night", golden: "Golden hour",
    nextSun: "Next direct sun", nextShade: "Sun drops below terrain", noChange: "No transition through tomorrow",
    noSun: "No direct sun", sunNow: "Direct sun now", behind: "Sun is below the terrain horizon",
    periods: "Sun periods", phases: "Light phases", fromYesterday: "Change since yesterday", toTomorrow: "Change by tomorrow",
    fromPreviousDay: "Change from previous day", toFollowingDay: "Change to following day",
    lastWeek: "Change over the past 7 days", nextWeek: "Change over the next 7 days",
    similarSun: "Next day with this much sun", nextSunDate: "Next date with direct sun", noMatch: "No matching date found",
    noSunFound: "No date with direct sun found", lookupFailed: "Could not calculate the date",
    yearTotals: "Annual totals", annualSun: "Potential direct sun", annualDaylight: "Daylight with a clear horizon",
    seasons: "Upcoming solstices and equinoxes", solstices: "Solstices", equinoxes: "Equinoxes", eveningSun: "Evening sun",
    spring_equinox: "Spring equinox", summer_solstice: "Summer solstice", autumn_equinox: "Autumn equinox", winter_solstice: "Winter solstice",
    daySingle: "day", dayPlural: "days",
    evening: "Evening sun at", lastEvening: "Last date with direct sun at this time",
    elevation: "Upper solar limb", terrain: "Terrain altitude", bearing: "Azimuth", profile: "Terrain profile",
    sunPath: "Sun path", area: "Detail", circle: "360°", clock: "Clock times", duration: "Duration",
    year: "Year", date: "Date", graph: "Annual chart", dayTrack: "Day timeline", hour: "h", minute: "min",
    loading: "Calculating …", unavailable: "Data is unavailable. Check that Terrain Sun is set up.",
    retry: "Retry", prev: "Previous day", next: "Next day", today: "Today", directions: ["N", "E", "S", "W", "N"],
  },
};

const STYLES = /* css */ `
  :host {display:block;min-width:0;container-type:inline-size}
  ha-card {
    --ts-sun:#f5ba4c;--ts-day:#a3cbd5;--ts-civil:#709bab;--ts-nautical:#507382;
    --ts-astronomical:#365260;--ts-night:#223742;--ts-moon:#9664ce;--ts-compare:#bc5265;
    --ts-line:var(--divider-color,#d7dfe3);--ts-muted:var(--secondary-text-color,#56636b);
    --ts-ink:var(--primary-text-color,#243139);--ts-accent:var(--primary-color,#007c8c);
    color:var(--ts-ink);overflow:hidden;
  }
  * {box-sizing:border-box}
  .body {padding:16px 18px 18px}
  header {display:flex;align-items:baseline;justify-content:space-between;flex-wrap:wrap;gap:5px 12px;margin-bottom:12px}
  h2 {margin:0;font-size:1.2rem;font-weight:650;line-height:1.3;letter-spacing:-.01em}
  .date {font-size:.82rem;color:var(--ts-muted)}
  .status {display:flex;align-items:center;gap:8px;font-size:.92rem;font-weight:600;margin:0 0 10px}
  .status span {width:9px;height:9px;border-radius:50%;background:var(--ts-nautical);flex:none}
  .status.sun span {background:var(--ts-sun)}
  dl {margin:9px 0 0}
  .row {display:flex;justify-content:space-between;align-items:baseline;gap:5px 12px;padding:7px 0;border-bottom:1px solid var(--ts-line);font-size:.85rem}
  .row:last-child {border:0}
  .row dt {color:var(--ts-muted)}
  .row dd {margin:0;font-weight:550;text-align:end;font-variant-numeric:tabular-nums}
  details {margin-top:10px;border-top:1px solid var(--ts-line);font-size:.84rem}
  summary {cursor:pointer;padding:10px 0 2px;color:var(--ts-muted)}
  .statusbox {font-size:.9rem;color:var(--ts-muted);min-height:38px;margin:7px 0}
  button, input, select {font:inherit;color:inherit}
  button, input, select {border:1px solid var(--ts-line);border-radius:7px;background:var(--card-background-color,var(--ha-card-background,#fff));padding:5px 9px;min-height:33px}
  button {cursor:pointer}
  button:disabled {opacity:.4;cursor:default}
  button[aria-pressed="true"] {color:var(--ts-accent);border-color:var(--ts-accent);font-weight:625}
  :focus-visible {outline:2px solid var(--ts-accent);outline-offset:2px}
  .controls {display:flex;align-items:center;gap:6px;flex-wrap:wrap;font-size:.82rem;margin:0 0 9px}
  .controls .view-modes {display:flex;flex-wrap:wrap;gap:6px;margin-inline-end:6px;min-width:0}
  .controls .spacer {flex:1}
  .controls label {display:flex;align-items:center;gap:5px}
  .profile-controls {column-gap:12px}
  .profile-controls label, .profile-controls select {min-width:0;max-width:100%}
  .profile-label {font-size:.82rem;color:var(--ts-muted);margin:0 0 8px;overflow-wrap:anywhere}
  .profile-heading {margin:8px 0 2px;font-size:.86rem;font-weight:600;overflow-wrap:anywhere}
  .compare-table {width:100%;border-collapse:collapse;margin-top:9px;table-layout:fixed;font-size:.85rem}
  .compare-table th, .compare-table td {padding:7px 5px;text-align:start;vertical-align:top;overflow-wrap:anywhere;border-bottom:1px solid var(--ts-line)}
  .compare-table th:first-child {width:42%;padding-inline-start:0}
  .compare-table thead th {font-weight:650}
  .compare-table th[scope="row"] {font-weight:400;color:var(--ts-muted)}
  .compare-table td {font-weight:550;font-variant-numeric:tabular-nums}
  .compare-label {display:none}
  .year-plot, .horizon-plot {width:100%;height:auto;display:block;overflow:visible}
  .axis {fill:var(--ts-muted);font:13px system-ui,sans-serif}
  .grid {stroke:var(--ts-line);stroke-width:1;vector-effect:non-scaling-stroke}
  .year-plot .hit {touch-action:pan-y;cursor:crosshair;fill:transparent}
  .season-line {stroke:var(--ts-ink);stroke-width:1.1;opacity:.85;filter:drop-shadow(0 0 1px #fff);vector-effect:non-scaling-stroke}
  .season-line.equinox {stroke-dasharray:3 4}
  .cursor {stroke:#fff;stroke-width:1.8;vector-effect:non-scaling-stroke;filter:drop-shadow(1px 0 #233942)}
  .sun-line {stroke:var(--ts-sun);stroke-width:2.5;fill:none;vector-effect:non-scaling-stroke}
  .shade-line {stroke:var(--ts-nautical);stroke-width:1.7;stroke-dasharray:4 3;fill:none;vector-effect:non-scaling-stroke}
  .terrain-fill {fill:var(--ts-civil);opacity:.24}
  .terrain-line {stroke:var(--ts-nautical);stroke-width:1.6;fill:none;vector-effect:non-scaling-stroke}
  .terrain-line.secondary, .annual-line.secondary {stroke:var(--ts-compare);stroke-dasharray:5 3}
  .annual-line {stroke:var(--ts-nautical);stroke-width:2;fill:none;vector-effect:non-scaling-stroke}
  .legend .profile-key {width:14px;height:0;border-top:2px solid var(--ts-nautical);border-radius:0}
  .legend .profile-key.secondary {border-color:var(--ts-compare);border-top-style:dashed}
  .horizon-pair {display:grid;gap:10px}
  .twilight-band {fill-opacity:.44}
  .moon-line {stroke:var(--ts-moon);stroke-width:2;stroke-linecap:round;fill:none;vector-effect:non-scaling-stroke}
  .moon-marker {fill:#eef2f5;stroke:#435864;stroke-width:1.4;vector-effect:non-scaling-stroke}
  .strip {position:relative;margin-top:9px;height:22px;border-radius:5px;overflow:hidden;background:var(--ts-night)}
  .strip span {position:absolute;height:100%;top:0;display:block}
  .strip i {position:absolute;width:2px;height:100%;background:#fff;box-shadow:0 0 0 1px #21364190}
  .strip-labels {display:flex;justify-content:space-between;color:var(--ts-muted);font-size:.69rem;margin:3px 0 1px;font-variant-numeric:tabular-nums}
  .legend {display:flex;flex-wrap:wrap;column-gap:12px;row-gap:5px;margin:8px 0;color:var(--ts-muted);font-size:.74rem}
  .legend span {display:inline-flex;align-items:center;gap:5px}
  .legend i {display:inline-block;width:9px;height:9px;border-radius:2px}
  .legend .moon-key {display:none}
  .body:has(.moon-marker) .moon-key {display:inline-flex}
  .legend .moon-key i {background:#eef2f5;border:1px solid #435864;border-radius:50%}
  .legend .moon-path-key {width:12px;height:2px;background:var(--ts-moon)}
  .legend .season-key {width:12px;height:0;border-top:1px solid var(--ts-ink);border-radius:0}
  .legend .season-key.equinox {border-top-style:dashed}
  .year-section {margin-top:12px;border-top:1px solid var(--ts-line);padding-top:10px}
  .year-section h3 {margin:0;font-size:.92rem;font-weight:625}
  .tone-direct {fill:var(--ts-sun);background:var(--ts-sun)}
  .tone-daylight {fill:var(--ts-day);background:var(--ts-day)}
  .tone-civil {fill:var(--ts-civil);background:var(--ts-civil)}
  .tone-nautical {fill:var(--ts-nautical);background:var(--ts-nautical)}
  .tone-astronomical {fill:var(--ts-astronomical);background:var(--ts-astronomical)}
  .tone-night {fill:var(--ts-night);background:var(--ts-night)}
  @container (max-width:470px) { .axis {font-size:18px} }
  @container (max-width:420px) {
    .compare-table thead {position:absolute;width:1px;height:1px;overflow:hidden;clip-path:inset(50%)}
    .compare-table tbody, .compare-table tr, .compare-table th, .compare-table td {display:block}
    .compare-table th:first-child {width:auto}
    .compare-table th[scope="row"] {border:0;padding-bottom:3px}
    .compare-table td {display:flex;justify-content:space-between;gap:8px;padding:3px 0}
    .compare-table td:not(:last-child) {border:0}
    .compare-label {display:inline;font-weight:400;color:var(--ts-muted)}
  }
  @container (min-width:780px) { .horizon-pair {grid-template-columns:repeat(2,minmax(0,1fr))} }
  @container (max-width:360px) { .body {padding-inline:12px} }
`;

const phaseOrder = ["night", "astronomical", "nautical", "civil", "daylight"];
const legendOrder = ["direct", "daylight", "civil", "nautical", "astronomical", "night"];
const horizonHeights = {
  compact: { plot: 171, card: 5 }, normal: { plot: 255, card: 6 }, tall: { plot: 342, card: 7 },
};
const horizonViews = { area: "area", circle: "circle", sun: "sunPath", moon: "moonPath" };
const f = value => Number(value).toFixed(2);
const row = (label, value) => `<div class="row"><dt>${label}</dt><dd>${value}</dd></div>`;
const toggler = (action, label, selected) =>
  `<button type="button" data-action="${action}" aria-pressed="${selected}">${label}</button>`;
const tone = (phase, direct) => direct ? "direct" : phase;
const normalize = value => ((value % 360) + 360) % 360;
const isNorwegian = language => /^(nb|nn|no)(-|$)/i.test(language);
const pickerLanguage = () =>
  document.querySelector("home-assistant")?.hass?.locale?.language ?? navigator.language;
const pickerWords = () => WORDS[isNorwegian(pickerLanguage()) ? "no" : "en"];
const escape = value => String(value).replace(/[&<>"']/g, c =>
  ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

function request(hass, view, options = {}) {
  return hass.callWS({ type: "terrain_sun/data", view, ...options });
}

function offsetDate(value, days) {
  const day = new Date(value + "T12:00:00Z");
  day.setUTCDate(day.getUTCDate() + days);
  return day.toISOString().slice(0, 10);
}

function localDate(stamp, zone) {
  return new Intl.DateTimeFormat("sv-SE", { dateStyle: "short", timeZone: zone }).format(stamp);
}

class SolarCard extends HTMLElement {
  static getConfigForm() {
    const words = pickerWords();
    const states = document.querySelector("home-assistant")?.hass?.states ?? {};
    const profiles = Object.values(states).find(state => state.attributes.terrain_sun_profiles)?.attributes.terrain_sun_profiles;
    const options = Object.entries(profiles ?? {}).map(([label, value]) => ({ label, value }));
    const schema = [{ name: "title", selector: { text: {} } }];
    if (options.length > 1) {
      schema.push(...[["profile", words.followDefault], ["compare_profile", words.noComparison]].map(([name, label]) => ({
        name, selector: { select: { mode: "dropdown", options: [{ value: "", label }, ...options] } },
      })));
    }
    const labels = { title: words.title, profile: words.profileChoice, compare_profile: words.compareProfile };
    return {
      schema,
      computeLabel: field => labels[field.name],
    };
  }

  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.shadowRoot.addEventListener("click", event => this.handleClick(event));
    this.shadowRoot.addEventListener("change", event => this.handleChange(event));
  }

  setConfig(config) {
    const changed = this.config?.profile !== config.profile || this.config?.compare_profile !== config.compare_profile;
    if (changed) {
      this.profileOverride = undefined;
      this.compareOverride = undefined;
    }
    this.config = config;
    this.draw();
    if (this.isConnected && (changed || !this.data)) this.refresh();
  }

  set hass(hass) {
    const changed = this._hass?.connection !== hass.connection;
    const selector = this.catalogue?.selector;
    const profilesChanged = selector && this._hass?.states?.[selector] !== hass.states?.[selector];
    this._hass = hass;
    const locale = hass.locale?.language ?? hass.language ?? "en";
    this.lang = isNorwegian(locale) ? "no" : "en";
    if (this.isConnected && (changed || profilesChanged || (!this.data && !this.pending && !this.error))) this.refresh();
  }

  get l() { return WORDS[this.lang ?? "en"]; }

  connectedCallback() {
    this.draw();
    this.refresh();
  }

  disconnectedCallback() {
    clearInterval(this.timer);
    this.timer = undefined;
  }

  handleClick(event) {
    if (event.target.dataset.action === "retry") this.refresh();
  }

  handleChange(event) {
    const { dataset, value } = event.target;
    if (dataset.field === "profile") this.profileOverride = value;
    else if (dataset.field === "compare") this.compareOverride = value;
    else return;
    this.refresh();
  }

  async load() {}

  async loadProfiles(view, args) {
    const catalogue = await request(this._hass, "profiles");
    const requested = this.profileOverride ?? this.config.profile ?? "";
    const compare = this.compareOverride ?? this.config.compare_profile ?? "";
    const primary = catalogue.profiles.find(profile => profile.id === requested)
      ?? catalogue.profiles.find(profile => profile.id === catalogue.default_profile);
    const secondary = catalogue.profiles.find(profile => profile.id === compare && profile.id !== primary.id);
    if (secondary && (view === "now" || view === "horizon") && !args.date) args = { ...args, date: catalogue.today };
    if (secondary && view === "year" && !args.year) args = { ...args, year: Number(catalogue.today.slice(0, 4)) };
    const read = profile => request(this._hass, view, { ...args, profile_id: profile.id });
    const [data, comparison] = await Promise.all([read(primary), secondary ? read(secondary) : null]);
    return { data, comparison, catalogue, primary, secondary, followsDefault: primary.id !== requested };
  }

  applyData(result) {
    Object.assign(this, result);
  }

  async refresh() {
    if (!this._hass || !this.config) return;
    this.refreshVersion = (this.refreshVersion ?? 0) + 1;
    if (this.pending) return;
    this.pending = true;
    this.error = false;
    this.draw();
    let version;
    do {
      version = this.refreshVersion;
      try {
        const result = await this.load();
        if (version === this.refreshVersion) this.applyData(result);
      } catch (error) {
        if (version === this.refreshVersion) this.error = true;
      }
    } while (version !== this.refreshVersion);
    this.pending = false;
    this.draw();
  }

  get title() {
    return escape(this.config?.title || TYPES[this.localName][this.lang === "no" ? 0 : 1]);
  }

  profileControls() {
    if (this.catalogue.profiles.length === 1) return `<p class="profile-label">${escape(this.primary.name)}</p>`;
    const options = (current, profiles) => profiles.map(profile =>
      `<option value="${escape(profile.id)}" ${profile.id === current ? "selected" : ""}>${escape(profile.name)}</option>`).join("");
    const available = this.catalogue.profiles.filter(profile => profile.id !== this.primary.id);
    const defaultName = this.catalogue.profiles.find(profile => profile.id === this.catalogue.default_profile).name;
    return `<div class="controls profile-controls">
      <label>${this.l.profileChoice} <select data-field="profile"><option value="" ${this.followsDefault ? "selected" : ""}>${this.l.followDefault} (${escape(defaultName)})</option>
        ${options(this.followsDefault ? "" : this.primary.id, this.catalogue.profiles)}</select></label>
      <label>${this.l.compareProfile} <select data-field="compare"><option value="">${this.l.noComparison}</option>
        ${options(this.secondary?.id, available)}</select></label>
    </div>`;
  }

  comparisonTable(rows, label = this.l.compareProfile) {
    const names = [escape(this.primary.name), escape(this.secondary.name)];
    return `<table class="compare-table" aria-label="${label}"><thead><tr><th scope="col" aria-label="${label}"></th>${names.map(name =>
      `<th scope="col">${name}</th>`).join("")}</tr></thead><tbody>${rows.map(([heading, a, b]) =>
      `<tr><th scope="row">${heading}</th>${[a, b].map((value, index) =>
        `<td><span class="compare-label" aria-hidden="true">${names[index]}</span><span>${value}</span></td>`).join("")}</tr>`).join("")}
    </tbody></table>`;
  }

  profileLegend() {
    return `<div class="legend"><span><i class="profile-key"></i>${escape(this.primary.name)}</span>
      <span><i class="profile-key secondary"></i>${escape(this.secondary.name)}</span></div>`;
  }

  formatClock(timestamp, zone, end) {
    if (timestamp === end) return "24:00";
    return new Intl.DateTimeFormat(this.lang === "no" ? "nb-NO" : "en-GB", {
      hour: "2-digit", minute: "2-digit", hourCycle: "h23", timeZone: zone,
    }).format(timestamp * 1000);
  }

  formatDate(value, includeYear = false) {
    return new Intl.DateTimeFormat(this.lang === "no" ? "nb-NO" : "en-GB", {
      day: "numeric", month: "short", year: includeYear ? "numeric" : undefined, timeZone: "UTC",
    }).format(new Date(value + "T12:00:00Z"));
  }

  dateControls(date, min, max, showToday = true) {
    return `<div class="controls">
      <button type="button" data-action="prev" aria-label="${this.l.prev}" ${date === min ? "disabled" : ""}>‹</button>
      <label><input type="date" data-field="day" aria-label="${this.l.date}" value="${date}" min="${min}" max="${max}"></label>
      <button type="button" data-action="next" aria-label="${this.l.next}" ${date === max ? "disabled" : ""}>›</button>
      ${showToday ? `<button type="button" data-action="today">${this.l.today}</button>` : ""}
    </div>`;
  }

  formatDuration(value) {
    const minutes = Math.round(Math.abs(value) / 60);
    const prefix = value < 0 && minutes ? "−" : "";
    const hours = Math.floor(minutes / 60);
    return hours
      ? `${prefix}${hours} ${this.l.hour} ${String(minutes % 60).padStart(2, "0")} ${this.l.minute}`
      : `${prefix}${minutes} ${this.l.minute}`;
  }

  formatDelta(value) {
    return (Math.round(value / 60) > 0 ? "+" : "") + this.formatDuration(value);
  }

  formatPeriods(periods, day, zone) {
    return periods.map(([start, end]) =>
      `${this.formatClock(start, zone)}–${this.formatClock(end, zone, day.end)}`).join(" · ") || "—";
  }

  legend(comparison = false) {
    return `<div class="legend">${comparison ? "" : legendOrder.map(key =>
      `<span><i class="tone-${key}"></i>${key === "daylight" ? this.l.terrain_shade : this.l[key]}</span>`).join("")}
      <span><i class="season-key"></i>${this.l.solstices}</span><span><i class="season-key equinox"></i>${this.l.equinoxes}</span></div>`;
  }

  timeline(day, zone, now = null, showClock = true) {
    const duration = day.end - day.start;
    if (!duration) return "";
    const spans = day.bands.map(([start, end, phase, direct]) =>
      `<span class="tone-${tone(phase, direct)}" style="left:${f((start - day.start) / duration * 100)}%;width:${f((end - start) / duration * 100)}%" title="${escape(direct ? this.l.direct : this.l[phase === "daylight" ? "terrain_shade" : phase])} ${this.formatClock(start, zone)}–${this.formatClock(end, zone, day.end)}"></span>`).join("");
    const marker = now >= day.start && now < day.end
      ? `<i style="left:${f((now - day.start) / duration * 100)}%"></i>` : "";
    const labels = [0, .25, .5, .75, 1].map(fraction =>
      `<span>${this.formatClock(day.start + duration * fraction, zone, day.end)}</span>`).join("");
    return `<div class="strip" aria-label="${this.l.dayTrack}">${spans}${marker}</div>${showClock ? `<div class="strip-labels">${labels}</div>` : ""}`;
  }

  draw() {
    if (!this.isConnected || !this.config) return;
    const content = this.error
      ? `<p class="statusbox">${this.l.unavailable}</p><button data-action="retry">${this.l.retry}</button>`
      : this.data ? this.renderData() : `<p class="statusbox">${this.l.loading}</p>`;
    this.shadowRoot.innerHTML = `<style>${STYLES}</style><ha-card><div class="body">${content}</div></ha-card>`;
  }
}

class DatedCard extends SolarCard {
  selectedDate = null;

  connectedCallback() {
    super.connectedCallback();
    this.timer = setInterval(() => this.refresh(), 60000);
  }

  dateBounds() {
    const year = Number(this.data.today.slice(0, 4));
    return [`${year - 5}-01-01`, `${year + 5}-12-31`];
  }

  async selectDate(date, action) {
    const selected = date === this.data.today ? null : date;
    if (selected === this.selectedDate) return;
    this.selectedDate = selected;
    await this.refresh();
    if (action && selected === this.selectedDate && !this.shadowRoot.activeElement) {
      this.shadowRoot.querySelector(`[data-action="${action}"]`)?.focus();
    }
  }

  handleClick(event) {
    const { action } = event.target.dataset;
    if (action === "prev" || action === "next") {
      const date = offsetDate(this.selectedDate ?? this.data.today, action === "prev" ? -1 : 1);
      const [min, max] = this.dateBounds();
      if (date >= min && date <= max) this.selectDate(date, action);
    } else if (action === "today") {
      this.selectDate(this.data.today, action);
    } else super.handleClick(event);
  }

  handleChange(event) {
    const input = event.target;
    if (input.dataset.field === "day") {
      if (input.value && input.validity.valid) this.selectDate(input.value);
    } else super.handleChange(event);
  }
}

class TodayCard extends DatedCard {
  getCardSize() { return 5; }

  async load() {
    return this.loadProfiles("now", this.selectedDate ? { date: this.selectedDate } : {});
  }

  dailyRows(data) {
    const { day, direct, next, zone, today, yesterday_delta, tomorrow_delta, last_week_delta, next_week_delta } = data;
    const isToday = day.date === today;
    const nextDate = next ? localDate(next * 1000, zone) : null;
    const nextLabel = next
      ? (nextDate === today ? "" : this.formatDate(nextDate) + " · ") + this.formatClock(next, zone)
      : this.l.noChange;
    const transitionLabel = direct ? this.l.nextShade : this.l.nextSun;
    return [
      ...(isToday ? [this.comparison ? [this.l.transition, next ? `${transitionLabel} · ${nextLabel}` : nextLabel]
        : [transitionLabel, nextLabel]] : []),
      [this.l.periods, day.direct.length ? this.formatPeriods(day.direct, day, zone) : this.l.noSun],
      [this.l.direct, this.formatDuration(day.totals.direct)],
      [this.l.daylight, this.formatDuration(day.totals.daylight)],
      [this.l.terrain_shade, this.formatDuration(day.totals.terrain_shade)],
      [isToday ? this.l.fromYesterday : this.l.fromPreviousDay, this.formatDelta(yesterday_delta)],
      [isToday ? this.l.toTomorrow : this.l.toFollowingDay, this.formatDelta(tomorrow_delta)],
      [this.l.lastWeek, this.formatDelta(last_week_delta)],
      [this.l.nextWeek, this.formatDelta(next_week_delta)],
    ];
  }

  phaseRows({ day, zone }) {
    const phases = phaseOrder.map(phase => {
      const periods = [];
      for (const [start, end, name] of day.bands) {
        if (name !== phase) continue;
        if (periods.at(-1)?.[1] === start) periods.at(-1)[1] = end;
        else periods.push([start, end]);
      }
      return [this.l[phase === "daylight" ? "daylight_phase" : phase], this.formatPeriods(periods, day, zone)];
    });
    return [...phases, [this.l.golden, this.formatPeriods(day.golden, day, zone)]];
  }

  renderData() {
    const { day, today } = this.data;
    const opened = this.shadowRoot.querySelector("details")?.open;
    const chart = (data, profile, showClock) => `${this.comparison ? `<h3 class="profile-heading">${escape(profile.name)}</h3>` : ""}
      ${data.day.date === data.today ? `<p class="status ${data.direct ? "sun" : ""}"><span></span>${data.direct ? this.l.sunNow : this.l.behind}</p>` : ""}
      ${this.timeline(data.day, data.zone, data.time ?? null, showClock)}`;
    const daily = this.dailyRows(this.data);
    const phases = this.phaseRows(this.data);
    const other = this.comparison;
    let values = `<dl>${daily.map(args => row(...args)).join("")}</dl>`;
    let phaseValues = `<dl>${phases.map(args => row(...args)).join("")}</dl>`;
    if (other) {
      const otherDaily = this.dailyRows(other);
      const otherPhases = this.phaseRows(other);
      const delta = other.day.totals.direct - day.totals.direct;
      const difference = Math.round(Math.abs(delta) / 60)
        ? `${escape(this.secondary.name)} ${this.formatDelta(delta)}` : this.l.sameDuration;
      const dailyValues = new Map(daily), otherValues = new Map(otherDaily);
      const labels = new Set([...dailyValues.keys(), ...otherValues.keys()]);
      values = this.comparisonTable([...labels].map(label => [label, dailyValues.get(label) ?? "—", otherValues.get(label) ?? "—"]))
        + `<dl>${row(this.l.directDifference, difference)}</dl>`;
      phaseValues = this.comparisonTable(phases.map(([label, value], i) => [label, value, otherPhases[i][1]]), this.l.phases);
    }
    return `<header><h2>${this.title}</h2><span class="date">${this.formatDate(day.date)}</span></header>
      ${this.profileControls()}
      ${this.dateControls(this.selectedDate ?? today, ...this.dateBounds())}
      ${chart(this.data, this.primary, !other)}${other ? chart(other, this.secondary, true) : ""}
      ${values}<details ${opened ? "open" : ""}><summary>${this.l.phases}</summary>${phaseValues}</details>`;
  }
}

function horizonElevation(profile, azimuth) {
  azimuth = normalize(azimuth);
  const index = profile.findIndex(point => point[0] > azimuth);
  const [left, right] = [profile[index - 1], profile[index]];
  return left[1] + (right[1] - left[1]) * (azimuth - left[0]) / (right[0] - left[0]);
}

const bearingDelta = (from, to) => normalize(to - from + 180) - 180;

function pathBearingRange(path) {
  // Track the swept arc, including crossings of north or changes of direction.
  let unwrapped = path[0][1];
  let low = unwrapped, high = unwrapped;
  for (let i = 1; i < path.length; i++) {
    unwrapped += bearingDelta(path[i - 1][1], path[i][1]);
    low = Math.min(low, unwrapped);
    high = Math.max(high, unwrapped);
  }
  const start = normalize(low);
  return [start, start + high - low];
}

function fitBearingRanges(ranges) {
  const occupied = ranges.map(([begin, end]) => [normalize(begin), end - begin]);
  // Try a cut at the start of each occupied arc and keep the tightest enclosure.
  let best = [0, 360];
  for (const [start] of occupied) {
    const span = Math.max(...occupied.map(([begin, length]) => normalize(begin - start) + length));
    if (span < best[1] - best[0]) best = [start, start + span];
  }
  return best;
}

function horizonArc(profile, start, stop, bearing) {
  const arc = [[start, horizonElevation(profile, start)], [stop, horizonElevation(profile, stop)]];
  for (const [angle, height] of profile) {
    if (angle === 360) continue;
    const projected = bearing(angle);
    if (projected > start && projected < stop) arc.push([projected, height]);
  }
  return arc.sort((a, b) => a[0] - b[0]);
}

function pathSegments(path, bearing, start, stop) {
  const segments = [];
  for (let index = 1; index < path.length; index++) {
    const [fromTime, fromAz, fromAltitude] = path[index - 1];
    const [toTime, toAz, toAltitude] = path[index];
    const sweep = bearingDelta(fromAz, toAz);
    const time = (fromTime + toTime) / 2;
    // Clip each copy at the chart edges, including paths across the 0°/360° seam.
    for (const turn of [-360, 0, 360]) {
      const az = bearing(fromAz) + turn;
      if (sweep === 0) {
        if (az >= start && az < stop) segments.push([time, az, fromAltitude, az, toAltitude]);
        continue;
      }
      const edges = [(start - az) / sweep, (stop - az) / sweep];
      const first = Math.max(0, Math.min(...edges));
      const last = Math.min(1, Math.max(...edges));
      if (first >= last) continue;
      const rise = toAltitude - fromAltitude;
      segments.push([time, az + first * sweep, fromAltitude + first * rise, az + last * sweep, fromAltitude + last * rise]);
    }
  }
  return segments;
}

class HorizonCard extends DatedCard {
  static getConfigForm() {
    const { schema, computeLabel } = super.getConfigForm();
    const words = pickerWords();
    const labels = {
      title: words.title, graph_height: words.graphHeight, min_elevation: words.minElevation,
      max_elevation: words.maxElevation, horizon_view: words.horizonView,
      show_twilight: words.showTwilight, show_moon: words.showMoon,
    };
    const elevation = { number: { min: -90, max: 90, step: 0.1, mode: "box", unit_of_measurement: "°" } };
    const heights = Object.keys(horizonHeights).map(value => ({ value, label: words[value] }));
    const views = Object.entries(horizonViews).map(([value, label]) => ({ value, label: words[label] }));
    return {
      schema: [
        ...schema,
        { name: "graph_height", selector: { select: { options: heights, mode: "dropdown" } } },
        { name: "min_elevation", selector: elevation },
        { name: "max_elevation", selector: elevation },
        { name: "horizon_view", selector: { select: { options: views, mode: "dropdown" } } },
        { name: "show_twilight", selector: { boolean: {} } },
        { name: "show_moon", selector: { boolean: {} } },
      ],
      computeLabel: field => labels[field.name] ?? computeLabel(field),
      computeHelper: field => field.selector?.number ? words.autoElevation : undefined,
    };
  }

  get view() { return "horizon"; }
  get graphSize() { return horizonHeights[this.config?.graph_height ?? "tall"]; }
  get wantsMoonPath() { return this.mode === "moon"; }
  getCardSize() { return this.graphSize.card; }

  setConfig(config) {
    const graph_height = config.graph_height ?? "tall";
    if (!Object.hasOwn(horizonHeights, graph_height)) throw new Error(pickerWords().invalidHeight);
    const min_elevation = config.min_elevation === "" ? null : config.min_elevation ?? null;
    const max_elevation = config.max_elevation === "" ? null : config.max_elevation ?? null;
    const low = min_elevation ?? -90;
    const high = max_elevation ?? 90;
    if (!Number.isFinite(low) || !Number.isFinite(high) || low < -90 || high > 90 || low >= high) {
      throw new Error(pickerWords().invalidLimits);
    }
    const show_moon = config.show_moon === true;
    const moonChanged = this.config?.show_moon !== show_moon;
    const legacyView = (config.fixed_sun ?? config.center_sun) === true ? "sun" : "area";
    const horizon_view = config.horizon_view === "" ? legacyView : config.horizon_view ?? legacyView;
    if (!Object.hasOwn(horizonViews, horizon_view)) throw new Error(pickerWords().invalidView);
    const hadMoonPath = this.wantsMoonPath;
    if (this.config?.horizon_view !== horizon_view) this.mode = horizon_view;
    const show_twilight = config.show_twilight === true;
    if (this.config?.show_twilight !== show_twilight) this.showTwilight = show_twilight;
    super.setConfig({ ...config, graph_height, min_elevation, max_elevation, show_moon, horizon_view, show_twilight });
    if (this.isConnected && (moonChanged || (!hadMoonPath && this.wantsMoonPath))) this.refresh();
  }

  async load() {
    return this.loadProfiles(this.view, {
      ...(this.selectedDate && { date: this.selectedDate }),
      moon: this.config.show_moon,
      ...(this.wantsMoonPath && { moon_path: true }),
    });
  }

  handleClick(event) {
    const { action } = event.target.dataset;
    const modeButton = Object.hasOwn(horizonViews, action);
    if (modeButton || action === "show-twilight") {
      if (modeButton) {
        if (action === this.mode) return;
        this.mode = action;
      } else this.showTwilight = !this.showTwilight;
      if (modeButton && this.wantsMoonPath && (!this.data.moon_path || (this.comparison && !this.comparison.moon_path))) this.refresh();
      else this.draw();
    } else super.handleClick(event);
  }

  draw() {
    const action = this.shadowRoot.activeElement?.dataset.action;
    super.draw();
    if (Object.hasOwn(horizonViews, action) || action === "show-twilight") {
      requestAnimationFrame(() => {
        if (!this.shadowRoot.activeElement) this.shadowRoot.querySelector(`[data-action="${action}"]`)?.focus();
      });
    }
  }

  chartGeometry(datasets) {
    const { min_elevation, max_elevation } = this.config;
    const fitPath = this.mode === "sun" || this.wantsMoonPath;
    const left = 39, right = 606, top = 12, bottom = top + this.graphSize.plot;
    const solar = datasets.map(data => data.day.path.map(([time, az, , altitude]) => [time, az, altitude]));
    const lunar = this.wantsMoonPath ? datasets.map(data => data.moon_path) : [];
    const summits = solar.map(path => path.reduce((best, sample) => sample[2] > best[2] ? sample : best));
    const ranges = fitPath ? [...solar, ...lunar].map(pathBearingRange) : solar.map((path, index) => {
      const [, center, height] = summits[index];
      const active = path.filter(point => point[2] >= Math.min(-4, height - 1)).map(([, az]) => center + bearingDelta(center, az));
      return [Math.min(...active), Math.max(...active)];
    });
    const [leftmost, rightmost] = fitBearingRanges(ranges);
    const zoomMin = Math.floor((leftmost - 18) / 30) * 30;
    const zoomMax = Math.ceil((rightmost + 18) / 30) * 30;
    const full = this.mode === "circle" || zoomMax - zoomMin >= 360;
    const [start, stop] = full ? [0, 360] : [zoomMin, zoomMax];
    const bearing = angle => start + normalize(angle - start);
    const arcs = datasets.map(data => horizonArc(data.profile, start, stop, bearing));
    const profileHeights = arcs.flatMap(arc => arc.map(point => point[1]));
    const pathHeights = fitPath ? [...solar, ...lunar].flatMap(path => path.map(point => point[2])) : summits.map(point => point[2]);
    const lowHeights = fitPath ? [...profileHeights, ...pathHeights] : profileHeights;
    const autoLow = Math.max(-90, Math.min(-8, Math.floor((Math.min(...lowHeights) - 2) / 5) * 5));
    const autoHigh = Math.min(90, Math.max(10, Math.ceil((Math.max(...pathHeights, ...profileHeights) + 2) / 5) * 5));
    const low = fitPath ? autoLow
      : min_elevation ?? Math.min(autoLow, Math.max(-90, (max_elevation ?? 90) - 5));
    const high = fitPath ? autoHigh : max_elevation ?? Math.max(autoHigh, Math.min(90, low + 5));
    const x = angle => left + (angle - start) / (stop - start) * (right - left);
    const y = altitude => bottom - (altitude - low) / (high - low) * (bottom - top);
    return { start, stop, low, high, left, right, top, bottom, x, y, bearing, fitPath, arcs, solar, lunar };
  }

  chart(twilight, geometry, index = 0, overlay = false) {
    const data = index ? this.comparison : this.data;
    const { day, azimuth, elevation, direct, today, phase_limits, moon } = data;
    const { start, stop, low, high, left, right, top, bottom, x, y, bearing, fitPath, arcs, solar, lunar } = geometry;
    const path = solar[index], lunarPath = lunar[index] ?? [];
    const arcLine = arc => arc.map(([az, ele], point) => `${point ? "L" : "M"}${f(x(az))},${f(y(ele))}`).join("");
    const line = arcLine(arcs[index]);
    const otherLine = overlay ? arcLine(arcs[1]) : "";
    const grid = [];
    const span = high - low;
    const verticalStep = span > (fitPath ? 80 : 45) ? 20 : span > 20 ? 10 : span > 8 ? 5 : span >= 3 ? 2 : 1;
    const ticks = [];
    for (let height = Math.ceil(low / verticalStep) * verticalStep; height <= high; height += verticalStep) {
      ticks.push(height);
    }
    for (const height of ticks.length > 1 ? ticks : [low, high]) {
      grid.push(`<path class="grid" d="M${left},${f(y(height))}H${right}"/><text class="axis" x="${left - 6}" y="${f(y(height) + 4)}" text-anchor="end">${height}°</text>`);
    }
    const horizontalStep = stop - start >= 240 ? 60 : 30;
    for (let angle = Math.ceil(start / horizontalStep) * horizontalStep; angle <= stop; angle += horizontalStep) {
      const cardinal = normalize(angle) % 90 === 0 ? this.l.directions[normalize(angle) / 90] : "";
      const label = cardinal || `${normalize(angle)}°`;
      grid.push(`<path class="grid" d="M${f(x(angle))},${top}V${bottom}"/><text class="axis" x="${f(x(angle))}" y="${bottom + 21}" text-anchor="middle">${label}</text>`);
    }
    const paths = { sun: [], shade: [] };
    const drawSegment = (a, aAltitude, b, bAltitude) => `M${f(x(a))},${f(y(aAltitude))}L${f(x(b))},${f(y(bAltitude))}`;
    for (const [time, a, aAltitude, b, bAltitude] of pathSegments(path, bearing, start, stop)) {
      if (aAltitude < low && bAltitude < low) continue;
      const shown = day.direct.some(([from, to]) => from <= time && time < to);
      paths[shown ? "sun" : "shade"].push(drawSegment(a, aAltitude, b, bAltitude));
    }
    const lunarLine = pathSegments(lunarPath, bearing, start, stop).map(([, ...segment]) => drawSegment(...segment)).join("");
    const bands = twilight ? phaseOrder.slice(0, -1).map((phase, index) => {
      const bandBottom = Math.max(low, phase_limits[index - 1] ?? low);
      const bandTop = Math.min(high, phase_limits[index]);
      return bandTop > bandBottom ? `<rect class="twilight-band tone-${phase}" x="${left}" y="${f(y(bandTop))}" width="${right - left}" height="${f(y(bandBottom) - y(bandTop))}"><title>${this.l[phase]}</title></rect>` : "";
    }).join("") : "";
    const inView = (az, altitude) => az >= start && az <= stop && altitude >= low && altitude <= high;
    const now = bearing(azimuth);
    const sunMarker = day.date === today && inView(now, elevation)
      ? `<circle class="sun-marker" cx="${f(x(now))}" cy="${f(y(elevation))}" r="5.7" fill="var(${direct ? "--ts-sun" : "--ts-nautical"})" stroke="#fff" stroke-width="1.3"/>` : "";
    const moonBearing = bearing(moon?.azimuth);
    const moonAltitude = day.date === today && this.config.show_moon ? moon?.elevation : undefined;
    const moonMarker = inView(moonBearing, moonAltitude)
      ? `<circle class="moon-marker" cx="${f(x(moonBearing))}" cy="${f(y(moonAltitude))}" r="7"><title>${this.l.moon}</title></circle>` : "";
    const clip = `horizon-clip-${index}`;
    const name = escape((index ? this.secondary : this.primary).name);
    return `<svg class="horizon-plot" viewBox="0 0 620 ${bottom + 32}" role="img" aria-label="${name} · ${this.l.profile} · ${this.l.sunPath}${lunarLine ? ` · ${this.l.moonPath}` : ""}${moonMarker ? ` · ${this.l.moon}` : ""}">
      <defs><clipPath id="${clip}"><rect x="${left}" y="${top}" width="${right - left}" height="${bottom - top}"/></clipPath></defs>
      <g clip-path="url(#${clip})">${bands}</g>
      ${grid.join("")}
      <g clip-path="url(#${clip})">
        <path class="terrain-fill" d="${line}V${bottom}H${left}Z"/>
        <path class="terrain-line" d="${line}"/>
        ${otherLine ? `<path class="terrain-line secondary" d="${otherLine}"/>` : ""}
        <path class="shade-line" d="${paths.shade.join("")}"/>
        <path class="sun-line" d="${paths.sun.join("")}"/>
        ${lunarLine ? `<path class="moon-line" d="${lunarLine}"/>` : ""}
        ${sunMarker}
        ${moonMarker}
      </g>
    </svg>`;
  }

  renderData() {
    const { day, today, phase_limits } = this.data;
    const other = this.comparison;
    const twilight = this.showTwilight && Array.isArray(phase_limits);
    const waitingForMoon = this.wantsMoonPath && (!this.data.moon_path || (other && !other.moon_path));
    const degrees = value => new Intl.NumberFormat(this.lang === "no" ? "nb-NO" : "en",
      { maximumFractionDigits: 1, minimumFractionDigits: 1 }).format(value) + "°";
    const angles = data => [degrees(data.azimuth), degrees(data.upper_limb), degrees(data.terrain)];
    const rows = [this.l.bearing, this.l.elevation, this.l.terrain];
    const live = day.date === today
      ? (other ? this.comparisonTable(rows.map((label, i) => [label, angles(this.data)[i], angles(other)[i]]))
        : `<dl>${rows.map((label, i) => row(label, angles(this.data)[i])).join("")}</dl>`) : "";
    const pairedPaths = other && (this.mode === "sun" || this.wantsMoonPath);
    const overlay = other && !pairedPaths;
    const legend = `<div class="legend"><span><i class="tone-direct"></i>${this.l.direct}</span>${overlay ? "" : `<span><i class="tone-nautical"></i>${this.l.profile}</span>`}
      <span>${this.l.sunPath} (${this.l.sunCenter})${overlay ? ` · ${escape(this.primary.name)}` : ""}</span>
      ${this.wantsMoonPath ? `<span><i class="moon-path-key"></i>${this.l.moonPath}</span>` : ""}
      ${this.config.show_moon ? `<span class="moon-key"><i></i>${this.l.moon}</span>` : ""}
      ${twilight ? phaseOrder.slice(0, -1).reverse().map(phase =>
        `<span><i class="tone-${phase}"></i>${this.l[phase]}</span>`).join("") : ""}</div>`;
    let plot = `<p class="statusbox" role="status">${this.l.loading}</p>`;
    if (!waitingForMoon) {
      const geometry = this.chartGeometry(other ? [this.data, other] : [this.data]);
      plot = pairedPaths ? `<div class="horizon-pair">${[this.primary, this.secondary].map((profile, i) =>
        `<section><h3 class="profile-heading">${escape(profile.name)}</h3>${this.chart(twilight, geometry, i)}</section>`).join("")}</div>`
        : this.chart(twilight, geometry, 0, overlay);
      plot += legend + (overlay ? this.profileLegend() : "");
    }
    return `<header><h2>${this.title}</h2><span class="date">${this.formatDate(day.date)}</span></header>
      ${this.profileControls()}
      <div class="controls"><div class="view-modes" role="group" aria-label="${this.l.viewMode}">
        ${Object.entries(horizonViews).map(([mode, label]) => toggler(mode, this.l[label], mode === this.mode)).join("")}</div>
        ${toggler("show-twilight", this.l.showTwilight, this.showTwilight)}</div>
      ${this.dateControls(this.selectedDate ?? today, ...this.dateBounds())}
      ${plot}
      ${live}`;
  }
}

class YearCard extends SolarCard {
  mode = "clock";
  evening = "20:00";
  getGridOptions() { return { columns: 12, min_columns: 6, rows: "auto" }; }
  getCardSize() { return 10; }

  connectedCallback() {
    super.connectedCallback();
    this.timer = setInterval(() => {
      if (!this.data || this.pending) return;
      const today = localDate(Date.now(), this.data.zone);
      if (today === this.today) return;
      if (this.data.days[this.index].date === this.today) this.year = Number(today.slice(0, 4));
      this.refresh();
    }, 60000);
  }

  async load() {
    return this.loadProfiles("year", this.year ? { year: this.year } : {});
  }

  applyData(result) {
    const selected = this.data?.days[this.index]?.date;
    const followsToday = !selected || selected === this.today;
    super.applyData(result);
    this.year = this.data.year;
    this.today = this.data.today;
    this.index = Math.max(0, this.data.days.findIndex(day => day.date === (followsToday ? this.today : selected)));
    this.similar = null;
    this.updateSimilarDay();
  }

  handleClick(event) {
    const action = event.target.dataset.action;
    if (action === "clock" || action === "duration") {
      this.mode = action;
      this.draw();
      this.shadowRoot.querySelector(`[data-action="${action}"]`)?.focus();
    } else if (action === "prev" || action === "next") {
      this.select(this.index + (action === "prev" ? -1 : 1));
      this.shadowRoot.querySelector(`[data-action="${action}"]`)?.focus();
    } else if (action === "today") {
      this.select(this.data.days.findIndex(day => day.date === this.today));
    } else if (action === "day-plot") {
      const plot = event.target.getBoundingClientRect();
      if (plot.width) this.select(Math.floor((event.clientX - plot.left) / plot.width * this.data.days.length));
    } else super.handleClick(event);
  }

  handleChange(event) {
    if (event.target.dataset.field === "year") {
      this.year = Number(event.target.value);
      this.data = null;
      this.refresh();
    } else if (event.target.dataset.field === "evening") {
      if (event.target.value) this.evening = event.target.value;
      this.draw();
      this.shadowRoot.querySelector('[data-field="evening"]')?.focus();
    } else if (event.target.dataset.field === "day") {
      const selected = this.data.days.findIndex(day => day.date === event.target.value);
      if (selected !== -1) this.select(selected);
    } else super.handleChange(event);
  }

  select(index) {
    this.index = Math.max(0, Math.min(this.data.days.length - 1, index));
    this.updateSimilarDay();
    this.draw();
  }

  async updateSimilarDay() {
    const day = this.data.days[this.index];
    const key = `${day.date}:${this.primary.id}:${this.secondary?.id ?? ""}`;
    if (this.similar?.key === key && !this.similar.lookups.some(lookup => lookup.error)) return;
    const profiles = [[this.primary, day]];
    if (this.comparison) profiles.push([this.secondary, this.comparison.days[this.index]]);
    const batch = { key, lookups: profiles.map(([, value]) => ({ dark: value.totals.direct === 0 })) };
    this.similar = batch;
    await Promise.all(profiles.map(async ([profile], i) => {
      const lookup = batch.lookups[i];
      try {
        lookup.result = await request(this._hass, "similar_sun", { date: day.date, profile_id: profile.id });
      } catch (error) {
        lookup.error = true;
      }
      const output = this.shadowRoot.querySelector(`[data-similar-result="${i}"]`);
      if (batch === this.similar && output) output.textContent = this.similarDayValue(i);
    }));
  }

  similarDayValue(index = 0) {
    const { error, result, dark } = this.similar.lookups[index];
    if (error) return this.l.lookupFailed;
    if (result === undefined) return this.l.loading;
    if (!result) return dark ? this.l.noSunFound : this.l.noMatch;
    const label = this.comparison && dark ? `${this.l.nextSunDate} · ` : "";
    return `${label}${this.formatDate(result.date, true)} · ${this.formatDuration(result.duration)}`;
  }

  chart() {
    const { days } = this.data;
    const compared = this.comparison?.days;
    const left = 39, right = 606, top = 10, bottom = 404;
    const width = (right - left) / days.length;
    const max = compared ? 14400 * Math.max(1, Math.ceil(Math.max(...days.concat(compared).map(day => day.totals.direct)) / 14400))
      : this.mode === "duration" ? Math.max(86400, ...days.map(day => day.end - day.start)) : 86400;
    const y = seconds => bottom - seconds / max * (bottom - top);
    const paths = Object.fromEntries(legendOrder.map(key => [key, []]));
    const section = (index, begin, end, color) => {
      if (end <= begin) return;
      const x1 = f(left + index * width), x2 = f(left + (index + 1) * width);
      const y1 = f(y(begin)), y2 = f(y(end));
      paths[color].push(`M${x1},${y1}H${x2}V${y2}H${x1}Z`);
    };
    if (!compared) days.forEach((day, index) => {
      if (this.mode === "clock") {
        for (const [,, phase, direct, clockStart, clockEnd] of day.bands) {
          section(index, clockStart, clockEnd, tone(phase, direct));
        }
      } else {
        const sums = Object.fromEntries(legendOrder.map(phase => [phase, 0]));
        for (const [start, end, phase, direct] of day.bands) sums[tone(phase, direct)] += end - start;
        let baseline = 0;
        for (const key of [...phaseOrder, "direct"]) {
          section(index, baseline, baseline + sums[key], key);
          baseline += sums[key];
        }
      }
    });
    const grids = [];
    for (let hour = 0; hour <= Math.floor(max / 3600); hour += 4) {
      const v = f(y(hour * 3600));
      grids.push(`<path class="grid" d="M${left},${v}H${right}"/><text class="axis" x="${left - 6}" y="${Number(v) + 4}" text-anchor="end">${String(hour).padStart(2, "0")}</text>`);
    }
    const months = [];
    const useEveryMonth = (this.getBoundingClientRect().width || 600) >= 490;
    days.forEach((day, index) => {
      const month = Number(day.date.slice(5, 7));
      if (!day.date.endsWith("-01") || (!useEveryMonth && month % 2 === 0)) return;
      const label = new Intl.DateTimeFormat(this.lang === "no" ? "nb-NO" : "en-GB", {
        month: "short", timeZone: "UTC",
      }).format(new Date(day.date + "T12:00:00Z"));
      months.push(`<text class="axis" x="${f(left + index * width + 2)}" y="${bottom + 20}">${escape(label)}</text>`);
    });
    const seasons = this.data.seasons.map(event => {
      const index = days.findIndex(day => day.date === event.date);
      const mark = f(left + (index + .5) * width);
      const kind = event.kind.endsWith("_equinox") ? "equinox" : "solstice";
      return `<path class="season-line ${kind}" d="M${mark},${top}V${bottom}"><title>${this.l[event.kind]} · ${this.formatDate(event.date)}</title></path>`;
    });
    const cursor = f(left + (this.index + .5) * width);
    const directLine = (series, index) => `<path class="annual-line${index ? " secondary" : ""}" d="${series.map((day, i) =>
      `${i ? "L" : "M"}${f(left + (i + .5) * width)},${f(y(day.totals.direct))}`).join("")}"/>`;
    const series = compared ? [days, compared].map(directLine).join("")
      : legendOrder.slice().reverse().map(key => `<path class="tone-${key}" d="${paths[key].join("")}"/>`).join("");
    return `<svg class="year-plot" viewBox="0 0 620 ${bottom + 35}" aria-label="${compared ? `${this.l.graph} · ${this.l.direct}` : this.l.graph}">
      ${grids.join("")}
      ${series}
      ${seasons.join("")}
      <path class="cursor" d="M${cursor},${top}V${bottom}"/>
      ${months.join("")}
      <rect class="hit" x="${left}" y="${top}" width="${right - left}" height="${bottom - top}" data-action="day-plot"/>
    </svg>`;
  }

  renderData() {
    const { days, totals, next_seasons } = this.data;
    const compared = this.comparison;
    const day = days[this.index];
    const [hour, minute] = this.evening.split(":").map(Number);
    const time = hour * 3600 + minute * 60;
    const lastEvening = series => {
      const match = series.findLast(item => item.bands.some(([,,, direct, start, end]) => direct && start <= time && time < end));
      return match ? this.formatDate(match.date) : "—";
    };
    const opened = this.shadowRoot.querySelector("details")?.open;
    const currentYear = Number(this.today.slice(0, 4));
    const yearOptions = [currentYear - 1, currentYear, currentYear + 1]
      .map(year => `<option ${year === this.year ? "selected" : ""}>${year}</option>`).join("");
    const locale = this.lang === "no" ? "nb-NO" : "en-GB";
    const numbers = new Intl.NumberFormat(locale, { maximumFractionDigits: 1 });
    const hours = seconds => `${numbers.format(seconds / 3600)} ${this.l.hour}`;
    const percent = new Intl.NumberFormat(locale, {
      style: "percent", maximumFractionDigits: 1,
    });
    const shade = data => hours(data.terrain_shade) + (data.daylight > 0 ? ` · ${percent.format(data.terrain_shade / data.daylight)}` : "");
    const annualRows = [
      [this.l.annualSun, data => hours(data.direct)],
      [this.l.annualDaylight, data => hours(data.daylight)],
      [this.l.terrain_shade, shade],
    ];
    const annual = compared ? this.comparisonTable(annualRows.map(([label, value]) => [label, value(totals), value(compared.totals)]), this.l.yearTotals)
      : `<dl>${annualRows.map(([label, value]) => row(label, value(totals))).join("")}</dl>`;
    const match = compared ? this.comparisonTable([[this.l.similarSun, ...[0, 1].map(i =>
      `<span data-similar-result="${i}" aria-live="polite">${this.similarDayValue(i)}</span>`) ]])
      : `<dl><div class="row"><dt>${this.similar.lookups[0].dark ? this.l.nextSunDate : this.l.similarSun}</dt>
        <dd data-similar-result="0" aria-live="polite">${this.similarDayValue()}</dd></div></dl>`;
    return `<header><h2>${this.title}</h2></header>
      ${this.profileControls()}
      <div class="controls">
        ${compared ? `<strong>${this.l.dailySun}</strong>` : toggler("clock", this.l.clock, this.mode === "clock") + toggler("duration", this.l.duration, this.mode === "duration")}
        <span class="spacer"></span><label>${this.l.year} <select data-field="year">${yearOptions}</select></label>
      </div>
      ${this.dateControls(day.date, days[0].date, days.at(-1).date, currentYear === this.year)}
      ${this.chart()}
      ${compared ? this.profileLegend() : ""}${this.legend(Boolean(compared))}
      ${match}
      <section class="year-section">
        <h3>${this.l.yearTotals} ${this.year}</h3>
        ${annual}
      </section>
      <section class="year-section">
        <h3>${this.l.seasons}${compared ? ` · ${escape(this.primary.name)}` : ""}</h3>
        <dl>${next_seasons.map(event => {
          const countdown = event.days === 0 ? this.l.today : `${event.days} ${event.days === 1 ? this.l.daySingle : this.l.dayPlural}`;
          return row(this.l[event.kind], `${this.formatDate(event.date, true)} · ${countdown}`);
        }).join("")}</dl>
      </section>
      <details ${opened ? "open" : ""}><summary>${this.l.eveningSun}</summary>
        <dl>${row(this.l.evening, `<input type="time" data-field="evening" aria-label="${this.l.evening}" value="${this.evening}">`)}
          ${compared ? "" : row(this.l.lastEvening, lastEvening(days))}</dl>
        ${compared ? this.comparisonTable([[this.l.lastEvening, lastEvening(days), lastEvening(compared.days)]], this.l.eveningSun) : ""}
      </details>`;
  }
}

const CARDS = Object.entries({
  "terrain-sun-today": TodayCard, "terrain-sun-horizon": HorizonCard, "terrain-sun-year": YearCard,
});
window.customCards ??= [];
for (const [type, component] of CARDS) {
  if (!customElements.get(type)) customElements.define(type, component);
  if (!window.customCards.some(card => card.type === type)) {
    window.customCards.push({
      type,
      get name() {
        return `Terrain Sun · ${TYPES[type][isNorwegian(pickerLanguage()) ? 0 : 1]}`;
      },
      preview: true,
      documentationURL: "https://github.com/stboee/ha-terrain-sun#kort",
    });
  }
}
