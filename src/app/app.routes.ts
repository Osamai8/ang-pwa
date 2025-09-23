import { Routes } from '@angular/router';
import { UserListComponent } from './components/user-list/user-list.component';
import { CreateUserComponent } from './components/create-user/create-user.component';

export const routes: Routes = [
    { path: '', component: UserListComponent },
    { path: 'create-user', component: CreateUserComponent },
    { path: '**', redirectTo: '' }
];
