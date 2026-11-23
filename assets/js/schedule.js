/*
 * New Exodus Radio: schedule helper
 * ------------------------------------------------------------
 * Reads data/schedule.json and answers "what is on now?" and
 * "what is on next?" for the player. With no confirmed slots in
 * the file, both answers are empty and the site shows
 * "Schedule to be announced". Nothing is invented.
 *
 * Slot format (data/schedule.json -> slots[]):
 *   { "show": "coffee-with-jesus", "day": "monday",
 *     "start": "07:00", "end": "08:00", "tentative": true }
 */
(function () {
  "use strict";
  var NER = (window.NER = window.NER || {});
  var CFG = window.NER_CONFIG || {};
  var DAYS = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];

  function toMinutes(hhmm) {
    var p = String(hhmm).split(":");
    return parseInt(p[0], 10) * 60 + parseInt(p[1] || "0", 10);
  }

  /* Current day index and minute-of-day in the station's time zone. */
  function stationNow(date) {
    var parts = new Intl.DateTimeFormat("en-US", {
      timeZone: CFG.timezone || "America/New_York",
      weekday: "long", hour: "2-digit", minute: "2-digit", hour12: false
    }).formatToParts(date || new Date());
    var get = function (t) {
      return (parts.find(function (p) { return p.type === t; }) || {}).value;
    };
    var hour = parseInt(get("hour"), 10) % 24;
    return { day: DAYS.indexOf(get("weekday").toLowerCase()), minutes: hour * 60 + parseInt(get("minute"), 10) };
  }

  /* Week position in minutes, Sunday 00:00 = 0. */
  function weekPos(dayIndex, minutes) { return dayIndex * 1440 + minutes; }

  NER.schedule = {
    load: function () {
      return NER.loadJSON("schedule").catch(function () {
        return { status: "unavailable", slots: [] };
      });
    },

    /* Returns { current, next } slots, or nulls when nothing is scheduled. */
    resolve: function (data, date) {
      var slots = (data && data.slots) || [];
      if (!slots.length) return { current: null, next: null };
      var now = stationNow(date);
      var pos = weekPos(now.day, now.minutes);
      var current = null, next = null, best = Infinity;
      slots.forEach(function (s) {
        var d = DAYS.indexOf(String(s.day).toLowerCase());
        if (d < 0) return;
        var start = weekPos(d, toMinutes(s.start));
        var end = weekPos(d, toMinutes(s.end));
        if (end <= start) end += 1440; // runs past midnight
        if (pos >= start && pos < end) current = s;
        var until = (start - pos + 10080) % 10080;
        if (until > 0 && until < best) { best = until; next = s; }
      });
      return { current: current, next: next };
    },

    formatTime: function (hhmm) {
      var m = toMinutes(hhmm), h = Math.floor(m / 60), min = m % 60;
      var suffix = h >= 12 ? "PM" : "AM";
      h = h % 12 || 12;
      return h + (min ? ":" + String(min).padStart(2, "0") : "") + " " + suffix;
    },

    DAYS: DAYS
  };
})();
