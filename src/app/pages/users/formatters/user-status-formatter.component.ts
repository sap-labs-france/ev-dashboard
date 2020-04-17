import { Component, Input, Pipe, PipeTransform } from '@angular/core';
import { CellContentTemplateComponent } from 'app/shared/table/cell-content-template/cell-content-template.component';
import { ChipType } from 'app/types/GlobalType';
import { User, UserStatus } from 'app/types/User';
import { userStatuses } from '../model/users.model';

@Component({
  selector: 'app-user-status-formatter',
  template: `
    <mat-chip-list [selectable]="false">
      <mat-chip [ngClass]="row.status | appFormatUserStatus:'class'" [disabled]="true">
        {{row.status | appFormatUserStatus:'text' | translate}}
      </mat-chip>
    </mat-chip-list>
  `,
})
export class UserStatusFormatterComponent extends CellContentTemplateComponent {
  @Input() row!: User;
}

@Pipe({name: 'appFormatUserStatus'})
export class AppFormatUserStatusPipe implements PipeTransform {
  transform(userStatus: string, type: string): string {
    if (type === 'class') {
      return this.buildUserStatusClasses(userStatus);
    }
    if (type === 'text') {
      return this.buildUserStatusText(userStatus);
    }
    return '';
  }

  buildUserStatusClasses(status: string): string {
    let classNames = 'chip-width-5em ';
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

  buildUserStatusText(status: string): string {
    for (const userStatus of userStatuses) {
      if (userStatus.key === status) {
        return userStatus.value;
      }
    }
    return '';
  }
}
