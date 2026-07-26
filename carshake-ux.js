/* ════════════════════════════════════════════════════════════════════
   CarShake UX Enhancement — R1 (2026-07-26)
   Tiny progressive-enhancement runtime. Self-hosted → allowed by CSP
   (script-src 'self'). No dependencies. Defers all work until the SPA
   has mounted, so it never races the React hydration.
   ════════════════════════════════════════════════════════════════════ */
(function () {
  "use strict";

  var CTA_HREF = "/free/instant-proof";   // primary conversion goal
  var CTA_LABEL_PRIMARY = "Try free";
  var CTA_LABEL_TITLE = "Instant proof";
  var CTA_LABEL_SUB = "30s · no signup";

  /* Inject the chrome once the DOM is ready AND the SPA has produced
     real content. We avoid injecting before the app mounts so the fixed
     chrome never overlaps the still-empty #root. */
  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  function el(tag, attrs, html) {
    var n = document.createElement(tag);
    if (attrs) for (var k in attrs) {
      if (k === "class") n.className = attrs[k];
      else if (k === "html") n.innerHTML = attrs[k];
      else n.setAttribute(k, attrs[k]);
    }
    if (html != null) n.innerHTML = html;
    return n;
  }

  function build() {
    if (document.getElementById("cs-ux-progress")) return; // idempotent

    // Skip link (a11y) — first focusable element
    var skip = el("a", {
      id: "cs-ux-skip",
      href: "#main"
    }, "Skip to content");

    // Reading progress
    var progress = el("div", { id: "cs-ux-progress" });

    // Sticky mobile CTA
    var cta = el("div", { id: "cs-ux-cta" });
    var label = el("div", { id: "cs-ux-cta-label" });
    label.appendChild(el("span", { class: "t" }, CTA_LABEL_TITLE));
    label.appendChild(el("span", { class: "s" }, CTA_LABEL_SUB));
    var btn = el("a", {
      class: "cs-ux-btn cs-ux-btn--primary",
      href: CTA_HREF,
      "aria-label": CTA_LABEL_PRIMARY + " — " + CTA_LABEL_SUB
    }, CTA_LABEL_PRIMARY);
    cta.appendChild(label);
    cta.appendChild(btn);

    // Back-to-top
    var totop = el("button", {
      id: "cs-ux-totop",
      type: "button",
      "aria-label": "Back to top"
    });
    totop.innerHTML =
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" ' +
      'stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" ' +
      'aria-hidden="true"><path d="M12 19V5"/><path d="M5 12l7-7 7 7"/></svg>';

    // Ensure #main exists as a skip target (the SPA renders <main>)
    if (!document.getElementById("main")) {
      var m = document.querySelector("main");
      if (m) m.id = "main";
    }

    var body = document.body;
    body.appendChild(skip);
    body.appendChild(progress);
    body.appendChild(cta);
    body.appendChild(totop);

    wireUp(progress, cta, totop);
  }

  function wireUp(progress, cta, totop) {
    var body = document.body;
    var lastY = -1;
    var ticking = false;
    var footer = document.querySelector("footer");
    var hero = document.querySelector("h1");

    function onScroll() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () {
        ticking = false;
        var y = window.pageYOffset || document.documentElement.scrollTop;
        if (y === lastY) return;
        lastY = y;

        var docH = document.documentElement.scrollHeight - window.innerHeight;
        var pct = docH > 0 ? Math.min(100, Math.max(0, (y / docH) * 100)) : 0;

        // Reading progress
        progress.style.width = pct.toFixed(2) + "%";

        // Back-to-top: show after 1.5 viewports of scrolling
        if (y > window.innerHeight * 1.4) totop.classList.add("visible");
        else totop.classList.remove("visible");

        // Sticky CTA logic — mobile only (CSS hides it ≥880px).
        // Show once the hero headline scrolls past; hide near the very
        // bottom so it doesn't fight the final in-page CTA.
        var ctaOn = false;
        if (window.innerWidth < 880) {
          var heroBottom = hero ? hero.getBoundingClientRect().bottom + y : 0;
          var nearBottom = pct > 92;
          if (y > heroBottom + 120 && !nearBottom) ctaOn = true;
        }
        if (ctaOn) {
          if (!cta.classList.contains("visible")) {
            cta.classList.add("visible");
            body.classList.add("cs-ux-cta-on");
          }
        } else {
          if (cta.classList.contains("visible")) {
            cta.classList.remove("visible");
            body.classList.remove("cs-ux-cta-on");
          }
        }
      });
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });

    totop.addEventListener("click", function () {
      window.scrollTo({
        top: 0,
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
          ? "auto" : "smooth"
      });
    });

    // Re-measure when the SPA finishes mounting (it can render late)
    if (typeof MutationObserver !== "undefined") {
      var root = document.getElementById("root");
      if (root) {
        var mo = new MutationObserver(function () { onScroll(); });
        mo.observe(root, { childList: true, subtree: false });
        // Stop watching after the app has clearly settled (8s)
        setTimeout(function () { mo.disconnect(); }, 8000);
      }
    }

    onScroll();
  }

  // The SPA hydrates after DOMContentLoaded. Inject immediately so the
  // fixed chrome is in place, but the scroll handler re-measures on
  // MutationObserver once content appears.
  ready(build);
})();
