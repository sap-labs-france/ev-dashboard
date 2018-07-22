import { Routes } from '@angular/router';

import { UserComponent } from './user.component';
import { AuthenticationGuard } from '../authentication/authentication-guard';

export const UserRoutes: Routes = [
    {
        path: '',
        children: [
            { path: 'user', component: UserComponent, canActivate: [ AuthenticationGuard ] }]
    }
];
