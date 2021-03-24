import { Component } from '@angular/core';
import { AbstractControl, FormGroup } from '@angular/forms';

import { SettingsOcpiEndpointsTableDataSource } from './settings-ocpi-endpoints-table-data-source';

@Component({
  selector: 'app-settings-ocpi-endpoints',
  templateUrl: './settings-ocpi-endpoints.component.html',
})
export class SettingsOcpiEnpointsComponent {
  public isAdmin!: boolean;
  public formGroup!: FormGroup;
  public name!: AbstractControl;
  public countryCode!: AbstractControl;
  public partyID!: AbstractControl;

  constructor(
    public settingsOcpiEnpointsTableDataSource: SettingsOcpiEndpointsTableDataSource) {
  }
}
