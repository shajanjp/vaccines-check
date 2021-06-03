const API_BASE_URL = "https://cdn-api.co-vin.in/api/v2";
const centresContainer = document.getElementById("centres-rows");
const pinNumberInput = document.getElementById("pinNumber");
const storage = window.localStorage;

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
        return `<tr style="color: ${
          session.available_capacity === 0 ? "#ff5722" : "#1fab89"
        }">
            <td>${session.date}</td>
            <td>${centre.name}</td>
            <td>${centre.district_name}</td>
            <td>${session.vaccine}</td>
            <td>${session.available_capacity}</td>
            <td>${session.available_capacity_dose1}</td> 
            <td>${session.available_capacity_dose2}</td> 
            <td>${session.min_age_limit}</td>
            <td>${centre.fee_type}</td>
        </tr>`;
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

  setInterval(() => {
    getVacineCentresByDistrictIdAndDate(
      pinNumberInput.value,
      currentDate()
    ).then(checkCentresAndNotifyIfNeed);
  }, 300000);
}

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
