const addProcedureForm = document.getElementById("addProcedureForm");

if (addProcedureForm) {
  addProcedureForm.onsubmit = function (e) {
    e.preventDefault();

    // Get patient ID from URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const patientId = urlParams.get("id");

    // Verify doctor name
    const doctorInput = document.getElementById("doctor");
    const doctorName = doctorInput.value.trim(); // keep original case
    const doctorDatalist = document.getElementById("doctorNamesDatalist");
    const doctorMatches = doctorDatalist
      ? Array.from(doctorDatalist.options).filter(
          (opt) => opt.value.trim().toLowerCase() === doctorName.toLowerCase()
        )
      : [];
    if (!doctorName || doctorMatches.length === 0) {
      alert("Please select a valid doctor name from the list.");
      doctorInput.focus();
      return;
    }

    if (confirm("Are you sure you want to add this procedure?")) {
      // Collect treated teeth data from the new teeth chart system
      const treatedTeeth = collectTeethChartData();

      const remarks = document.getElementById("remarks").value.trim();
      const amount = document.getElementById("procedureAmount");
      const balance = document.getElementById("procedureBalance");

      const procedureData = {
        patientId: patientId,
        procedure: document.getElementById("procedure").value,
        doctor: doctorInput.value, // original case
        date: document.getElementById("date").value,
        remarks: remarks,
        amount: amount.value,
        balance: balance.value,
        treatedTeeth: treatedTeeth,
      };

      if (window.proceduresCollection) {
        window.proceduresCollection
          .add(procedureData)
          .then(() => {
            alert("Procedure added successfully.");
            location.reload();
            addProcedureForm.reset();
            // Clear the teeth chart
            clearTeethChart();
          })
          .catch((error) => {
            alert("Error adding procedure: " + error);
          });
      }
    }
  };
}

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
      `<div style="font-size:8px; margin-top:1px; font-weight: bold;">${num}</div>`;

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

// Procedure view/edit system
let currentProcedureData = null;
let isViewMode = false;

// Add event listeners for view buttons in procedure history
document.addEventListener("click", function (e) {
  if (
    e.target.closest(".view-procedure-btn") &&
    e.target.closest(".view-procedure-btn").hasAttribute("data-id")
  ) {
    const procedureId = e.target
      .closest(".view-procedure-btn")
      .getAttribute("data-id");
    viewProcedure(procedureId);
  }
});

// Event listeners for edit, update, and close buttons
document.addEventListener("DOMContentLoaded", function () {
  const editBtn = document.getElementById("editProcedureBtn");
  const updateBtn = document.getElementById("updateProcedureBtn");
  const closeBtn = document.getElementById("closeProcedureBtn");

  if (editBtn) {
    editBtn.addEventListener("click", enableEditMode);
  }

  if (updateBtn) {
    updateBtn.addEventListener("click", updateProcedure);
  }

  if (closeBtn) {
    closeBtn.addEventListener("click", closeProcedureView);
  }
});

// View procedure function
async function viewProcedure(procedureId) {
  try {
    // Get procedure data from Firebase
    const procedureDoc = await db
      .collection("procedures")
      .doc(procedureId)
      .get();
    if (!procedureDoc.exists) {
      alert("Procedure not found");
      return;
    }

    currentProcedureData = procedureDoc.data();
    currentProcedureData.id = procedureId;

    // Show procedure form and populate data
    showProcedureForm();
    populateProcedureForm(currentProcedureData);
    setViewMode(true);
  } catch (error) {
    console.error("Error fetching procedure:", error);
    alert("Error loading procedure data");
  }
}

// Show procedure form
function showProcedureForm() {
  const procedureBody = document.getElementById("procedureBody");
  if (procedureBody) {
    procedureBody.style.display = "block";
  }
}

// Populate form with procedure data
function populateProcedureForm(data) {
  // Populate basic form fields
  const fields = {
    procedure: data.procedure || "",
    doctor: data.doctor || "",
    date: data.date || "",
    condition: data.condition || "",
    treatment: data.treatment || "",
    assistantName: data.assistantName || "",
    anesthesia: data.anesthesia || "",
    remarks: data.remarks || "",
    medicine: data.medicine || "",
    medicineDetails: data.medicineDetails || "",
  };

  Object.keys(fields).forEach((fieldId) => {
    const field = document.getElementById(fieldId);
    if (field) {
      if (field.type === "radio") {
        const radioGroup = document.querySelectorAll(
          `input[name="${fieldId}"]`
        );
        radioGroup.forEach((radio) => {
          if (radio.value === fields[fieldId]) {
            radio.checked = true;
          }
        });
      } else {
        field.value = fields[fieldId];
      }
    }
  });

  // Handle teeth chart data - support both data formats
  const teethData = data.treatedTeeth || data.teethChart || [];
  if (teethData && teethData.length > 0) {
    // Reset chart first
    clearTeethChart();

    // Populate teeth selections using the profile.js teeth system
    teethData.forEach((tooth) => {
      const toothContainer = document.getElementById(
        `tooth-${tooth.toothNumber}`
      );
      if (toothContainer) {
        // Handle activeSections
        if (tooth.activeSections && tooth.activeSections.length > 0) {
          tooth.activeSections.forEach((sectionId) => {
            const sectionElement = toothContainer.querySelector(
              `#${sectionId}`
            );
            if (sectionElement) {
              sectionElement.classList.add("active");
            }
          });
        }

        // Set treatment and condition text
        const treatmentInput = toothContainer.querySelector(
          "#treatmentBox input"
        );
        const conditionInput = toothContainer.querySelector(
          "#existingConditionBox input"
        );

        if (treatmentInput && tooth.treatmentDone) {
          treatmentInput.value = tooth.treatmentDone;
        }

        if (conditionInput && tooth.existingCondition) {
          conditionInput.value = tooth.existingCondition;
        }

        // Update tooth modified status
        updateToothModifiedStatus(toothContainer);
      }
    });

    // Update teeth summary
    updateTeethSummary();
  }
}

// Set view mode
function setViewMode(viewMode) {
  isViewMode = viewMode;
  const form = document.getElementById("addProcedureForm");
  const addBtn = document.getElementById("addProcedureBtn");
  const editBtn = document.getElementById("editProcedureBtn");
  const updateBtn = document.getElementById("updateProcedureBtn");
  const closeBtn = document.getElementById("closeProcedureBtn");
  const submitBtn = document.getElementById("addProcedureSubmitBtn");

  if (viewMode) {
    // View mode - disable all form fields
    disableFormFields(form);
    addBtn.style.display = "none";
    editBtn.style.display = "inline-block";
    closeBtn.style.display = "inline-block";
    updateBtn.style.display = "none";
    submitBtn.style.display = "none";

    // Update section title
    const sectionTitle = document.querySelector(".section-title");
    if (sectionTitle && sectionTitle.textContent === "New Procedures") {
      sectionTitle.textContent = "View Procedure";
    }
  } else {
    // Normal mode - enable all form fields
    enableFormFields(form);
    addBtn.style.display = "inline-block";
    editBtn.style.display = "none";
    closeBtn.style.display = "none";
    updateBtn.style.display = "none";
    submitBtn.style.display = "inline-block";

    // Reset section title
    const sectionTitle = document.querySelector(".section-title");
    if (sectionTitle) {
      sectionTitle.textContent = "New Procedures";
    }
  }
}

// Enable edit mode
function enableEditMode() {
  const form = document.getElementById("addProcedureForm");
  const editBtn = document.getElementById("editProcedureBtn");
  const updateBtn = document.getElementById("updateProcedureBtn");
  const submitBtn = document.getElementById("addProcedureSubmitBtn");

  enableFormFields(form);
  editBtn.style.display = "none";
  updateBtn.style.display = "inline-block";
  submitBtn.style.display = "none";

  // Update section title
  const sectionTitle = document.querySelector(".section-title");
  if (sectionTitle) {
    sectionTitle.textContent = "Edit Procedure";
  }
}

// Update procedure
async function updateProcedure() {
  try {
    const form = document.getElementById("addProcedureForm");
    const formData = new FormData(form);

    // Collect teeth chart data using the profile.js function
    const teethData = collectTeethChartData();

    // Prepare update data
    const updateData = {
      procedure: formData.get("procedure") || "",
      doctor: formData.get("doctor") || "",
      date: formData.get("date") || "",
      condition: formData.get("condition") || "",
      treatment: formData.get("treatment") || "",
      assistantName: formData.get("assistantName") || "",
      anesthesia: formData.get("anesthesia") || "",
      remarks: formData.get("remarks") || "",
      medicine: formData.get("medicine") || "",
      medicineDetails: formData.get("medicineDetails") || "",
      treatedTeeth: teethData,
      updatedAt: new Date().toISOString(),
    };

    // Update in Firebase
    await db
      .collection("procedures")
      .doc(currentProcedureData.id)
      .update(updateData);

    alert("Procedure updated successfully!");

    // Return to view mode
    setViewMode(true);

    // Refresh procedure history
    if (typeof renderProcedureHistory === "function") {
      renderProcedureHistory();
    }
  } catch (error) {
    console.error("Error updating procedure:", error);
    alert("Error updating procedure");
  }
}

// Close procedure view
function closeProcedureView() {
  const procedureBody = document.getElementById("procedureBody");
  const form = document.getElementById("addProcedureForm");

  // Hide procedure form
  if (procedureBody) {
    procedureBody.style.display = "none";
  }

  // Reset form
  if (form) {
    form.reset();
  }

  // Reset teeth chart using the profile.js function
  clearTeethChart();

  // Reset mode
  setViewMode(false);
  currentProcedureData = null;
  isViewMode = false;
}

// Disable form fields
function disableFormFields(form) {
  if (!form) return;

  const inputs = form.querySelectorAll("input, select, textarea");
  inputs.forEach((input) => {
    input.disabled = true;
  });

  // Disable teeth chart interactions
  const teethChart = document.getElementById("teethChartContainer");
  if (teethChart) {
    teethChart.style.pointerEvents = "none";
    teethChart.style.opacity = "0.7";
  }
}

// Enable form fields
function enableFormFields(form) {
  if (!form) return;

  const inputs = form.querySelectorAll("input, select, textarea");
  inputs.forEach((input) => {
    input.disabled = false;
  });

  // Enable teeth chart interactions
  const teethChart = document.getElementById("teethChartContainer");
  if (teethChart) {
    teethChart.style.pointerEvents = "auto";
    teethChart.style.opacity = "1";
  }
}
