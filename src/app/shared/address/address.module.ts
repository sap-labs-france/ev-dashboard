export class FooterModule {
}

import {NgModule} from '@angular/core';
import {AddressComponent} from './address.component';
import {CommonModule} from '@angular/common';
import {ReactiveFormsModule} from '@angular/forms';
import {TranslateModule} from '@ngx-translate/core';
import {GooglePlaceModule} from 'ngx-google-places-autocomplete';
import {MaterialModule} from '../../app.module';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TranslateModule,
    MaterialModule,
    GooglePlaceModule
  ],
  declarations: [
    AddressComponent
  ],
  exports: [
    AddressComponent
  ]
})
export class AddressModule {
}
