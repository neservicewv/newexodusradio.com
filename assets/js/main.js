/*
 * New Exodus Radio: shared site behavior
 * ------------------------------------------------------------
 * - Renders the shared header and footer on every page, so the
 *   navigation lives in exactly one place.
 * - Mobile navigation.
 * - JSON data loading (NER.loadJSON).
 * - Demonstration-mode forms that never pretend to submit.
 *
 * Each page's <body> declares:
 *   data-root  ""  for top-level pages, "../" for pages in /shows/
 *   data-page  the nav key of the current page (e.g. "home")
 */
(function () {
  "use strict";

  var body = document.body;
  var ROOT = body.getAttribute("data-root") || "";
  var PAGE = body.getAttribute("data-page") || "";
  var CFG = window.NER_CONFIG || {};

  var NER = (window.NER = window.NER || {});
  NER.root = ROOT;
  NER.url = function (path) {
    if (!path || /^(https?:|mailto:|tel:|#)/.test(path)) return path;
    return ROOT + path;
  };

  /* ---------- Data loading ---------- */
  var cache = {};
  NER.loadJSON = function (name) {
    if (!cache[name]) {
      var url = ROOT + (CFG.dataPath || "data/") + name + ".json";
      cache[name] = fetch(url, { cache: "no-cache" }).then(function (r) {
        if (!r.ok) throw new Error("Could not load " + url + " (" + r.status + ")");
        return r.json();
      });
    }
    return cache[name];
  };

  /* Shown in place of data-driven content when the site is opened
     straight from disk (file://), where browsers block JSON loading. */
  NER.dataNotice = function (container) {
    if (!container) return;
    var local = location.protocol === "file:";
    container.innerHTML =
      '<div class="data-notice" role="note"><p><strong>' +
      (local ? "This section needs a local web server." : "This section could not load.") +
      "</strong> " +
      (local
        ? "Browsers block data files on pages opened directly from disk. Double-click <code>start-server.bat</code> in the project folder, then visit <code>http://localhost:8080</code>."
        : "Refresh the page to try again.") +
      "</p></div>";
  };

  NER.escape = function (s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  };

  /* ---------- Navigation model (single source of truth) ---------- */
  var NAV = [
    { key: "home", label: "Home", href: "index.html" },
    { key: "shows", label: "Shows", href: "shows.html" },
    { key: "listen", label: "Listen Live", href: "listen-live.html" },
    { key: "schedule", label: "Schedule", href: "schedule.html" },
    { key: "preparedness", label: "Preparedness", href: "preparedness.html" },
    { key: "shop", label: "Shop", href: "shop.html" },
    { key: "about", label: "About", href: "about.html" },
    { key: "contact", label: "Contact", href: "contact.html" }
  ];

  var FOOTER = [
    {
      title: "Network",
      links: [
        ["Listen Live", "listen-live.html"],
        ["Schedule", "schedule.html"],
        ["Episode archive", "episodes.html"],
        ["About", "about.html"],
        ["Contact", "contact.html"]
      ]
    },
    {
      title: "Programs",
      links: [
        ["Coffee with Jesus", "shows/coffee-with-jesus.html"],
        ["The Upper Room Broadcast 2.0", "shows/upper-room-2.html"],
        ["Night Watch", "shows/night-watch.html"],
        ["All shows", "shows.html"]
      ]
    },
    {
      title: "Community",
      links: [
        ["Prayer requests", "prayer-requests.html"],
        ["Stories of Restoration", "testimonies.html"],
        ["Bridging the Gap", "bridging-the-gap.html"],
        ["Preparedness Center", "preparedness.html"],
        ["Preparedness Shop", "shop.html"]
      ]
    }
  ];

  var SPONSOR_LINKS = [
    ["N.E. Service", "https://neservicewv.com"],
    ["New Life Laptops", "https://newlifelaptops.com"]
  ];

  var MARK =
    '<svg viewBox="0 0 40 40" aria-hidden="true" focusable="false">' +
    '<path d="M20 34V19" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/>' +
    '<circle cx="20" cy="16" r="3.2" fill="currentColor"/>' +
    '<path d="M12.5 23.5a10.5 10.5 0 0 1 0-15M27.5 8.5a10.5 10.5 0 0 1 0 15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>' +
    '<path d="M7.5 28a17 17 0 0 1 0-24M32.5 4a17 17 0 0 1 0 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" opacity=".55"/>' +
    "</svg>";

  function brand() {
    return (
      '<a class="brand" href="' + ROOT + 'index.html" aria-label="New Exodus Radio, home">' +
      '<span class="brand-mark">' + MARK + "</span>" +
      '<span class="brand-word"><span class="brand-name">New Exodus</span><span class="brand-sub">Radio</span></span>' +
      "</a>"
    );
  }

  function renderHeader() {
    var slot = document.getElementById("site-header");
    if (!slot) return;
    var items = NAV.map(function (n) {
      var current = n.key === PAGE ? ' aria-current="page"' : "";
      return '<li><a href="' + ROOT + n.href + '"' + current + ">" + n.label + "</a></li>";
    }).join("");

    slot.className = "site-header";
    slot.innerHTML =
      '<div class="container header-inner">' +
      brand() +
      '<nav class="main-nav" aria-label="Main">' +
      '<button class="nav-toggle" type="button" aria-expanded="false" aria-controls="primary-nav">' +
      '<span class="nav-toggle-bars" aria-hidden="true"></span><span class="nav-toggle-label">Menu</span></button>' +
      '<ul id="primary-nav" class="nav-list">' + items + "</ul>" +
      "</nav>" +
      '<a class="btn btn-live" href="' + ROOT + 'listen-live.html">' +
      '<span class="live-dot" data-player-dot aria-hidden="true"></span>Listen Live</a>' +
      "</div>";

    var toggle = slot.querySelector(".nav-toggle");
    var list = slot.querySelector(".nav-list");
    function setOpen(open) {
      toggle.setAttribute("aria-expanded", String(open));
      toggle.querySelector(".nav-toggle-label").textContent = open ? "Close" : "Menu";
      slot.classList.toggle("nav-open", open);
      body.classList.toggle("nav-locked", open);
    }
    toggle.addEventListener("click", function () {
      setOpen(toggle.getAttribute("aria-expanded") !== "true");
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && slot.classList.contains("nav-open")) {
        setOpen(false);
        toggle.focus();
      }
    });
    list.addEventListener("click", function (e) {
      if (e.target.closest("a")) setOpen(false);
    });
    window.matchMedia("(min-width: 64em)").addEventListener("change", function (m) {
      if (m.matches) setOpen(false);
    });

    var onScroll = function () {
      slot.classList.toggle("is-scrolled", window.scrollY > 24);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  function renderFooter() {
    var slot = document.getElementById("site-footer");
    if (!slot) return;
    var cols = FOOTER.map(function (c) {
      return (
        '<div class="footer-col"><h2 class="footer-heading">' + c.title + "</h2><ul>" +
        c.links.map(function (l) {
          return '<li><a href="' + ROOT + l[1] + '">' + l[0] + "</a></li>";
        }).join("") +
        "</ul></div>"
      );
    }).join("");

    var sponsors =
      '<div class="footer-col"><h2 class="footer-heading">Sponsors</h2><ul>' +
      SPONSOR_LINKS.map(function (s) {
        return (
          '<li><a href="' + s[1] + '" target="_blank" rel="noopener" class="external">' + s[0] +
          '<span class="visually-hidden"> (opens an external site)</span></a></li>'
        );
      }).join("") +
      '<li><a href="' + ROOT + 'sponsors.html">All sponsors and partners</a></li></ul></div>';

    slot.className = "site-footer";
    slot.innerHTML =
      '<div class="container">' +
      '<div class="footer-grid">' +
      '<div class="footer-brand">' + brand() +
      '<p class="footer-tagline">' + (CFG.tagline || "") + "</p>" +
      '<blockquote class="footer-verse"><p>“Come out of her, my people.”</p><cite>Revelation 18:4</cite></blockquote>' +
      "</div>" +
      cols + sponsors +
      "</div>" +
      '<div class="footer-base">' +
      "<p>© " + new Date().getFullYear() + " New Exodus Radio. All rights reserved.</p>" +
      '<ul class="footer-legal"><li><a href="' + ROOT + 'privacy.html">Privacy Policy</a></li>' +
      '<li><a href="' + ROOT + 'terms.html">Terms of Use</a></li></ul>' +
      "</div></div>";
  }

  /* ---------- Demonstration-mode forms ----------
     <form data-form="newsletter" data-feature="newsletter"> ... <p data-form-status></p>
     While the matching feature switch in config.js is off, submitting
     the form only explains that nothing was sent. */
  function initForms() {
    document.querySelectorAll("form[data-form]").forEach(function (form) {
      var feature = form.getAttribute("data-feature");
      var live = feature && CFG.features && CFG.features[feature] === true;
      var status = form.querySelector("[data-form-status]");
      form.addEventListener("submit", function (e) {
        e.preventDefault();
        if (!form.checkValidity()) {
          form.reportValidity();
          return;
        }
        if (!live) {
          if (status) {
            status.hidden = false;
            status.className = "form-status is-demo";
            status.textContent =
              form.getAttribute("data-demo-message") ||
              "This form isn't connected yet, so nothing was sent or saved.";
          }
          return;
        }
        /* Phase 7: send to the secure backend endpoint here and show
           a success message only after the server confirms receipt. */
      });
    });
  }

  /* ---------- Sponsor cards (from data/sponsors.json) ---------- */
  NER.renderSponsors = function (container) {
    if (!container) return;
    NER.loadJSON("sponsors").then(function (data) {
      container.innerHTML = data.sponsors.map(function (s) {
        var logo = s.logo
          ? '<img src="' + NER.url(s.logo) + '" alt="' + NER.escape(s.name) + ' logo" loading="lazy">'
          : '<span class="sponsor-monogram" aria-hidden="true">' + NER.escape(s.monogram) + "</span>";
        return (
          '<article class="sponsor-card">' +
          '<div class="sponsor-logo">' + logo + "</div>" +
          '<div class="sponsor-body">' +
          "<h3>" + NER.escape(s.name) + "</h3>" +
          '<p class="sponsor-tagline">' + NER.escape(s.tagline) + "</p>" +
          "<p>" + NER.escape(s.description) + "</p>" +
          '<a class="btn btn-outline" href="' + s.url + '" target="_blank" rel="noopener">' +
          NER.escape(s.cta) + '<span class="visually-hidden"> (opens ' + NER.escape(s.domain) + " in a new tab)</span></a>" +
          '<p class="sponsor-domain">External site: ' + NER.escape(s.domain) + "</p>" +
          "</div></article>"
        );
      }).join("");
    }).catch(function () {
      NER.dataNotice(container);
    });
  };

  renderHeader();
  renderFooter();
  initForms();
  document.querySelectorAll("[data-sponsors]").forEach(NER.renderSponsors);
})();
