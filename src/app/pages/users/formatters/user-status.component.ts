import {TableColumnDef, User} from '../../../common.types';
import {CellContentTemplateComponent} from '../../../shared/table/cell-content-template/cell-content-template.component';
import {userStatuses} from '../users.model';
import {Constants} from '../../../utils/Constants';
import {ChipComponent, TYPE_DANGER, TYPE_INFO, TYPE_SUCCESS, TYPE_WARNING} from '../../../shared/component/chip/chip.component';

export class UserStatusComponent extends ChipComponent implements CellContentTemplateComponent {
  /**
   * setData
   */
  setData(user: User, columndef: TableColumnDef) {
    for (const userStatus of userStatuses) {
      if (userStatus.key === user.status) {
        this.text = userStatus.value
      }
    }
    switch (user.status) {
      case Constants.USER_STATUS_ACTIVE:
        this.type = TYPE_SUCCESS;
        break;

      case Constants.USER_STATUS_PENDING:
        this.type = TYPE_WARNING;
        break;

      case Constants.USER_STATUS_BLOCKED:
      case Constants.USER_STATUS_DELETED:
      case Constants.USER_STATUS_LOCKED:
      case Constants.USER_STATUS_INACTIVE:
        this.type = TYPE_DANGER;
        break;

      default:
        this.type = TYPE_INFO;
    }
  }
}
