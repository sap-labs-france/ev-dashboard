import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { PaymentMethod } from '@stripe/stripe-js';
import { Observable } from 'rxjs';
import { AuthorizationService } from 'services/authorization.service';
import { CentralServerService } from 'services/central-server.service';
import { ComponentService } from 'services/component.service';
import { WindowService } from 'services/window.service';
import { TableCreatePaymentMethodAction, TableCreatePaymentMethodActionDef } from 'shared/table/actions/users/table-create-payment-method-action';
import { BillingButtonAction } from 'types/Billing';

import { SpinnerService } from '../../../../../services/spinner.service';
import { TableAutoRefreshAction } from '../../../../../shared/table/actions/table-auto-refresh-action';
import { TableRefreshAction } from '../../../../../shared/table/actions/table-refresh-action';
import { TableDataSource } from '../../../../../shared/table/table-data-source';
import { DataResult } from '../../../../../types/DataResult';
import { TableActionDef, TableColumnDef, TableDef, TableFilterDef } from '../../../../../types/Table';
import { PaymentMethodDialogComponent } from './payment-method/payment-method.dialog.component';

@Injectable()
export class PaymentMethodsTableDataSource extends TableDataSource<PaymentMethod> {
  public canCreatePaymentMethod: boolean;
  public currentUserID: string;
  constructor(
    public spinnerService: SpinnerService,
    public translateService: TranslateService,
    public componentService: ComponentService,
    public authorizationService: AuthorizationService,
    public windowService: WindowService,
    public activatedRoute: ActivatedRoute,
    public centralServerService: CentralServerService,
    private dialog: MatDialog) {
      super(spinnerService, translateService);
      // Init
      this.initDataSource();
  }

//   public getDataChangeSubject(): Observable<ChangeNotification> {
//     return this.centralServerNotificationService.getSubjectRegistrationTokens();
//   }

  public loadDataImpl(): Observable<DataResult<PaymentMethod>> {
    return new Observable(() => {
      // Get the Tenants
    //   this.centralServerService.getRegistrationTokens(this.buildFilterValues(),
    //     this.getPaging(), this.getSorting()).subscribe((tokens) => {
    //       observer.next(tokens);
    //       observer.complete();
    //     }, (error) => {
    //       // Show error
    //       Utils.handleHttpError(error, this.router, this.messageService, this.centralServerService, 'general.error_backend');
    //       // Error
    //       observer.error(error);
    //     });
    });
  }

  public buildTableDef(): TableDef {
    return {
      search: {
        enabled: false,
      },
      hasDynamicRowAction: true,
    };
  }

  public buildTableColumnDefs(): TableColumnDef[] {
    const columns: TableColumnDef[] = [
      {
        id: 'status',
        name: 'users.status',
        headerClass: 'col-5p text-center',
        class: 'col-5p table-cell-angular-big-component',
        sortable: true,
      },
      {
        id: 'description',
        name: 'general.description',
        headerClass: 'd-none d-xl-table-cell col-30p',
        class: 'd-none d-xl-table-cell col-30p',
      },
    ];
    return columns;
  }

  public buildTableActionsDef(): TableActionDef[] {
    const tableActionsDef = super.buildTableActionsDef();
    if (this.activatedRoute.snapshot.url[0]?.path === 'profile') {
      this.currentUserID = this.centralServerService.getLoggedUser().id;
    }
    this.canCreatePaymentMethod = this.authorizationService.canCreatePaymentMethod(this.currentUserID);
    if (this.canCreatePaymentMethod) {
      tableActionsDef.unshift(new TableCreatePaymentMethodAction().getActionDef());
    }
    return tableActionsDef;
  }

  public buildTableDynamicRowActions(paymentMethod: PaymentMethod): TableActionDef[] {
    // const asExpired = moment(registrationToken.expirationDate).isBefore(new Date());
    // const isRevoked = registrationToken.revocationDate ? true : false;
    const actions: TableActionDef[] = [];
    // const moreActions = new TableMoreAction([]);
    // const copyUrlActions: TableActionDef[] = [
    //   ...(!Utils.isUndefined(registrationToken.ocpp15SOAPUrl) ? [this.copySOAP15Action] : []),
    //   ...(!Utils.isUndefined(registrationToken.ocpp16SOAPUrl) ? [this.copySOAP16Action] : []),
    //   ...(!Utils.isUndefined(registrationToken.ocpp16JSONUrl) ? [this.copyJSON16Action] : []),
    //   ...(!Utils.isUndefined(registrationToken.ocpp15SOAPSecureUrl) ? [this.copySOAP15SecureAction] : []),
    //   ...(!Utils.isUndefined(registrationToken.ocpp16SOAPSecureUrl) ? [this.copySOAP16SecureAction] : []),
    //   ...(!Utils.isUndefined(registrationToken.ocpp16JSONSecureUrl) ? [this.copyJSON16SecureAction] : [])
    // ];
    // if (!asExpired && !isRevoked) {
    //   actions.push(new TableMultiCopyAction(
    //     copyUrlActions,
    //     'chargers.connections.copy_url_tooltip',
    //     'chargers.connections.copy_url_tooltip').getActionDef());
    // }
    // if (this.canUpdateToken) {
    //   actions.push(this.editAction);
    //   if (!asExpired && !isRevoked) {
    //     actions.push(this.revokeAction);
    //   }
    // }
    // if (this.canDeleteToken) {
    //   moreActions.addActionInMoreActions(this.deleteAction);
    // }
    // actions.push(moreActions.getActionDef());
    return actions;
  }

  public actionTriggered(actionDef: TableActionDef) {
    // Action
    switch (actionDef.id) {
      case BillingButtonAction.CREATE_PAYMENT_METHOD:
        if (actionDef.id) {
          (actionDef as TableCreatePaymentMethodActionDef).action(
            PaymentMethodDialogComponent, this.currentUserID, this.dialog, this.refreshData.bind(this));
        }
        break;
    }
  }

  public rowActionTriggered(actionDef: TableActionDef, paymentMethod: PaymentMethod) {
    // switch (actionDef.id) {
    //   case RegistrationTokenButtonAction.REVOKE_TOKEN:
    //     if (actionDef.action) {
    //       (actionDef as TableRevokeRegistrationTokenActionDef).action(
    //         registrationToken, this.dialogService, this.translateService, this.messageService,
    //         this.centralServerService, this.spinnerService, this.router, this.refreshData.bind(this));
    //     }
    //     break;
    //   case RegistrationTokenButtonAction.DELETE_TOKEN:
    //     if (actionDef.action) {
    //       (actionDef as TableDeleteRegistrationTokenActionDef).action(
    //         registrationToken, this.dialogService, this.translateService, this.messageService,
    //         this.centralServerService, this.spinnerService, this.router, this.refreshData.bind(this));
    //     }
    //     break;
    //   case RegistrationTokenButtonAction.EDIT_TOKEN:
    //     if (actionDef.action) {
    //       (actionDef as TableEditRegistrationTokenActionDef).action(
    //         paymentMethodDialogComponent, registrationToken, this.dialog, this.refreshData.bind(this))
    //     }
    //     break;
    //   case RegistrationTokenButtonAction.COPY_URL:
    //     let url: string;
    //     switch (actionDef.name) {
    //       case 'chargers.connections.ocpp_15_soap':
    //         url = registrationToken.ocpp15SOAPUrl;
    //         break;
    //       case 'chargers.connections.ocpp_16_soap':
    //         url = registrationToken.ocpp16SOAPUrl;
    //         break;
    //       case 'chargers.connections.ocpp_16_json':
    //         url = registrationToken.ocpp16JSONUrl;
    //         break;
    //       case 'chargers.connections.ocpp_15_soap_secure':
    //         url = registrationToken.ocpp15SOAPSecureUrl;
    //         break;
    //       case 'chargers.connections.ocpp_16_soap_secure':
    //         url = registrationToken.ocpp16SOAPSecureUrl;
    //         break;
    //       case 'chargers.connections.ocpp_16_json_secure':
    //         url = registrationToken.ocpp16JSONSecureUrl;
    //         break;
    //     }
    //     Utils.copyToClipboard(url);
    //     this.messageService.showInfoMessage('chargers.connections.url_copied');
    //     break;
    // }
  }

  public buildTableActionsRightDef(): TableActionDef[] {
    return [
      new TableAutoRefreshAction(false).getActionDef(),
      new TableRefreshAction().getActionDef(),
    ];
  }

  public buildTableFiltersDef(): TableFilterDef[] {
    return [];
  }
}
