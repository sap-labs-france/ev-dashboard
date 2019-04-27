import {Component, OnInit} from '@angular/core';
import {AbstractControl, FormGroup} from '@angular/forms';
import {EndpointsDataSource} from './settings-ocpi-source-table';

@Component({
  selector: 'app-settings-ocpi-endpoints',
  templateUrl: 'settings-ocpi.component.html',
  providers: [
    EndpointsDataSource
  ]
})
export class SettingsOcpiEndpointsComponent implements OnInit {
  public isAdmin;
  public formGroup: FormGroup;
  public name: AbstractControl;
  public country_code: AbstractControl;
  public party_id: AbstractControl;
  private readonly currentBusinessDetails: any;

  constructor(
    public endpointsDataSource: EndpointsDataSource
  ) {

  }

  ngOnInit(): void {
  }
}
