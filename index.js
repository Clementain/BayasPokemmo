/**
 * @format
 */

import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';
import notifee, { EventType } from '@notifee/react-native';

notifee.onForegroundEvent(({ type, detail }) => {
    switch (type) {
        case EventType.DISMISSED:
            console.log('Notificación descartada', detail.notification);
            break;
        case EventType.PRESS:
            console.log('Notificación presionada', detail.notification);
            // Aquí puedes manejar la acción de la notificación, como redirigir al usuario a una pantalla específica
            break;
    }
});

AppRegistry.registerComponent(appName, () => App);
