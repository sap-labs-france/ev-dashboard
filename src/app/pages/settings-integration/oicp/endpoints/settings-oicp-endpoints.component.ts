import { Component } from '@angular/core';
import { AbstractControl, FormGroup } from '@angular/forms';

import { SettingsOicpEndpointsTableDataSource } from './settings-oicp-endpoints-table-data-source';

@Component({
  selector: 'app-settings-oicp-endpoints',
  templateUrl: './settings-oicp-endpoints.component.html',
})
export class SettingsOicpEndpointsComponent {
  public isAdmin!: boolean;
  public formGroup!: FormGroup;
  public name!: AbstractControl;
  public countryCode!: AbstractControl;
  public partyID!: AbstractControl;

  // eslint-disable-next-line no-useless-constructor
  public constructor(
    public settingsOicpEndpointsTableDataSource: SettingsOicpEndpointsTableDataSource) {}
}
