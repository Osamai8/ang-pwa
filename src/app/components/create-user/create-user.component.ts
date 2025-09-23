import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { UserService } from '../../services/user.service';
import { CreateUserRequest } from '../../models/user.model';

@Component({
    selector: 'app-create-user',
    standalone: true,
    imports: [CommonModule, FormsModule, RouterModule],
    templateUrl: './create-user.component.html',
    styleUrl: './create-user.component.css'
})
export class CreateUserComponent {
    userName = '';

    loading = false;
    success = false;
    error: string | null = null;
    generatedAvatar = '';
    showToaster = false;

    constructor(private userService: UserService, private router: Router) {
        this.generateNewAvatar();
    }

    generateNewAvatar() {
        this.generatedAvatar = this.userService.generateRandomAvatar();
    }

    onSubmit() {
        if (!this.userName.trim()) {
            this.error = 'Name is required';
            return;
        }

        this.loading = true;
        this.error = null;
        this.success = false;

        const userData: CreateUserRequest = {
            name: this.userName.trim(),
            avatar: this.generatedAvatar,
            createdAt: new Date().toISOString(),
            id: Math.floor(Math.random() * 1000)
        };

        this.userService.createUser(userData).subscribe({
            next: (response) => {
                this.loading = false;
                this.success = true;
                this.showToaster = true;
                this.userName = '';
                this.generateNewAvatar();
                console.log('User created successfully:', response);

                // Show toaster for 2 seconds then redirect
                setTimeout(() => {
                    this.router.navigate(['/']);
                }, 2000);
            },
            error: (error) => {
                this.loading = false;
                this.error = 'Failed to create user';
                console.error('Error creating user:', error);
            }
        });
    }

    resetForm() {
        this.userName = '';
        this.generateNewAvatar();
        this.error = null;
        this.success = false;
        this.showToaster = false;
    }

    dismissToaster() {
        this.showToaster = false;
        this.router.navigate(['/']);
    }
}
