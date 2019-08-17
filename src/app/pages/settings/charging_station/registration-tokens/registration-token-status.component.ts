import { Component, Input, Pipe, PipeTransform } from '@angular/core';
import { CellContentTemplateComponent } from 'app/shared/table/cell-content-template/cell-content-template.component';
import * as moment from 'moment';
import { RegistrationToken } from '../../../../common.types';
import { Constants } from '../../../../utils/Constants';

@Component({
  template: `
    <mat-chip-list [selectable]="false">
      <mat-chip [ngClass]="row | appRegistrationTokenStatus:'class'" [disabled]="true">
          {{row | appRegistrationTokenStatus:'text' | translate}}
      </mat-chip>
    </mat-chip-list>
  `
})
export class RegistrationTokenStatusComponent extends CellContentTemplateComponent {
  @Input() row: RegistrationToken;
}

@Pipe({name: 'appRegistrationTokenStatus'})
export class AppRegistrationTokenStatusPipe implements PipeTransform {
  transform(registrationToken: RegistrationToken, type: string): string {
    if (type === 'class') {
      return this.buildStatusClasses(registrationToken);
    }
    if (type === 'text') {
      return this.buildStatusText(registrationToken);
    }
  }

  buildStatusClasses(registrationToken: RegistrationToken): string {
    let classNames = 'chip-width-5em ';
    if (this.isExpired(registrationToken)) {
      classNames += Constants.CHIP_TYPE_DANGER;
    } else if (this.isRevoked(registrationToken)) {
      classNames += Constants.CHIP_TYPE_WARNING;
    } else {
      classNames += Constants.CHIP_TYPE_SUCCESS;
    }
    return classNames;
  }

  buildStatusText(registrationToken: RegistrationToken): string {
    if (this.isExpired(registrationToken)) {
      return 'settings.charging_station.registration_token_expired';
    }
    if (this.isRevoked(registrationToken)) {
      return 'settings.charging_station.registration_token_revoked';
    }
    return 'settings.charging_station.registration_token_valid';
  }

  private isExpired(registrationToken: RegistrationToken): boolean {
      return registrationToken.expirationDate && moment().isAfter(registrationToken.expirationDate);
  }

  private isRevoked(registrationToken: RegistrationToken): boolean {
    return registrationToken.revocationDate && moment().isAfter(registrationToken.revocationDate);
  }
}
