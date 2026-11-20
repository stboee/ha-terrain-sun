/* Terrain Sun dashboard cards. Chart geometry is based on the server model. */
const TYPES = {
  "terrain-sun-today": ["Sol i dag", "Sun today"],
  "terrain-sun-horizon": ["Lokal horisont", "Local horizon"],
  "terrain-sun-year": ["Solåret", "Solar year"],
};
const WORDS = {
  no: {
    title: "Tittel", graphHeight: "Grafhøyde", compact: "Kompakt", normal: "Normal", tall: "Høy",
    minElevation: "Nedre gradgrense", maxElevation: "Øvre gradgrense", autoElevation: "La feltet stå tomt for automatisk skalering.",
    fixedSun: "Fast solbane", relativeElevation: "Høyde relativt til solbanen", showTwilight: "Vis skumring", showMoon: "Vis månen", moon: "Månen",
    sunCenter: "solsentrum", invalidHeight: "Velg Kompakt, Normal eller Høy.",
    invalidLimits: "Gradgrensene må være mellom −90° og 90°, med nedre grense under øvre grense.",
    direct: "Direkte sol", terrain_shade: "Dagslys i terrengskygge", daylight: "Dagslengde ved fri horisont",
    daylight_phase: "Dagslys", civil: "Borgerlig skumring", nautical: "Nautisk skumring",
    astronomical: "Astronomisk skumring", night: "Natt", golden: "Gyllen time",
    nextSun: "Neste direkte sol", nextShade: "Sola forsvinner", noChange: "Ingen overgang innen i morgen",
    noSun: "Ingen direkte sol", sunNow: "Direkte sol nå", behind: "Sola er under terrenghorisonten",
    periods: "Solperioder", phases: "Lysfaser", fromYesterday: "Endring fra i går", toTomorrow: "Endring til i morgen",
    lastWeek: "Endring siste 7 dager", nextWeek: "Endring neste 7 dager",
    similarSun: "Neste gang det er så lyst", noMatch: "Ingen tilsvarende dato funnet",
    noSunFound: "Ingen dato med direkte sol funnet", lookupFailed: "Kunne ikke beregne datoen",
    seasons: "Solhverv og kveldssol", june: "Junisolverv", december: "Desembersolverv",
    evening: "Klokkeslett for kveldssol", lastEvening: "Siste dato med direkte sol på dette klokkeslettet",
    elevation: "Øvre solrand", terrain: "Terrenghøyde", bearing: "Azimut", profile: "Terrengprofil",
    sunPath: "Solbane", area: "Utsnitt", circle: "360°", clock: "Klokkeslett", duration: "Varighet",
    year: "År", date: "Dato", graph: "Årsgraf", dayTrack: "Døgnstripe", hour: "t", minute: "min",
    loading: "Beregner …", unavailable: "Data er utilgjengelige. Kontroller at Terrain Sun er satt opp.",
    retry: "Prøv igjen", prev: "Forrige dag", next: "Neste dag", today: "I dag", directions: ["N", "Ø", "S", "V", "N"],
  },
  en: {
    title: "Title", graphHeight: "Chart height", compact: "Compact", normal: "Normal", tall: "Tall",
    minElevation: "Lower elevation limit", maxElevation: "Upper elevation limit", autoElevation: "Leave blank for automatic scaling.",
    fixedSun: "Fixed sun path", relativeElevation: "Elevation relative to the sun path", showTwilight: "Show twilight", showMoon: "Show the moon", moon: "Moon",
    sunCenter: "sun center", invalidHeight: "Choose Compact, Normal, or Tall.",
    invalidLimits: "Elevation limits must be between −90° and 90°, with the lower limit below the upper limit.",
    direct: "Direct sun", terrain_shade: "Daylight in terrain shade", daylight: "Daylight with a clear horizon",
    daylight_phase: "Daylight", civil: "Civil twilight", nautical: "Nautical twilight",
    astronomical: "Astronomical twilight", night: "Night", golden: "Golden hour",
    nextSun: "Next direct sun", nextShade: "Sun drops below terrain", noChange: "No transition through tomorrow",
    noSun: "No direct sun", sunNow: "Direct sun now", behind: "Sun is below the terrain horizon",
    periods: "Sun periods", phases: "Light phases", fromYesterday: "Change since yesterday", toTomorrow: "Change by tomorrow",
    lastWeek: "Change over the past 7 days", nextWeek: "Change over the next 7 days",
    similarSun: "Next day with this much sun", noMatch: "No matching date found",
    noSunFound: "No date with direct sun found", lookupFailed: "Could not calculate the date",
    seasons: "Solstices and evening sun", june: "June solstice", december: "December solstice",
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
    --ts-astronomical:#365260;--ts-night:#223742;
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
  .controls .spacer {flex:1}
  .controls label {display:flex;align-items:center;gap:5px}
  .year-plot, .horizon-plot {width:100%;height:auto;display:block;overflow:visible}
  .axis {fill:var(--ts-muted);font:13px system-ui,sans-serif}
  .grid {stroke:var(--ts-line);stroke-width:1;vector-effect:non-scaling-stroke}
  .year-plot .hit {touch-action:pan-y;cursor:crosshair;fill:transparent}
  .solstice {stroke:#fff;stroke-dasharray:3 4;opacity:.55;vector-effect:non-scaling-stroke}
  .cursor {stroke:#fff;stroke-width:1.8;vector-effect:non-scaling-stroke;filter:drop-shadow(1px 0 #233942)}
  .sun-line {stroke:var(--ts-sun);stroke-width:2.5;fill:none;vector-effect:non-scaling-stroke}
  .fixed-reference {stroke:var(--ts-muted);stroke-width:1.5;stroke-dasharray:3 4;fill:none;vector-effect:non-scaling-stroke}
  .shade-line {stroke:var(--ts-nautical);stroke-width:1.7;stroke-dasharray:4 3;fill:none;vector-effect:non-scaling-stroke}
  .terrain-fill {fill:var(--ts-civil);opacity:.24}
  .terrain-line {stroke:var(--ts-nautical);stroke-width:1.6;fill:none;vector-effect:non-scaling-stroke}
  .twilight-band {fill-opacity:.44}
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
  .day {margin-top:12px;border-top:1px solid var(--ts-line);padding-top:10px}
  .day .controls {margin:0}
  .day label {font-weight:600}
  .tone-direct {fill:var(--ts-sun);background:var(--ts-sun)}
  .tone-daylight {fill:var(--ts-day);background:var(--ts-day)}
  .tone-civil {fill:var(--ts-civil);background:var(--ts-civil)}
  .tone-nautical {fill:var(--ts-nautical);background:var(--ts-nautical)}
  .tone-astronomical {fill:var(--ts-astronomical);background:var(--ts-astronomical)}
  .tone-night {fill:var(--ts-night);background:var(--ts-night)}
  @container (max-width:470px) { .axis {font-size:18px} }
  @container (max-width:360px) { .body {padding-inline:12px} }
`;

const phaseOrder = ["night", "astronomical", "nautical", "civil", "daylight"];
const legendOrder = ["direct", "daylight", "civil", "nautical", "astronomical", "night"];
const horizonHeights = {
  compact: { plot: 171, card: 5 }, normal: { plot: 255, card: 6 }, tall: { plot: 342, card: 7 },
};
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

class SolarCard extends HTMLElement {
  static getConfigForm() {
    return {
      schema: [{ name: "title", selector: { text: {} } }],
      computeLabel: () => pickerWords().title,
    };
  }

  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.shadowRoot.addEventListener("click", event => this.handleClick(event));
    this.shadowRoot.addEventListener("change", event => this.handleChange(event));
  }

  setConfig(config) {
    this.config = config;
    this.draw();
  }

  set hass(hass) {
    const changed = this._hass?.connection !== hass.connection;
    this._hass = hass;
    const locale = hass.locale?.language ?? hass.language ?? "en";
    this.lang = isNorwegian(locale) ? "no" : "en";
    if (this.isConnected && (changed || !this.data) && !this.pending && !this.error) this.refresh();
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

  handleChange() {}

  async load() {}

  async refresh() {
    if (!this._hass || this.pending) return;
    this.pending = true;
    this.error = false;
    this.draw();
    try {
      await this.load();
    } catch (error) {
      this.error = true;
    } finally {
      this.pending = false;
      this.draw();
    }
  }

  get title() {
    return escape(this.config?.title || TYPES[this.localName][this.lang === "no" ? 0 : 1]);
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

  legend(daylightLabel = this.l.terrain_shade) {
    return `<div class="legend">${legendOrder.map(key =>
      `<span><i class="tone-${key}"></i>${key === "daylight" ? daylightLabel : this.l[key]}</span>`).join("")}</div>`;
  }

  timeline(day, zone, now = null) {
    const duration = day.end - day.start;
    if (!duration) return "";
    const spans = day.bands.map(([start, end, phase, direct]) =>
      `<span class="tone-${tone(phase, direct)}" style="left:${f((start - day.start) / duration * 100)}%;width:${f((end - start) / duration * 100)}%" title="${escape(direct ? this.l.direct : this.l[phase === "daylight" ? "terrain_shade" : phase])} ${this.formatClock(start, zone)}–${this.formatClock(end, zone, day.end)}"></span>`).join("");
    const marker = now >= day.start && now < day.end
      ? `<i style="left:${f((now - day.start) / duration * 100)}%"></i>` : "";
    const labels = [0, .25, .5, .75, 1].map(fraction =>
      `<span>${this.formatClock(day.start + duration * fraction, zone, day.end)}</span>`).join("");
    return `<div class="strip" aria-label="${this.l.dayTrack}">${spans}${marker}</div><div class="strip-labels">${labels}</div>`;
  }

  draw() {
    if (!this.isConnected || !this.config) return;
    const content = this.error
      ? `<p class="statusbox">${this.l.unavailable}</p><button data-action="retry">${this.l.retry}</button>`
      : this.data ? this.renderData() : `<p class="statusbox">${this.l.loading}</p>`;
    this.shadowRoot.innerHTML = `<style>${STYLES}</style><ha-card><div class="body">${content}</div></ha-card>`;
  }
}

class LiveCard extends SolarCard {
  connectedCallback() {
    super.connectedCallback();
    this.timer = setInterval(() => this.refresh(), 60000);
  }

  async load() {
    this.data = await request(this._hass, this.view);
  }
}

class TodayCard extends LiveCard {
  get view() { return "now"; }
  getCardSize() { return 5; }

  renderData() {
    const { day, direct, next, zone, time, yesterday_delta, tomorrow_delta, last_week_delta, next_week_delta } = this.data;
    const opened = this.shadowRoot.querySelector("details")?.open;
    const nextDate = next ? new Intl.DateTimeFormat("en-CA", {
      dateStyle: "short", timeZone: zone,
    }).format(next * 1000) : null;
    const todayDate = new Intl.DateTimeFormat("en-CA", {
      dateStyle: "short", timeZone: zone,
    }).format(time * 1000);
    const nextLabel = next
      ? (nextDate === todayDate ? "" : this.formatDate(new Intl.DateTimeFormat("sv-SE", {
        dateStyle: "short", timeZone: zone,
      }).format(next * 1000)) + " · ") + this.formatClock(next, zone)
      : this.l.noChange;
    return `
      <header><h2>${this.title}</h2><span class="date">${this.formatDate(day.date)}</span></header>
      <p class="status ${direct ? "sun" : ""}"><span></span>${direct ? this.l.sunNow : this.l.behind}</p>
      ${this.timeline(day, zone, time)}
      <dl>
        ${row(direct ? this.l.nextShade : this.l.nextSun, nextLabel)}
        ${row(this.l.periods, day.direct.length ? this.formatPeriods(day.direct, day, zone) : this.l.noSun)}
        ${row(this.l.direct, this.formatDuration(day.totals.direct))}
        ${row(this.l.daylight, this.formatDuration(day.totals.daylight))}
        ${row(this.l.fromYesterday, this.formatDelta(yesterday_delta))}
        ${row(this.l.toTomorrow, this.formatDelta(tomorrow_delta))}
        ${row(this.l.lastWeek, this.formatDelta(last_week_delta))}
        ${row(this.l.nextWeek, this.formatDelta(next_week_delta))}
      </dl>
      <details ${opened ? "open" : ""}><summary>${this.l.phases}</summary>
        <dl>${phaseOrder.map(phase => {
          const periods = [];
          for (const [start, end, name] of day.bands) {
            if (name !== phase) continue;
            if (periods.at(-1)?.[1] === start) periods.at(-1)[1] = end;
            else periods.push([start, end]);
          }
          return row(this.l[phase === "daylight" ? "daylight_phase" : phase], this.formatPeriods(periods, day, zone));
        }).join("")}
        ${row(this.l.golden, this.formatPeriods(day.golden, day, zone))}
        </dl>
      </details>`;
  }
}

function horizonElevation(profile, azimuth) {
  azimuth = normalize(azimuth);
  const index = profile.findIndex(point => point[0] > azimuth);
  const [left, right] = [profile[index - 1], profile[index]];
  return left[1] + (right[1] - left[1]) * (azimuth - left[0]) / (right[0] - left[0]);
}

function solarAltitudeLookup(path) {
  const byBearing = path.map(([, bearing, altitude]) => [bearing, altitude]).sort((a, b) => a[0] - b[0]);
  const [first, last] = [byBearing[0], byBearing.at(-1)];
  // Interpolate across any bearings outside the day's track to keep the terrain continuous.
  const complete = [[last[0] - 360, last[1]], ...byBearing, [first[0] + 360, first[1]]];
  const segments = path.slice(1).map(([, to, end], index) => {
    const [, from, begin] = path[index];
    return [from, normalize(to - from + 180) - 180, begin, end];
  });
  return azimuth => {
    let highest = -Infinity;
    for (const [from, width, begin, end] of segments) {
      const offset = normalize(azimuth - from + 180) - 180;
      if (width === 0) {
        if (offset === 0) highest = Math.max(highest, begin, end);
        continue;
      }
      const fraction = offset / width;
      if (fraction >= 0 && fraction <= 1) highest = Math.max(highest, begin + fraction * (end - begin));
    }
    return Number.isFinite(highest) ? highest : horizonElevation(complete, azimuth);
  };
}

class HorizonCard extends LiveCard {
  static getConfigForm() {
    const { schema } = super.getConfigForm();
    const words = pickerWords();
    const labels = {
      title: words.title, graph_height: words.graphHeight, min_elevation: words.minElevation,
      max_elevation: words.maxElevation, fixed_sun: words.fixedSun,
      show_twilight: words.showTwilight, show_moon: words.showMoon,
    };
    const elevation = { number: { min: -90, max: 90, step: 0.1, mode: "box", unit_of_measurement: "°" } };
    const options = Object.keys(horizonHeights).map(value => ({ value, label: words[value] }));
    return {
      schema: [
        ...schema,
        { name: "graph_height", selector: { select: { options, mode: "dropdown" } } },
        { name: "min_elevation", selector: elevation },
        { name: "max_elevation", selector: elevation },
        { name: "fixed_sun", selector: { boolean: {} } },
        { name: "show_twilight", selector: { boolean: {} } },
        { name: "show_moon", selector: { boolean: {} } },
      ],
      computeLabel: field => labels[field.name],
      computeHelper: field => field.selector?.number ? words.autoElevation : undefined,
    };
  }

  get view() { return "horizon"; }
  get graphSize() { return horizonHeights[this.config?.graph_height ?? "tall"]; }
  getCardSize() { return this.graphSize.card; }
  selectedDate = null;

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
    const fixed_sun = (config.fixed_sun ?? config.center_sun) === true;
    if (this.config?.fixed_sun !== fixed_sun) this.fixedSun = fixed_sun;
    super.setConfig({ ...config, graph_height, min_elevation, max_elevation, show_moon, fixed_sun });
    if (this.isConnected && moonChanged) this.refresh();
  }

  async load() {
    // Date and display settings can change while a request is in flight.
    let date, moon;
    const current = () => date === this.selectedDate && moon === (this.config?.show_moon === true);
    do {
      date = this.selectedDate;
      moon = this.config?.show_moon === true;
      try {
        const data = await request(this._hass, this.view, { ...(date && { date }), moon });
        if (current()) this.data = data;
      } catch (error) {
        if (current()) throw error;
      }
    } while (!current());
  }

  async selectDate(date, action) {
    const selectedDate = date === this.data.today ? null : date;
    if (selectedDate === this.selectedDate) return;
    this.selectedDate = selectedDate;
    await this.refresh();
    if (action && selectedDate === this.selectedDate && !this.shadowRoot.activeElement) {
      this.shadowRoot.querySelector(`[data-action="${action}"]`)?.focus();
    }
  }

  handleClick(event) {
    const { action } = event.target.dataset;
    if (action === "area" || action === "circle") {
      this.full = action === "circle";
      this.draw();
    } else if (action === "fixed-sun") {
      this.fixedSun = !this.fixedSun;
      this.draw();
      this.shadowRoot.querySelector('[data-action="fixed-sun"]')?.focus();
    } else if (action === "prev" || action === "next") {
      const input = this.shadowRoot.querySelector('[data-field="day"]');
      const date = offsetDate(this.selectedDate ?? this.data.today, action === "prev" ? -1 : 1);
      if (date >= input.min && date <= input.max) this.selectDate(date, action);
    } else if (action === "today") {
      this.selectDate(this.data.today, action);
    } else super.handleClick(event);
  }

  handleChange(event) {
    const input = event.target;
    if (input.dataset.field === "day" && input.value && input.validity.valid) this.selectDate(input.value);
  }

  chart() {
    const { day, profile, azimuth, upper_limb, elevation, direct, today, phase_limits, moon } = this.data;
    const { min_elevation, max_elevation, show_moon } = this.config;
    const twilight = this.config.show_twilight === true && Array.isArray(phase_limits);
    const path = twilight ? day.path.map(([time, az, , altitude]) => [time, az, altitude]) : day.path;
    const left = 39, right = 606, top = 12, bottom = top + this.graphSize.plot;
    const summit = path.reduce((best, item) => item[2] > best[2] ? item : best);
    const center = summit[1];
    const unwrap = angle => center + normalize(angle - center + 180) - 180;
    const active = path.filter(point => point[2] >= Math.min(twilight ? phase_limits[0] : -4, summit[2] - 1));
    const activeAz = active.map(point => unwrap(point[1]));
    const zoomMin = Math.floor((Math.min(...activeAz) - 18) / 30) * 30;
    const zoomMax = Math.ceil((Math.max(...activeAz) + 18) / 30) * 30;
    const full = this.full || zoomMax - zoomMin >= 360;
    const [start, stop] = full ? [0, 360] : [zoomMin, zoomMax];
    const bearing = full ? angle => angle : unwrap;
    const profileArc = [[start, horizonElevation(profile, start)]];
    for (const [angle, height] of profile) {
      if (angle === 360) continue;
      for (const shift of [-360, 0, 360, 720]) {
        if (angle + shift > start && angle + shift < stop) profileArc.push([angle + shift, height]);
      }
    }
    profileArc.push([stop, horizonElevation(profile, stop)]);
    profileArc.sort((a, b) => a[0] - b[0]);
    const profileHeights = profileArc.map(point => point[1]);
    const autoLow = Math.min(twilight ? phase_limits[0] - 2 : -8, Math.floor((Math.min(...profileHeights) - 2) / 5) * 5);
    const autoHigh = Math.max(10, Math.ceil((Math.max(summit[2], ...profileHeights) + 2) / 5) * 5);
    const low = this.fixedSun ? -75 : min_elevation ?? Math.min(autoLow, Math.max(-90, (max_elevation ?? 90) - 5));
    const high = this.fixedSun ? 85 : max_elevation ?? Math.max(autoHigh, Math.min(90, low + 5));
    const x = angle => left + (angle - start) / (stop - start) * (right - left);
    const y = altitude => bottom - (altitude - low) / (high - low) * (bottom - top);
    const fractions = Array.from({ length: 121 }, (_, index) => index / 120);
    const reference = fraction => -29 + 57 * Math.sin(Math.PI * fraction);
    const referenceLine = offset => fractions.map((fraction, index) =>
      `${index ? "L" : "M"}${f(left + fraction * (right - left))},${f(y(reference(fraction) + offset))}`).join("");
    const solarAltitude = this.fixedSun ? solarAltitudeLookup(path) : null;
    const offsets = new Map();
    const project = (az, altitude) => {
      if (!solarAltitude) return altitude;
      if (!offsets.has(az)) offsets.set(az, reference((az - start) / (stop - start)) - solarAltitude(az));
      return altitude + offsets.get(az);
    };
    const projectedBearings = this.fixedSun ? [...new Set([
      ...fractions.map(fraction => start + fraction * (stop - start)),
      ...profileArc.map(([az]) => az),
      ...path.map(([, az]) => bearing(az)).filter(az => az >= start && az <= stop),
    ])].sort((a, b) => a - b) : [];
    const terrainPath = this.fixedSun
      ? projectedBearings.map(az => [az, project(az, horizonElevation(profile, az))]) : profileArc;
    const line = terrainPath.map(([az, ele], index) => `${index ? "L" : "M"}${f(x(az))},${f(y(ele))}`).join("");
    const grid = [];
    const span = high - low;
    const verticalStep = span > 45 ? 20 : span > 20 ? 10 : span > 8 ? 5 : span >= 3 ? 2 : 1;
    const ticks = [];
    for (let height = Math.ceil(low / verticalStep) * verticalStep; height <= high; height += verticalStep) {
      ticks.push(height);
    }
    if (this.fixedSun) {
      for (const offset of [-30, -15, 0, 15, 30, 45]) {
        const label = offset > 0 ? `+${offset}` : offset;
        grid.push(`<path class="grid" fill="none" d="${referenceLine(offset)}"/><text class="axis" x="${left - 6}" y="${f(y(reference(0) + offset) + 4)}" text-anchor="end">${label}°</text>`);
      }
    } else {
      for (const height of ticks.length > 1 ? ticks : [low, high]) {
        grid.push(`<path class="grid" d="M${left},${f(y(height))}H${right}"/><text class="axis" x="${left - 6}" y="${f(y(height) + 4)}" text-anchor="end">${height}°</text>`);
      }
    }
    const horizontalStep = stop - start >= 240 ? 60 : 30;
    for (let angle = Math.ceil(start / horizontalStep) * horizontalStep; angle <= stop; angle += horizontalStep) {
      const cardinal = normalize(angle) % 90 === 0 ? this.l.directions[normalize(angle) / 90] : "";
      const label = cardinal || `${normalize(angle)}°`;
      grid.push(`<path class="grid" d="M${f(x(angle))},${top}V${bottom}"/><text class="axis" x="${f(x(angle))}" y="${bottom + 21}" text-anchor="middle">${label}</text>`);
    }
    const paths = { sun: [], shade: [] };
    for (let i = 1; i < path.length; i++) {
      const [aTime, aRaw, aEle] = path[i - 1];
      const [bTime, bRaw, bEle] = path[i];
      const [a, b] = [bearing(aRaw), bearing(bRaw)];
      if (Math.abs(a - b) > 180) continue;
      const startY = project(a, aEle), endY = project(b, bEle);
      if (startY < low && endY < low) continue;
      const middle = (aTime + bTime) / 2;
      const shown = day.direct.some(([from, to]) => from <= middle && middle < to);
      paths[shown ? "sun" : "shade"].push(`M${f(x(a))},${f(y(startY))}L${f(x(b))},${f(y(endY))}`);
    }
    const bands = twilight ? phaseOrder.slice(0, -1).map((phase, index) => {
      if (this.fixedSun) {
        const upper = projectedBearings.map(az => `${f(x(az))},${f(y(project(az, phase_limits[index])))}`);
        const lower = index === 0 ? [`${right},${bottom}`, `${left},${bottom}`]
          : projectedBearings.map(az => `${f(x(az))},${f(y(project(az, phase_limits[index - 1])))}`).reverse();
        return `<polygon class="twilight-band tone-${phase}" points="${[...upper, ...lower].join(" ")}"><title>${this.l[phase]}</title></polygon>`;
      }
      const bandBottom = Math.max(low, phase_limits[index - 1] ?? low);
      const bandTop = Math.min(high, phase_limits[index]);
      return bandTop > bandBottom ? `<rect class="twilight-band tone-${phase}" x="${left}" y="${f(y(bandTop))}" width="${right - left}" height="${f(y(bandBottom) - y(bandTop))}"><title>${this.l[phase]}</title></rect>` : "";
    }).join("") : "";
    const inView = (az, altitude) => az >= start && az <= stop && altitude >= low && altitude <= high;
    const now = bearing(azimuth);
    const sunAltitude = day.date === today ? project(now, twilight ? elevation : upper_limb) : NaN;
    const sunMarker = inView(now, sunAltitude)
      ? `<circle class="sun-marker" cx="${f(x(now))}" cy="${f(y(sunAltitude))}" r="5.7" fill="var(${direct ? "--ts-sun" : "--ts-nautical"})" stroke="#fff" stroke-width="1.3"/>` : "";
    const moonBearing = bearing(moon?.azimuth);
    const moonAltitude = day.date === today && show_moon && moon ? project(moonBearing, moon.elevation) : NaN;
    const moonMarker = inView(moonBearing, moonAltitude)
      ? `<circle class="moon-marker" cx="${f(x(moonBearing))}" cy="${f(y(moonAltitude))}" r="7"><title>${this.l.moon}</title></circle>` : "";
    return `<svg class="horizon-plot" viewBox="0 0 620 ${bottom + 32}" role="img" aria-label="${this.l.profile} · ${this.l.sunPath}${moonMarker ? ` · ${this.l.moon}` : ""}">
      <defs><clipPath id="horizon-clip"><rect x="${left}" y="${top}" width="${right - left}" height="${bottom - top}"/></clipPath></defs>
      <g clip-path="url(#horizon-clip)">${bands}</g>
      ${grid.join("")}
      <g clip-path="url(#horizon-clip)">
        <path class="terrain-fill" d="${line}V${bottom}H${left}Z"/>
        <path class="terrain-line" d="${line}"/>
        ${this.fixedSun ? `<path class="fixed-reference" d="${referenceLine(0)}"/>` : ""}
        <path class="shade-line" d="${paths.shade.join("")}"/>
        <path class="sun-line" d="${paths.sun.join("")}"/>
        ${sunMarker}
        ${moonMarker}
      </g>
    </svg>`;
  }

  renderData() {
    const { direct, day, upper_limb, azimuth, terrain, today, zone } = this.data;
    const degrees = value => new Intl.NumberFormat(this.lang === "no" ? "nb-NO" : "en",
      { maximumFractionDigits: 1, minimumFractionDigits: 1 }).format(value) + "°";
    const currentYear = Number(today.slice(0, 4));
    const periods = day.direct.length
      ? `${this.formatPeriods(day.direct, day, zone)} · ${this.formatDuration(day.totals.direct)}` : this.l.noSun;
    const live = day.date === today ? `<p class="status ${direct ? "sun" : ""}"><span></span>${direct ? this.l.sunNow : this.l.behind}</p>
      <dl>${row(this.l.bearing, degrees(azimuth))}${row(this.l.elevation, degrees(upper_limb))}${row(this.l.terrain, degrees(terrain))}</dl>` : "";
    return `<header><h2>${this.title}</h2><span class="date">${this.formatDate(day.date)}</span></header>
      <div class="controls">${toggler("area", this.l.area, !this.full)}${toggler("circle", this.l.circle, !!this.full)}
        ${toggler("fixed-sun", this.l.fixedSun, this.fixedSun)}</div>
      ${this.dateControls(this.selectedDate ?? today, `${currentYear - 5}-01-01`, `${currentYear + 5}-12-31`)}
      ${this.chart()}
      <div class="legend"><span><i class="tone-direct"></i>${this.l.direct}</span><span><i class="tone-nautical"></i>${this.l.profile}</span>
        ${this.fixedSun ? `<span>${this.l.relativeElevation}</span>` : ""}
        ${this.config.show_moon ? `<span class="moon-key"><i></i>${this.l.moon}</span>` : ""}
        ${this.config.show_twilight === true ? `<span>${this.l.sunPath} (${this.l.sunCenter})</span>` + phaseOrder.slice(0, -1).reverse().map(phase =>
          `<span><i class="tone-${phase}"></i>${this.l[phase]}</span>`).join("") : ""}</div>
      <dl>${row(this.l.periods, periods)}</dl>
      ${live}`;
  }
}

class YearCard extends SolarCard {
  mode = "clock";
  evening = "20:00";
  getGridOptions() { return { columns: 12, min_columns: 6, rows: "auto" }; }
  getCardSize() { return 10; }

  async load() {
    this.data = await request(this._hass, "year", this.year ? { year: this.year } : {});
    this.year = this.data.year;
    this.zone = this.data.zone;
    const today = new Intl.DateTimeFormat("sv-SE", {
      dateStyle: "short", timeZone: this.zone,
    }).format(Date.now());
    this.today = today;
    this.index = Math.max(0, this.data.days.findIndex(day => day.date === today));
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
    }
  }

  select(index) {
    this.index = Math.max(0, Math.min(this.data.days.length - 1, index));
    this.updateSimilarDay();
    this.draw();
  }

  async updateSimilarDay() {
    const day = this.data.days[this.index];
    if (this.similar?.date === day.date && !this.similar.error) return;
    const lookup = { date: day.date, dark: day.totals.direct === 0 };
    this.similar = lookup;
    try {
      lookup.result = await request(this._hass, "similar_sun", { date: day.date });
    } catch (error) {
      lookup.error = true;
    }
    const output = this.shadowRoot.querySelector("[data-similar-result]");
    if (lookup === this.similar && output) output.textContent = this.similarDayValue();
  }

  similarDayValue() {
    const { error, result, dark } = this.similar;
    if (error) return this.l.lookupFailed;
    if (result === undefined) return this.l.loading;
    if (!result) return dark ? this.l.noSunFound : this.l.noMatch;
    return `${this.formatDate(result.date, true)} · ${this.formatDuration(result.duration)}`;
  }

  chart() {
    const { days } = this.data;
    const left = 39, right = 606, top = 10, bottom = 404;
    const width = (right - left) / days.length;
    const max = this.mode === "duration"
      ? Math.max(86400, ...days.map(day => day.end - day.start)) : 86400;
    const y = seconds => bottom - seconds / max * (bottom - top);
    const paths = Object.fromEntries(legendOrder.map(key => [key, []]));
    const section = (index, begin, end, color) => {
      if (end <= begin) return;
      const x1 = f(left + index * width), x2 = f(left + (index + 1) * width);
      const y1 = f(y(begin)), y2 = f(y(end));
      paths[color].push(`M${x1},${y1}H${x2}V${y2}H${x1}Z`);
    };
    days.forEach((day, index) => {
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
    for (let hour = 0; hour <= 24; hour += 4) {
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
    const solstices = this.data.solstices.map(event => {
      const index = days.findIndex(day => day.date === event.date);
      const mark = f(left + (index + .5) * width);
      return `<path class="solstice" d="M${mark},${top}V${bottom}"/>`;
    });
    const cursor = f(left + (this.index + .5) * width);
    return `<svg class="year-plot" viewBox="0 0 620 ${bottom + 35}" aria-label="${this.l.graph}">
      ${grids.join("")}
      ${legendOrder.slice().reverse().map(key => `<path class="tone-${key}" d="${paths[key].join("")}"/>`).join("")}
      ${solstices.join("")}
      <path class="cursor" d="M${cursor},${top}V${bottom}"/>
      ${months.join("")}
      <rect class="hit" x="${left}" y="${top}" width="${right - left}" height="${bottom - top}" data-action="day-plot"/>
    </svg>`;
  }

  renderData() {
    const { days } = this.data;
    const day = days[this.index];
    const [hour, minute] = this.evening.split(":").map(Number);
    const time = hour * 3600 + minute * 60;
    const lastEvening = days.findLast(item => item.bands.some(
      ([,,, direct, start, end]) => direct && start <= time && time < end));
    const opened = this.shadowRoot.querySelector("details")?.open;
    const currentYear = Number(this.today.slice(0, 4));
    const yearOptions = [currentYear - 1, currentYear, currentYear + 1]
      .map(year => `<option ${year === this.year ? "selected" : ""}>${year}</option>`).join("");
    return `<header><h2>${this.title}</h2></header>
      <div class="controls">
        ${toggler("clock", this.l.clock, this.mode === "clock")}
        ${toggler("duration", this.l.duration, this.mode === "duration")}
        <span class="spacer"></span><label>${this.l.year} <select data-field="year">${yearOptions}</select></label>
      </div>
      ${this.dateControls(day.date, days[0].date, days.at(-1).date, currentYear === this.year)}
      ${this.chart()}
      ${this.legend()}
      <div class="day">
        ${this.timeline(day, this.zone, Date.now() / 1000)}
        <dl>
          ${row(this.l.periods, day.direct.length ? this.formatPeriods(day.direct, day, this.zone) : this.l.noSun)}
          ${row(this.l.direct, this.formatDuration(day.totals.direct))}
          ${row(this.l.terrain_shade, this.formatDuration(day.totals.terrain_shade))}
          ${row(this.l.daylight, this.formatDuration(day.totals.daylight))}
          <div class="row"><dt>${this.similar.dark ? this.l.nextSun : this.l.similarSun}</dt>
            <dd data-similar-result aria-live="polite">${this.similarDayValue()}</dd></div>
        </dl>
      </div>
      <details ${opened ? "open" : ""}><summary>${this.l.seasons}</summary>
        <dl>${this.data.solstices.map(event => row(
          this.l[event.month === "6" ? "june" : "december"], this.formatDate(event.date))).join("")}
        ${row(this.l.evening, `<input type="time" data-field="evening" aria-label="${this.l.evening}" value="${this.evening}">`)}
        ${row(this.l.lastEvening, lastEvening ? this.formatDate(lastEvening.date) : "—")}
        </dl>
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
