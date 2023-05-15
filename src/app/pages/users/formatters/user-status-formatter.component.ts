import { Component, Input, Pipe, PipeTransform } from '@angular/core';

import { USER_STATUSES } from '../../../shared/model/users.model';
import { CellContentTemplateDirective } from '../../../shared/table/cell-content-template/cell-content-template.directive';
import { ChipType } from '../../../types/GlobalType';
import { User, UserStatus } from '../../../types/User';

@Component({
  selector: 'app-user-status-formatter',
  template: `
    <mat-chip-list [selectable]="false">
      <mat-chip [ngClass]="row.status | appFormatUserStatus : 'class'" [disabled]="true">
        {{ row.status | appFormatUserStatus : 'text' | translate }}
      </mat-chip>
    </mat-chip-list>
  `,
})
export class UserStatusFormatterComponent extends CellContentTemplateDirective {
  @Input() public row!: User;
}

@Pipe({ name: 'appFormatUserStatus' })
export class AppFormatUserStatusPipe implements PipeTransform {
  public transform(userStatus: string, type: string): string {
    if (type === 'class') {
      return this.buildUserStatusClasses(userStatus);
    }
    if (type === 'text') {
      return this.buildUserStatusText(userStatus);
    }
    return '';
  }

  public buildUserStatusClasses(status: string): string {
    let classNames = 'chip-width-8em ';
    switch (status) {
      case UserStatus.ACTIVE:
        classNames += ChipType.SUCCESS;
        break;

      case UserStatus.PENDING:
        classNames += ChipType.WARNING;
        break;

      case UserStatus.BLOCKED:
      case UserStatus.DELETED:
      case UserStatus.LOCKED:
      case UserStatus.INACTIVE:
        classNames += ChipType.DANGER;
        break;

      default:
        classNames += ChipType.DEFAULT;
    }
    return classNames;
  }

  public buildUserStatusText(status: string): string {
    for (const userStatus of USER_STATUSES) {
      if (userStatus.key === status) {
        return userStatus.value;
      }
    }
    return '';
  }
}
