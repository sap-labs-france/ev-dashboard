import { Component } from '@angular/core';
import { AbstractControl, UntypedFormGroup } from '@angular/forms';

import { SettingsOicpEndpointsTableDataSource } from './settings-oicp-endpoints-table-data-source';

@Component({
  selector: 'app-settings-oicp-endpoints',
  templateUrl: 'settings-oicp-endpoints.component.html',
})
export class SettingsOicpEndpointsComponent {
  public formGroup!: UntypedFormGroup;
  public name!: AbstractControl;
  public countryCode!: AbstractControl;
  public partyID!: AbstractControl;

  // eslint-disable-next-line no-useless-constructor
  public constructor(
    public settingsOicpEndpointsTableDataSource: SettingsOicpEndpointsTableDataSource
  ) {}
}
