import { Component } from '@angular/core';
import { AbstractControl, FormGroup } from '@angular/forms';

import { SettingsOcpiEndpointsTableDataSource } from './settings-ocpi-endpoints-table-data-source';

@Component({
  selector: 'app-settings-ocpi-endpoints',
  templateUrl: './settings-ocpi-endpoints.component.html',
})
export class SettingsOcpiEndpointsComponent {
  public isAdmin!: boolean;
  public formGroup!: FormGroup;
  public name!: AbstractControl;
  public countryCode!: AbstractControl;
  public partyID!: AbstractControl;

  // eslint-disable-next-line no-useless-constructor
  public constructor(
    public settingsOcpiEndpointsTableDataSource: SettingsOcpiEndpointsTableDataSource) {}
}
