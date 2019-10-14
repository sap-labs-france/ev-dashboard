import { KeyValue } from '../../common.types';
import { Constants } from '../../utils/Constants';

export const userStatuses: KeyValue[] = [
  {key: 'A', value: 'users.status_active'},
  {key: 'B', value: 'users.status_blocked'},
  {key: 'I', value: 'users.status_inactive'},
  {key: 'L', value: 'users.status_locked'},
  {key: 'P', value: 'users.status_pending'},
];

export class UserRoles {
  public static getAvailableRoles(role: string): KeyValue[] {
    if (role === Constants.ROLE_SUPER_ADMIN) {
      return [
        {key: 'S', value: 'users.role_super_admin'},
      ];
    }
    return [
      {key: 'A', value: 'users.role_admin'},
      {key: 'B', value: 'users.role_basic'},
      {key: 'D', value: 'users.role_demo'},
    ];
  }
}
