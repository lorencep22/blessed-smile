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
// Global Firestore collections
window.doctorsCollection = db.collection("doctors");
window.patientDetailsCollection = db.collection("patientDetails");
window.patientRecordsCollection = db.collection("patientRecords");

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

const patientsPage = document.getElementById("patients-page");
const patientsProfile = document.getElementById("patients-profile");

//Auth State Listener
if (signOutBtn) signOutBtn.onclick = () => auth.signOut();
if (window.location.pathname === "/") {
  if (signInBtn) signInBtn.onclick = () => auth.signInWithPopup(provider);

  //Dashboard
  dashBtn.onclick = () => {
    location.href = "/dashboard";
  };

  auth.onAuthStateChanged((user) => {
    if (user) {
      whenSignedIn.style.display = "none";
      whenSignedOut.style.display = "block";
      dashSection.style.display = "block";
      drDiv.style.visibility = "visible";
      drName.innerHTML = user.displayName;
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
if (window.location.pathname.endsWith("/dashboard")) {
  if (dashboardSignOut) {
    dashboardSignOut.onclick = () => {
      auth.signOut().then(() => {
        window.location.href = "/";
      });
    };
  }
}

if (patientsPage) {
  db.collection("patientDetails")
    .get()
    .then((snapshot) => {
      const patientsList = document.getElementById("patientsList");
      const patients = [];
      snapshot.forEach((doc) => {
        const patient = doc.data();
        patient.id = doc.id;
        patients.push(patient);
      });

      // Pagination variables
      let currentPage = 1;
      const pageSize = 10;
      const totalPages = Math.ceil(patients.length / pageSize);

      function renderTable(page) {
        patientsList.innerHTML = "";
        let html = `<table class="table table-bordered table-hover">
              <thead>
                <tr>
                  <th>Full Name</th>
                  <th>Gender</th>
                  <th>Contact No.</th>
                  <th>Email</th>
                  <th>Accounts</th>
                </tr>
              </thead>
              <tbody>`;
        const start = (page - 1) * pageSize;
        const end = Math.min(start + pageSize, patients.length);
        for (let i = start; i < end; i++) {
          const p = patients[i];
          html += `<tr>
                <td>${p.firstName} ${p.middleName} ${p.lastName}</td>
                <td>${p.sex}</td>
                <td>${p.contactNo}</td>
                <td>${p.email}</td>
                <td><a target="_blank" href="/public/dashboard/patients/profile.html?id=${p.id}">View</a></td>
              </tr>`;
        }
        html += `</tbody></table>`;

        // Pagination controls
        html += `<nav><ul class="pagination">`;
        for (let i = 1; i <= totalPages; i++) {
          html += `<li class="page-item${
            i === page ? " active" : ""
          }"><a class="page-link" href="#">${i}</a></li>`;
        }
        html += `</ul></nav>`;

        patientsList.innerHTML = html;

        // Add click event for pagination
        const pageLinks = patientsList.querySelectorAll(".page-link");
        pageLinks.forEach((link, idx) => {
          link.onclick = (e) => {
            e.preventDefault();
            renderTable(idx + 1);
          };
        });
      }

      renderTable(currentPage);
    });
}
if (patientsProfile) {
  const patientDetails = document.getElementById("patientDetails");
  const urlParams = new URLSearchParams(window.location.search);
  const patientId = urlParams.get("id");

  db.collection("patientDetails")
    .doc(patientId)
    .get()
    .then((doc) => {
      if (doc.exists) {
        const patient = doc.data();
        patientDetails.innerHTML = `
              <h3>${patient.firstName} ${patient.lastName}</h3>
              <p><strong>Gender:</strong> ${patient.sex}</p>
              <p><strong>Contact No.:</strong> ${patient.contactNo}</p>
              <p><strong>Email:</strong> ${patient.email}</p>
              <p><strong>Address:</strong> ${patient.address}</p>
              <p><strong>Birthday:</strong> ${patient.birthday}</p>
              <p><strong>Occupation:</strong> ${patient.occupation}</p>
            `;
      } else {
        patientDetails.innerHTML = "<p>Patient not found.</p>";
      }
    })
    .catch((error) => {
      console.error("Error fetching patient details:", error);
      patientDetails.innerHTML = "<p>Error fetching patient details.</p>";
    });
}

function addPatient(patient) {
  db.collection("patientDetails")
    .add(patient)
    .then((docRef) => {
      alert("Patient added with ID: " + docRef.id);
    })
    .catch((error) => {
      alert("Error adding patient: " + error);
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
