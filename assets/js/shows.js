/*
 * New Exodus Radio: program cards and the tuning dial
 * ------------------------------------------------------------
 * Everything here is generated from data/shows.json, so adding a
 * program, or turning a "Coming soon" card into a real show,
 * means editing that file only.
 *
 *   <div data-show-grid></div>   program cards
 *   <div data-tuner></div>       hero tuning dial
 */
(function () {
  "use strict";
  var NER = window.NER;
  var esc = NER.escape;

  function card(s) {
    var soon = s.status === "coming-soon";
    var host = s.host ? "Hosted by " + esc(s.host) : soon ? "" : "Host to be announced";
    var example = s.exampleEpisode
      ? '<div class="show-example"><p class="show-example-label">Example episode topic</p>' +
        '<p class="show-example-title">' + esc(s.exampleEpisode.title) + "</p>" +
        '<p class="scripture-ref">' + esc(s.exampleEpisode.scripture) + "</p></div>"
      : "";
    return (
      '<article class="show-card' + (soon ? " is-soon" : "") + '" data-theme="' + esc(s.theme) + '">' +
      '<div class="show-art"><img src="' + NER.url(s.artwork) + '" alt="' + esc(s.artworkAlt) + '" loading="lazy" width="640" height="400"></div>' +
      '<div class="show-body">' +
      '<p class="show-when">' + (soon ? '<span class="badge">Coming soon</span>' : esc(s.period)) + "</p>" +
      '<h3 class="show-name"><a href="' + NER.url(s.page) + '">' + esc(s.name) + "</a></h3>" +
      '<p class="show-category">' + esc(s.category) + "</p>" +
      '<p class="show-summary">' + esc(s.summary) + "</p>" +
      example +
      (host ? '<p class="show-host">' + host + "</p>" : "") +
      "</div></article>"
    );
  }

  function renderGrid(el) {
    NER.loadJSON("shows").then(function (data) {
      var list = data.shows;
      var main = list.filter(function (s) { return s.status !== "coming-soon"; });
      var soon = list.filter(function (s) { return s.status === "coming-soon"; });
      el.innerHTML =
        '<div class="show-grid show-grid--main">' + main.map(card).join("") + "</div>" +
        (soon.length ? '<div class="show-grid show-grid--soon">' + soon.map(card).join("") + "</div>" : "");
    }).catch(function () { NER.dataNotice(el); });
  }

  function renderTuner(el) {
    NER.loadJSON("shows").then(function (data) {
      var stations = data.shows.map(function (s, i) {
        var soon = s.status === "coming-soon";
        return (
          '<li class="station' + (soon ? " is-soon" : "") + '" style="--pos:' + s.dial + '%">' +
          '<a href="' + NER.url(s.page) + '" data-dial="' + s.dial + '" data-readout="' +
          esc(soon ? "A new program is on the way" : s.name + ", " + s.period.toLowerCase()) + '">' +
          '<span class="station-name">' + esc(soon ? "Coming soon" : s.shortName || s.name) + "</span></a></li>"
        );
      }).join("");

      el.innerHTML =
        '<div class="tuner">' +
        '<p class="tuner-readout" aria-live="polite">Our programs</p>' +
        '<div class="tuner-band" aria-hidden="true"><span class="tuner-ticks"></span><span class="tuner-needle"></span></div>' +
        '<ul class="tuner-stations" aria-label="Programs">' + stations + "</ul>" +
        "</div>";

      var tuner = el.querySelector(".tuner");
      var readout = el.querySelector(".tuner-readout");
      var rest = data.shows[0] ? data.shows[0].dial : 10;
      tuner.style.setProperty("--needle", rest + "%");

      var move = function (a) {
        tuner.style.setProperty("--needle", a.getAttribute("data-dial") + "%");
        readout.textContent = a.getAttribute("data-readout");
        tuner.querySelectorAll(".station").forEach(function (li) { li.classList.toggle("is-tuned", li.contains(a)); });
      };
      var reset = function () {
        tuner.style.setProperty("--needle", rest + "%");
        readout.textContent = "Our programs";
        tuner.querySelectorAll(".station").forEach(function (li) { li.classList.remove("is-tuned"); });
      };
      tuner.querySelectorAll(".station a").forEach(function (a) {
        a.addEventListener("mouseenter", function () { move(a); });
        a.addEventListener("focus", function () { move(a); });
      });
      tuner.addEventListener("mouseleave", reset);
      tuner.addEventListener("focusout", function (e) { if (!tuner.contains(e.relatedTarget)) reset(); });
    }).catch(function () { el.innerHTML = ""; });
  }

  document.querySelectorAll("[data-show-grid]").forEach(renderGrid);
  document.querySelectorAll("[data-tuner]").forEach(renderTuner);
})();
