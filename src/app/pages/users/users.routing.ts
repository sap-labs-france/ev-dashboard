import { Routes } from '@angular/router';

import { UserComponent } from './user/user.component';
import { RouteGuardService } from '../../service/route-guard.service';

export const UserRoutes: Routes = [
    // { path: '', component: UsersComponent, canActivate: [RouteGuardService] },
    // { path: 'users', component: UsersComponent, canActivate: [RouteGuardService] },
    { path: 'user', component: UserComponent, canActivate: [RouteGuardService] },
    { path: 'user/:id', component: UserComponent, canActivate: [RouteGuardService] }
];
