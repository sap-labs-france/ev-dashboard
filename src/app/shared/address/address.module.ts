export class FooterModule {}

import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { GooglePlaceModule } from 'ngx-google-places-autocomplete';

import { MaterialModule } from '../../app.module';
import { AddressComponent } from './address.component';

@NgModule({
  imports: [CommonModule, ReactiveFormsModule, TranslateModule, MaterialModule, GooglePlaceModule],
  declarations: [AddressComponent],
  exports: [AddressComponent],
})
export class AddressModule {}
