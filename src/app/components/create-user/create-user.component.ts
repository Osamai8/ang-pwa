import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { UserService } from '../../services/user.service';
import { CreateUserRequest } from '../../models/user.model';
import { FormSubmissionService } from '../../services/form-submission.service';

@Component({
    selector: 'app-create-user',
    standalone: true,
    imports: [CommonModule, FormsModule, RouterModule],
    templateUrl: './create-user.component.html',
    styleUrl: './create-user.component.css'
})
export class CreateUserComponent {
    userName = '';
    offlineMessage = "";

    loading = false;
    success = false;
    error: string | null = null;
    generatedAvatar = '';
    showToaster = false;

    isOnline = false;

    constructor(private userService: UserService, private router: Router, private formSubmissionService: FormSubmissionService) {
        this.generateNewAvatar();
        // Listen to online/offline events
        window.addEventListener('online', () => {
            this.isOnline = true;
            this.formSubmissionService.retryPendingSubmissions();
        });

        window.addEventListener('offline', () => {
            this.isOnline = false;
        });
    }

    generateNewAvatar() {
        this.generatedAvatar = this.userService.generateRandomAvatar();
    }

    async onSubmit(): Promise<void> {
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
        try {
            const result = await this.formSubmissionService.submitForm(userData);
            if (result.offline) {
                this.offlineMessage = 'Form saved offline. Will submit when connection is restored.';
                this.userName = '';
                this.generateNewAvatar();
            } else {
                this.offlineMessage = 'Form submitted successfully!';
                this.userName = '';
                this.generateNewAvatar();
                setTimeout(() => {
                    this.router.navigate(['/']);
                }, 2000);
            }
        } catch (error) {
            this.loading = false;
            this.error = 'Failed to create user';
            console.error('Error creating user:', error);
        } finally {
            this.loading = false;
        }
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
