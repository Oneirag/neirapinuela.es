(function () {
    "use strict";

    var STORAGE_KEY = "theme";
    var EXPLICIT_KEY = "theme.explicit";
    var VALID = ["light", "dark"];

    function getStoredTheme() {
        try {
            var t = localStorage.getItem(STORAGE_KEY);
            if (VALID.indexOf(t) !== -1) {
                return t;
            }
        } catch (e) {
            // localStorage may be blocked; fall through
        }
        return null;
    }

    function getSystemTheme() {
        if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
            return "dark";
        }
        return "light";
    }

    function applyTheme(theme) {
        document.documentElement.dataset.theme = theme;
        var meta = document.querySelector('meta[name="color-scheme"]');
        if (!meta) {
            meta = document.createElement("meta");
            meta.setAttribute("name", "color-scheme");
            document.head.appendChild(meta);
        }
        meta.setAttribute("content", theme);
    }

    function currentTheme() {
        return document.documentElement.dataset.theme || "light";
    }

    function setTheme(theme, explicit) {
        if (VALID.indexOf(theme) === -1) {
            return;
        }
        applyTheme(theme);
        try {
            localStorage.setItem(STORAGE_KEY, theme);
            if (explicit) {
                localStorage.setItem(EXPLICIT_KEY, "1");
            } else {
                localStorage.removeItem(EXPLICIT_KEY);
            }
        } catch (e) {
            // ignore
        }
        updateToggleIcon(theme);
    }

    function updateToggleIcon(theme) {
        var btn = document.getElementById("theme-toggle-btn");
        if (!btn) {
            return;
        }
        var icon = btn.querySelector("[data-theme-icon]");
        var label = btn.querySelector("[data-theme-label]");
        if (theme === "dark") {
            if (icon) {
                icon.innerHTML = SUN_SVG;
            }
            if (label) {
                label.textContent = label.getAttribute("data-light-label") || "Light mode";
            }
            btn.setAttribute("title", btn.getAttribute("data-light-title") || "Switch to light mode");
            btn.setAttribute("aria-label", btn.getAttribute("data-light-aria") || "Switch to light mode");
        } else {
            if (icon) {
                icon.innerHTML = MOON_SVG;
            }
            if (label) {
                label.textContent = label.getAttribute("data-dark-label") || "Dark mode";
            }
            btn.setAttribute("title", btn.getAttribute("data-dark-title") || "Switch to dark mode");
            btn.setAttribute("aria-label", btn.getAttribute("data-dark-aria") || "Switch to dark mode");
        }
    }

    function toggleTheme() {
        var next = currentTheme() === "dark" ? "light" : "dark";
        setTheme(next, true);
        // Persist to server-side session so subsequent SSR uses the same theme.
        try {
            fetch("/set_theme/" + next, {
                method: "POST",
                credentials: "same-origin",
                headers: { "Accept": "application/json" }
            }).catch(function () { /* non-fatal */ });
        } catch (e) {
            // ignore
        }
    }

    function init() {
        var explicit = false;
        try {
            explicit = localStorage.getItem(EXPLICIT_KEY) === "1";
        } catch (e) {
            // ignore
        }
        var stored = getStoredTheme();
        var theme;
        if (stored && explicit) {
            theme = stored;
        } else if (stored) {
            // inherited from server SSR; trust it
            theme = stored;
        } else {
            theme = getSystemTheme();
        }
        applyTheme(theme);
        updateToggleIcon(theme);

        var btn = document.getElementById("theme-toggle-btn");
        if (btn) {
            btn.addEventListener("click", function (ev) {
                ev.preventDefault();
                toggleTheme();
            });
        }

        // React to OS changes only when user has not made an explicit choice.
        if (window.matchMedia) {
            var mq = window.matchMedia("(prefers-color-scheme: dark)");
            var listener = function (e) {
                var exp = false;
                try {
                    exp = localStorage.getItem(EXPLICIT_KEY) === "1";
                } catch (err) {
                    // ignore
                }
                if (!exp) {
                    setTheme(e.matches ? "dark" : "light", false);
                }
            };
            if (mq.addEventListener) {
                mq.addEventListener("change", listener);
            } else if (mq.addListener) {
                mq.addListener(listener);
            }
        }
    }

    var SUN_SVG = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 4V2m0 20v-2m8-8h2M2 12h2m13.66-5.66l1.41-1.41M4.93 19.07l1.41-1.41m0-11.32L4.93 4.93m14.14 14.14l-1.41-1.41M12 7a5 5 0 100 10 5 5 0 000-10z" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
    var MOON_SVG = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" aria-hidden="true"><path d="M21 12.79A9 9 0 1111.21 3a7 7 0 009.79 9.79z" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }
})();
