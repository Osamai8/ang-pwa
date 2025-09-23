// form-submission.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BackgroundSyncService } from './background-sync.service';
import { SwUpdate } from '@angular/service-worker';
import { UserService } from './user.service';
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
        private userService: UserService
    ) { }

    async submitForm(formData: any): Promise<any> {
        if (navigator.onLine) {
            // Online: Submit immediately
            return firstValueFrom(this.userService.createUser(formData));
        } else {
            // Offline: Store for later submission
            const submissionId = await this.backgroundSync.storeFormData(formData);

            // Register background sync
            if ('serviceWorker' in navigator && 'SyncManager' in window) {
                const registration = await navigator.serviceWorker.ready;
                await (registration as any).sync.register('form-submission');
            }

            return { offline: true, id: submissionId, message: 'Form stored for offline submission' };
        }
    }

    // Retry pending submissions when online
    async retryPendingSubmissions(): Promise<void> {
        const pendingSubmissions = await this.backgroundSync.getPendingSubmissions();

        console.log('Pending submissions:', pendingSubmissions);
        for (const submission of pendingSubmissions) {
            try {
                await firstValueFrom(this.userService.createUser(submission));
                await this.backgroundSync.removeSubmission(submission.id);

                // Show success notification
                this.showNotification('Form submitted successfully!', {
                    body: `Your offline form was submitted.`,
                    icon: '/assets/icons/icon-72x72.png'
                });
            } catch (error) {
                console.error('Failed to submit pending form:', error);
            }
        }
    }

    private showNotification(title: string, options?: NotificationOptions): void {
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification(title, options);
        }
    }
}