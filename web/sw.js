importScripts('sw-toolbox.js');

toolbox.router.get(/.*/, toolbox.networkFirst, {
    cache: {
        name: 'mawaqit',
    }
});

// Notification.requestPermission(function(status) {
//     console.log('Notification permission status:', status);
// });
//
// function displayNotification() {
//     if (Notification.permission == 'granted') {
//         navigator.serviceWorker.getRegistration().then(function(reg) {
//             reg.showNotification('Hello world!');
//         });
//     }
// }
//
// function displayNotification() {
//     if (Notification.permission == 'granted') {
//         navigator.serviceWorker.getRegistration().then(function(reg) {
//             var options = {
//                 body: 'Here is a notification body!',
//                 icon: 'android-chrome-192x192.png',
//                 vibrate: [100, 50, 100],
//                 data: {
//                     dateOfArrival: Date.now(),
//                     primaryKey: 1
//                 }
//             };
//             reg.showNotification('Hello world!', options);
//         });
//     }
// }