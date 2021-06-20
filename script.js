const API_BASE_URL = "https://cdn-api.co-vin.in/api/v2";
const centersContainer = document.getElementById("centers-container");
const pincodeInput = document.getElementById("pincode");
const notifySwitch = document.getElementById("noitify-switch");
const vaccinesCheckWorder = new Worker("./worker.js");
const storage = window.localStorage;
let intervalHandle;

function currentDate() {
  const dateNow = new Date();

  return `${String(dateNow.getDate()).padStart(2, "0")}-${String(
    dateNow.getMonth() + 1
  ).padStart(2, "0")}-${dateNow.getFullYear()}`;
}

function displayVaccineCenters(sessions = []) {
  let sessionList = [];
  sessionList.push(
    ...sessions.map((session) => {
      return `
        <div class="four wide column">
        <div class="ui fluid card" style="border-top: 2px solid ${
          session.available_capacity === 0 ? "#ff5722" : "#1fab89"
        }">
          <div class="content">
            <div class="header">${session.center.name}</div>
            <div class="meta">${session.center.district_name}</div>
            <div class="description">
              <table class="ui celled unstackable very compact table">
              <tbody>
                  <tr>
                    <td>Total</td>
                    <td>${session.available_capacity}</td>
                  </tr>
                  <tr>
                    <td>Dose 1</td>
                    <td>${session.available_capacity_dose1}</td>
                  </tr>
                  <tr>
                    <td>Dose 2</td>
                    <td>${session.available_capacity_dose2}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          
          <div class="extra content">
          <span>${session.center.fee_type}</span>
          <span class="right floated">${session.vaccine}</span>
          </div>

          <div class="extra content">
          <span>Min Age : ${session.min_age_limit}</span>
          <span class="right floated">${session.date}</span>
          </div>

        </div>
        </div>
        `;
    })
  );

  return sessionList.join("");
}

function isValidPin(pin) {
  const pattern = new RegExp(/^[0-9]{6}$/g);

  return pattern.test(pin);
}

function updateVaccinesAndCronIfNeeded(data){
  sendMessageToServiceWorker({
    type: "UPDATE_VACCINES",
    data
  });

  if (storage.getItem("notitificationEnabled") === "true") {
    sendMessageToServiceWorker({
      type: "UPDATE_VACCINE_CRON",
      data,
    });
  }
}

function validateAndUpdateList() {
  if (isValidPin(this.value)) {
    storage.setItem("pincode", this.value);
    updateVaccinesAndCronIfNeeded({
      pincode: pincodeInput.value,
      date: currentDate(),
    })
  }
}

pincodeInput.addEventListener("input", validateAndUpdateList);

if (storage.getItem("notitificationEnabled") === "true") {
  notifySwitch.checked = true;
}

if (isValidPin(storage.getItem("pincode"))) {
  pincodeInput.value = storage.getItem("pincode");
  
  updateVaccinesAndCronIfNeeded({
    pincode: pincodeInput.value,
    date: currentDate(),
  })
}

notifySwitch.addEventListener("change", (event) => {
  if (event.currentTarget.checked) {
    storage.setItem("notitificationEnabled", "true");

    sendMessageToServiceWorker({
      type: "UPDATE_VACCINE_CRON",
      data: {
        pincode: pincodeInput.value,
        date: currentDate(),
      },
    });
  } else {
    sendMessageToServiceWorker({
      type: "STOP_VACCINE_CRON",
    });
    storage.setItem("notitificationEnabled", "false");
  }
});

function beep() {
  var snd = new Audio("data:audio/wav;base64,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qJrx4KOQjahZxWbcZgztj2c49nKmkId44S71j0c8eV9yDK6uPRzx5X18eDvjvQ6yKo9ZSS6l//8elePK/Lf//IInrOF/FvDoADYAGBMGb7FtErm5MXMlmPAJQVgWta7Zx2go+8xJ0UiCb8LHHdftWyLJE0QIAIsI+UbXu67dZMjmgDGCGl1H+vpF4NSDckSIkk7Vd+sxEhBQMRU8j/12UIRhzSaUdQ+rQU5kGeFxm+hb1oh6pWWmv3uvmReDl0UnvtapVaIzo1jZbf/pD6ElLqSX+rUmOQNpJFa/r+sa4e/pBlAABoAAAAA3CUgShLdGIxsY7AUABPRrgCABdDuQ5GC7DqPQCgbbJUAoRSUj+NIEig0YfyWUho1VBBBA//uQZB4ABZx5zfMakeAAAAmwAAAAF5F3P0w9GtAAACfAAAAAwLhMDmAYWMgVEG1U0FIGCBgXBXAtfMH10000EEEEEECUBYln03TTTdNBDZopopYvrTTdNa325mImNg3TTPV9q3pmY0xoO6bv3r00y+IDGid/9aaaZTGMuj9mpu9Mpio1dXrr5HERTZSmqU36A3CumzN/9Robv/Xx4v9ijkSRSNLQhAWumap82WRSBUqXStV/YcS+XVLnSS+WLDroqArFkMEsAS+eWmrUzrO0oEmE40RlMZ5+ODIkAyKAGUwZ3mVKmcamcJnMW26MRPgUw6j+LkhyHGVGYjSUUKNpuJUQoOIAyDvEyG8S5yfK6dhZc0Tx1KI/gviKL6qvvFs1+bWtaz58uUNnryq6kt5RzOCkPWlVqVX2a/EEBUdU1KrXLf40GoiiFXK///qpoiDXrOgqDR38JB0bw7SoL+ZB9o1RCkQjQ2CBYZKd/+VJxZRRZlqSkKiws0WFxUyCwsKiMy7hUVFhIaCrNQsKkTIsLivwKKigsj8XYlwt/WKi2N4d//uQRCSAAjURNIHpMZBGYiaQPSYyAAABLAAAAAAAACWAAAAApUF/Mg+0aohSIRobBAsMlO//Kk4soosy1JSFRYWaLC4qZBYWFRGZdwqKiwkNBVmoWFSJkWFxX4FFRQWR+LsS4W/rFRb/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////VEFHAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAU291bmRib3kuZGUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAMjAwNGh0dHA6Ly93d3cuc291bmRib3kuZGUAAAAAAAAAACU=");  
  snd.play();
}

function sendMessageToServiceWorker(data) {
  vaccinesCheckWorder.postMessage(data);
}

vaccinesCheckWorder.onmessage = function ({ data }) {
  if (data.type == "VACCINE_UPDATED") {
    centersContainer.innerHTML = displayVaccineCenters(data.sessions);
  }
  if (data.type == "PLAY_BEEP") {
    beep()
  }
};

Notification.requestPermission().then(() => {});

beep();

function getStates(){
  return fetch(
    `${API_BASE_URL}/admin/location/states`
  ).then((res) => {
    return res.json();
  });
}

function getDistrictsByStateId(stateId){
  return fetch(
    `${API_BASE_URL}/admin/location/districts/${stateId}`
  ).then((res) => {
    return res.json();
  });
}

getStates()
.then(data => {
  $('#select-state')
    .dropdown({
      values: data.states.map(state => {
        return {
          name: state.state_name,
          value: state.state_id
        }
      }),
      onChange: fetchAndUpdateDistrict
    })
});

function fetchAndUpdateDistrict(stateId){
  if(stateId) {
    getDistrictsByStateId(stateId)
    .then(data => {
      $('#select-district')
      .dropdown({
        values: data.districts.map(district => {
          return {
            name: district.district_name,
            value: district.district_id
          }
        }),
        onChange: (districtId) => {
          sendMessageToServiceWorker({
            type: "UPDATE_VACCINE_CRON",
            data: {
              districtId,
              date: currentDate(),
            },
          });
        }
      })
    })
  }
}