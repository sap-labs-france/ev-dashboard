import {User} from '../../../common.types';
import {userStatuses} from '../users.model';
import {Constants} from '../../../utils/Constants';
import {Component, Input, Pipe, PipeTransform} from '@angular/core';
import {CellContentTemplateComponent} from 'app/shared/table/cell-content-template/cell-content-template.component';

const TYPE_PRIMARY = 'chip-primary';
const TYPE_DEFAULT = 'chip-default';
const TYPE_INFO = 'chip-info';
const TYPE_SUCCESS = 'chip-success';
const TYPE_DANGER = 'chip-danger';
const TYPE_WARNING = 'chip-warning';
const TYPE_GREY = 'chip-grey';

@Component({
  selector: 'app-log-level-chip',
  template: `
    <mat-chip-list [selectable]="false">
      <mat-chip [ngClass]="row.status | appFormatUserStatus:'class'" [disabled]="true">
        {{row.status | appFormatUserStatus:'text' | translate}}
      </mat-chip>
    </mat-chip-list>
  `
})
export class UserStatusComponent extends CellContentTemplateComponent {
  @Input() row: User;
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
  }

  buildUserStatusClasses(status: string): string {
    let classNames = 'chip-width-5em ';
    switch (status) {
      case Constants.USER_STATUS_ACTIVE:
        classNames += TYPE_SUCCESS;
        break;

      case Constants.USER_STATUS_PENDING:
        classNames += TYPE_WARNING;
        break;

      case Constants.USER_STATUS_BLOCKED:
      case Constants.USER_STATUS_DELETED:
      case Constants.USER_STATUS_LOCKED:
      case Constants.USER_STATUS_INACTIVE:
        classNames += TYPE_DANGER;
        break;

      default:
        classNames += TYPE_DEFAULT;
    }
    return classNames;
  }

  buildUserStatusText(status: string): string {
    for (const userStatus of userStatuses) {
      if (userStatus.key === status) {
        return userStatus.value
      }
    }
  }
}
