import { Entity } from './Authorization';

export default interface ChangeNotification {
  tenantID: string;
  entity: Entity;
  action?: Notification;
}
