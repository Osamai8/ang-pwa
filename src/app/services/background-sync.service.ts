import { Injectable } from "@angular/core";
import { SwUpdate } from '@angular/service-worker';
@Injectable({
    providedIn: 'root'
})
export class BackgroundSyncService {
    private dbName = 'OfflineUsersDB';
    private dbVersion = 1;
    private storeName = 'pendingUsers';
    constructor(
        private swUpdate: SwUpdate
    ) { }

    // inititalize the database
    private async initDB(): Promise<IDBDatabase> {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.dbVersion);
            request.onerror = (event) => reject(event);
            request.onsuccess = () => resolve(request.result);

            request.onupgradeneeded = (event) => {
                const db = (event.target as IDBOpenDBRequest).result as IDBDatabase;
                if (!db.objectStoreNames.contains(this.storeName)) {
                    db.createObjectStore(this.storeName, { keyPath: 'id', autoIncrement: true });
                }
            };
        })
    }

    // store form data when offline
    async storeFormData(formData: any): Promise<number> {
        const db = await this.initDB();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction([this.storeName], 'readwrite');
            const store = transaction.objectStore(this.storeName);
            const request = store.add({
                ...formData,
                timestamp: new Date().toISOString(),
                status: 'pending'
            });
            request.onsuccess = () => resolve(request.result as number);
            request.onerror = () => reject(request.error);
        });
    }

    // Get all pending submissions
    async getPendingSubmissions(): Promise<any[]> {
        const db = await this.initDB();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction([this.storeName], 'readonly');
            const store = transaction.objectStore(this.storeName);
            const request = store.getAll();

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    // Remove submitted form
    async removeSubmission(id: number): Promise<void> {
        const db = await this.initDB();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction([this.storeName], 'readwrite');
            const store = transaction.objectStore(this.storeName);
            const request = store.delete(id);

            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }



}