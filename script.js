const API_BASE_URL = "https://cdn-api.co-vin.in/api/v2";
const UPDATE_INTERVAL = 30000;
const centresContainer = document.getElementById("centre-container");
const pinNumberInput = document.getElementById("pinNumber");
const notifySwitch = document.getElementById("noitify-switch");
const storage = window.localStorage;
let intervalHandle;

function getVacineCentresByDistrictIdAndDate(pinNumber, date) {
  return fetch(
    `${API_BASE_URL}/appointment/sessions/public/calendarByPin?pincode=${pinNumber}&date=${date}`
  ).then((res) => {
    return res.json();
  });
}

function currentDate() {
  const dateNow = new Date();

  return `${String(dateNow.getDate()).padStart(2, "0")}-${String(
    dateNow.getMonth() + 1
  ).padStart(2, "0")}-${dateNow.getFullYear()}`;
}

function updateCentreList(pincode = "686665", date = currentDate()) {
  getVacineCentresByDistrictIdAndDate(pincode, date).then((vaccineCentres) => {
    // I have double checked, its 'centres' and not 'centers' ;)
    centresContainer.innerHTML = displayVaccineCentres(vaccineCentres.centers);
  });
}

function displayVaccineCentres(centres = []) {
  let centreList = [];

  for (let centre of centres) {
    centreList.push(
      ...centre.sessions.map((session) => {
        return `
        <div class="four wide column">
        <div class="ui fluid card" style="border-top: 2px solid ${
          session.available_capacity === 0 ? "#ff5722" : "#1fab89"
        }">
          <div class="content">
            <div class="header">${centre.name}</div>
            <div class="meta">${centre.district_name}</div>
            <div class="description">
              <table class="ui celled unstackable table">
              <thead>
              <tr><th>Total</th>
              <th>Dose 1</th>
              <th>Dose 2</th>
              </tr></thead>  
              <tbody>
                  <tr>
                    <td>${session.available_capacity}</td>
                    <td>${session.available_capacity_dose1}</td>
                    <td>${session.available_capacity_dose2}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          
          <div class="extra content">
          <span class="right floated">${session.date}</span>
          <span>Min Age : ${session.min_age_limit}</span>
          </div>

          <div class="extra content">
          <span class="right floated">${session.vaccine}</span>
          <span>${centre.fee_type}</span>
        </div>
        </div>
        </div>
        `;
      })
    );
  }

  return centreList.join("");
}

function updateListIfNeeded() {
  if (isValidPin(this.value)) {
    storage.setItem("pinNumber", this.value);
    updateCentreList(this.value);
  }
}

function isValidPin(pin) {
  const pattern = new RegExp(/^[0-9]{6}$/g);

  return pattern.test(pin);
}

pinNumberInput.addEventListener("input", updateListIfNeeded);

function checkCentresAndNotifyIfNeed(vaccineCentres) {
  const availableCentreList = (vaccineCentres.centers || []).reduce(
    (acc, obj) => {
      for (let session of obj.sessions) {
        if (session.available_capacity > 0) {
          acc.push(obj.name);
        }
      }

      return acc;
    },
    []
  );

  if (availableCentreList.length) {
    notify(
      "Vaccine Available",
      `Vaccines are available now at ${availableCentreList.join(", ")}`
    );
  }
}

if (isValidPin(storage.getItem("pinNumber"))) {
  pinNumberInput.value = storage.getItem("pinNumber");
  updateCentreList(pinNumberInput.value);
  if (storage.getItem("pinNumber") === "true") {
    intervalHandle = setInterval(() => {
      getVacineCentresByDistrictIdAndDate(
        pinNumberInput.value,
        currentDate()
      ).then(checkCentresAndNotifyIfNeed);
    }, UPDATE_INTERVAL);
  }
}

notifySwitch.addEventListener("change", (event) => {
  if (event.currentTarget.checked) {
    storage.setItem("notitificationEnabled", "true");

    intervalHandle = setInterval(() => {
      getVacineCentresByDistrictIdAndDate(
        pinNumberInput.value,
        currentDate()
      ).then(checkCentresAndNotifyIfNeed);
    }, UPDATE_INTERVAL);
  } else {
    clearInterval(intervalHandle);
    storage.setItem("notitificationEnabled", "false");
  }
});

function notify(title, description) {
  if (!("Notification" in window)) {
  } else if (Notification.permission === "granted") {
    new Notification(title, { body: description });
  } else if (Notification.permission !== "denied") {
    Notification.requestPermission().then(function (permission) {
      if (permission === "granted") {
        new Notification(title, { body: description });
      }
    });
  }
}
