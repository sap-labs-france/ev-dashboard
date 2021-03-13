import { Component } from '@angular/core';
import { AbstractControl, FormGroup } from '@angular/forms';

import { SettingsOicpEndpointsTableDataSource } from './settings-oicp-endpoints-table-data-source';

@Component({
  selector: 'app-settings-oicp-endpoints',
  templateUrl: './settings-oicp-endpoints.component.html',
})
export class SettingsOicpEnpointsComponent {
  public isAdmin!: boolean;
  public formGroup!: FormGroup;
  public name!: AbstractControl;
  public countryCode!: AbstractControl;
  public partyID!: AbstractControl;

  constructor(
    public settingsOicpEndpointsTableDataSource: SettingsOicpEndpointsTableDataSource) {
  }
}
