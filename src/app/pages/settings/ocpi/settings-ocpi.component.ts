import {Component} from '@angular/core';
import {AbstractControl} from '@angular/forms';
import {ComponentEnum, ComponentService} from '../../../services/component.service';

@Component({
  selector: 'app-settings-ocpi',
  templateUrl: 'settings-ocpi.component.html'
})
export class SettingsOcpiComponent {
  public isAdmin;
  // public formGroup: FormGroup;
  public name: AbstractControl;
  public countryCode: AbstractControl;
  public partyID: AbstractControl;
  public isOcpiActive = false;

  constructor(
      private componentService: ComponentService) {
    this.isOcpiActive = this.componentService.isActive(ComponentEnum.OCPI);
  }
}
