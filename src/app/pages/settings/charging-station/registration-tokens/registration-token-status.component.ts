import { Component, Input, Pipe, PipeTransform } from '@angular/core';
import { CellContentTemplateComponent } from 'app/shared/table/cell-content-template/cell-content-template.component';
import { ChipType } from 'app/types/GlobalType';
import { RegistrationToken } from 'app/types/RegistrationToken';
import * as moment from 'moment';

@Component({
  template: `
    <mat-chip-list [selectable]="false">
      <mat-chip [ngClass]="row | appRegistrationTokenStatus:'class'" [disabled]="true">
          {{row | appRegistrationTokenStatus:'text' | translate}}
      </mat-chip>
    </mat-chip-list>
  `,
})
export class RegistrationTokenStatusComponent extends CellContentTemplateComponent {
  @Input() row!: RegistrationToken;
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
    return '';
  }

  buildStatusClasses(registrationToken: RegistrationToken): string {
    let classNames = 'chip-width-5em ';
    if (this.isExpired(registrationToken)) {
      classNames += ChipType.DANGER;
    } else if (this.isRevoked(registrationToken)) {
      classNames += ChipType.WARNING;
    } else {
      classNames += ChipType.SUCCESS;
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
    // @ts-ignore
    return registrationToken.expirationDate && moment().isAfter(registrationToken.expirationDate);
  }

  private isRevoked(registrationToken: RegistrationToken): boolean {
    // @ts-ignore
    return registrationToken.revocationDate && moment().isAfter(registrationToken.revocationDate);
  }
}
