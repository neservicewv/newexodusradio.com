/*
 * New Exodus Radio: Preparedness Shop (front-end scaffold)
 * ------------------------------------------------------------
 * Phase 1 renders the shop's product categories from
 * data/products.json. The cart below is a structure for Phase 5:
 * it keeps item ids and quantities only, in this browser, and
 * never handles payment details. Checkout will hand off to a
 * hosted payment provider (for example Stripe Checkout) through a
 * secure server; no payment keys belong in this file.
 */
(function () {
  "use strict";
  var NER = window.NER;
  var esc = NER.escape;
  var KEY = "ner-cart";

  var cart = {
    items: function () {
      try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch (e) { return []; }
    },
    save: function (items) {
      try { localStorage.setItem(KEY, JSON.stringify(items)); } catch (e) {}
      document.dispatchEvent(new CustomEvent("ner:cart", { detail: items }));
    },
    add: function (id, qty) {
      var items = cart.items();
      var row = items.find(function (r) { return r.id === id; });
      if (row) row.qty += qty || 1; else items.push({ id: id, qty: qty || 1 });
      cart.save(items);
    },
    remove: function (id) {
      cart.save(cart.items().filter(function (r) { return r.id !== id; }));
    },
    clear: function () { cart.save([]); },
    count: function () {
      return cart.items().reduce(function (n, r) { return n + r.qty; }, 0);
    }
  };

  function renderCategories(el) {
    NER.loadJSON("products").then(function (data) {
      el.innerHTML = data.categories.map(function (c) {
        return (
          '<li class="shop-cat">' +
          '<h3>' + esc(c.name) + "</h3>" +
          '<p>' + esc(c.items.join(", ")) + "</p>" +
          "</li>"
        );
      }).join("");
    }).catch(function () { NER.dataNotice(el); });
  }

  NER.store = { cart: cart };
  document.querySelectorAll("[data-shop-categories]").forEach(renderCategories);
})();
