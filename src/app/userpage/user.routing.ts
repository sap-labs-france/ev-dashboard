import { Routes } from '@angular/router';

import { UserComponent } from './user.component';

export const UserRoutes: Routes = [
    {

      path: '',
      children: [ {
        path: 'pages/user',
        component: UserComponent
    }]
}
];
