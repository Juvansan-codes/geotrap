const continueButton = document.querySelector("#continue-button");
const statusPanel = document.querySelector("#status-panel");
const statusMessage = document.querySelector("#status-message");
const locationDetails = document.querySelector("#location-details");
const latitude = document.querySelector("#latitude");
const longitude = document.querySelector("#longitude");
const accuracy = document.querySelector("#accuracy");
const retryButton = document.querySelector("#retry-button");
const returnButton = document.querySelector("#return-button");

const locationOptions = {
  enableHighAccuracy: true,
  timeout: 10000,
  maximumAge: 0
};

function showLocationRequest() {
  continueButton.hidden = true;
  statusPanel.hidden = false;
  locationDetails.hidden = true;
  retryButton.hidden = true;
  statusMessage.textContent = "Requesting location...";

  if (!navigator.geolocation) {
    showLocationError("Location is not available in this browser.");
    return;
  }

  navigator.geolocation.getCurrentPosition(
    showLocation,
    showLocationError,
    locationOptions
  );
}

function showLocation(position) {
  const coordinates = position.coords;

  latitude.textContent = coordinates.latitude.toFixed(6);
  longitude.textContent = coordinates.longitude.toFixed(6);
  accuracy.textContent = `${Math.round(coordinates.accuracy)} meters`;
  locationDetails.hidden = false;
  retryButton.hidden = true;
  statusMessage.textContent = "Location received. Saving...";

  saveLocation(coordinates);
}

async function saveLocation(coordinates) {
  try {
    const response = await fetch("/api/location", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        latitude: coordinates.latitude,
        longitude: coordinates.longitude,
        accuracy: coordinates.accuracy
      })
    });

    if (!response.ok) {
      throw new Error("Location could not be saved.");
    }

    statusMessage.textContent = "Location received.";
  } catch (error) {
    statusMessage.textContent = "Location was received but could not be saved.";
    retryButton.hidden = false;
    console.error(error);
  }
}

function showLocationError(error) {
  let message = "Unable to get your location.";

  if (error && error.code === GeolocationPositionError.PERMISSION_DENIED) {
    message = "Location permission was denied.";
  } else if (error && error.code === GeolocationPositionError.TIMEOUT) {
    message = "The location request timed out.";
  }

  statusMessage.textContent = message;
  locationDetails.hidden = true;
  retryButton.hidden = false;
}

function returnToStart() {
  statusPanel.hidden = true;
  continueButton.hidden = false;
  continueButton.focus();
}

continueButton.addEventListener("click", showLocationRequest);
retryButton.addEventListener("click", showLocationRequest);
returnButton.addEventListener("click", returnToStart);
