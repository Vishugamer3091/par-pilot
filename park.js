/* PARKPILOT — Real-Time Ride Status & Categorized Fallback Recommendation Engine */

// Dynamic Rides State Engine with Categories (6 Rides Total)
const ridesData = {
  "Roller Coaster": {
    category: "dry", // Land / Thrill
    capacity: 50,
    currentRiders: 48,
    queueCount: 15,
    roundLocked: true, // Round completely full
    status: "LOCKED"
  },
  "Go-Karting": {
    category: "dry", // Land / Thrill
    capacity: 30,
    currentRiders: 12,
    queueCount: 3,
    roundLocked: false,
    status: "AVAILABLE"
  },
  "Ferris Wheel": {
    category: "dry", // Land / Family
    capacity: 40,
    currentRiders: 20,
    queueCount: 5,
    roundLocked: false,
    status: "AVAILABLE"
  },
  "Water Slides": {
    category: "water", // Water Attraction
    capacity: 50,
    currentRiders: 48,
    queueCount: 12,
    roundLocked: false,
    status: "FULL"
  },
  "Wave Pool": {
    category: "water", // Water Attraction
    capacity: 60,
    currentRiders: 25,
    queueCount: 4,
    roundLocked: false,
    status: "AVAILABLE"
  },
  "Lazy River Float": {
    category: "water", // Water Attraction
    capacity: 40,
    currentRiders: 10,
    queueCount: 2,
    roundLocked: false,
    status: "AVAILABLE"
  }
};

document.getElementById("year").textContent = new Date().getFullYear();

// Toast message handler
function showToast(msg) {
  const toast = document.getElementById("toast");
  toast.textContent = msg;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 4500);
}

// Strictly Categorized Recommendation System
function getCategoryMatchedAlternative(requestedRideName) {
  const requested = ridesData[requestedRideName];
  if (!requested) return null;

  const targetCategory = requested.category;

  // Filter rides matching EXACT category that are AVAILABLE
  let validAlternatives = Object.keys(ridesData).filter(rideName => {
    if (rideName === requestedRideName) return false;
    const item = ridesData[rideName];
    return item.category === targetCategory && item.status === "AVAILABLE";
  });

  if (validAlternatives.length > 0) {
    return validAlternatives[0]; // Best matched alternative
  }

  return "No alternative in same category available right now.";
}

// Render Live Status Dashboard Cards
function renderLiveStatusDashboard() {
  const container = document.getElementById("statusGridContainer");
  if (!container) return;

  container.innerHTML = "";

  Object.keys(ridesData).forEach(rideName => {
    const ride = ridesData[rideName];
    const card = document.createElement("div");
    card.className = "status-card-item";

    let badgeClass = ride.status === "AVAILABLE" ? "available" : ride.status === "FULL" ? "full" : "locked";
    let statusText = ride.status === "LOCKED" ? "🔒 LOCKED (ROUND FULL)" : ride.status === "FULL" ? "⚠️ QUEUE FULL" : "✅ AVAILABLE";

    let suggestionHTML = "";
    if (ride.status !== "AVAILABLE") {
      const altRide = getCategoryMatchedAlternative(rideName);
      suggestionHTML = `
        <div class="suggestion-box">
          📍 Ride Busy! Recommended Same-Category Alternative (${ride.category === 'water' ? 'Water Attraction' : 'Dry/Land Ride'}): <br>
          👉 <strong>${altRide}</strong>
        </div>
      `;
    }

    card.innerHTML = `
      <div class="status-card-header">
        <h3>${rideName}</h3>
        <span class="status-badge ${badgeClass}">${statusText}</span>
      </div>
      <ul class="status-info-list" style="list-style:none; padding:0; margin: 10px 0; font-weight:700;">
        <li>Category: <strong>${ride.category === 'water' ? '🌊 Water Attraction' : '🎢 Land / Thrill'}</strong></li>
        <li>Active Riders: ${ride.currentRiders} / ${ride.capacity}</li>
        <li>Current Queue: ${ride.queueCount} people</li>
        <li>Next Round Status: ${ride.roundLocked ? "❌ Locked (Wait for next batch)" : "🟢 Open"}</li>
      </ul>
      ${suggestionHTML}
    `;

    container.appendChild(card);
  });
}

// Scrollspy for Sticky Navbar
const sections = document.querySelectorAll("section[id]");
const navItems = document.querySelectorAll(".nav-item");

window.addEventListener("scroll", () => {
  let currentScroll = window.scrollY + 160;
  sections.forEach(sec => {
    if (currentScroll >= sec.offsetTop && currentScroll < sec.offsetTop + sec.offsetHeight) {
      navItems.forEach(link => {
        link.classList.remove("active");
        if (link.getAttribute("href") === `#${sec.id}`) link.classList.add("active");
      });
    }
  });
});

// Mobile Menu
document.getElementById("menuToggle").addEventListener("click", () => {
  const nav = document.getElementById("navLinks");
  nav.classList.toggle("open");
});

// Pass Booking Logic
document.querySelectorAll(".choose-package").forEach(btn => {
  btn.addEventListener("click", () => {
    showToast(`🎟️ ${btn.dataset.package} Pass booked successfully! Check Live Updates section for current ride queues.`);
  });
});

// Add to Custom Pass Handler
document.querySelectorAll(".add-ride").forEach(btn => {
  btn.addEventListener("click", () => {
    const rideName = btn.dataset.ride;
    const cb = Array.from(document.querySelectorAll(".custom-ride")).find(c => c.value === rideName);
    if (cb) {
      cb.checked = true;
      document.getElementById("customizer").scrollIntoView({ behavior: "smooth" });
      showToast(`${rideName} added to custom pass!`);
    }
  });
});

// Custom Pass Booking with Strict Fallback
document.getElementById("customBookButton").addEventListener("click", () => {
  const checkboxes = document.querySelectorAll(".custom-ride:checked");
  if (checkboxes.length === 0) {
    showToast("Please select at least one ride!");
    return;
  }

  let alerts = [];
  checkboxes.forEach(cb => {
    const rName = cb.value;
    const rData = ridesData[rName];
    if (rData && (rData.status === "LOCKED" || rData.status === "FULL")) {
      const alt = getCategoryMatchedAlternative(rName);
      alerts.push(`[${rName} is ${rData.status}] -> Redirecting to same-category ride: ${alt}`);
    }
  });

  if (alerts.length > 0) {
    showToast(`⚠️ Queue Alerts:\n` + alerts.join("\n"));
  } else {
    showToast("✅ Custom pass booked smoothly for all selected rides!");
  }
});

// Initial Render
renderLiveStatusDashboard();