/**
 * @format
 */

import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';
import notifee, { EventType } from '@notifee/react-native';

// 1. Eventos en primer plano
notifee.onForegroundEvent(({ type, detail }) => {
    switch (type) {
        case EventType.DELIVERED:
            console.log('[ForegroundEvent] Notificación entregada:', detail.notification);
            break;
        case EventType.DISMISSED:
            console.log('[ForegroundEvent] Notificación descartada:', detail.notification);
            break;
        case EventType.PRESS:
            console.log('[ForegroundEvent] Notificación presionada:', detail.notification);
            // Aquí podrías navegar a una pantalla concreta, p.ej.:
            //    NavigationService.navigate('DetalleBaya', { baya: detail.notification.data?.baya });
            break;
    }
});

// 2. Eventos en segundo plano (app en background o kill)
notifee.onBackgroundEvent(async ({ type, detail }) => {
    switch (type) {
        case EventType.DELIVERED:
            console.log('[BackgroundEvent] Notificación entregada en background:', detail.notification);
            break;
        case EventType.DISMISSED:
            console.log('[BackgroundEvent] Notificación descartada en background:', detail.notification);
            break;
        case EventType.PRESS:
            console.log('[BackgroundEvent] Notificación presionada en background:', detail.notification);
            break;
    }
});

// 3. Tarea headless para Android cold start
AppRegistry.registerHeadlessTask(
    'RNNotifeeBackgroundEvent',
    () =>
        async ({ type, detail }) => {
            if (type === EventType.DELIVERED) {
                console.log('[HeadlessTask] Notificación entregada en cold start:', detail.notification);
            }
            if (type === EventType.PRESS) {
                console.log('[HeadlessTask] Notificación presionada en cold start:', detail.notification);
            }
        }
);

// 4. Registro del componente principal
AppRegistry.registerComponent(appName, () => App);
