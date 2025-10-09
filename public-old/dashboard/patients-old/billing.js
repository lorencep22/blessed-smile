// Billing functionality for patient profile
document.addEventListener("DOMContentLoaded", function () {
  // Get billing-specific elements
  const billingPeriodSelect = document.getElementById("billingPeriodSelect");
  const billingCustomStartDate = document.getElementById(
    "billingCustomStartDate"
  );
  const billingCustomEndDate = document.getElementById("billingCustomEndDate");
  const billingToLabel = document.getElementById("billingToLabel");
  const billingFilterDateBtn = document.getElementById("billingFilterDateBtn");
  const printBillingHistoryBtn = document.getElementById(
    "printBillingHistoryBtn"
  );
  const billingHistory = document.getElementById("billingHistory");
  const billingPagination = document.getElementById("billingPagination");

  // Get patient ID from URL parameters
  const urlParams = new URLSearchParams(window.location.search);
  const patientId = urlParams.get("id");

  // Billing data variables
  let billingData = [];
  let filteredBillingData = [];

  // Show/hide custom date fields for billing
  if (billingPeriodSelect) {
    billingPeriodSelect.addEventListener("change", function () {
      if (this.value === "custom") {
        billingCustomStartDate.classList.remove("d-none");
        billingCustomEndDate.classList.remove("d-none");
        billingToLabel.classList.remove("d-none");
      } else {
        billingCustomStartDate.classList.add("d-none");
        billingCustomEndDate.classList.add("d-none");
        billingToLabel.classList.add("d-none");
      }
    });
  }

  // Generate billing data based on selected period
  if (billingFilterDateBtn) {
    billingFilterDateBtn.addEventListener("click", function () {
      const selectedPeriod = billingPeriodSelect.value;
      generateBillingReport(selectedPeriod);
    });
  }

  // Print billing history functionality
  if (printBillingHistoryBtn) {
    printBillingHistoryBtn.addEventListener("click", function () {
      printBillingReport();
    });
  }

  // Function to get date range based on selected period
  function getBillingDateRange(period) {
    const now = new Date();
    let start, end;

    switch (period) {
      case "today": {
        start = new Date(now);
        end = new Date(now);
        break;
      }
      case "thisWeek": {
        const day = now.getDay();
        const diff = now.getDate() - day + (day === 0 ? -6 : 1); // Monday
        start = new Date(now.setDate(diff));
        end = new Date(start);
        end.setDate(start.getDate() + 6); // Sunday
        break;
      }
      case "prevWeek": {
        const day = now.getDay();
        const diff = now.getDate() - day + (day === 0 ? -6 : 1); // Monday of this week
        start = new Date(now.setDate(diff - 7)); // Previous Monday
        end = new Date(start);
        end.setDate(start.getDate() + 6); // Previous Sunday
        break;
      }
      case "thisMonth": {
        start = new Date(now.getFullYear(), now.getMonth(), 1);
        end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        break;
      }
      case "prevMonth": {
        start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        end = new Date(now.getFullYear(), now.getMonth(), 0);
        break;
      }
      case "thisYear": {
        start = new Date(now.getFullYear(), 0, 1);
        end = new Date(now.getFullYear(), 11, 31);
        break;
      }
      case "custom": {
        const startValue = billingCustomStartDate.value;
        const endValue = billingCustomEndDate.value;
        if (!startValue || !endValue) {
          if (window.showWarning) {
            showWarning(
              "Please select both start and end dates for custom range."
            );
          } else {
            alert("Please select both start and end dates for custom range.");
          }
          return null;
        }
        start = new Date(startValue);
        end = new Date(endValue);
        break;
      }
      default:
        return null;
    }

    // Set time to start/end of day
    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);
    return { start, end };
  }

  // Function to generate billing report
  function generateBillingReport(period) {
    if (!patientId) {
      if (window.showError) {
        showError("Patient ID not found. Please reload the page.");
      } else {
        alert("Patient ID not found. Please reload the page.");
      }
      return;
    }

    const dateRange = getBillingDateRange(period);
    if (!dateRange) {
      if (window.showWarning) {
        showWarning("Please select a valid date range.");
      } else {
        alert("Please select a valid date range.");
      }
      return;
    }

    // Show loading state
    if (billingHistory) {
      billingHistory.innerHTML =
        '<tr><td colspan="6" class="text-center">Loading billing information...</td></tr>';
    }

    // Fetch procedures for this patient within the date range
    if (window.proceduresCollection) {
      window.proceduresCollection
        .where("patientId", "==", patientId)
        .orderBy("date", "desc")
        .get()
        .then((snapshot) => {
          if (snapshot.empty) {
            billingHistory.innerHTML =
              '<tr><td colspan="6" class="text-center text-warning">No billing records found for this patient.</td></tr>';
            return;
          }

          // Filter procedures by date range
          filteredBillingData = [];
          let totalAmount = 0;
          let totalBalance = 0;

          snapshot.forEach((doc) => {
            const procedure = doc.data();

            // Parse procedure date
            let procDate = procedure.date;
            if (typeof procDate === "string") {
              procDate = new Date(procDate);
            } else if (procDate && procDate.toDate) {
              procDate = procedure.date.toDate();
            }

            // Check if procedure falls within date range
            if (procDate >= dateRange.start && procDate <= dateRange.end) {
              // Calculate affected teeth count
              let teethCount = 0;
              if (
                procedure.treatedTeeth &&
                Array.isArray(procedure.treatedTeeth)
              ) {
                teethCount = procedure.treatedTeeth.length;
              } else if (procedure.treatedTeeth) {
                // Handle legacy data format or single tooth
                teethCount = 1;
              }

              const billingRecord = {
                id: doc.id,
                procedureName: procedure.procedure || "N/A",
                teethCount: teethCount,
                date: procedure.date || "N/A",
                amount: parseFloat(procedure.amount) || 0,
                balance: parseFloat(procedure.balance) || 0,
                status: getPaymentStatus(
                  parseFloat(procedure.amount) || 0,
                  parseFloat(procedure.balance) || 0
                ),
              };

              filteredBillingData.push(billingRecord);
              totalAmount += billingRecord.amount;
              totalBalance += billingRecord.balance;
            }
          });

          if (filteredBillingData.length === 0) {
            billingHistory.innerHTML =
              '<tr><td colspan="6" class="text-center text-warning">No billing records found for the selected date range.</td></tr>';
            return;
          }

          // Sort by date (most recent first)
          filteredBillingData.sort((a, b) => {
            const dateA = new Date(a.date);
            const dateB = new Date(b.date);
            return dateB - dateA;
          });

          // Render billing table (all data)
          renderBillingTable();

          // Clear pagination area
          clearBillingPagination();

          // Show summary (optional)
          console.log(`Billing Summary for selected period:
                        Total Records: ${filteredBillingData.length}
                        Total Amount: ₱${totalAmount.toFixed(2)}
                        Total Balance: ₱${totalBalance.toFixed(2)}
                        Total Paid: ₱${(totalAmount - totalBalance).toFixed(
                          2
                        )}`);
        })
        .catch((error) => {
          console.error("Error fetching billing data:", error);
          billingHistory.innerHTML =
            '<tr><td colspan="6" class="text-center text-danger">Error loading billing information. Please try again.</td></tr>';
        });
    } else {
      if (window.showError) {
        showError("Database connection not available. Please reload the page.");
      } else {
        alert("Database connection not available. Please reload the page.");
      }
    }
  }

  // Function to determine payment status
  function getPaymentStatus(amount, balance) {
    if (balance === 0) {
      return '<span class="badge bg-success">Fully Paid</span>';
    } else if (balance === amount) {
      return '<span class="badge bg-danger">Unpaid</span>';
    } else if (balance < amount && balance > 0) {
      return '<span class="badge bg-warning">Partially Paid</span>';
    } else {
      return '<span class="badge bg-secondary">Unknown</span>';
    }
  }

  // Function to render billing table (all data)
  function renderBillingTable() {
    if (!billingHistory) return;

    billingHistory.innerHTML = "";

    // Display all records
    filteredBillingData.forEach((record) => {
      const row = document.createElement("tr");

      // Format date
      let formattedDate = "N/A";
      if (record.date && record.date !== "N/A") {
        try {
          const date = new Date(record.date);
          if (!isNaN(date.getTime())) {
            formattedDate = date.toLocaleDateString("en-US", {
              year: "numeric",
              month: "short",
              day: "numeric",
            });
          }
        } catch (e) {
          formattedDate = record.date;
        }
      }

      row.innerHTML = `
                <td>${record.procedureName}</td>
                <td>${record.teethCount > 0 ? record.teethCount : "N/A"}</td>
                <td>${formattedDate}</td>
                <td>₱${record.amount.toFixed(2)}</td>
                <td>₱${record.balance.toFixed(2)}</td>
                <td>${record.status}</td>
            `;

      billingHistory.appendChild(row);
    });

    // If no records to show
    if (filteredBillingData.length === 0) {
      const row = document.createElement("tr");
      row.innerHTML =
        '<td colspan="6" class="text-center text-muted">No records to display.</td>';
      billingHistory.appendChild(row);
    }
  }

  // Function to clear billing pagination area
  function clearBillingPagination() {
    if (billingPagination) {
      billingPagination.innerHTML = "";
    }
  }

  // Function to load logo image
  function loadLogo() {
    return new Promise((resolve, reject) => {
      const logoImg = new Image();
      logoImg.crossOrigin = "anonymous";

      logoImg.onload = function () {
        resolve(logoImg);
      };

      logoImg.onerror = function () {
        reject(new Error("Logo not found"));
      };

      // Try multiple possible paths for the logo
      const possiblePaths = [
        "../../../site-logo.png",
        "../../site-logo.png",
        "../site-logo.png",
        "/site-logo.png",
        "site-logo.png",
      ];

      // Try the first path
      logoImg.src = possiblePaths[0];

      // If first path fails, try others
      let pathIndex = 0;
      logoImg.onerror = function () {
        pathIndex++;
        if (pathIndex < possiblePaths.length) {
          console.log(`Trying logo path: ${possiblePaths[pathIndex]}`);
          logoImg.src = possiblePaths[pathIndex];
        } else {
          reject(new Error("Logo not found in any of the expected paths"));
        }
      };
    });
  }

  // Function to print billing report
  async function printBillingReport() {
    if (!filteredBillingData || filteredBillingData.length === 0) {
      if (window.showWarning) {
        showWarning(
          "No billing data to print. Please generate a report first."
        );
      } else {
        alert("No billing data to print. Please generate a report first.");
      }
      return;
    }

    try {
      // Get patient information (if available)
      let patientName = "Unknown Patient";

      // Try to get patient name from the specific HTML structure
      const patientDetailsContainer = document.getElementById("patientDetails");
      if (patientDetailsContainer) {
        let firstName = "";
        let middleName = "";
        let lastName = "";

        // Look for name components in info-item structure
        const infoItems =
          patientDetailsContainer.querySelectorAll(".info-item");

        infoItems.forEach((item) => {
          const label = item.querySelector(".info-label");
          const value = item.querySelector(".info-value");

          if (label && value) {
            const labelText = label.textContent.trim().toLowerCase();
            const valueText = value.textContent.trim();

            if (labelText.includes("first name")) {
              firstName = valueText;
            } else if (labelText.includes("middle name")) {
              middleName = valueText;
            } else if (labelText.includes("last name")) {
              lastName = valueText;
            }
          }
        });

        // Construct full name
        if (firstName || middleName || lastName) {
          patientName = [firstName, middleName, lastName]
            .filter((name) => name && name !== "")
            .join(" ");
        } else {
          // Fallback: try to get the first info-value element (which might contain full name)
          const firstInfoValue =
            patientDetailsContainer.querySelector(".info-value");
          if (firstInfoValue) {
            patientName = firstInfoValue.textContent.trim();
          }
        }
      }

      // Calculate totals
      const totalAmount = filteredBillingData.reduce(
        (sum, record) => sum + record.amount,
        0
      );
      const totalBalance = filteredBillingData.reduce(
        (sum, record) => sum + record.balance,
        0
      );
      const totalPaid = totalAmount - totalBalance;

      // Prepare billing table data for PDF
      const tableData = filteredBillingData.map((record) => {
        let formattedDate = "N/A";
        if (record.date && record.date !== "N/A") {
          try {
            const date = new Date(record.date);
            if (!isNaN(date.getTime())) {
              formattedDate = date.toLocaleDateString("en-US");
            }
          } catch (e) {
            formattedDate = record.date;
          }
        }

        let statusText = "";
        if (record.balance === 0) {
          statusText = "Fully Paid";
        } else if (record.balance === record.amount) {
          statusText = "Unpaid";
        } else {
          statusText = "Partially Paid";
        }

        return [
          formattedDate,
          record.procedureName,
          record.teethCount > 0 ? record.teethCount.toString() : "N/A",
          `PHP ${record.amount.toFixed(2)}`,
          `PHP ${record.balance.toFixed(2)}`,
          statusText,
        ];
      });

      // Generate PDF using jsPDF with wider page size
      const { jsPDF } = window.jspdf;
      const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: [180, 200], // A4 portrait: 210mm width x 297mm height
      });

      // Load logo before generating PDF
      let logoLoaded = false;
      let logoImage = null;

      try {
        logoImage = await loadLogo();
        logoLoaded = true;
        console.log("Logo loaded successfully");
      } catch (error) {
        console.log("Logo could not be loaded:", error);
        logoLoaded = false;
      }

      // Add logo to PDF if loaded
      if (logoLoaded && logoImage) {
        try {
          const logoSize = 15; // 15mm diameter for the circular logo
          const logoX = (doc.internal.pageSize.width - logoSize) / 2; // Center the logo
          const logoY = 8; // Position at top

          doc.addImage(logoImage, "PNG", logoX, logoY, logoSize, logoSize);
          console.log("Logo added to PDF");
        } catch (error) {
          console.log("Error adding logo to PDF:", error);
        }
      }

      // Header - centered below logo
      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      doc.text(
        "Blessed Smile Dental Clinic",
        doc.internal.pageSize.width / 2,
        30, // Below the logo
        {
          align: "center",
        }
      );

      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("Billing Statement", doc.internal.pageSize.width / 2, 38, {
        align: "center",
      });

      // Patient Information - professional layout
      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.text("Patient Information:", 10, 52);

      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      let yPos = 58;
      doc.text(`Name: ${patientName}`, 10, yPos);
      yPos += 5;
      doc.text(
        `Report Date: ${new Date().toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
        })}`,
        10,
        yPos
      );
      yPos += 5;
      doc.text(`Period: ${getPeriodDescription()}`, 10, yPos);

      // Billing History Table - professional styling
      yPos += 8;
      doc.autoTable({
        head: [["Date", "Procedure", "Tooth", "Amount", "Balance", "Status"]],
        body: tableData,
        startY: yPos,
        theme: "striped",
        headStyles: {
          fillColor: [52, 58, 64],
          textColor: 255,
          fontStyle: "bold",
          fontSize: 9,
        },
        styles: {
          fontSize: 9,
          cellPadding: 1.5,
        },
        alternateRowStyles: {
          fillColor: [248, 249, 250],
        },
        margin: { left: 10, right: 10 },
        columnStyles: {
          0: { cellWidth: 25 }, // Date - compact
          1: { cellWidth: 45 }, // Procedure - wider but fits in 180mm width
          2: { cellWidth: 15 }, // Tooth - compact
          3: { cellWidth: 20 }, // Amount - reasonable
          4: { cellWidth: 20 }, // Balance - reasonable
          5: { cellWidth: 25 }, // Status - compact
        },
      });

      // Summary - professional
      const finalY = doc.lastAutoTable.finalY + 8;
      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.text("Summary:", 10, finalY);

      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text(
        `Total Procedures: ${filteredBillingData.length}`,
        10,
        finalY + 6
      );
      doc.text(`Total Amount: PHP ${totalAmount.toFixed(2)}`, 10, finalY + 12);
      doc.text(`Total Paid: PHP ${totalPaid.toFixed(2)}`, 10, finalY + 18);

      doc.setFont("helvetica", "bold");
      doc.text(
        `Outstanding Balance: PHP ${totalBalance.toFixed(2)}`,
        10,
        finalY + 24
      );

      // Footer - professional
      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      doc.text(
        `Generated: ${new Date().toLocaleDateString("en-US")}`,
        doc.internal.pageSize.width - 10,
        doc.internal.pageSize.height - 6,
        { align: "right" }
      );

      // Create professional filename with sanitized patient name and date
      const sanitizedPatientName = patientName
        .replace(/[^a-zA-Z0-9\s]/g, "")
        .replace(/\s+/g, "_")
        .toUpperCase();

      // Get current date in YYYY-MM-DD format
      const currentDate = new Date().toISOString().split("T")[0];

      const fileName = sanitizedPatientName
        ? `BlessedSmile_BillingStatement_${sanitizedPatientName}_${currentDate}.pdf`
        : `BlessedSmile_BillingStatement_${currentDate}.pdf`;

      // Save PDF and open in new tab
      const pdfBlob = doc.output("blob");
      if (window.navigator && window.navigator.msSaveOrOpenBlob) {
        window.navigator.msSaveOrOpenBlob(pdfBlob, fileName);
      } else {
        const blobUrl = URL.createObjectURL(pdfBlob);
        const a = document.createElement("a");
        a.href = blobUrl;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.open(blobUrl, "_blank");
        setTimeout(() => URL.revokeObjectURL(blobUrl), 5000);
      }
    } catch (error) {
      console.error("Error generating PDF:", error);
      if (window.showError) {
        showError("Error generating PDF. Please try again.");
      } else {
        alert("Error generating PDF. Please try again.");
      }
    }
  }

  // Function to get period description for print
  function getPeriodDescription() {
    const period = billingPeriodSelect ? billingPeriodSelect.value : "unknown";
    const periodMap = {
      today: "Today",
      thisWeek: "This Week",
      prevWeek: "Previous Week",
      thisMonth: "This Month",
      prevMonth: "Previous Month",
      thisYear: "This Year",
      custom: `${billingCustomStartDate?.value || "N/A"} to ${
        billingCustomEndDate?.value || "N/A"
      }`,
    };
    return periodMap[period] || "All Records";
  }

  // Load initial billing data when page loads (optional - you can remove this if you want to load data only when Generate is clicked)
  // generateBillingReport('thisMonth');
});
