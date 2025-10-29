// form-submission.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BackgroundSyncService } from './background-sync.service';
import { SwUpdate } from '@angular/service-worker';
import { UserService } from './user.service';
import { NotificationService } from './notification.service';
import { firstValueFrom } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class FormSubmissionService {
    private apiUrl = '/api/submit-form';

    constructor(
        private http: HttpClient,
        private backgroundSync: BackgroundSyncService,
        private swUpdate: SwUpdate,
        private userService: UserService,
        private notificationService: NotificationService
    ) { }

    async submitForm(formData: any): Promise<any> {
        if (navigator.onLine) {
            try {
                // Online: Submit immediately
                return await firstValueFrom(this.userService.createUser(formData));
            } catch (error: any) {
                // Network error - fall back to offline storage
                // Continue to offline logic below
            }
        }

        // Offline: Store for later submission
        const submissionId = await this.backgroundSync.storeFormData(formData);

        // Register background sync (non-blocking)
        this.registerBackgroundSync().catch(() => {
            // Silently fail
        });

        return { offline: true, id: submissionId, message: 'Form stored for offline submission' };
    }

    private async registerBackgroundSync(): Promise<void> {
        if (!('serviceWorker' in navigator) || !('SyncManager' in window)) {
            return;
        }

        try {
            // Check if service worker is registered
            if (!navigator.serviceWorker.controller) {
                return;
            }

            // Add timeout to prevent hanging
            const timeoutPromise = new Promise((_, reject) =>
                setTimeout(() => reject(new Error('Service worker ready timeout')), 2000)
            );

            const registration = await Promise.race([
                navigator.serviceWorker.ready,
                timeoutPromise
            ]) as ServiceWorkerRegistration;

            if (registration && (registration as any).sync) {
                await (registration as any).sync.register('form-submission');
            }
        } catch (syncError) {
            // Silently fail
        }
    }

    // Retry pending submissions when online
    async retryPendingSubmissions(): Promise<void> {
        if (!navigator.onLine) {
            return;
        }

        // Small delay to ensure network is fully restored
        await new Promise(resolve => setTimeout(resolve, 500));

        const pendingSubmissions = await this.backgroundSync.getPendingSubmissions();

        if (!pendingSubmissions || pendingSubmissions.length === 0) {
            return;
        }

        for (const submission of pendingSubmissions) {
            try {
                // Remove metadata fields before submitting
                const { timestamp, status, id: dbId, ...cleanSubmission } = submission;

                await firstValueFrom(this.userService.createUser(cleanSubmission));
                await this.backgroundSync.removeSubmission(submission.id);

                // Ensure window is focused (some browsers require focus for notifications)
                if (document.hasFocus && !document.hasFocus()) {
                    window.focus();
                    // Wait a bit for focus
                    await new Promise(resolve => setTimeout(resolve, 100));
                }

                // Show success notification
                await this.notificationService.showNotification('Form submitted successfully!', {
                    body: `Your offline form was submitted.`,
                    icon: '/icons/icon-72x72.png'
                });
            } catch (error) {
                // Don't remove from DB if submission failed - will retry next time
            }
        }
    }
}