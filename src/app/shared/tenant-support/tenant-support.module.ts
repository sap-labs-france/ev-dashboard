export class FooterModule {
}

import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { GooglePlaceModule } from 'ngx-google-places-autocomplete';

import { MaterialModule } from '../../app.module';
import { TenantSupportComponent } from './tenant-support.component';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TranslateModule,
    MaterialModule,
    GooglePlaceModule,
  ],
  declarations: [
    TenantSupportComponent,
  ],
  exports: [
    TenantSupportComponent,
  ],
})
export class TenantSupportModule {
}
