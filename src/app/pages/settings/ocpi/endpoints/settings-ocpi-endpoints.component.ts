import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { AuthorizationService } from '../../../../services/authorization-service';
import { AbstractControl, FormControl, FormGroup, Validators } from '@angular/forms';
import { EndpointsDataSource} from './settings-ocpi-endpoints-source-table';

@Component({
  selector: 'app-settings-ocpi-endpoints',
  templateUrl: 'settings-ocpi-endpoints.component.html'
})
export class SettingsOcpiEndpointsComponent implements OnInit {
  public isAdmin;
  public formGroup: FormGroup;
  public name: AbstractControl;
  public country_code: AbstractControl;
  public party_id: AbstractControl;

  private readonly currentBusinessDetails: any;

  constructor(
    public endpointsDataSource: EndpointsDataSource,
    private authorizationService: AuthorizationService,
    private translateService: TranslateService
  ) {

  }

  ngOnInit(): void {
  }
}
