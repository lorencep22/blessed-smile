/**
 * New Procedures Section JavaScript Functions
 *
 * This file contains all functionality related to the New Procedures section including:
 * - Procedure form submission and validation
 * - Teeth chart creation and interaction
 * - Procedure viewing, editing, and updating
 * - Form field management (enable/disable)
 * - Teeth chart data collection and summary
 * - Procedure button event handlers
 *
 * Moved from profile.html and profile.js for better code organization.
 */

// Procedure form submission handler
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
      if (window.showWarning) {
        showWarning("Please select a valid doctor name from the list.");
      } else {
        alert("Please select a valid doctor name from the list.");
      }
      doctorInput.focus();
      return;
    }

    if (
      confirm(
        "Are you sure you want to add this procedure and generate billing PDF?"
      )
    ) {
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

      // Use the new save & print function
      saveProcedureAndPrint(procedureData)
        .then((result) => {
          if (result.success) {
            if (window.showSuccess) {
              showSuccess(result.message);
            } else {
              alert(result.message);
            }
            // location.reload(); // Prevent page reload after save & print
          } else {
            if (window.showError) {
              showError(result.message);
            } else {
              alert(result.message);
            }
          }
        })
        .catch((error) => {
          console.error("Error in save & print:", error);
          if (window.showError) {
            showError("An error occurred. Please try again.");
          } else {
            alert("An error occurred. Please try again.");
          }
        });
    }
  };
}

// Note: Teeth chart core functions (collectTeethChartData, clearTeethChart, etc.)
// are imported from profile.js to avoid duplicate declarations

// Function to wait for Firestore collections to be initialized
function waitForCollections(maxAttempts = 30) {
  return new Promise((resolve, reject) => {
    let attempts = 0;

    const checkCollections = () => {
      attempts++;

      if (window.proceduresCollection && window.patientDetailsCollection) {
        resolve(true);
      } else if (attempts >= maxAttempts) {
        reject(
          new Error("Firestore collections not initialized after waiting")
        );
      } else {
        setTimeout(checkCollections, 100); // Wait 100ms between checks
      }
    };

    checkCollections();
  });
}

// Save & Print Function - Can be called for any procedure
async function saveProcedureAndPrint(procedureData, procedureId = null) {
  try {
    // Wait for collections to be initialized
    await waitForCollections();

    let finalProcedureId = procedureId;

    // If no procedureId provided, this is a new procedure - save it first
    if (!procedureId) {
      const docRef = await window.proceduresCollection.add(procedureData);
      finalProcedureId = docRef.id;
      console.log("New procedure saved with ID:", finalProcedureId);
    }

    // Generate and print the PDF
    await generateComprehensiveBillingPDF(procedureData, finalProcedureId);

    return {
      success: true,
      procedureId: finalProcedureId,
      message: "Procedure saved and PDF generated successfully!",
    };
  } catch (error) {
    console.error("Error in saveProcedureAndPrint:", error);
    return {
      success: false,
      error: error.message,
      message: "Failed to save procedure or generate PDF: " + error.message,
    };
  }
}

// Print existing procedure by ID
async function printExistingProcedure(procedureId) {
  try {
    // Wait for collections to be initialized
    await waitForCollections();

    // Fetch the procedure data
    const procedureDoc = await window.proceduresCollection
      .doc(procedureId)
      .get();
    if (!procedureDoc.exists) {
      throw new Error("Procedure not found");
    }

    const procedureData = procedureDoc.data();

    // Generate PDF for existing procedure
    await generateComprehensiveBillingPDF(procedureData, procedureId);

    return {
      success: true,
      message: "PDF generated successfully for existing procedure!",
    };
  } catch (error) {
    console.error("Error printing existing procedure:", error);
    return {
      success: false,
      error: error.message,
      message: "Failed to print procedure: " + error.message,
    };
  }
}

// Function to generate comprehensive billing PDF with teeth chart screenshot
async function generateComprehensiveBillingPDF(procedureData, procedureId) {
  const { jsPDF } = window.jspdf;

  // Get patient details
  const urlParams = new URLSearchParams(window.location.search);
  const patientId = urlParams.get("id");

  // Get patient information
  const patientDetails = await getPatientDetails(patientId);
  if (!patientDetails) {
    throw new Error("Patient details not found");
  }

  // Debug: Log patient details to see the structure
  console.log("Patient details:", patientDetails);

  // Ensure we have a valid name field
  const patientName =
    patientDetails.fullName ||
    patientDetails.name ||
    patientDetails.firstName ||
    "Unknown_Patient";
  if (!patientName) {
    console.warn("Patient name not found in details:", patientDetails);
  }

  // Create PDF with enhanced layout
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  try {
    // Load logo
    const logoImg = await loadLogo();

    // Add header with logo and clinic info
    if (logoImg) {
      doc.addImage(logoImg, "PNG", 15, 10, 30, 30);
    }

    // Clinic information
    doc.setFontSize(20);
    doc.setFont(undefined, "bold");
    doc.text("BLESSED SMILE DENTAL CLINIC", 50, 20);

    doc.setFontSize(12);
    doc.setFont(undefined, "normal");
    doc.text("Professional Dental Care Services", 50, 28);
    doc.text("Complete Oral Health Solutions", 50, 35);

    // Add date and invoice info
    doc.setFontSize(10);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 140, 15);
    // doc.text(`Procedure ID: ${procedureId}`, 140, 22);

    // Add separator line
    doc.setLineWidth(0.5);
    doc.line(15, 45, 195, 45);

    let yPosition = 55;

    // Patient Information Section
    doc.setFontSize(16);
    doc.setFont(undefined, "bold");
    doc.text("PATIENT INFORMATION", 15, yPosition);
    yPosition += 10;

    doc.setFontSize(11);
    doc.setFont(undefined, "normal");
    // Row 1: Full Name
    const fullName =
      (
        patientDetails.fullName ||
        [
          patientDetails.firstName,
          patientDetails.middleName,
          patientDetails.lastName,
        ]
          .filter(Boolean)
          .join(" ")
      ).trim() || "N/A";
    doc.text(`Full Name: ${fullName}`, 15, yPosition);
    yPosition += 7;
    // Row 2: Contact and Email
    doc.text(
      `Contact No.: ${patientDetails.contactNumber || "N/A"}`,
      15,
      yPosition
    );
    doc.text(`Email: ${patientDetails.email || "N/A"}`, 120, yPosition);
    yPosition += 7;
    // Row 3: Address and Birthday
    doc.text(`Address: ${patientDetails.address || "N/A"}`, 15, yPosition);
    doc.text(`Birthday: ${patientDetails.birthday || "N/A"}`, 120, yPosition);
    yPosition += 7;
    // Row 4: Date
    doc.text(`Date: ${procedureData.date || "N/A"}`, 15, yPosition);
    yPosition += 8;

    // Procedure Details Section
    doc.setFontSize(16);
    doc.setFont(undefined, "bold");
    doc.text("PROCEDURE DETAILS", 15, yPosition);
    yPosition += 10;

    doc.setFontSize(11);
    doc.setFont(undefined, "normal");
    doc.text(`Procedure: ${procedureData.procedure || "N/A"}`, 15, yPosition);
    yPosition += 7;
    doc.text(`Doctor: ${procedureData.doctor || "N/A"}`, 15, yPosition);
    yPosition += 7;
    doc.text(`Remarks: ${procedureData.remarks || "None"}`, 15, yPosition);
    yPosition += 15;

    // Teeth Chart Section
    doc.setFontSize(16);
    doc.setFont(undefined, "bold");
    doc.text("DENTAL CHART - TREATED TEETH", 15, yPosition);
    yPosition += 10;

    // Take screenshot of teeth chart if there are treated teeth
    if (procedureData.treatedTeeth && procedureData.treatedTeeth.length > 0) {
      try {
        const chartElement = document.querySelector(".chart-wrapper");
        if (chartElement) {
          // Temporarily highlight treated teeth for better visibility in PDF
          await highlightTreatedTeethForPDF(procedureData.treatedTeeth);

          // Ensure parent container is visible and not clipped
          const chartParent = chartElement.closest("#teethChartContainer");
          const parentOriginalOverflow = chartParent
            ? chartParent.style.overflow
            : undefined;
          const parentOriginalHeight = chartParent
            ? chartParent.style.height
            : undefined;
          const parentOriginalMaxHeight = chartParent
            ? chartParent.style.maxHeight
            : undefined;

          const originalOverflow = chartElement.style.overflow;
          const originalHeight = chartElement.style.height;
          const originalMaxHeight = chartElement.style.maxHeight;
          const originalBorder = chartElement.style.border;

          if (chartParent) {
            chartParent.style.overflow = "visible";
            chartParent.style.height = "auto";
            chartParent.style.maxHeight = "none";
          }
          chartElement.style.overflow = "visible";
          chartElement.style.height = "auto";
          chartElement.style.maxHeight = "none";
          // chartElement.style.border = "2px solid red"; // Debug border removed

          // Scroll chart into view (centered in viewport)
          chartElement.scrollIntoView({ behavior: "instant", block: "center" });

          // Wait a bit longer for layout to settle and dynamic content to render
          await new Promise((resolve) => setTimeout(resolve, 600));

          try {
            const dataUrl = await domtoimage.toPng(chartElement);

            // Restore original styles
            if (chartParent) {
              chartParent.style.overflow = parentOriginalOverflow;
              chartParent.style.height = parentOriginalHeight;
              chartParent.style.maxHeight = parentOriginalMaxHeight;
            }
            chartElement.style.overflow = originalOverflow;
            chartElement.style.height = originalHeight;
            chartElement.style.maxHeight = originalMaxHeight;
            chartElement.style.border = originalBorder;

            // Reset teeth highlighting
            await resetTeethHighlighting();

            // Add image to PDF
            const img = new window.Image();
            img.src = dataUrl;
            // Wait for image to load to get dimensions
            await new Promise((resolve) => {
              img.onload = resolve;
              img.onerror = resolve;
            });
            const imgWidth = 170; // Fit within page margins
            const imgHeight = (img.height * imgWidth) / img.width;

            // Check if we need a new page
            if (yPosition + imgHeight > 270) {
              doc.addPage();
              yPosition = 20;
            }

            doc.addImage(dataUrl, "PNG", 15, yPosition, imgWidth, imgHeight);
            yPosition += imgHeight + 10;
          } catch (error) {
            // Restore original styles
            if (chartParent) {
              chartParent.style.overflow = parentOriginalOverflow;
              chartParent.style.height = parentOriginalHeight;
              chartParent.style.maxHeight = parentOriginalMaxHeight;
            }
            chartElement.style.overflow = originalOverflow;
            chartElement.style.height = originalHeight;
            chartElement.style.maxHeight = originalMaxHeight;
            chartElement.style.border = originalBorder;

            // Reset teeth highlighting
            await resetTeethHighlighting();

            console.error("dom-to-image error:", error);
            doc.setFontSize(10);
            doc.text("Error capturing teeth chart image", 15, yPosition);
            yPosition += 10;
          }
        }
      } catch (error) {
        console.error("Error capturing teeth chart:", error);
        doc.setFontSize(10);
        doc.text("Error capturing teeth chart image", 15, yPosition);
        yPosition += 10;
      }

      // Add treated teeth details
      doc.setFontSize(12);
      doc.setFont(undefined, "bold");
      doc.text("Treated Teeth Summary:", 15, yPosition);
      yPosition += 8;

      doc.setFontSize(10);
      doc.setFont(undefined, "normal");
      procedureData.treatedTeeth.forEach((tooth, index) => {
        let details = `Tooth ${tooth.toothNumber}:`;
        if (tooth.treatmentDone)
          details += ` Treatment: ${tooth.treatmentDone}`;
        if (tooth.existingCondition)
          details += ` | Condition: ${tooth.existingCondition}`;
        if (tooth.activeSections && tooth.activeSections.length > 0) {
          details += ` | Sections: ${tooth.activeSections.join(", ")}`;
        }

        // Check if we need a new page
        if (yPosition > 270) {
          doc.addPage();
          yPosition = 20;
        }

        doc.text(details, 15, yPosition);
        yPosition += 5;
      });
    } else {
      doc.setFontSize(10);
      doc.text(
        "No specific teeth were marked for this procedure.",
        15,
        yPosition
      );
      yPosition += 10;
    }

    yPosition += 10; // Add some spacing before billing section

    // Billing Information
    doc.setFontSize(16);
    doc.setFont(undefined, "bold");
    doc.text("BILLING INFORMATION", 15, yPosition);
    yPosition += 10;

    // Create billing table
    // "Status";
    const billingTableData = [
      ["Procedure", "Amount", "Balance"],
      [
        procedureData.procedure || "N/A",
        `${parseFloat(procedureData.amount || 0).toLocaleString()}`,
        `${parseFloat(procedureData.balance || 0).toLocaleString()}`,
        // (procedureData.balance || 0) > 0 ? "Partial Payment" : "Paid",
      ],
    ];

    // Check if we need a new page for the billing table
    if (yPosition + 40 > 270) {
      doc.addPage();
      yPosition = 20;
      doc.setFontSize(16);
      doc.setFont(undefined, "bold");
      doc.text("BILLING INFORMATION", 15, yPosition);
      yPosition += 10;
    }

    doc.autoTable({
      startY: yPosition,
      head: [billingTableData[0]],
      body: [billingTableData[1]],
      theme: "grid",
      styles: { fontSize: 10 },
      headStyles: { fillColor: [255, 215, 0], textColor: [30, 41, 59] },
      margin: { left: 15, right: 15 },
    });

    yPosition = doc.lastAutoTable.finalY + 15;

    // Add footer
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.text(`Page ${i} of ${pageCount}`, 15, 285);
      doc.text("Thank you for choosing Blessed Smile Dental Clinic", 130, 285);
    }

    // Generate filename with patient name and date
    const safePatientName = patientName.replace(/[^a-zA-Z0-9]/g, "_");
    const filename = `Billing_${safePatientName}_${
      procedureData.date || "No_Date"
    }_${procedureId}.pdf`;

    // Save the PDF
    doc.save(filename);
  } catch (error) {
    console.error("Error in PDF generation:", error);
    throw error;
  }
}

// Function to get patient details from Firestore
async function getPatientDetails(patientId) {
  // Wait for collections to be initialized
  await waitForCollections();

  try {
    const patientDoc = await window.patientDetailsCollection
      .doc(patientId)
      .get();
    if (!patientDoc.exists) {
      throw new Error("Patient not found");
    }
    return patientDoc.data();
  } catch (error) {
    console.error("Error fetching patient details:", error);
    throw error;
  }
}

// Function to load clinic logo
async function loadLogo() {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => {
      console.warn("Could not load logo, continuing without it");
      resolve(null);
    };

    // Try multiple logo paths
    const logoPaths = [
      "/site-logo.png",
      "../../../site-logo.png",
      "/public/site-logo.png",
    ];

    function tryNextPath(index = 0) {
      if (index >= logoPaths.length) {
        resolve(null);
        return;
      }

      img.onerror = () => tryNextPath(index + 1);
      img.src = logoPaths[index];
    }

    tryNextPath();
  });
}

// Function to temporarily highlight treated teeth for better PDF visibility
async function highlightTreatedTeethForPDF(treatedTeeth) {
  treatedTeeth.forEach((tooth) => {
    const toothContainer = document.getElementById(
      `tooth-${tooth.toothNumber}`
    );
    if (toothContainer) {
      // Add a temporary highlighting class
      toothContainer.classList.add("pdf-highlight");

      // Highlight active sections
      if (tooth.activeSections) {
        tooth.activeSections.forEach((sectionId) => {
          const sectionElement = toothContainer.querySelector(`#${sectionId}`);
          if (sectionElement) {
            sectionElement.style.fill = "#ff0000";
            sectionElement.style.stroke = "#darkred";
            sectionElement.style.strokeWidth = "2";
          }
        });
      }
    }
  });

  // Add temporary CSS for better PDF visibility
  const style = document.createElement("style");
  style.id = "pdf-highlight-style";
  style.textContent = `
    .pdf-highlight {
      border: 2px solid #ffd700 !important;
      background: #fff9e6 !important;
    }
  `;
  document.head.appendChild(style);

  // Wait a moment for styles to apply
  await new Promise((resolve) => setTimeout(resolve, 100));
}

// Function to reset teeth highlighting after PDF capture
async function resetTeethHighlighting() {
  // Remove highlighting classes
  document.querySelectorAll(".pdf-highlight").forEach((element) => {
    element.classList.remove("pdf-highlight");
  });

  // Reset section styles
  document.querySelectorAll(".section").forEach((section) => {
    section.style.fill = "";
    section.style.stroke = "";
    section.style.strokeWidth = "";
  });

  // Remove temporary CSS
  const style = document.getElementById("pdf-highlight-style");
  if (style) {
    style.remove();
  }

  // Wait a moment for styles to reset
  await new Promise((resolve) => setTimeout(resolve, 100));
}

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
      if (window.showError) {
        showError("Procedure not found");
      } else {
        alert("Procedure not found");
      }
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
    if (window.showError) {
      showError("Error loading procedure data");
    } else {
      alert("Error loading procedure data");
    }
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

    if (window.showSuccess) {
      showSuccess("Procedure updated successfully!");
    } else {
      alert("Procedure updated successfully!");
    }

    // Return to view mode
    setViewMode(true);

    // Refresh procedure history
    if (typeof renderProcedureHistory === "function") {
      renderProcedureHistory();
    }
  } catch (error) {
    console.error("Error updating procedure:", error);
    if (window.showError) {
      showError("Error updating procedure");
    } else {
      alert("Error updating procedure");
    }
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

// Show/hide procedureBody only when Add Procedure is clicked
document.addEventListener("DOMContentLoaded", function () {
  var addProcedureBtn = document.getElementById("addProcedureBtn");
  var procedureBody = document.getElementById("procedureBody");
  if (addProcedureBtn && procedureBody) {
    addProcedureBtn.addEventListener("click", function (e) {
      e.preventDefault();
      var isVisible = procedureBody.style.display === "block";
      if (!isVisible) {
        procedureBody.style.display = "block";
        addProcedureBtn.innerHTML =
          '<i class="fas fa-minus me-2"></i>Cancel Procedure';
      } else {
        procedureBody.style.display = "none";
        addProcedureBtn.innerHTML =
          '<i class="fas fa-plus me-2"></i>Add Procedure';
      }
    });
  }
});

// Set max date for procedure date input to today
document.addEventListener("DOMContentLoaded", function () {
  var dateInput = document.getElementById("date");
  if (dateInput) {
    var today = new Date();
    var yyyy = today.getFullYear();
    var mm = String(today.getMonth() + 1).padStart(2, "0");
    var dd = String(today.getDate()).padStart(2, "0");
    var maxDate = yyyy + "-" + mm + "-" + dd;
    dateInput.setAttribute("max", maxDate);
  }
});

// Collect teeth chart data compatible with HTML structure (for compatibility with existing functions)
function collectTeethChartDataHTML() {
  const teethData = [];

  // Get all teeth elements with selections
  const allTeethElements = document.querySelectorAll("[data-tooth]");

  allTeethElements.forEach((toothElement) => {
    const toothNumber = parseInt(toothElement.getAttribute("data-tooth"));
    const selectedSections = toothElement.querySelectorAll(
      ".tooth-section.selected"
    );

    if (selectedSections.length > 0) {
      const activeSections = [];
      selectedSections.forEach((section) => {
        const sectionName = section.getAttribute("data-section");
        if (sectionName) {
          activeSections.push(sectionName);
        }
      });

      // Get condition and treatment if stored as attributes
      const existingCondition =
        toothElement.getAttribute("data-condition") || "";
      const treatmentDone = toothElement.getAttribute("data-treatment") || "";

      if (activeSections.length > 0 || existingCondition || treatmentDone) {
        teethData.push({
          toothNumber: toothNumber,
          treatmentDone: treatmentDone,
          existingCondition: existingCondition,
          activeSections: activeSections,
        });
      }
    }
  });

  return teethData;
}

// Reset teeth chart function compatible with HTML structure (for compatibility with existing functions)
function resetTeethChart() {
  const selectedSections = document.querySelectorAll(".tooth-section.selected");
  selectedSections.forEach((section) => {
    section.classList.remove("selected");
  });

  // Hide teeth summary
  const teethSummary = document.getElementById("teethSummary");
  if (teethSummary) {
    teethSummary.style.display = "none";
  }
}
