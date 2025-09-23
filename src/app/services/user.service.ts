import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User, CreateUserRequest } from '../models/user.model';

@Injectable({
    providedIn: 'root'
})
export class UserService {
    private baseUrl = 'https://68d222cdcc7017eec5429b8e.mockapi.io';

    constructor(private http: HttpClient) { }

    getUsers(): Observable<User[]> {
        return this.http.get<User[]>(`${this.baseUrl}/get-users`);
    }

    createUser(userData: CreateUserRequest): Observable<User> {
        return this.http.post<User>(`${this.baseUrl}/get-users`, userData);
    }

    generateRandomAvatar(): string {
        const randomId = Math.floor(Math.random() * 70) + 1; // 1-70 range
        return `https://i.pravatar.cc/150?img=${randomId}`;
    }
}
