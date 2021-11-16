import { TransactionButtonAction } from '../../../../types/Transaction';
import { TableOpenURLAction, TableOpenURLActionDef } from '../table-open-url-action';

export class TableOpenURLRefundAction extends TableOpenURLAction {
  // Return an action
  public getActionDef(): TableOpenURLActionDef {
    return {
      ...super.getActionDef(),
      id: TransactionButtonAction.OPEN_REFUND_URL,
      name: 'general.open_refunding_system',
    };
  }
}
