const adminForm = document.querySelector("#admin-form");
const adminSecret = document.querySelector("#admin-secret");
const adminMessage = document.querySelector("#admin-message");
const locations = document.querySelector("#locations");

adminForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  adminMessage.textContent = "Loading...";
  locations.replaceChildren();

  try {
    const response = await fetch("/api/admin", {
      headers: {
        "x-admin-secret": adminSecret.value
      }
    });
    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || "Unable to load locations.");
    }

    if (result.locations.length === 0) {
      adminMessage.textContent = "No locations were recorded in the last 24 hours.";
      return;
    }

    adminMessage.textContent = "";
    result.locations.forEach((location) => {
      const item = document.createElement("p");
      item.textContent =
        `${new Date(location.created_at).toLocaleString()} — ` +
        `Latitude: ${Number(location.latitude).toFixed(6)}, ` +
        `Longitude: ${Number(location.longitude).toFixed(6)}, ` +
        `Accuracy: ${Math.round(location.accuracy)} meters`;
      locations.append(item);
    });
  } catch (error) {
    adminMessage.textContent = error.message;
  }
});
