const centresContainer = document.getElementById("centre-container");
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

function updateCentreList(pincode = "686665", date = currentDate()) {
  getVacineCentresByDistrictIdAndDate(pincode, date).then((vaccineCentres) => {
    centresContainer.innerHTML = displayVaccineCentres(vaccineCentres.centers);
  });
}

function displayVaccineCentres(sessions = []) {
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

function validateAndUpdateList() {
  if (isValidPin(this.value)) {
    storage.setItem("pincode", this.value);
    sendMessageToServiceWorker({
      type: "UPDATE_VACCINES",
      data: {
        pincode: pincodeInput.value,
        date: currentDate(),
      },
    });
  }
}

pincodeInput.addEventListener("input", validateAndUpdateList);

if (isValidPin(storage.getItem("pincode"))) {
  pincodeInput.value = storage.getItem("pincode");
  sendMessageToServiceWorker({
    type: "UPDATE_VACCINES",
    data: {
      pincode: pincodeInput.value,
      date: currentDate(),
    },
  });
  if (storage.getItem("notitificationEnabled") === "true") {
    sendMessageToServiceWorker({
      type: "UPDATE_VACCINE_CRON",
      data: {
        pincode: pincodeInput.value,
        date: currentDate(),
      },
    });
  }
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

function sendMessageToServiceWorker(data) {
  vaccinesCheckWorder.postMessage(data);
}

vaccinesCheckWorder.onmessage = function ({ data }) {
  if (data.type == "VACCINE_UPDATED") {
    console.log(data.sessions);
    centresContainer.innerHTML = displayVaccineCentres(data.sessions);
  }
};
