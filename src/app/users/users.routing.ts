import { Routes } from '@angular/router';

import { UserComponent } from './user/user.component';
import { AuthenticationGuard } from '../authentication/authentication-guard';

export const UserRoutes: Routes = [
    // { path: '', component: UsersComponent, canActivate: [AuthenticationGuard] },
    // { path: 'users', component: UsersComponent, canActivate: [AuthenticationGuard] },
    { path: 'user', component: UserComponent, canActivate: [AuthenticationGuard] },
    { path: 'user/:id', component: UserComponent, canActivate: [AuthenticationGuard] }
];
