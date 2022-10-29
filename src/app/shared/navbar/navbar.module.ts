import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
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
