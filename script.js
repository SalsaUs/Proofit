function selectRole(role) {
  if (role === 'tenant') {
    window.location.href = "./tenant.html";
  } else {
    window.location.href = "./agent.html";
  }
}

function goHome() {
  window.location.href = "./index.html";
}

function startWalkthrough() {
  alert("Walkthrough starting next step...");
}
