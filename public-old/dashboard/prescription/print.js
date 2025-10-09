// Print functionality for prescription and certificate pages

document.addEventListener("DOMContentLoaded", function () {
  // Print logic for medical clearance (A4 bond paper)
  document
    .getElementById("printMedicalClearanceBtn")
    .addEventListener("click", function () {
      var clearanceDiv = document.getElementById("medicalClearance");
      var replaced = [];

      // Convert all input fields to plain text, but retain checkboxes visually
      clearanceDiv.querySelectorAll("input").forEach(function (input) {
        if (input.type === "checkbox") {
          // Create a visual checkbox span
          var box = document.createElement("span");
          box.style.display = "inline-block";
          box.style.width = "18px";
          box.style.height = "18px";
          box.style.border = "2px solid #222";
          box.style.borderRadius = "3px";
          box.style.marginRight = "6px";
          box.style.verticalAlign = "middle";
          box.style.position = "relative";
          if (input.checked) {
            var check = document.createElement("span");
            check.textContent = "✓";
            check.style.position = "absolute";
            check.style.left = "2px";
            check.style.top = "-7px";
            check.style.fontSize = "1.2em";
            check.style.color = "#222";
            box.appendChild(check);
          }
          input.parentNode.insertBefore(box, input);
          input.parentNode.removeChild(input);
          replaced.push({ original: input, replacement: box });
        } else {
          var span = document.createElement("span");
          span.textContent = input.value;
          span.style.display = input.style.display;
          span.className = input.className;
          span.style.cssText += input.style.cssText;
          input.parentNode.replaceChild(span, input);
          replaced.push({ original: input, replacement: span });
        }
      });

      // Convert textarea to plain text
      clearanceDiv.querySelectorAll("textarea").forEach(function (textarea) {
        var div = document.createElement("div");
        div.textContent = textarea.value;
        div.className = textarea.className;
        div.style.cssText = textarea.style.cssText;
        div.style.whiteSpace = "pre-line";
        textarea.parentNode.replaceChild(div, textarea);
        replaced.push({ original: textarea, replacement: div });
      });

      // Remove borders from all input and .form-control elements
      var borderRemoved = [];
      clearanceDiv
        .querySelectorAll("input, .form-control")
        .forEach(function (el) {
          borderRemoved.push({
            el: el,
            border: el.style.border,
            background: el.style.background,
          });
          el.style.border = "none";
          el.style.background = "none";
        });

      // Use html2canvas to render the actual HTML layout (WYSIWYG)
      html2canvas(clearanceDiv, { scale: 2 }).then(function (canvas) {
        var imgData = canvas.toDataURL("image/png");
        var jsPDFLib = window.jspdf ? window.jspdf.jsPDF : window.jsPDF;
        var pdf = new jsPDFLib({ unit: "pt", format: "a4" });
        var pageWidth = pdf.internal.pageSize.getWidth();
        var pageHeight = pdf.internal.pageSize.getHeight();

        // Calculate image dimensions to fit A4 and center horizontally
        var imgWidth = pageWidth - 40;
        var imgHeight = (canvas.height * imgWidth) / canvas.width;
        var y = 20;
        var x = (pageWidth - imgWidth) / 2; // Center horizontally

        if (imgHeight > pageHeight - 40) {
          imgHeight = pageHeight - 40;
          imgWidth = (canvas.width * imgHeight) / canvas.height;
          x = (pageWidth - imgWidth) / 2;
        }

        pdf.addImage(imgData, "PNG", x, y, imgWidth, imgHeight);
        var patientName = document.getElementById("clearancePatientName")
          ? document.getElementById("clearancePatientName").value
          : "";
        var fileName =
          "medical-clearance-" +
          (patientName ? patientName.replace(/\s+/g, "_") : "print") +
          ".pdf";
        pdf.save(fileName);

        // Restore original fields
        replaced.forEach(function (pair) {
          pair.replacement.parentNode.replaceChild(
            pair.original,
            pair.replacement
          );
        });
        borderRemoved.forEach(function (obj) {
          obj.el.style.border = obj.border;
          obj.el.style.background = obj.background;
        });
      });
    });
  // Show the correct print button based on active tab
  var printPrescriptionBtn = document.getElementById("printPrescriptionBtn");
  var printCertificateBtn = document.getElementById("printCertificateBtn");
  var printMedicalClearanceBtn = document.getElementById(
    "printMedicalClearanceBtn"
  );
  var printCaseReportBtn = document.getElementById("printCaseReportBtn");
  var prescriptionTabs = document.getElementById("prescriptionTabs");

  if (prescriptionTabs && printPrescriptionBtn && printCertificateBtn) {
    prescriptionTabs.addEventListener("click", function (e) {
      var target = e.target;
      if (target && target.classList.contains("nav-link")) {
        if (target.id === "all-prescriptions-tab") {
          printPrescriptionBtn.style.display = "";
          printCertificateBtn.style.display = "none";
          printMedicalClearanceBtn.style.display = "none";
          printCaseReportBtn.style.display = "none";
        } else if (target.id === "recent-prescriptions-tab") {
          printPrescriptionBtn.style.display = "none";
          printCertificateBtn.style.display = "";
          printMedicalClearanceBtn.style.display = "none";
          printCaseReportBtn.style.display = "none";
        } else if (target.id === "medical-clearance-tab") {
          printPrescriptionBtn.style.display = "none";
          printCertificateBtn.style.display = "none";
          printMedicalClearanceBtn.style.display = "";
          printCaseReportBtn.style.display = "none";
        } else if (target.id === "dental-case-report-tab") {
          printPrescriptionBtn.style.display = "none";
          printCertificateBtn.style.display = "none";
          printMedicalClearanceBtn.style.display = "none";
          printCaseReportBtn.style.display = "";
        }
      }
    });

    // On load, ensure correct button is shown
    var activeTab = prescriptionTabs.querySelector(".nav-link.active");

    if (activeTab && activeTab.id === "recent-prescriptions-tab") {
      printPrescriptionBtn.style.display = "none";
      printCertificateBtn.style.display = "";
      printMedicalClearanceBtn.style.display = "none";
      printCaseReportBtn.style.display = "none";
    } else if (activeTab && activeTab.id === "medical-clearance-tab") {
      printPrescriptionBtn.style.display = "none";
      printCertificateBtn.style.display = "none";
      printMedicalClearanceBtn.style.display = "";
      printCaseReportBtn.style.display = "none";
    } else if (activeTab && activeTab.id === "dental-case-report-tab") {
      printPrescriptionBtn.style.display = "none";
      printCertificateBtn.style.display = "none";
      printMedicalClearanceBtn.style.display = "none";
      printCaseReportBtn.style.display = "";
    }
  }

  // Certificate live update logic
  var certName = document.getElementById("certificatePatientName");
  var certAddress = document.getElementById("certificateAddress");
  var certAge = document.getElementById("certificateAge");
  var certDate = document.getElementById("certificateDate");
  var certTextarea = document.querySelector("#certificate textarea");

  if (certTextarea && certName && certAddress && certAge && certDate) {
    // Store the original template
    var template = certTextarea.value;

    function updateCertificateText() {
      var text = template;
      text = text.replace(
        /\[Patient Name\]/g,
        certName.value || "[Patient Name]"
      );
      text = text.replace(/\[Address\]/g, certAddress.value || "[Address]");
      text = text.replace(/\[Age\]/g, certAge.value || "[Age]");
      text = text.replace(/\[Date\]/g, certDate.value || "[Date]");
      certTextarea.value = text;
    }

    // Listen for input changes
    certName.addEventListener("input", updateCertificateText);
    certAddress.addEventListener("input", updateCertificateText);
    certAge.addEventListener("input", updateCertificateText);
    certDate.addEventListener("input", updateCertificateText);

    // Optionally, update on page load if fields are pre-filled
    updateCertificateText();
  }

  // Set the date input to today
  var dateInput = document.getElementById("date");
  if (dateInput) {
    var today = new Date();
    var yyyy = today.getFullYear();
    var mm = String(today.getMonth() + 1).padStart(2, "0");
    var dd = String(today.getDate()).padStart(2, "0");
    dateInput.value = yyyy + "-" + mm + "-" + dd;
  }

  // Print logic for prescription div (profile.html style)
  document
    .getElementById("printPrescriptionBtn")
    .addEventListener("click", function () {
      var prescriptionDiv = document.getElementById("prescription");
      var replaced = [];

      // 1. Convert all input fields and textareas to plain text for print, but keep sig images
      // For doctor names at the top, add a special class for bold/large style
      var doctorRowSpans = [];
      prescriptionDiv
        .querySelectorAll("#doctorContainer input")
        .forEach(function (input) {
          var span = document.createElement("span");
          span.textContent = input.value;
          span.style.display = input.style.display;
          span.className = input.className + " doctor-print-bold";
          span.style.cssText += input.style.cssText;
          input.parentNode.replaceChild(span, input);
          replaced.push({ original: input, replacement: span });
          doctorRowSpans.push(span);
        });

      // Other input fields (if any)
      prescriptionDiv
        .querySelectorAll("input:not(#doctorContainer input)")
        .forEach(function (input) {
          var span = document.createElement("span");
          span.textContent = input.value;
          span.style.display = input.style.display;
          span.className = input.className;
          span.style.cssText += input.style.cssText;
          input.parentNode.replaceChild(span, input);
          replaced.push({ original: input, replacement: span });
        });

      // Add style for doctor-print-bold (bold and larger)
      var style = document.createElement("style");
      style.id = "doctor-print-bold-style";
      style.textContent =
        ".doctor-print-bold { font-weight: bold !important; font-size: 1.15em !important; }";
      document.head.appendChild(style);

      prescriptionDiv.querySelectorAll("textarea").forEach(function (textarea) {
        var div = document.createElement("div");
        div.textContent = textarea.value;
        div.className = textarea.className;
        div.style.cssText = textarea.style.cssText;
        div.style.whiteSpace = "pre-line";
        textarea.parentNode.replaceChild(div, textarea);
        replaced.push({ original: textarea, replacement: div });
      });

      // 2. Hide all X icons (remove buttons), plus icons (add doctor row), and minus icons (remove doctor row)
      var removedX = [];
      prescriptionDiv
        .querySelectorAll("button.btn-link")
        .forEach(function (btn) {
          btn.style.display = "none";
          removedX.push(btn);
        });

      // Hide all .fa-plus icons inside #prescription
      var hiddenPlus = [];
      prescriptionDiv.querySelectorAll(".fa-plus").forEach(function (plusIcon) {
        plusIcon.style.display = "none";
        hiddenPlus.push(plusIcon);
      });

      // Hide all .fa-minus icons inside #prescription
      var hiddenMinus = [];
      prescriptionDiv
        .querySelectorAll(".fa-minus")
        .forEach(function (minusIcon) {
          minusIcon.style.display = "none";
          hiddenMinus.push(minusIcon);
        });

      // 3. Hide Add Prescription button
      var addBtn = document.querySelector("#addPrescriptionContainer");
      var addBtnDisplay = null;
      if (addBtn) {
        addBtnDisplay = addBtn.style.display;
        addBtn.style.display = "none";
      }

      // 4. Remove borders from prescription blocks
      var borderRemoved = [];
      prescriptionDiv.querySelectorAll(".form-control").forEach(function (el) {
        borderRemoved.push({
          el: el,
          border: el.style.border,
          background: el.style.background,
        });
        el.style.border = "none";
        el.style.background = "none";
      });

      // 5. Hide empty prescription fields (sig + empty text)
      var hiddenEmpty = [];
      prescriptionDiv
        .querySelectorAll(".prescription-block")
        .forEach(function (block) {
          var textDiv = block.querySelector(".form-control");
          if (textDiv && !textDiv.textContent.trim()) {
            block.style.display = "none";
            hiddenEmpty.push(block);
          }
        });

      // 6. Use html2canvas to render the actual HTML layout (WYSIWYG)
      html2canvas(prescriptionDiv, { scale: 2 }).then(function (canvas) {
        var imgData = canvas.toDataURL("image/png");
        var jsPDFLib = window.jspdf ? window.jspdf.jsPDF : window.jsPDF;

        // Create PDF with half A4 size in portrait orientation
        // A4 is 595.28 x 841.89 pt, so half A4 would be 297.64 x 420.945 pt
        var pdf = new jsPDFLib({
          unit: "pt",
          format: [297.64, 420.945],
          orientation: "portrait",
        });

        var pageWidth = pdf.internal.pageSize.getWidth();
        var pageHeight = pdf.internal.pageSize.getHeight();

        // Calculate image dimensions to fit half A4 with smaller margins
        var imgWidth = pageWidth - 20; // Reduced margin for smaller page
        var imgHeight = (canvas.height * imgWidth) / canvas.width;
        var y = 10; // Smaller top margin

        if (imgHeight > pageHeight - 20) {
          imgHeight = pageHeight - 20;
          imgWidth = (canvas.width * imgHeight) / canvas.height;
        }

        pdf.addImage(imgData, "PNG", 10, y, imgWidth, imgHeight);
        var patientName = document.getElementById("patientName")
          ? document.getElementById("patientName").value
          : "";
        var fileName =
          "prescription-" +
          (patientName ? patientName.replace(/\s+/g, "_") : "print") +
          ".pdf";
        pdf.save(fileName);

        // Restore original fields
        replaced.forEach(function (pair) {
          pair.replacement.parentNode.replaceChild(
            pair.original,
            pair.replacement
          );
        });
        removedX.forEach(function (btn) {
          btn.style.display = "";
        });
        hiddenPlus.forEach(function (plusIcon) {
          plusIcon.style.display = "";
        });
        hiddenMinus.forEach(function (minusIcon) {
          minusIcon.style.display = "";
        });
        if (addBtn) addBtn.style.display = addBtnDisplay;
        borderRemoved.forEach(function (obj) {
          obj.el.style.border = obj.border;
          obj.el.style.background = obj.background;
        });
        hiddenEmpty.forEach(function (block) {
          block.style.display = "";
        });

        // Remove the temporary style
        var tempStyle = document.getElementById("doctor-print-bold-style");
        if (tempStyle) tempStyle.remove();
      });
    });

  // Print logic for certificate div (no borders, no icons)
  document
    .getElementById("printCertificateBtn")
    .addEventListener("click", function () {
      var certificateDiv = document.getElementById("certificate");
      var replaced = [];

      // Convert all input fields to plain text
      certificateDiv.querySelectorAll("input").forEach(function (input) {
        var span = document.createElement("span");
        span.textContent = input.value;
        span.style.display = input.style.display;
        span.className = input.className;
        span.style.cssText += input.style.cssText;
        input.parentNode.replaceChild(span, input);
        replaced.push({ original: input, replacement: span });
      });

      // Convert textarea to plain text
      certificateDiv.querySelectorAll("textarea").forEach(function (textarea) {
        var div = document.createElement("div");
        div.textContent = textarea.value;
        div.className = textarea.className;
        div.style.cssText = textarea.style.cssText;
        div.style.whiteSpace = "pre-line";
        textarea.parentNode.replaceChild(div, textarea);
        replaced.push({ original: textarea, replacement: div });
      });

      // Remove borders from form-control elements
      var borderRemoved = [];
      certificateDiv.querySelectorAll(".form-control").forEach(function (el) {
        borderRemoved.push({
          el: el,
          border: el.style.border,
          background: el.style.background,
        });
        el.style.border = "none";
        el.style.background = "none";
      });

      // Use html2canvas to render the actual HTML layout (WYSIWYG)
      html2canvas(certificateDiv, { scale: 2 }).then(function (canvas) {
        var imgData = canvas.toDataURL("image/png");
        var jsPDFLib = window.jspdf ? window.jspdf.jsPDF : window.jsPDF;
        var pdf = new jsPDFLib({ unit: "pt", format: "a4" });
        var pageWidth = pdf.internal.pageSize.getWidth();
        var pageHeight = pdf.internal.pageSize.getHeight();

        // Calculate image dimensions to fit A4
        var imgWidth = pageWidth - 40;
        var imgHeight = (canvas.height * imgWidth) / canvas.width;
        var y = 20;

        if (imgHeight > pageHeight - 40) {
          imgHeight = pageHeight - 40;
          imgWidth = (canvas.width * imgHeight) / canvas.height;
        }

        pdf.addImage(imgData, "PNG", 20, y, imgWidth, imgHeight);
        var patientName = document.getElementById("certificatePatientName")
          ? document.getElementById("certificatePatientName").value
          : "";
        var fileName =
          "certificate-" +
          (patientName ? patientName.replace(/\s+/g, "_") : "print") +
          ".pdf";
        pdf.save(fileName);

        // Restore original fields
        replaced.forEach(function (pair) {
          pair.replacement.parentNode.replaceChild(
            pair.original,
            pair.replacement
          );
        });
        borderRemoved.forEach(function (obj) {
          obj.el.style.border = obj.border;
          obj.el.style.background = obj.background;
        });
      });
    });

  // Doctor row add/remove logic
  function addDoctorRow() {
    const container = document.getElementById("doctorContainer");

    // Disable previous input and change icon to minus
    const prevRows = container.querySelectorAll(".doctor-row");
    if (prevRows.length > 0) {
      const lastRow = prevRows[prevRows.length - 1];
      const input = lastRow.querySelector("input");
      input.disabled = true;
      const icon = lastRow.querySelector("i");
      icon.classList.remove("fa-plus");
      icon.classList.add("fa-minus");
      icon.style.color = "#dc3545";
      icon.style.cursor = "pointer";
      icon.onclick = function () {
        lastRow.remove();
      };
    }

    // Create new row
    const rowDiv = document.createElement("div");
    rowDiv.className = "doctor-row";
    rowDiv.style.display = "flex";

    // Input
    const input = document.createElement("input");
    input.type = "text";
    input.className = "form-control";
    input.placeholder = "Doctor's Name";
    input.id = "";
    input.setAttribute("list", "doctorNamesDatalist");

    // Plus icon
    const icon = document.createElement("i");
    icon.className = "fa fa-plus";
    icon.style.alignSelf = "center";
    icon.style.fontSize = "1.3em";
    icon.style.marginLeft = "8px";
    icon.style.cursor = "pointer";
    icon.onclick = addDoctorRow;

    rowDiv.appendChild(input);
    rowDiv.appendChild(icon);
    container.appendChild(rowDiv);
  }

  // Initial setup: replace static row with dynamic
  const staticRow = document.getElementById("doctorRow");
  if (staticRow) {
    staticRow.parentNode.removeChild(staticRow);
    addDoctorRow();
  }

  // Add prescription functionality
  const addBtn = document.querySelector(
    "#addPrescriptionContainer .btn-dark.btn-sm"
  );
  const rxInputContainer = document.getElementById("rxContainer");

  if (addBtn && rxInputContainer) {
    const rxColContainer = addBtn.closest(".col-12");

    addBtn.addEventListener("click", function () {
      // Find all prescription blocks
      let prescBlocks = rxColContainer.querySelectorAll(".prescription-block");

      // If none, wrap the first textarea
      if (prescBlocks.length === 0) {
        const origBlock = document.createElement("div");
        origBlock.className = "prescription-block";
        rxInputContainer.parentNode.insertBefore(origBlock, rxInputContainer);
        origBlock.appendChild(rxInputContainer);
        prescBlocks = rxColContainer.querySelectorAll(".prescription-block");
      }

      // Find last textarea in last block
      const lastBlock = prescBlocks[prescBlocks.length - 1];
      const textarea = lastBlock.querySelector("textarea");

      if (textarea) {
        // Convert textarea to plain text, keep sig.png
        const value = textarea.value.trim();
        const blockDiv = document.createElement("div");
        blockDiv.style.display = "flex";
        blockDiv.style.alignItems = "center";
        blockDiv.style.gap = "5px";
        blockDiv.style.padding = "0 50px";

        // Signature image
        const sigImg = document.createElement("img");
        sigImg.src = "/sig.png";
        sigImg.alt = "";
        sigImg.style.width = "80px";
        blockDiv.appendChild(sigImg);

        // Plain text prescription
        const textDiv = document.createElement("div");
        textDiv.textContent = value;
        textDiv.className = "form-control mb-2";
        textDiv.style.background = "#f8f9fa";
        textDiv.style.minHeight = "38px";
        textDiv.style.padding = "8px 12px";
        textDiv.style.border = "1px solid #dee2e6";
        textDiv.style.whiteSpace = "pre-line";
        blockDiv.appendChild(textDiv);

        // Add X icon for removal
        const removeBtn = document.createElement("button");
        removeBtn.type = "button";
        removeBtn.className = "btn btn-link p-0 ms-2";
        removeBtn.innerHTML =
          '<i class="fa fa-times text-danger" style="font-size:1.2rem;"></i>';
        removeBtn.title = "Remove prescription";
        removeBtn.onclick = function () {
          blockDiv.parentNode.remove();
        };
        blockDiv.appendChild(removeBtn);

        // Replace textarea's parent with blockDiv
        textarea.parentNode.replaceWith(blockDiv);
      }

      // Add new prescription block below
      const newBlock = document.createElement("div");
      newBlock.className = "prescription-block";

      // Create row with sig.png and textarea only
      const rowDiv = document.createElement("div");
      rowDiv.style.display = "flex";
      rowDiv.style.alignItems = "center";
      rowDiv.style.gap = "5px";
      rowDiv.style.padding = "0 50px";

      // Signature image
      const sigImgNew = document.createElement("img");
      sigImgNew.src = "/sig.png";
      sigImgNew.alt = "";
      sigImgNew.style.width = "80px";
      rowDiv.appendChild(sigImgNew);

      // Textarea
      const newTextarea = document.createElement("textarea");
      newTextarea.className = "form-control mt-2";
      newTextarea.rows = 2;
      newTextarea.placeholder = "Prescription details...";
      rowDiv.appendChild(newTextarea);

      newBlock.appendChild(rowDiv);
      rxColContainer.insertBefore(newBlock, addBtn.parentNode);
    });
  }
});
