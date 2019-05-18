import {Component} from '@angular/core';
import {AbstractControl, FormGroup} from '@angular/forms';
import {EndpointsDataSource} from './settings-ocpi-source-table';

@Component({
  selector: 'app-settings-ocpi-endpoints',
  templateUrl: 'settings-ocpi.component.html'
})
export class SettingsOcpiEndpointsComponent {
  public isAdmin;
  public formGroup: FormGroup;
  public name: AbstractControl;
  public country_code: AbstractControl;
  public party_id: AbstractControl;

  constructor(
    public endpointsDataSource: EndpointsDataSource) {
  }
}
