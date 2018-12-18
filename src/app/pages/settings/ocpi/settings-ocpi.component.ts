import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { AuthorizationService } from '../../../services/authorization-service';
import { AbstractControl, FormControl, FormGroup, Validators } from '@angular/forms';
import { CentralServerService } from '../../../services/central-server.service';
import { Constants } from '../../../utils/Constants';

@Component({
  selector: 'app-settings-ocpi',
  templateUrl: 'settings-ocpi.component.html'
})
export class SettingsOcpiComponent implements OnInit {
  public isAdmin;
  // public formGroup: FormGroup;
  public name: AbstractControl;
  public country_code: AbstractControl;
  public party_id: AbstractControl;
  public isOcpiActive: boolean = false;
  
  private readonly currentBusinessDetails: any;

  constructor(
    private authorizationService: AuthorizationService,
    private translateService: TranslateService,
    private centralServerService: CentralServerService
  ) {
    this.isOcpiActive = centralServerService.isComponentActive(Constants.SETTINGS_OCPI);
  }

  ngOnInit(): void {
   
  }
}
