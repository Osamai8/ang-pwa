import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class NotificationService {
    async showNotification(title: string, options?: NotificationOptions): Promise<void> {
        if (!('Notification' in window)) {
            return;
        }

        if (!window.isSecureContext) {
            return;
        }

        let permission = Notification.permission;

        // Request permission if not yet determined
        if (permission === 'default') {
            permission = await Notification.requestPermission();
        }

        if (permission !== 'granted') {
            return;
        }

        // Try Service Worker notification first (works even when page is not active)
        // Skip if no service worker is registered (e.g., in dev mode)
        if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
            try {
                // Check if service worker is ready quickly
                const registration = await Promise.race([
                    navigator.serviceWorker.ready,
                    new Promise((_, reject) =>
                        setTimeout(() => reject(new Error('Service worker ready timeout')), 1000)
                    )
                ]) as ServiceWorkerRegistration | null;

                if (registration) {
                    await registration.showNotification(title, {
                        ...options,
                        badge: '/icons/icon-72x72.png',
                        icon: options?.icon || '/icons/icon-72x72.png',
                        tag: 'offline-form-submitted',
                        requireInteraction: false,
                        silent: false,
                        vibrate: [200, 100, 200]
                    } as any);
                    return;
                }
            } catch (swError) {
                // Fall through to regular notification
            }
        }

        // Fallback to regular notification
        try {
            const notificationOptions: NotificationOptions = {
                ...options,
                badge: '/icons/icon-72x72.png',
                icon: options?.icon || '/icons/icon-72x72.png',
                tag: 'offline-form-submitted',
                requireInteraction: false,
                silent: false,
                dir: 'auto'
            };

            const notification = new Notification(title, notificationOptions);

            notification.onclick = () => {
                window.focus();
                notification.close();
            };

            // Auto close after 10 seconds
            setTimeout(() => {
                notification.close();
            }, 10000);
        } catch (error) {
            // Silently fail
        }
    }
}

