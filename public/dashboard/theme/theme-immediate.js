// Immediate Theme Application Script
// This script applies the saved theme immediately to prevent flash of unstyled content
(function () {
  const savedTheme = localStorage.getItem("easysmile-theme");
  if (savedTheme) {
    const themes = {
      gold: {
        primary: "#ffd700",
        secondary: "#fff",
        background: "linear-gradient(135deg, #fff 0%, #ffd700 50%, #fff 100%)",
        text: "#000",
        cardBg: "#fff",
        sidebarBg: "linear-gradient(180deg, #fff 0%, #ffd700 50%, #fff 100%)",
        navbarBg: "linear-gradient(135deg, #ffd700 0%, #fff 50%, #ffd700 100%)",
        isDark: false,
      },
      blue: {
        primary: "#007bff",
        secondary: "#e3f2fd",
        background:
          "linear-gradient(135deg, #e3f2fd 0%, #007bff 50%, #e3f2fd 100%)",
        text: "#1a1a1a",
        cardBg: "#fff",
        sidebarBg:
          "linear-gradient(180deg, #e3f2fd 0%, #007bff 50%, #e3f2fd 100%)",
        navbarBg:
          "linear-gradient(135deg, #007bff 0%, #e3f2fd 50%, #007bff 100%)",
        isDark: false,
      },
      green: {
        primary: "#28a745",
        secondary: "#e8f5e8",
        background:
          "linear-gradient(135deg, #e8f5e8 0%, #28a745 50%, #e8f5e8 100%)",
        text: "#1a1a1a",
        cardBg: "#fff",
        sidebarBg:
          "linear-gradient(180deg, #e8f5e8 0%, #28a745 50%, #e8f5e8 100%)",
        navbarBg:
          "linear-gradient(135deg, #28a745 0%, #e8f5e8 50%, #28a745 100%)",
        isDark: false,
      },
      purple: {
        primary: "#6f42c1",
        secondary: "#f3e5f5",
        background:
          "linear-gradient(135deg, #f3e5f5 0%, #6f42c1 50%, #f3e5f5 100%)",
        text: "#1a1a1a",
        cardBg: "#fff",
        sidebarBg:
          "linear-gradient(180deg, #f3e5f5 0%, #6f42c1 50%, #f3e5f5 100%)",
        navbarBg:
          "linear-gradient(135deg, #6f42c1 0%, #f3e5f5 50%, #6f42c1 100%)",
        isDark: false,
      },
      dark: {
        primary: "#ffd700",
        secondary: "#2d3748",
        background:
          "linear-gradient(135deg, #1a202c 0%, #2d3748 50%, #1a202c 100%)",
        text: "#fff",
        cardBg: "#2d3748",
        sidebarBg:
          "linear-gradient(180deg, #2d3748 0%, #1a202c 50%, #2d3748 100%)",
        navbarBg:
          "linear-gradient(135deg, #2d3748 0%, #1a202c 50%, #2d3748 100%)",
        isDark: true,
      },
      midnight: {
        primary: "#4299e1",
        secondary: "#1a365d",
        background:
          "linear-gradient(135deg, #0f1419 0%, #1a365d 50%, #0f1419 100%)",
        text: "#e2e8f0",
        cardBg: "#1a365d",
        sidebarBg:
          "linear-gradient(180deg, #1a365d 0%, #0f1419 50%, #1a365d 100%)",
        navbarBg:
          "linear-gradient(135deg, #1a365d 0%, #0f1419 50%, #1a365d 100%)",
        isDark: true,
      },
    };

    const theme = themes[savedTheme];
    if (theme) {
      const root = document.documentElement;
      root.style.setProperty("--theme-primary", theme.primary, "important");
      root.style.setProperty("--theme-secondary", theme.secondary, "important");
      root.style.setProperty(
        "--theme-background",
        theme.background,
        "important"
      );
      root.style.setProperty("--theme-text", theme.text, "important");
      root.style.setProperty("--theme-card-bg", theme.cardBg, "important");
      root.style.setProperty(
        "--theme-sidebar-bg",
        theme.sidebarBg,
        "important"
      );
      root.style.setProperty("--theme-navbar-bg", theme.navbarBg, "important");

      // Additional CSS variables for consistent theming
      root.style.setProperty("--theme-accent", theme.primary, "important");
      root.style.setProperty("--theme-surface", theme.cardBg, "important");
      root.style.setProperty("--theme-primary-bg", theme.navbarBg, "important");
      root.style.setProperty(
        "--theme-hover",
        `rgba(${theme.isDark ? "255,255,255" : "0,0,0"}, 0.1)`,
        "important"
      );
      root.style.setProperty(
        "--theme-shadow",
        `rgba(${theme.isDark ? "0,0,0" : "0,0,0"}, ${
          theme.isDark ? "0.5" : "0.2"
        })`,
        "important"
      );
      root.style.setProperty(
        "--theme-focus",
        `${theme.primary}40`,
        "important"
      );
      root.style.setProperty(
        "--theme-highlight-bg",
        `${theme.primary}20`,
        "important"
      );
      root.style.setProperty(
        "--theme-close-filter",
        theme.isDark ? "invert(1)" : "none",
        "important"
      );

      // Apply background immediately to html element to prevent flash
      document.documentElement.style.background = theme.background;

      // Mark that immediate theme has been applied
      window._themeImmediatelyApplied = savedTheme;

      // Create loading overlay with current theme
      function createLoadingOverlay() {
        const overlay = document.createElement("div");
        overlay.id = "theme-loading-overlay";
        overlay.innerHTML = `
          <div class="loading-container">
            <div class="loading-spinner"></div>
            <div class="loading-text">Loading...</div>
          </div>
        `;

        // Style the overlay
        overlay.style.cssText = `
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          background: ${theme.background};
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          z-index: 9999;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: opacity 0.5s ease-out;
        `;

        // Style the loading container
        const style = document.createElement("style");
        style.textContent = `
          #theme-loading-overlay .loading-container {
            text-align: center;
            background: ${
              theme.isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.05)"
            };
            padding: 2rem;
            border-radius: 20px;
            backdrop-filter: blur(20px);
            -webkit-backdrop-filter: blur(20px);
            border: 1px solid ${
              theme.isDark ? "rgba(255, 255, 255, 0.2)" : "rgba(0, 0, 0, 0.1)"
            };
          }
          
          #theme-loading-overlay .loading-spinner {
            width: 50px;
            height: 50px;
            border: 4px solid ${
              theme.isDark ? "rgba(255, 255, 255, 0.3)" : "rgba(0, 0, 0, 0.3)"
            };
            border-top: 4px solid ${theme.primary};
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin: 0 auto 1rem auto;
          }
          
          #theme-loading-overlay .loading-text {
            color: ${theme.text};
            font-size: 1.2rem;
            font-weight: 600;
            font-family: 'Inter', sans-serif;
          }
          
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `;

        // Add overlay and styles to document
        if (document.head) {
          document.head.appendChild(style);
        }

        if (document.body) {
          document.body.appendChild(overlay);
        } else {
          // If body isn't ready, add it when ready
          document.addEventListener("DOMContentLoaded", () => {
            if (!document.head.contains(style)) {
              document.head.appendChild(style);
            }
            if (!document.body.contains(overlay)) {
              document.body.appendChild(overlay);
            }
          });
        }

        return overlay;
      }

      // Create and show loading overlay
      const loadingOverlay = createLoadingOverlay();

      // Wait for document.body to be available and apply styles more aggressively
      function applyBodyStyles() {
        if (document.body) {
          // Apply styles with !important to override defaults
          document.body.style.setProperty(
            "background",
            theme.background,
            "important"
          );
          document.body.style.setProperty("color", theme.text, "important");
          document.body.classList.remove("theme-dark", "theme-light");
          document.body.classList.add(
            theme.isDark ? "theme-dark" : "theme-light"
          );
        } else {
          // If body isn't ready, wait and try again with shorter interval
          setTimeout(applyBodyStyles, 1);
        }
      }

      // Function to remove loading overlay
      window._removeThemeLoading = function () {
        const overlay = document.getElementById("theme-loading-overlay");
        if (overlay) {
          overlay.style.opacity = "0";
          setTimeout(() => {
            if (overlay.parentNode) {
              overlay.parentNode.removeChild(overlay);
            }
          }, 500);
        }
      };

      // Try to apply immediately
      applyBodyStyles();

      // Also apply when DOM is ready
      if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", applyBodyStyles);
      }

      // Fallback: Remove loading overlay after a maximum time
      setTimeout(() => {
        if (window._removeThemeLoading) {
          window._removeThemeLoading();
        }
      }, 3000); // Remove after 3 seconds maximum
    }
  }
})();
