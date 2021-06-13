let intervalHandle;
const API_BASE_URL = "https://cdn-api.co-vin.in/api/v2";
const UPDATE_INTERVAL = 30000;

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
      sessions: flattenCenterSessions(data.centers),
    });
  });
}

function checkPeriodicallyAndUpdateView({ pincode, date }) {
  getVacineCentresByDistrictIdAndDate(pincode, date).then((data) => {
    postMessage({
      type: "VACCINE_UPDATED",
      sessions: flattenCenterSessions(data.centers),
    });
  });
  clearInterval(intervalHandle);
  intervalHandle = setInterval(() => {
    getVacineCentresByDistrictIdAndDate(pincode, date).then((data) => {
      postMessage({
        type: "VACCINE_UPDATED",
        sessions: flattenCenterSessions(data.centers),
      });
      checkCentresAndNotifyIfNeed(data.centers)
    });
  }, UPDATE_INTERVAL);
}

function flattenCenterSessions(centers = []) {
  const sessions = centers.reduce((acc, center) => {
    acc.push(
      ...center.sessions.map((session) => {
        return {
          ...session,
          center: {
            center_id: center.center_id,
            name: center.name,
            address: center.address,
            state_name: center.state_name,
            district_name: center.district_name,
            block_name: center.block_name,
            pincode: center.pincode,
            from: center.from,
            to: center.to,
            fee_type: center.fee_type,
          },
        };
      })
    );

    return acc;
  }, []).sort((a,b) => {
    return b.available_capacity - a.available_capacity;
  })

  return sessions;
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

function checkCentresAndNotifyIfNeed(centers) {
  const availableCentreList = (centers || []).reduce(
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
      `Vaccines are available now at ${availableCentreList[0]} and other centers`
    );
    postMessage({
      type: 'PLAY_BEEP'
    })
  }
}
