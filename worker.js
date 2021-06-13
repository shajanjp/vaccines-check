let intervalHandle;
const API_BASE_URL = "https://cdn-api.co-vin.in/api/v2";

function getVacineCentresByDistrictIdAndDate(pincode, date) {
  return fetch(
    `${API_BASE_URL}/appointment/sessions/public/calendarByPin?pincode=${pincode}&date=${date}`
  ).then((res) => {
    return res.json();
  });
}

onmessage = function ({ data }) {
  switch (data.type) {
    case "UPDATE_VACCINE_CRON": {
      checkPeriodicallyAndUpdateView(data.data);
      break;
    }

    case "STOP_VACCINE_CRON": {
      clearInterval(intervalHandle);
      break;
    }

    case "UPDATE_VACCINES": {
      checkAndUpdateView(data.data);
      break;
    }
  }
};

function checkAndUpdateView({ pincode, date }) {
  getVacineCentresByDistrictIdAndDate(pincode, date).then((data) => {
    postMessage({
      type: "VACCINE_UPDATED",
      centers: data.centers,
    });
  });
}

function checkPeriodicallyAndUpdateView({ pincode, date }) {
  getVacineCentresByDistrictIdAndDate(pincode, date).then((data) => {
    postMessage({
      type: "VACCINE_UPDATED",
      centers: data.centers,
    });
  });
  clearInterval(intervalHandle);
  intervalHandle = setInterval(() => {
    getVacineCentresByDistrictIdAndDate(pincode, date).then((data) => {
      postMessage({
        type: "VACCINE_UPDATED",
        centers: data.centers,
      });
    });
  }, 10000);
}

function notify(title = "", description = "") {
  if (Notification.permission === "granted") {
    new Notification(title, { body: description });
  } else if (Notification.permission !== "denied") {
    Notification.requestPermission().then(function (permission) {
      if (permission === "granted") {
        new Notification(title, { body: description });
      }
    });
  }
}

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
