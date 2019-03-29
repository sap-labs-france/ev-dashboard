import { Routes } from '@angular/router';
import { RouteGuardService } from '../../services/route-guard.service';
import {TemplateComponent} from './template.component'

export const TemplateRoutes: Routes = [
    { path: '', component: TemplateComponent, canActivate: [RouteGuardService] }
];
