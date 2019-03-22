import {Component, OnInit} from '@angular/core';
import {TranslateService} from '@ngx-translate/core';
import {AuthorizationService} from '../../../services/authorization-service';
import {AbstractControl} from '@angular/forms';
import {ComponentEnum, ComponentService} from '../../../services/component.service';

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
  public isOcpiActive = false;
  private readonly currentBusinessDetails: any;

  constructor(
    private authorizationService: AuthorizationService,
    private translateService: TranslateService,
    private componentService: ComponentService,
  ) {
    this.isOcpiActive = componentService.isActive(ComponentEnum.OCPI);
  }

  ngOnInit(): void {
  }
}
