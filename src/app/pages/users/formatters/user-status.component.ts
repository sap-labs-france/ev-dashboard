import {TableColumnDef, User} from '../../../common.types';
import {CellContentTemplateComponent} from '../../../shared/table/cell-content-template/cell-content-template.component';
import {userStatuses} from '../users.model';
import {Constants} from '../../../utils/Constants';
import {ChipComponent, TYPE_DANGER, TYPE_DEFAULT, TYPE_SUCCESS, TYPE_WARNING} from '../../../shared/component/chip/chip.component';
import {Component, Input, OnInit} from '@angular/core';

@Component({
  selector: 'app-log-level-chip',
  styleUrls: ['../../../shared/component/chip/chip.component.scss'],
  templateUrl: '../../../shared/component/chip/chip.component.html'
})
export class UserStatusComponent extends ChipComponent implements CellContentTemplateComponent, OnInit {

  @Input() row: User;

   ngOnInit(): void {
     // Called after the constructor, initializing input properties, and the first call to ngOnChanges.
     // Add 'implements OnInit' to the class.
    for (const userStatus of userStatuses) {
      if (userStatus.key === this.row.status) {
        this.text = userStatus.value
      }
    }
    this.type = 'chip-width-5em ';
    switch (this.row.status) {
      case Constants.USER_STATUS_ACTIVE:
        this.type += TYPE_SUCCESS;
        break;

      case Constants.USER_STATUS_PENDING:
        this.type += TYPE_WARNING;
        break;

      case Constants.USER_STATUS_BLOCKED:
      case Constants.USER_STATUS_DELETED:
      case Constants.USER_STATUS_LOCKED:
      case Constants.USER_STATUS_INACTIVE:
        this.type += TYPE_DANGER;
        break;

      default:
        this.type += TYPE_DEFAULT;
    }
  }
}
