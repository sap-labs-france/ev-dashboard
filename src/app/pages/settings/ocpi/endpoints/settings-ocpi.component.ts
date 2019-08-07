import { Component } from '@angular/core';
import { AbstractControl, FormGroup } from '@angular/forms';
import { SettingsOcpiTableDataSource } from './settings-ocpi-table-data-source';

@Component({
  selector: 'app-settings-ocpi',
  templateUrl: 'settings-ocpi.component.html'
})
export class SettingsOcpiComponent {
  public isAdmin;
  public formGroup: FormGroup;
  public name: AbstractControl;
  public countryCode: AbstractControl;
  public partyID: AbstractControl;

  constructor(
    public settingsOcpiTableDataSource: SettingsOcpiTableDataSource) {
  }
}
