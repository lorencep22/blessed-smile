const firebaseConfig = {
  apiKey: "AIzaSyBBao67lyPXvzb8JmTHUclUq7p7P7MMZCI",
  authDomain: "blessed-smile-cdde2.firebaseapp.com",
  projectId: "blessed-smile-cdde2",
  storageBucket: "blessed-smile-cdde2.firebasestorage.app",
  messagingSenderId: "624302457943",
  appId: "1:624302457943:web:db145c1660c554a70b0f12",
  measurementId: "G-E183MR2HXM",
};

firebase.initializeApp(firebaseConfig);
// ...existing code...
const auth = firebase.auth();
const db = firebase.firestore();
// Make db globally accessible for theme manager
window.db = db;
// Global Firestore collections
window.doctorsCollection = db.collection("doctors");
window.patientDetailsCollection = db.collection("patientDetails");
window.patientRecordsCollection = db.collection("patientRecords");
window.proceduresCollection = db.collection("procedures");
window.prescriptionsCollection = db.collection("prescriptions");
window.usersCollection = db.collection("users");
window.themeCollection = db.collection("themes");

const whenSignedIn = document.getElementById("whenSignedIn");
const whenSignedOut = document.getElementById("whenSignedOut");
const signInBtn = document.getElementById("signInBtn");
const signOutBtn = document.getElementById("signOutBtn");
const userDetails = document.getElementById("userDetails");
const drDiv = document.getElementById("drDiv");
const drName = document.getElementById("drName");
const dashSection = document.getElementById("dashSection");
const dashBtn = document.getElementById("dashboardBtn");
const dashboardSignOut = document.getElementById("dashboard-signout");
const provider = new firebase.auth.GoogleAuthProvider();
provider.setCustomParameters({ prompt: "select_account" });

const patientsProfile = document.getElementById("patients-profile");

//Auth State Listener
if (signOutBtn) signOutBtn.onclick = () => auth.signOut();

if (window.location.pathname === "/") {
  let allowedEmails = []; // Will be populated from users collection

  // Fetch allowed emails from users collection
  function fetchAllowedEmails() {
    return db
      .collection("users")
      .get()
      .then((snapshot) => {
        allowedEmails = [];
        snapshot.forEach((doc) => {
          const user = doc.data();
          if (user.googleEmail) {
            allowedEmails.push(user.googleEmail);
          }
        });
        return allowedEmails;
      })
      .catch((error) => {
        console.error("Error fetching allowed emails:", error);
        return [];
      });
  }

  // Load allowed emails on page load
  fetchAllowedEmails();

  //Sign In
  if (signInBtn)
    signInBtn.onclick = () => {
      auth
        .signInWithPopup(provider)
        .then((result) => {
          const email = result.user.email;
          // Fetch latest emails in case collection was updated
          return fetchAllowedEmails().then(() => {
            // if (!allowedEmails.includes(email)) {
            // auth.signOut();
            // if (window.showError) {
            //   showError("This email is not allowed to sign in.");
            // } else {
            //   alert("This email is not allowed to sign in.");
            // }
            // }
          });
        })
        .catch((error) => {
          if (window.showError) {
            showError("Sign in failed: " + error.message);
          } else {
            alert("Sign in failed: " + error.message);
          }
        });
    };

  //Dashboard
  dashBtn.onclick = () => {
    location.href = "/dashboard/index.html";
  };

  auth.onAuthStateChanged((user) => {
    if (user) {
      // Check if email is in allowed list, fetch fresh data if needed
      fetchAllowedEmails().then(() => {
        if (!allowedEmails.includes(user.email)) {
          auth.signOut();
          if (window.showError) {
            showError("This email is not allowed to sign in.");
          } else {
            alert("This email is not allowed to sign in.");
          }
          return;
        }
        whenSignedIn.style.display = "none";
        whenSignedOut.style.display = "block";
        dashSection.style.display = "block";
        drDiv.style.visibility = "visible";
        // drName.innerHTML = user.displayName;
      });
    } else {
      // userDetails.innerHTML = "";
      whenSignedIn.style.display = "block";
      dashSection.style.display = "none";
      whenSignedOut.style.display = "none";
      drDiv.style.visibility = "hidden";
    }
  });
}
//Dashboard Code

// Protect dashboard and all subpages under /dashboard/
if (window.location.pathname.startsWith("/dashboard/")) {
  // Sign out button logic for dashboard main page
  if (dashboardSignOut) {
    dashboardSignOut.onclick = () => {
      auth.signOut().then(() => {
        window.location.href = "/";
      });
    };
  }
  // Auth check for all dashboard pages
  auth.onAuthStateChanged(function (user) {
    if (!user) {
      window.location.href = "/";
    }
  });
}

// // Example usage:
// const newPatient = [
//   {
//     address: "CDO",
//     age: 22,
//     birthday: "03/09/2025",
//     civilStatus: "Single",
//     contactNo: "09999999999",
//     email: "blessed.smile.web@gmail.com",
//     firstName: "Smile",
//     lastName: "Blessed",
//     middleName: "Web",
//     occupation: "IT",
//     sex: "Male",
//   }
// ];

// newPatient.forEach((patient) => addPatient(patient));

// Generate patient names datalist for use in forms
// Generate doctor names datalist for use in forms

function generateDoctorNamesDatalist() {
  db.collection("doctors")
    .get()
    .then((snapshot) => {
      let datalist = document.getElementById("doctorNamesDatalist");
      if (!datalist) {
        datalist = document.createElement("datalist");
        datalist.id = "doctorNamesDatalist";
        document.body.appendChild(datalist);
      }
      datalist.innerHTML = "";
      // Check page title
      const isPrescriptionList = document.title.trim() === "Prescription List";
      snapshot.forEach((doc) => {
        const d = doc.data();
        let name = d.name || "";
        const status = d.status || "Active";
        if (name && status === "Active") {
          if (isPrescriptionList) {
            // Remove any prefix ending with a period and space (e.g., 'a. ', 'Dr. ', 'Dra. ')
            name = name.replace(/^([A-Za-z]+\.)\s+/i, "");
            // Also remove 'Dr', 'Dra' without period
            name = name.replace(/^(Dr|Dra)\s+/i, "");
          }
          const option = document.createElement("option");
          option.value = name;
          datalist.appendChild(option);
        }
      });
    });
}

function generatePatientNamesDatalist() {
  db.collection("patientDetails")
    .get()
    .then((snapshot) => {
      let datalist = document.getElementById("patientNamesDatalist");
      if (!datalist) {
        datalist = document.createElement("datalist");
        datalist.id = "patientNamesDatalist";
        document.body.appendChild(datalist);
      }
      datalist.innerHTML = "";
      snapshot.forEach((doc) => {
        const p = doc.data();
        const fullName = `${p.firstName || ""} ${p.middleName || ""} ${
          p.lastName || ""
        }`.trim();
        if (fullName) {
          const option = document.createElement("option");
          option.value = fullName;
          option.dataset.id = doc.id; // Add patient id as data-id attribute
          datalist.appendChild(option);
        }
      });
    });
}
// Call this on page load if you need the datalist
if (
  document.getElementById("patientName") ||
  document.getElementById("searchPatientInput")
) {
  generatePatientNamesDatalist();
  const patientNameInput = document.getElementById("patientName");
  const searchPatientInput = document.getElementById("searchPatientInput");
  if (patientNameInput) {
    patientNameInput.setAttribute("list", "patientNamesDatalist");
  }
  if (searchPatientInput) {
    searchPatientInput.setAttribute("list", "patientNamesDatalist");
  }
}
if (document.getElementById("doctor")) {
  generateDoctorNamesDatalist();
  const doctorInput = document.getElementById("doctor");
  doctorInput.setAttribute("list", "doctorNamesDatalist");
  // Show datalist again after comma for multiple names
  doctorInput.addEventListener("input", function (e) {
    const value = doctorInput.value;
    const lastComma = value.lastIndexOf(",");
    // If last character is comma, temporarily add a space to trigger datalist
    if (lastComma === value.length - 1) {
      doctorInput.value = value + " ";
      setTimeout(() => {
        doctorInput.value = value;
        doctorInput.setAttribute("list", "doctorNamesDatalist");
        doctorInput.focus();
      }, 10);
    } else {
      doctorInput.setAttribute("list", "doctorNamesDatalist");
    }
  });
}
