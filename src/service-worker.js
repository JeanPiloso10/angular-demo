self.addEventListener('install', function(event) {
    console.log('Service Worker instalado');
});

self.addEventListener('push', function(event) {
    const data = event.data.json();

    console.log(data.notificationTag);
    const options = {
        body: data.mensaje,
        icon: '/assets/img/brand/logo_vertical.svg',
        data: {
            url: `/#${data.urlNotificacionPush}` // Asegúrate de incluir el hash si usas HashLocationStrategy
        }
    };

    event.waitUntil(
        self.registration.showNotification(data.titulo, options)
    );
});


self.addEventListener('notificationclick', function(event) {
    event.notification.close(); // Cierra la notificación

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(clientList) {
            for (let i = 0; i < clientList.length; i++) {
                let client = clientList[i];
                if (client.url === event.notification.data.url && 'focus' in client) {
                    return client.focus();
                }
            }

            if (clients.openWindow) {
                return clients.openWindow(event.notification.data.url);
            }
        })
    );
});