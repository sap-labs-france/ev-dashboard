import { Routes } from '@angular/router';

import { RegisterComponent } from './register/register.component';
import { RetrievePasswordComponent } from './retrieve-password/retrieve-password.component';
import { LoginComponent } from './login/login.component';

export const AuthenticationRoutes: Routes = [

    {
        path: '',
        children: [{
            path: 'login',
            component: LoginComponent
        }, {
            path: 'retrieve-password',
            component: RetrievePasswordComponent
        }, {
            path: 'register',
            component: RegisterComponent
        }]
    }
];
