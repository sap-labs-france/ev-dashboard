import { Component } from '@angular/core';
import { AbstractControl, UntypedFormGroup } from '@angular/forms';

import { SettingsOcpiEndpointsTableDataSource } from './settings-ocpi-endpoints-table-data-source';

@Component({
  selector: 'app-settings-ocpi-endpoints',
  templateUrl: 'settings-ocpi-endpoints.component.html',
  providers: [SettingsOcpiEndpointsTableDataSource],
})
export class SettingsOcpiEndpointsComponent {
  public formGroup!: UntypedFormGroup;
  public name!: AbstractControl;
  public countryCode!: AbstractControl;
  public partyID!: AbstractControl;

  // eslint-disable-next-line no-useless-constructor
  public constructor(
    public settingsOcpiEndpointsTableDataSource: SettingsOcpiEndpointsTableDataSource
  ) {}
}
