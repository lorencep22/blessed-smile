// Theme Communication System for Iframe Pages
(function () {
  // Listen for theme changes from parent window
  window.addEventListener("message", function (event) {
    if (event.data.type === "THEME_CHANGE" && window.themeManager) {
      window.themeManager.applyTheme(event.data.themeId);
    }
  });

  // Function to notify parent of theme changes
  window.notifyParentThemeChange = function (themeId) {
    if (window.parent !== window) {
      window.parent.postMessage(
        {
          type: "THEME_CHANGE",
          themeId: themeId,
        },
        "*"
      );
    }
  };

  // Override the theme manager's changeTheme function to include parent notification
  function setupThemeOverride() {
    if (window.themeManager) {
      const originalChangeTheme = window.themeManager.changeTheme.bind(
        window.themeManager
      );
      window.themeManager.changeTheme = async function (themeId) {
        await originalChangeTheme(themeId);
        window.notifyParentThemeChange(themeId);

        // NO PAGE RELOAD - Let parent handle iframe theme updates
      };
    } else {
      // If theme manager not ready, try again later
      setTimeout(setupThemeOverride, 100);
    }
  }

  // Setup when DOM is ready or immediately if already ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", setupThemeOverride);
  } else {
    setupThemeOverride();
  }

  // Apply theme immediately when page loads if theme manager is ready
  function applyStoredTheme() {
    const savedTheme = localStorage.getItem("blessedsmile-theme") || "gold";
    if (window.themeManager && window.themeManager.applyTheme) {
      window.themeManager.applyTheme(savedTheme);
    } else {
      // If theme manager not ready, wait a bit and try again (with max retries)
      let retries = 0;
      const checkThemeManager = () => {
        if (window.themeManager && window.themeManager.applyTheme) {
          window.themeManager.applyTheme(savedTheme);
        } else if (retries < 30) {
          // Wait up to 3 seconds
          retries++;
          setTimeout(checkThemeManager, 100);
        }
      };
      checkThemeManager();
    }
  }

  // Start theme application when DOM is ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", applyStoredTheme);
  } else {
    applyStoredTheme();
  }
})();
