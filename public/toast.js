/**
 * Global Toast Notification System for Blessed Smile Dental Clinic
 * Replaces all alert() calls with styled toast notifications
 */

// Create toast container if it doesn't exist
function createToastContainer() {
  let container = document.getElementById("global-toast-container");
  if (!container) {
    container = document.createElement("div");
    container.id = "global-toast-container";
    container.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            z-index: 10000;
            display: flex;
            flex-direction: column;
            gap: 10px;
            pointer-events: none;
            max-width: 400px;
        `;
    document.body.appendChild(container);
  }
  return container;
}

// Global toast function
window.showToast = function (message, type = "info", duration = 4000) {
  const container = createToastContainer();

  const toast = document.createElement("div");
  toast.style.cssText = `
        background: white;
        border: 2px solid ${getToastBorderColor(type)};
        border-radius: 8px;
        box-shadow: 0 4px 16px ${getToastShadow(type)};
        max-width: 400px;
        word-wrap: break-word;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        font-size: 14px;
        font-weight: 500;
        line-height: 1.4;
        opacity: 0;
        transform: translateX(100%);
        transition: all 0.3s ease;
        pointer-events: auto;
        cursor: pointer;
        overflow: hidden;
        margin-bottom: 10px;
    `;

  // Create header
  const header = document.createElement("div");
  header.style.cssText = `
        background: ${getToastHeaderBackground(type)};
        color: ${getToastHeaderColor(type)};
        padding: 12px 16px;
        font-weight: 600;
        display: flex;
        justify-content: space-between;
        align-items: center;
        border-bottom: 1px solid ${getToastBorderColor(type)};
    `;

  const title = document.createElement("strong");
  title.textContent = getToastTitle(type);
  title.style.cssText = "margin: 0; flex: 1;";

  const closeBtn = document.createElement("button");
  closeBtn.innerHTML = "×";
  closeBtn.style.cssText = `
        background: none;
        border: none;
        color: inherit;
        font-size: 18px;
        cursor: pointer;
        padding: 0;
        width: 20px;
        height: 20px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 3px;
        transition: background-color 0.2s;
    `;

  closeBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    removeToast(toast);
  });

  header.appendChild(title);
  header.appendChild(closeBtn);

  // Create body
  const body = document.createElement("div");
  body.style.cssText = `
        padding: 12px 16px;
        color: ${getToastBodyColor(type)};
    `;
  body.textContent = message;

  toast.appendChild(header);
  toast.appendChild(body);
  container.appendChild(toast);

  // Animate in
  requestAnimationFrame(() => {
    toast.style.opacity = "1";
    toast.style.transform = "translateX(0)";
  });

  // Auto remove
  const timeoutId = setTimeout(() => removeToast(toast), duration);

  // Click to dismiss
  toast.addEventListener("click", () => {
    clearTimeout(timeoutId);
    removeToast(toast);
  });

  return toast;
};

// Helper functions for styling
function getToastBorderColor(type) {
  const colors = {
    success: "#28a745",
    error: "#f8a5a5",
    warning: "#ffc107",
    info: "#ffd700",
  };
  return colors[type] || colors.info;
}

function getToastShadow(type) {
  const shadows = {
    success: "rgba(40, 167, 69, 0.3)",
    error: "rgba(248, 165, 165, 0.3)",
    warning: "rgba(255, 193, 7, 0.3)",
    info: "rgba(255, 215, 0, 0.3)",
  };
  return shadows[type] || shadows.info;
}

function getToastHeaderBackground(type) {
  const backgrounds = {
    success: "linear-gradient(135deg, #28a745 0%, #fff 50%, #28a745 100%)",
    error: "linear-gradient(135deg, #f8a5a5 0%, #fff 50%, #f8a5a5 100%)",
    warning: "linear-gradient(135deg, #ffc107 0%, #fff 50%, #ffc107 100%)",
    info: "linear-gradient(135deg, #ffd700 0%, #fff 50%, #ffd700 100%)",
  };
  return backgrounds[type] || backgrounds.info;
}

function getToastHeaderColor(type) {
  const colors = {
    success: "#000",
    error: "#8b0000",
    warning: "#000",
    info: "#000",
  };
  return colors[type] || colors.info;
}

function getToastBodyColor(type) {
  const colors = {
    success: "#000",
    error: "#d73027",
    warning: "#000",
    info: "#000",
  };
  return colors[type] || colors.info;
}

function getToastTitle(type) {
  const titles = {
    success: "Success",
    error: "Error",
    warning: "Warning",
    info: "Info",
  };
  return titles[type] || titles.info;
}

function removeToast(toast) {
  toast.style.opacity = "0";
  toast.style.transform = "translateX(100%)";
  setTimeout(() => {
    if (toast.parentNode) {
      toast.parentNode.removeChild(toast);
    }
  }, 300);
}

// Additional helper functions for different types
window.showSuccess = function (message, duration = 4000) {
  return showToast(message, "success", duration);
};

window.showError = function (message, duration = 4000) {
  return showToast(message, "error", duration);
};

window.showWarning = function (message, duration = 4000) {
  return showToast(message, "warning", duration);
};

window.showInfo = function (message, duration = 4000) {
  return showToast(message, "info", duration);
};

// Enhanced confirm with toast styling
window.showConfirm = function (message, onConfirm, onCancel) {
  const overlay = document.createElement("div");
  overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.5);
        z-index: 10001;
        display: flex;
        align-items: center;
        justify-content: center;
        backdrop-filter: blur(4px);
    `;

  const modal = document.createElement("div");
  modal.style.cssText = `
        background: white;
        padding: 24px;
        border-radius: 12px;
        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
        max-width: 400px;
        width: 90%;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        text-align: center;
        border: 2px solid #ffd700;
    `;

  modal.innerHTML = `
        <div style="margin-bottom: 20px;">
            <div style="font-size: 48px; color: #ffc107; margin-bottom: 16px;">⚠️</div>
            <h3 style="margin: 0 0 8px 0; font-size: 18px; font-weight: 600; color: #1f2937;">Confirm Action</h3>
            <p style="margin: 0; color: #6b7280; line-height: 1.5;">${message}</p>
        </div>
        <div style="display: flex; gap: 12px; justify-content: center;">
            <button id="confirm-btn" style="
                background: linear-gradient(135deg, #ffd700 0%, #fff 50%, #ffd700 100%);
                color: #000;
                border: 2px solid #ffd700;
                padding: 10px 20px;
                border-radius: 6px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.3s ease;
            ">Confirm</button>
            <button id="cancel-btn" style="
                background: #6b7280;
                color: white;
                border: none;
                padding: 10px 20px;
                border-radius: 6px;
                font-weight: 500;
                cursor: pointer;
                transition: background 0.2s;
            ">Cancel</button>
        </div>
    `;

  overlay.appendChild(modal);
  document.body.appendChild(overlay);

  const confirmBtn = modal.querySelector("#confirm-btn");
  const cancelBtn = modal.querySelector("#cancel-btn");

  confirmBtn.addEventListener("mouseover", () => {
    confirmBtn.style.background = "#ffd700";
    confirmBtn.style.transform = "translateY(-1px)";
    confirmBtn.style.boxShadow = "0 4px 8px rgba(255, 215, 0, 0.4)";
  });
  confirmBtn.addEventListener("mouseout", () => {
    confirmBtn.style.background =
      "linear-gradient(135deg, #ffd700 0%, #fff 50%, #ffd700 100%)";
    confirmBtn.style.transform = "translateY(0)";
    confirmBtn.style.boxShadow = "none";
  });

  cancelBtn.addEventListener(
    "mouseover",
    () => (cancelBtn.style.background = "#4b5563")
  );
  cancelBtn.addEventListener(
    "mouseout",
    () => (cancelBtn.style.background = "#6b7280")
  );

  const cleanup = () => document.body.removeChild(overlay);

  confirmBtn.addEventListener("click", () => {
    cleanup();
    if (onConfirm) onConfirm();
  });

  cancelBtn.addEventListener("click", () => {
    cleanup();
    if (onCancel) onCancel();
  });

  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) {
      cleanup();
      if (onCancel) onCancel();
    }
  });
};

// Add responsive styles
const style = document.createElement("style");
style.textContent = `
    @media (max-width: 768px) {
        #global-toast-container {
            bottom: 10px !important;
            right: 10px !important;
            left: 10px !important;
            max-width: none !important;
        }
        
        #global-toast-container > div {
            max-width: none !important;
            width: 100% !important;
        }
    }
`;
document.head.appendChild(style);

// console.log("🍞 Global Toast System loaded successfully!");
