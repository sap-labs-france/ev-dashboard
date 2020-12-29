import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

import { TechnicalSettingsComponent } from './technical-settings.component';
import { TechnicalSettingsRoutes } from './technical-settings.routing';

@NgModule({
  declarations: [TechnicalSettingsComponent],
  imports: [
    CommonModule,
    RouterModule.forChild(TechnicalSettingsRoutes),
    TranslateModule
  ]
})
export class TechnicalSettingsModule { }
