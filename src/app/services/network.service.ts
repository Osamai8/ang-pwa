import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { FormSubmissionService } from './form-submission.service';

@Injectable({ providedIn: 'root' })
export class NetworkService {
    private isOnlineSubject = new BehaviorSubject<boolean>(navigator.onLine);
    isOnline$: Observable<boolean> = this.isOnlineSubject.asObservable();

    constructor(private formSubmissionService: FormSubmissionService) { }

    init(): void {
        // set initial
        this.isOnlineSubject.next(navigator.onLine);

        window.addEventListener('online', () => {
            this.isOnlineSubject.next(true);
            // trigger retries when we come online
            this.formSubmissionService.retryPendingSubmissions();
        });

        window.addEventListener('offline', () => {
            this.isOnlineSubject.next(false);
        });
    }
}


