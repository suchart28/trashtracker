
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-app.js";
import { getFirestore, doc, setDoc } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-firestore.js";
import { firebaseConfig } from "./firebase-config.js";

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const urlParams = new URLSearchParams(location.search);
const vehicleId = urlParams.get("id") || "TRUCK";

if (!navigator.geolocation) {
  alert("Geolocation not supported");
}

function sendLocation() {
  navigator.geolocation.getCurrentPosition(async (pos) => {
    const { latitude, longitude } = pos.coords;
    await setDoc(doc(db, "vehicles", vehicleId), {
      lat: latitude,
      lng: longitude,
      ts: Date.now()
    });
  });
}

setInterval(sendLocation, 10000);
sendLocation();
