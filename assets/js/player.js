/*
 * New Exodus Radio: live stream player
 * ------------------------------------------------------------
 * One audio engine drives every player view on the page: the
 * persistent bar at the bottom of the window and any featured
 * player (homepage, Listen Live page). Views are plain HTML marked
 * with data-player-* attributes, so the markup can be restyled
 * without touching this file.
 *
 * Honesty rules built in:
 *   - With no stream URL in config.js the state is OFFLINE and
 *     play is disabled.
 *   - "Live" is shown only after audio is actually playing.
 *   - No listener counts, no simulated programming.
 *
 * Note: a full page navigation reloads the page and stops audio.
 * Uninterrupted playback across pages would need the site to load
 * pages without full reloads (a later phase), so it isn't claimed.
 */
(function () {
  "use strict";
  var NER = (window.NER = window.NER || {});
  var CFG = window.NER_CONFIG || {};
  var STREAM = CFG.stream || {};
  var DEFAULT_ART = "assets/images/branding/station-art.svg";

  var STATES = {
    offline:    { label: "Offline",     detail: "No broadcast source is connected yet." },
    ready:      { label: "Stream ready", detail: "Press play to connect to the live stream." },
    connecting: { label: "Connecting",  detail: "Connecting to the live stream…" },
    live:       { label: "Live",        detail: "Connected to the live stream." },
    error:      { label: "Unavailable", detail: "The stream can't be reached right now. Try again in a few minutes." }
  };

  var state = STREAM.url ? "ready" : "offline";
  var audio = null;
  var shows = {};
  var meta = { title: "", host: "", art: "", next: "", streamTitle: "" };
  var volume = 0.8;
  var muted = false;
  try {
    var saved = parseFloat(localStorage.getItem("ner-volume"));
    if (!isNaN(saved)) volume = Math.min(1, Math.max(0, saved));
  } catch (e) { /* storage unavailable; use default */ }

  function views() { return document.querySelectorAll("[data-player]"); }
  function each(root, sel, fn) { root.querySelectorAll(sel).forEach(fn); }

  function setState(next) {
    state = next;
    render();
  }

  function render() {
    var s = STATES[state];
    var playing = state === "live" || state === "connecting";

    document.querySelectorAll("[data-player-dot]").forEach(function (d) {
      d.setAttribute("data-state", state);
    });

    views().forEach(function (v) {
      v.setAttribute("data-state", state);
      each(v, "[data-player-status]", function (el) { el.textContent = s.label; });
      each(v, "[data-player-connection]", function (el) { el.textContent = s.detail; });
      each(v, "[data-player-title]", function (el) { el.textContent = meta.streamTitle || meta.title; });
      each(v, "[data-player-host]", function (el) {
        el.textContent = meta.host;
        el.hidden = !meta.host;
      });
      each(v, "[data-player-next]", function (el) { el.textContent = meta.next; });
      each(v, "[data-player-art]", function (el) {
        var src = NER.url(meta.art || DEFAULT_ART);
        if (el.getAttribute("src") !== src) el.setAttribute("src", src);
      });
      each(v, "[data-player-toggle]", function (btn) {
        btn.disabled = state === "offline";
        btn.setAttribute("aria-pressed", String(playing));
        btn.setAttribute("aria-label",
          state === "offline" ? "Play (unavailable while offline)" : playing ? "Pause live stream" : "Play live stream");
      });
      each(v, "[data-player-volume]", function (r) {
        r.value = String(Math.round((muted ? 0 : volume) * 100));
        r.style.setProperty("--fill", r.value + "%");
        r.setAttribute("aria-valuetext", r.value + " percent");
      });
      each(v, "[data-player-mute]", function (b) {
        b.setAttribute("aria-pressed", String(muted || volume === 0));
        b.setAttribute("aria-label", muted ? "Unmute" : "Mute");
      });
    });
  }

  /* ---------- Audio engine ---------- */
  function ensureAudio() {
    if (audio) return audio;
    audio = new Audio();
    audio.preload = "none";
    audio.volume = volume;
    audio.muted = muted;
    audio.addEventListener("playing", function () { setState("live"); });
    audio.addEventListener("waiting", function () { if (state === "live") setState("connecting"); });
    audio.addEventListener("stalled", function () { if (state === "live") setState("connecting"); });
    audio.addEventListener("error", function () { if (audio.getAttribute("src")) setState("error"); });
    return audio;
  }

  function play() {
    if (!STREAM.url) return;
    var a = ensureAudio();
    /* Cache-buster so a resumed live stream starts at the live edge. */
    a.src = STREAM.url + (STREAM.url.indexOf("?") > -1 ? "&" : "?") + "t=" + Date.now();
    setState("connecting");
    var p = a.play();
    if (p && p.catch) p.catch(function () { setState("error"); });
    setMediaSession();
  }

  function stop() {
    if (!audio) return;
    audio.pause();
    audio.removeAttribute("src"); // stop downloading the live stream
    audio.load();
    setState(STREAM.url ? "ready" : "offline");
  }

  function toggle() {
    if (state === "live" || state === "connecting") stop();
    else play();
  }

  function setVolume(v) {
    volume = Math.min(1, Math.max(0, v));
    muted = volume === 0 ? muted : false;
    if (audio) { audio.volume = volume; audio.muted = muted; }
    try { localStorage.setItem("ner-volume", String(volume)); } catch (e) {}
    render();
  }

  function setMediaSession() {
    if (!("mediaSession" in navigator)) return;
    try {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: meta.streamTitle || meta.title || STREAM.stationName,
        artist: STREAM.stationName || "New Exodus Radio"
      });
      navigator.mediaSession.setActionHandler("play", play);
      navigator.mediaSession.setActionHandler("pause", stop);
    } catch (e) {}
  }

  /* ---------- Program information ---------- */
  function applySchedule(schedule) {
    var r = NER.schedule ? NER.schedule.resolve(schedule) : { current: null, next: null };
    var cur = r.current && shows[r.current.show];
    var nxt = r.next && shows[r.next.show];

    if (cur) {
      meta.title = cur.name;
      meta.host = cur.host ? "Hosted by " + cur.host : "";
      meta.art = cur.artwork;
    } else if (STREAM.url) {
      meta.title = STREAM.stationName || "New Exodus Radio";
      meta.host = "";
      meta.art = "";
    } else {
      meta.title = "Nothing on the air right now";
      meta.host = "";
      meta.art = "";
    }

    if (nxt) {
      var day = r.next.day.charAt(0).toUpperCase() + r.next.day.slice(1);
      meta.next = nxt.name + ", " + day + " at " + NER.schedule.formatTime(r.next.start) +
        (r.next.tentative ? " (tentative)" : "");
    } else {
      meta.next = "Schedule to be announced";
    }
    render();
  }

  /* Optional: read the current title from an Icecast status-json.xsl endpoint. */
  function pollMetadata() {
    if (!STREAM.metadataUrl) return;
    var tick = function () {
      if (state !== "live") return;
      fetch(STREAM.metadataUrl, { cache: "no-store" })
        .then(function (r) { return r.json(); })
        .then(function (j) {
          var src = j && j.icestats && j.icestats.source;
          if (Array.isArray(src)) src = src[0];
          meta.streamTitle = (src && (src.title || src.server_name)) || "";
          render();
        })
        .catch(function () {});
    };
    setInterval(tick, Math.max(10, STREAM.metadataIntervalSeconds || 30) * 1000);
  }

  /* ---------- Wire up views ---------- */
  function bind() {
    views().forEach(function (v) {
      each(v, "[data-player-toggle]", function (b) { b.addEventListener("click", toggle); });
      each(v, "[data-player-volume]", function (r) {
        r.addEventListener("input", function () { setVolume(parseInt(r.value, 10) / 100); });
      });
      each(v, "[data-player-mute]", function (b) {
        b.addEventListener("click", function () {
          muted = !muted;
          if (audio) audio.muted = muted;
          render();
        });
      });
    });
  }

  /* The persistent bar is rendered here so it lives in one place.
     Pages include <div id="player-bar"></div> before </body>. */
  var ICONS =
    '<svg class="icon-play" viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5.5v13l10.5-6.5z" fill="currentColor"/></svg>' +
    '<svg class="icon-pause" viewBox="0 0 24 24" aria-hidden="true"><path d="M7 5h3.5v14H7zM13.5 5H17v14h-3.5z" fill="currentColor"/></svg>';
  var VOL =
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z" fill="currentColor"/>' +
    '<path class="vol-waves" d="M15 9a4 4 0 0 1 0 6M17.5 6.5a7.5 7.5 0 0 1 0 11" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>' +
    '<path class="vol-x" d="M15.5 9.5l5 5M20.5 9.5l-5 5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>';
  NER.playerIcons = { play: ICONS, volume: VOL };

  function renderBar() {
    var slot = document.getElementById("player-bar");
    if (!slot) return;
    slot.className = "player-bar";
    slot.setAttribute("data-player", "");
    slot.setAttribute("role", "region");
    slot.setAttribute("aria-label", "Live radio player");
    slot.innerHTML =
      '<div class="container player-bar-inner">' +
      '<img class="pb-art" data-player-art alt="" width="48" height="48">' +
      '<div class="pb-info">' +
      '<p class="pb-title" data-player-title></p>' +
      '<p class="pb-sub"><span class="status-pill" data-player-status></span><span class="pb-next">Up next: <span data-player-next></span></span></p>' +
      "</div>" +
      '<button class="play-btn" type="button" data-player-toggle>' + ICONS + "</button>" +
      '<div class="volume">' +
      '<button class="icon-btn" type="button" data-player-mute>' + VOL + "</button>" +
      '<input type="range" min="0" max="100" step="1" data-player-volume aria-label="Volume">' +
      "</div>" +
      '<a class="pb-link" href="' + NER.url("listen-live.html") + '">Listen Live page</a>' +
      "</div>";
    document.body.classList.add("has-player-bar");
  }

  function init() {
    renderBar();
    document.querySelectorAll("[data-player-icons]").forEach(function (el) { el.innerHTML = ICONS; });
    document.querySelectorAll("[data-player-volicon]").forEach(function (el) { el.innerHTML = VOL; });
    applySchedule(null);
    bind();
    render();

    Promise.all([
      NER.loadJSON("shows").catch(function () { return { shows: [] }; }),
      NER.schedule ? NER.schedule.load() : Promise.resolve(null)
    ]).then(function (res) {
      (res[0].shows || []).forEach(function (s) { shows[s.id] = s; });
      applySchedule(res[1]);
      setInterval(function () { applySchedule(res[1]); }, 60000);
    });
    pollMetadata();
  }

  NER.player = {
    play: play, stop: stop, toggle: toggle, setVolume: setVolume,
    getState: function () { return state; }
  };

  init();
})();
