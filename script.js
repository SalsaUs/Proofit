 // ===== NAVIGATION =====

function selectRole(role) {
  if (role === 'tenant') {
    window.location.href = "./tenant.html";
  }
}

function goHome() {
  window.location.href = "./index.html";
}

function startWalkthrough() {
  window.location.href = "./tenant-inspection.html";
}


// ===== ROOM SYSTEM =====

let currentRoom = 0;
const roomNames = ["Entry", "Living", "Kitchen", "Bathroom", "Bedroom"];


// ===== STORAGE =====

function getInspectionData() {
  return JSON.parse(localStorage.getItem("inspectionData")) || {};
}

function saveInspectionData(data) {
  localStorage.setItem("inspectionData", JSON.stringify(data));
}


// ===== ADD CARD (RESTORED PHOTO CARD) =====

function addInspectionCard() {
  const wrapper = document.getElementById("cards-wrapper");

  const card = document.createElement("div");
  card.className = "inspection-card";

  card.innerHTML = `
    <h2>${roomNames[currentRoom]}</h2>
    <p class="subtitle">Take photos and add a note about this room</p>

    <div class="photo-upload">
      <div class="photo-box">
        <div class="plus">+</div>
        <p>Take Photo</p>
      </div>
    </div>

    <div class="notes-section">
      <label>NOTES</label>
      <textarea class="notes-input" placeholder="Attach a note..."></textarea>
    </div>
  `;

  wrapper.appendChild(card);
}


// ===== SAVE =====

function saveCurrentRoom() {
  const data = getInspectionData();
  const cards = document.querySelectorAll(".inspection-card");

  data[currentRoom] = [];

  cards.forEach(card => {
    data[currentRoom].push({
      notes: card.querySelector(".notes-input")?.value || ""
    });
  });

  saveInspectionData(data);
}


// ===== LOAD =====

function loadRoom() {
  const wrapper = document.getElementById("cards-wrapper");
  wrapper.innerHTML = "";

  const data = getInspectionData();
  const roomData = data[currentRoom] || [];

  if (roomData.length === 0) {
    addInspectionCard();
  }

  roomData.forEach(entry => {
    const card = document.createElement("div");
    card.className = "inspection-card";

    card.innerHTML = `
      <h2>${roomNames[currentRoom]}</h2>
      <p class="subtitle">Take photos and add a note about this room</p>

      <div class="photo-upload">
        <div class="photo-box">
          <div class="plus">+</div>
          <p>Take Photo</p>
        </div>
      </div>

      <div class="notes-section">
        <label>NOTES</label>
        <textarea class="notes-input" placeholder="Attach a note...">${entry.notes || ""}</textarea>
      </div>
    `;

    wrapper.appendChild(card);
  });

  updateProgress();
  updateTabs();
}


// ===== SWITCH ROOM =====

function switchRoom(index) {
  saveCurrentRoom();
  currentRoom = index;
  loadRoom();
}


// ===== NEXT ROOM =====

function nextRoom() {
  saveCurrentRoom();

  if (currentRoom < roomNames.length - 1) {
    currentRoom++;
    loadRoom();
  } else {
    window.location.href = "./report.html";
  }
}


// ===== BACK =====

function goBack() {
  if (currentRoom > 0) {
    saveCurrentRoom();
    currentRoom--;
    loadRoom();
  }
}


// ===== PROGRESS =====

function updateProgress() {
  const fill = document.getElementById("progressFill");
  const text = document.getElementById("progressText");

  if (!fill || !text) return;

  const percent = ((currentRoom + 1) / roomNames.length) * 100;

  fill.style.width = percent + "%";
  text.textContent = `Room ${currentRoom + 1} of ${roomNames.length}`;
}


// ===== TABS =====

function updateTabs() {
  document.querySelectorAll(".tab").forEach((tab, i) => {
    tab.classList.toggle("active", i === currentRoom);
  });
}


// ===== INIT =====

document.addEventListener("DOMContentLoaded", () => {
  loadRoom();
});
