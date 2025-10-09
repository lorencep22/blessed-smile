/**
 * Profile.js - Shared Teeth Chart Functionality
 *
 * This file contains the core teeth chart functionality that can be shared
 * across different sections of the patient profile:
 * - Teeth chart data collection (collectTeethChartData)
 * - Teeth chart clearing functionality (clearTeethChart)
 * - Teeth chart rendering and interaction
 * - Teeth summary updates
 * - SVG tooth creation and management
 *
 * Note: Procedure-specific functionality has been moved to procedure.js
 */

// Function to collect teeth chart data
function collectTeethChartData() {
  const teethData = [];

  // Get all tooth containers
  const allToothNumbers = [
    ...topPrimary,
    ...topPermanent,
    ...bottomPermanent,
    ...bottomPrimary,
  ];

  allToothNumbers.forEach((toothNum) => {
    const toothContainer = document.getElementById(`tooth-${toothNum}`);
    if (!toothContainer) return;

    // Get treatment and existing condition text
    const treatmentBox = toothContainer.querySelector("#treatmentBox input");
    const existingConditionBox = toothContainer.querySelector(
      "#existingConditionBox input"
    );

    const treatmentText = treatmentBox ? treatmentBox.value.trim() : "";
    const existingConditionText = existingConditionBox
      ? existingConditionBox.value.trim()
      : "";

    // Get active SVG sections
    const activeSections = [];
    const svgSections = toothContainer.querySelectorAll(".section.active");
    svgSections.forEach((section) => {
      activeSections.push(section.id); // center, right, bottom, left, top
    });

    // Only include teeth that have either text input or active sections
    if (treatmentText || existingConditionText || activeSections.length > 0) {
      teethData.push({
        toothNumber: toothNum,
        treatmentDone: treatmentText,
        existingCondition: existingConditionText,
        activeSections: activeSections,
      });
    }
  });

  return teethData;
}

// Function to clear the teeth chart
function clearTeethChart() {
  const allToothNumbers = [
    ...topPrimary,
    ...topPermanent,
    ...bottomPermanent,
    ...bottomPrimary,
  ];

  allToothNumbers.forEach((toothNum) => {
    const toothContainer = document.getElementById(`tooth-${toothNum}`);
    if (!toothContainer) return;

    // Clear text inputs
    const treatmentBox = toothContainer.querySelector("#treatmentBox input");
    const existingConditionBox = toothContainer.querySelector(
      "#existingConditionBox input"
    );

    if (treatmentBox) treatmentBox.value = "";
    if (existingConditionBox) existingConditionBox.value = "";

    // Remove active class from SVG sections
    const activeSections = toothContainer.querySelectorAll(".section.active");
    activeSections.forEach((section) => {
      section.classList.remove("active");
    });

    // Remove modified indicators
    const indicator = toothContainer.querySelector(".tooth-modified-indicator");
    if (indicator) indicator.remove();
  });

  // Update summary
  updateTeethSummary();
}
// SVG template for a single tooth
function getToothSVG() {
  return `
        <svg viewBox="0 0 50 50" width="32" height="32" style="margin:1px;">
            <g transform="rotate(45,25,25)">
                <circle id="center" class="section" cx="25" cy="25" r="10"></circle>
                <path id="right" class="section" d="M25,5 A20,20 0 0,1 45,25 L35,25 A10,10 0 0,0 25,15 Z"></path>
                <path id="bottom" class="section" d="M45,25 A20,20 0 0,1 25,45 L25,35 A10,10 0 0,0 35,25 Z"></path>
                <path id="left" class="section" d="M25,45 A20,20 0 0,1 5,25 L15,25 A10,10 0 0,0 25,35 Z"></path>
                <path id="top" class="section" d="M5,25 A20,20 0 0,1 25,5 L25,15 A10,10 0 0,0 15,25 Z"></path>
            </g>
        </svg>`;
}

// Tooth numbers for each row
const topPrimary = [55, 54, 53, 52, 51, 61, 62, 63, 64, 65];
const topPermanent = [
  18, 17, 16, 15, 14, 13, 12, 11, 21, 22, 23, 24, 25, 26, 27, 28,
];
const bottomPermanent = [
  48, 47, 46, 45, 44, 43, 42, 41, 31, 32, 33, 34, 35, 36, 37, 38,
];
const bottomPrimary = [85, 84, 83, 82, 81, 71, 72, 73, 74, 75];

// Create row with 2 status boxes and tooth
function createToothRow(numbers) {
  const row = document.createElement("div");
  row.style.display = "flex";
  row.style.justifyContent = "center";
  row.style.alignItems = "center";
  row.style.marginBottom = "8px";
  row.style.gap = "2px";
  row.style.flexWrap = "nowrap";

  numbers.forEach((num) => {
    const col = document.createElement("div");
    col.style.display = "flex";
    col.id = `tooth-${num}`;
    col.style.flexDirection = "column";
    col.style.alignItems = "center";
    col.style.margin = "0 1px";
    col.style.flexShrink = "0";
    col.style.minWidth = "34px";

    // Box 1: Treatment Done
    const box1 = document.createElement("div");
    box1.style.width = "32px";
    box1.style.height = "18px";
    box1.id = "treatmentBox";
    box1.style.border = "1px solid black";
    box1.style.marginBottom = "1px";
    box1.style.display = "flex";
    box1.style.alignItems = "center";
    box1.style.justifyContent = "center";
    const input1 = document.createElement("input");
    input1.type = "text";
    input1.style.width = "90%";
    input1.style.height = "70%";
    input1.style.fontSize = "9px";
    input1.style.border = "none";
    input1.maxLength = 4;
    input1.style.outline = "none";
    input1.style.background = "transparent";
    input1.style.textAlign = "center";
    box1.appendChild(input1);

    // Box 2: Existing Condition
    const box2 = document.createElement("div");
    box2.style.width = "32px";
    box2.style.height = "18px";
    box2.id = "existingConditionBox";
    box2.style.border = "1px solid black";
    box2.style.marginBottom = "2px";
    box2.style.display = "flex";
    box2.style.alignItems = "center";
    box2.style.justifyContent = "center";
    const input2 = document.createElement("input");
    input2.type = "text";
    input2.style.width = "90%";
    input2.style.height = "70%";
    input2.style.fontSize = "9px";
    input2.maxLength = 4;
    input2.style.border = "none";
    input2.style.outline = "none";
    input2.style.background = "transparent";
    input2.style.textAlign = "center";
    box2.appendChild(input2);

    // Tooth diagram
    const toothWrapper = document.createElement("div");
    toothWrapper.style.display = "flex";
    toothWrapper.style.flexDirection = "column";
    toothWrapper.style.alignItems = "center";
    toothWrapper.innerHTML =
      getToothSVG() +
      `<div class="tooth-number" style="font-size:8px; margin-top:1px; font-weight: bold; color: #000; line-height: 1; text-align: center; min-height: 10px;">${num}</div>`;

    col.appendChild(box1);
    col.appendChild(box2);
    col.appendChild(toothWrapper);
    row.appendChild(col);
  });
  return row;
}

// Insert rows
document
  .getElementById("row-topPrimary")
  .appendChild(createToothRow(topPrimary));
document
  .getElementById("row-topPermanent")
  .appendChild(createToothRow(topPermanent));
document
  .getElementById("row-bottomPermanent")
  .appendChild(createToothRow(bottomPermanent));
document
  .getElementById("row-bottomPrimary")
  .appendChild(createToothRow(bottomPrimary));

// Toggle red on click
document.addEventListener("click", function (e) {
  if (e.target.classList.contains("section")) {
    e.target.classList.toggle("active");

    // Add visual feedback to show tooth has been modified
    const toothContainer = e.target.closest('[id^="tooth-"]');
    if (toothContainer) {
      updateToothModifiedStatus(toothContainer);
    }
  }
});

// Function to update tooth modified status
function updateToothModifiedStatus(toothContainer) {
  const hasActiveSection = toothContainer.querySelector(".section.active");
  const treatmentText = toothContainer
    .querySelector("#treatmentBox input")
    ?.value.trim();
  const conditionText = toothContainer
    .querySelector("#existingConditionBox input")
    ?.value.trim();

  const isModified = hasActiveSection || treatmentText || conditionText;

  // Add/remove a visual indicator
  let indicator = toothContainer.querySelector(".tooth-modified-indicator");
  if (isModified && !indicator) {
    indicator = document.createElement("div");
    indicator.className = "tooth-modified-indicator";
    indicator.style.cssText = `
      position: absolute;
      top: -2px;
      right: -2px;
      width: 8px;
      height: 8px;
      background: #10b981;
      border-radius: 50%;
      border: 2px solid white;
      z-index: 10;
    `;
    toothContainer.style.position = "relative";
    toothContainer.appendChild(indicator);
  } else if (!isModified && indicator) {
    indicator.remove();
  }

  // Update the summary
  updateTeethSummary();
}

// Function to update teeth summary
function updateTeethSummary() {
  const teethData = collectTeethChartData();
  const summaryDiv = document.getElementById("teethSummary");
  const summaryContent = document.getElementById("teethSummaryContent");

  if (!summaryDiv || !summaryContent) return;

  if (teethData.length === 0) {
    summaryDiv.style.display = "none";
    return;
  }

  summaryDiv.style.display = "block";

  const summaryItems = teethData.map((tooth) => {
    let details = [`Tooth ${tooth.toothNumber}`];

    if (tooth.treatmentDone) {
      details.push(`Treatment: ${tooth.treatmentDone}`);
    }

    if (tooth.existingCondition) {
      details.push(`Condition: ${tooth.existingCondition}`);
    }

    if (tooth.activeSections.length > 0) {
      details.push(`Sections: ${tooth.activeSections.join(", ")}`);
    }

    return `<div class="teeth-summary-item">${details.join(" | ")}</div>`;
  });

  summaryContent.innerHTML = summaryItems.join("");
}

// Add input event listeners to treatment and condition boxes
document.addEventListener("DOMContentLoaded", function () {
  // Wait for teeth to be rendered
  setTimeout(() => {
    document
      .querySelectorAll("#treatmentBox input, #existingConditionBox input")
      .forEach((input) => {
        input.addEventListener("input", function () {
          const toothContainer = this.closest('[id^="tooth-"]');
          if (toothContainer) {
            updateToothModifiedStatus(toothContainer);
          }
        });
      });
  }, 500);
});

// Procedure view/edit functionality has been moved to procedure.js
