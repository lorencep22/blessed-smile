class ThemeManager {
  constructor() {
    this.themes = {
      gold: {
        name: "Gold & White",
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
        name: "Blue Ocean",
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
        name: "Nature Green",
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
        name: "Royal Purple",
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
        name: "Dark Mode",
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
        name: "Midnight Blue",
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

    this.currentUserId = null;
    this.currentTheme = "gold";
    this.init();
  }

  async init() {
    // Try to load theme from localStorage first for immediate application
    const savedTheme = localStorage.getItem("easysmile-theme");
    if (savedTheme) {
      this.currentTheme = savedTheme;
      // Only apply if not already applied by immediate script
      if (window._themeImmediatelyApplied !== savedTheme) {
        this.applyTheme(savedTheme);
      } else {
        // Just update the theme selector if theme was already applied
        this.updateThemeSelector();
      }
    }

    // Wait for Firebase to be initialized with retries
    this.initFirebase();
  }

  async initFirebase() {
    // Check if Firebase is available with retries
    let retries = 0;
    const maxRetries = 50; // Wait up to 5 seconds

    const checkFirebase = () => {
      if (
        typeof firebase !== "undefined" &&
        firebase.apps &&
        firebase.apps.length > 0 &&
        window.db &&
        window.themeCollection
      ) {
        // Firebase is initialized by app.js
        try {
          firebase.auth().onAuthStateChanged(async (user) => {
            if (user) {
              this.currentUserId = user.uid;
              await this.loadUserTheme();
            } else {
              // If no user, still apply theme from localStorage
              this.applyTheme(this.currentTheme);
            }
          });
        } catch (error) {
          console.log("Firebase auth error, using local theme:", error);
          this.applyTheme(this.currentTheme);
        }
      } else if (retries < maxRetries) {
        // Firebase not ready yet, try again
        retries++;
        setTimeout(checkFirebase, 100);
      } else {
        // Firebase not available after retries
        console.log(
          "Firebase not available after retries, using saved or default theme"
        );
        this.applyTheme(this.currentTheme);
      }
    };

    checkFirebase();
  }

  async loadUserTheme() {
    try {
      if (window.db) {
        const themeDoc = await window.db
          .collection("theme")
          .doc(this.currentUserId)
          .get();
        if (themeDoc.exists) {
          const data = themeDoc.data();
          const newTheme = data.selectedTheme || "gold";

          // Only apply if it's different from current theme or not already applied
          if (
            newTheme !== this.currentTheme ||
            window._themeImmediatelyApplied !== newTheme
          ) {
            this.currentTheme = newTheme;
            this.applyTheme(newTheme);
          } else {
            this.currentTheme = newTheme;
            this.updateThemeSelector();
          }
        } else {
          // Set default theme for new user
          await this.saveUserTheme("gold");
        }
      } else {
        // If no database, just apply current theme
        this.applyTheme(this.currentTheme);
      }
    } catch (error) {
      console.error("Error loading user theme:", error);
      this.applyTheme(this.currentTheme); // Use current theme as fallback
    }
  }

  async saveUserTheme(themeId) {
    // Always save to localStorage for immediate persistence
    localStorage.setItem("easysmile-theme", themeId);

    if (!this.currentUserId) return;

    try {
      if (window.db) {
        await window.db.collection("theme").doc(this.currentUserId).set(
          {
            selectedTheme: themeId,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
          },
          { merge: true }
        );
      }
    } catch (error) {
      console.error("Error saving theme:", error);
    }
  }

  applyTheme(themeId) {
    const theme = this.themes[themeId];
    if (!theme) return;

    // Check if this theme is already applied by immediate script
    if (window._themeImmediatelyApplied === themeId) {
      this.currentTheme = themeId;
      // Just ensure body classes are correct and update theme selector
      this.applyBodyClasses(theme);
      this.updateThemeSelector();
      // Store in localStorage if not already there
      localStorage.setItem("easysmile-theme", themeId);

      // Remove loading overlay since theme is already applied
      if (window._removeThemeLoading) {
        setTimeout(() => {
          window._removeThemeLoading();
          // Remove theme-loading class to show content
          if (document.body) {
            document.body.classList.remove("theme-loading");
          }
        }, 300);
      }
      return;
    }

    this.currentTheme = themeId;

    // Remove existing theme classes (wait for body if needed)
    this.applyBodyClasses(theme);

    // Apply CSS custom properties
    const root = document.documentElement;
    root.style.setProperty("--theme-primary", theme.primary, "important");
    root.style.setProperty("--theme-secondary", theme.secondary, "important");
    root.style.setProperty("--theme-background", theme.background, "important");
    root.style.setProperty("--theme-text", theme.text, "important");
    root.style.setProperty("--theme-card-bg", theme.cardBg, "important");
    root.style.setProperty("--theme-sidebar-bg", theme.sidebarBg, "important");
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
    root.style.setProperty("--theme-focus", `${theme.primary}40`, "important");
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

    // Apply styles dynamically
    this.updateDynamicStyles(theme);

    // Update theme selector if it exists
    this.updateThemeSelector();

    // Store in localStorage
    localStorage.setItem("easysmile-theme", themeId);

    // Remove loading overlay and show content after theme is applied
    if (window._removeThemeLoading) {
      setTimeout(() => {
        window._removeThemeLoading();
        // Remove theme-loading class to show content
        if (document.body) {
          document.body.classList.remove("theme-loading");
        }
      }, 500); // Small delay to ensure everything is loaded
    }
  }

  applyBodyClasses(theme) {
    const applyClasses = () => {
      if (document.body) {
        document.body.classList.remove("theme-dark", "theme-light");
        document.body.classList.add(
          theme.isDark ? "theme-dark" : "theme-light"
        );
      } else {
        // If body isn't ready, wait and try again
        setTimeout(applyClasses, 10);
      }
    };
    applyClasses();
  }

  updateDynamicStyles(theme) {
    let styleId = "dynamic-theme-styles";
    let existingStyle = document.getElementById(styleId);
    if (existingStyle) {
      existingStyle.remove();
    }

    const style = document.createElement("style");
    style.id = styleId;
    style.textContent = `
            body {
                background: ${theme.background} !important;
                color: ${theme.text} !important;
            }
            
            .btn-primary {
                background: linear-gradient(135deg, ${theme.primary} 0%, ${
      theme.secondary
    } 50%, ${theme.primary} 100%) !important;
                border-color: ${theme.primary} !important;
                color: ${theme.isDark ? "#fff" : "#000"} !important;
            }
            
            .btn-primary:hover {
                background: ${theme.primary} !important;
                color: ${theme.isDark ? "#fff" : "#000"} !important;
            }
            
            .sidebar {
                background: ${theme.sidebarBg} !important;
                border-right: 2px solid ${theme.primary} !important;
            }
            
            .navbar-dark.bg-primary {
                background: ${theme.navbarBg} !important;
                border-bottom: 2px solid ${theme.primary} !important;
            }
            
            .sidebar .nav-link.active {
                background: linear-gradient(90deg, ${theme.primary} 0%, ${
      theme.secondary
    } 50%, ${theme.primary} 100%) !important;
                color: ${theme.isDark ? "#fff" : "#000"} !important;
                box-shadow: 0 4px 12px rgba(${
                  theme.isDark ? "255,255,255" : "0,0,0"
                }, 0.3) !important;
            }
            
            .card, .modal-content, .container {
                background: ${theme.cardBg} !important;
                color: ${theme.text} !important;
            }
            
            .table {
                background: ${theme.cardBg} !important;
                color: ${theme.text} !important;
            }
            
            .table thead th {
                background: linear-gradient(135deg, ${theme.primary} 0%, ${
      theme.secondary
    } 50%, ${theme.primary} 100%) !important;
                color: ${theme.isDark ? "#fff" : "#000"} !important;
            }
            
            .table tbody td {
                background: ${theme.cardBg} !important;
                color: ${theme.text} !important;
                border-color: ${theme.primary} !important;
            }
            
            .form-control, .form-select {
                background: ${theme.cardBg} !important;
                color: ${theme.text} !important;
                border-color: ${theme.primary} !important;
            }
            
            .btn-gold-gradient, .btn-modern {
                background: linear-gradient(135deg, ${theme.primary} 0%, ${
      theme.secondary
    } 50%, ${theme.primary} 100%) !important;
                color: ${theme.isDark ? "#fff" : "#000"} !important;
                border-color: ${theme.primary} !important;
            }
            
            .section-header {
                background: ${
                  theme.isDark
                    ? theme.secondary
                    : "linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)"
                } !important;
                color: ${theme.text} !important;
            }
            
            .section-icon {
                background: ${theme.primary} !important;
            }
            
            .profile-card, .main-container {
                background: ${theme.cardBg} !important;
                color: ${theme.text} !important;
            }
            
            .navbar-nav .nav-link {
                color: ${theme.isDark ? "#fff" : "#000"} !important;
            }
            
            .navbar-nav .nav-link:hover {
                background: rgba(${
                  theme.isDark ? "255,255,255" : "0,0,0"
                }, 0.1) !important;
            }
            
            #dashboard-signout {
                background: ${theme.cardBg} !important;
                color: ${theme.text} !important;
                border: 1px solid ${theme.primary} !important;
            }
            
            ${
              theme.isDark
                ? `
                .modal-header {
                    background: ${theme.secondary} !important;
                    color: ${theme.text} !important;
                }
                
                .btn-close {
                    filter: invert(1);
                }
                
                .pagination .page-link {
                    background: ${theme.secondary} !important;
                    border-color: ${theme.primary} !important;
                    color: ${theme.text} !important;
                }
                
                .dropdown-menu {
                    background-color: ${theme.secondary} !important;
                    border-color: ${theme.primary} !important;
                }
                
                .dropdown-item {
                    color: ${theme.text} !important;
                }
                
                .dropdown-item:hover {
                    background-color: ${theme.primary} !important;
                    color: ${theme.isDark ? "#fff" : "#000"} !important;
                }
            `
                : ""
            }
        `;

    document.head.appendChild(style);
  }

  updateThemeSelector() {
    const selector = document.getElementById("themeSelector");
    if (selector) {
      selector.value = this.currentTheme;
    }
  }

  async changeTheme(themeId) {
    if (this.themes[themeId]) {
      this.applyTheme(themeId);
      await this.saveUserTheme(themeId);

      // Apply theme to all iframes in the parent window
      this.applyThemeToIframes(themeId);

      if (window.showSuccess) {
        showSuccess(`Theme changed to ${this.themes[themeId].name}`);
      }
    }
  }

  applyThemeToIframes(themeId) {
    // If we're in the main dashboard, apply to iframes
    if (window.parent === window) {
      const iframes = document.querySelectorAll("iframe");
      iframes.forEach((iframe) => {
        try {
          if (iframe.contentWindow && iframe.contentWindow.themeManager) {
            iframe.contentWindow.themeManager.applyTheme(themeId);
          }
        } catch (error) {
          // Cross-origin restrictions might prevent this
          console.log("Could not apply theme to iframe:", error);
        }
      });
    }

    // If we're in an iframe, notify parent
    if (window.parent !== window && window.parent.themeManager) {
      try {
        window.parent.themeManager.applyTheme(themeId);
      } catch (error) {
        console.log("Could not apply theme to parent:", error);
      }
    }
  }

  getThemes() {
    return this.themes;
  }

  getCurrentTheme() {
    return this.currentTheme;
  }
}

// Initialize theme manager safely
if (!window.themeManager) {
  window.themeManager = new ThemeManager();
}

// Also apply theme immediately if we have one saved
(function () {
  const savedTheme = localStorage.getItem("easysmile-theme");
  if (savedTheme && window.themeManager && window.themeManager.applyTheme) {
    try {
      window.themeManager.applyTheme(savedTheme);
    } catch (error) {
      console.log("Error applying initial theme:", error);
    }
  }
})();
