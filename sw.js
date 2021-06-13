self.addEventListener('install', (e) => {});
self.addEventListener('fetch', (e) => {});
console.log("from service worker init");

self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'MSG_ID') {
      console.log("revieved message from main thread");
    }
});

function sendMessageToWindow(data){
    self.clients.matchAll({}).then(function (clients) {
        if (clients && clients.length) {
            clients[0].postMessage(data);
        }
    });
}

setTimeout(() => {
    console.log("sending sendMessageToWindow");
sendMessageToWindow({type: 'MSG_ID'});
}, 5000)