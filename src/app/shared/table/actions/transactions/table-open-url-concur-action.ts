import { TransactionButtonAction } from '../../../../types/Transaction';
import { TableOpenURLAction, TableOpenURLActionDef } from '../table-open-url-action';

export class TableOpenURLConcurAction extends TableOpenURLAction {
  // Return an action
  public getActionDef(): TableOpenURLActionDef {
    return {
      ...super.getActionDef(),
      id: TransactionButtonAction.OPEN_CONCUR_URL,
      name: 'general.open_in_concur',
    };
  }
}
