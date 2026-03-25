function selectRole(role) {
  if (role === 'tenant') {
    alert("Tenant flow coming soon!");
    // window.location.href = "tenant.html";
  } else {
    alert("Agent flow coming soon!");
    // window.location.href = "agent.html";
  }
}
function goHome() {
  window.location.href = "index.html";
}

function startWalkthrough() {
  alert("Walkthrough starting next step...");
}
