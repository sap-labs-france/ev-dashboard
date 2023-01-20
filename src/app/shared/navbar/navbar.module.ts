import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatLegacySlideToggleModule as MatSlideToggleModule } from '@angular/material/legacy-slide-toggle';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

import { NavbarComponent } from './navbar.component';

@NgModule({
  imports: [
    RouterModule,
    CommonModule,
    MatButtonModule, // Cannot access MaterialModule from app module (not yet initialized)
    MatSlideToggleModule, // Cannot access MaterialModule from app module (not yet initialized)
    TranslateModule
  ],
  declarations: [NavbarComponent],
  exports: [NavbarComponent],
})

export class NavbarModule {
}
