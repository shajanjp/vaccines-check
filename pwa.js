const installButton = document.getElementById("install-button");

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("./sw.js").then(function () {
    console.log("Service Worker Registered");
  });
}

let deferredPrompt;

if (window.matchMedia("(display-mode: standalone)").matches) {
  installButton.style.display = "none";
}

window.addEventListener("beforeinstallprompt", (e) => {
  e.preventDefault();
  deferredPrompt = e;
  installButton.addEventListener("click", (e) => {
    deferredPrompt.prompt();
    deferredPrompt.userChoice.then((choiceResult) => {
      deferredPrompt = null;
    });
  });
});
