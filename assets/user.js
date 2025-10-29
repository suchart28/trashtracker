
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-app.js";
import { getFirestore, collection, onSnapshot } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDsz5_5iMRadkAmMlk9yW4YK9Pg8plfyuw",
  authDomain: "trash-tracker-d7112.firebaseapp.com",
  projectId: "trash-tracker-d7112",
  storageBucket: "trash-tracker-d7112.firebasestorage.app",
  messagingSenderId: "868759687799",
  appId: "1:868759687799:web:c47904e2c86ac8cbbd2c72"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Leaflet Map Setup
let map = L.map('map').setView([13.736717, 100.523186], 14);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19 }).addTo(map);

let userMarker = null;
let vehicleMarkers = {};
let hasAlerted = {};

// ระบุตำแหน่งบ้านผู้ใช้
navigator.geolocation.watchPosition(pos => {
  const userLat = pos.coords.latitude;
  const userLon = pos.coords.longitude;
  if (!userMarker) {
    userMarker = L.marker([userLat, userLon]).addTo(map).bindPopup("ตำแหน่งบ้านคุณ");
    map.setView([userLat, userLon], 15);
  } else { userMarker.setLatLng([userLat, userLon]); }
}, console.error, { enableHighAccuracy: true });

// ฟังข้อมูลรถแบบ realtime
onSnapshot(collection(db, "vehicles"), snapshot => {
  if (!userMarker) return;
  const userPosition = userMarker.getLatLng();
  let nearestVehicle = null;
  let nearestDistance = Infinity;

  snapshot.forEach(doc => {
    const data = doc.data();
    const { lat, lng, name, driver } = data;

    // Marker รถ
    if (!vehicleMarkers[doc.id]) {
      vehicleMarkers[doc.id] = L.marker([lat, lng], { icon: L.icon({
        iconUrl: "https://cdn-icons-png.flaticon.com/512/743/743922.png",
        iconSize: [40,40]
      })}).addTo(map)
        .bindPopup(`<b>${name||doc.id}</b><br>พนักงานขับ: ${driver||'-'}`);
    } else {
      vehicleMarkers[doc.id].setLatLng([lat,lng])
        .setPopupContent(`<b>${name||doc.id}</b><br>พนักงานขับ: ${driver||'-'}`);
    }

    // ระยะรถที่ใกล้ที่สุด
    const d = map.distance([userPosition.lat,userPosition.lng],[lat,lng]);
    if(d<nearestDistance){ nearestDistance=d; nearestVehicle={id:doc.id,distance:d}; }

    // แจ้งเตือนถ้า ≤3 นาที (15 km/h ~ 4.16 m/s)
    const minutes = Math.round(d / (15000/3600) / 60);
    if(minutes <=3 && !hasAlerted[doc.id]){
      document.getElementById("alert-sound").play().catch(()=>{});
      hasAlerted[doc.id]=true;
      alert(`🚛 รถเก็บขยะ (${name||doc.id}) ใกล้มาถึงแล้ว!`);
    }
  });

  // แสดงรถใกล้ที่สุด
  if(nearestVehicle){
    const meters = nearestVehicle.distance;
    const speed = 15000/3600;
    const seconds = meters / speed;
    const minutes = Math.round(seconds / 60);
    document.getElementById("nearest-label").innerText = `รถคัน: ${nearestVehicle.id}`;
    document.getElementById("nearest-time").innerText = `${minutes} นาที`;
  }
});
