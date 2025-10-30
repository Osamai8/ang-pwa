import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { UserService } from '../../services/user.service';
import { CreateUserRequest } from '../../models/user.model';
import { FormSubmissionService } from '../../services/form-submission.service';
import { NetworkService } from '../../services/network.service';
import { Observable } from 'rxjs';

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
    toasterType: 'success' | 'offline' = 'success';

    isOnline$!: Observable<boolean>;

    constructor(private userService: UserService, private router: Router, private formSubmissionService: FormSubmissionService, private networkService: NetworkService) {
        this.generateNewAvatar();
        this.isOnline$ = this.networkService.isOnline$;
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
        this.offlineMessage = '';

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
                this.toasterType = 'offline';
                this.showToaster = true;
                this.userName = '';
                this.generateNewAvatar();
            } else {
                this.offlineMessage = 'Form submitted successfully!';
                this.toasterType = 'success';
                this.showToaster = true;
                this.userName = '';
                this.generateNewAvatar();
                setTimeout(() => {
                    this.router.navigate(['/']);
                }, 2000);
            }

        } catch (error) {
            this.error = 'Failed to create user';
        }
        finally {
            this.loading = false;
        }
    }

    resetForm() {
        this.userName = '';
        this.generateNewAvatar();
        this.error = null;
        this.success = false;
        this.showToaster = false;
        this.offlineMessage = '';
    }

    dismissToaster() {
        this.showToaster = false;
        this.offlineMessage = '';
        if (this.toasterType === 'success') {
            this.router.navigate(['/']);
        }
    }
}
