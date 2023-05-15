/* eslint-disable max-len */
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs';

import { CentralServerService } from '../../../../services/central-server.service';
import { DialogService } from '../../../../services/dialog.service';
import { MessageService } from '../../../../services/message.service';
import { SpinnerService } from '../../../../services/spinner.service';
import { ButtonAction, RestResponse } from '../../../../types/GlobalType';
import PricingDefinition, { PricingButtonAction } from '../../../../types/Pricing';
import { TableActionDef } from '../../../../types/Table';
import { Utils } from '../../../../utils/Utils';
import { TableDeleteAction } from '../table-delete-action';

export interface TableDeletePricingDefinitionActionDef extends TableActionDef {
  action: (
    pricingDefinition: PricingDefinition,
    dialogService: DialogService,
    translateService: TranslateService,
    messageService: MessageService,
    centralServerService: CentralServerService,
    spinnerService: SpinnerService,
    router: Router,
    refresh?: () => Observable<void>
  ) => void;
}

export class TableDeletePricingDefinitionAction extends TableDeleteAction {
  public getActionDef(): TableDeletePricingDefinitionActionDef {
    return {
      ...super.getActionDef(),
      id: PricingButtonAction.DELETE_PRICING_DEFINITION,
      action: this.deletePricingDefinition,
    };
  }

  private deletePricingDefinition(
    pricingDefinition: PricingDefinition,
    dialogService: DialogService,
    translateService: TranslateService,
    messageService: MessageService,
    centralServerService: CentralServerService,
    spinnerService: SpinnerService,
    router: Router,
    refresh?: () => Observable<void>
  ) {
    dialogService
      .createAndShowYesNoDialog(
        translateService.instant('settings.pricing.pricing_definition_delete_title'),
        translateService.instant('settings.pricing.pricing_definition_delete_confirm')
      )
      .subscribe((result) => {
        if (result === ButtonAction.YES) {
          spinnerService.show();
          centralServerService.deletePricingDefinition(pricingDefinition.id).subscribe({
            next: (response) => {
              spinnerService.hide();
              if (response.status === RestResponse.SUCCESS) {
                messageService.showSuccessMessage(
                  translateService.instant('settings.pricing.pricing_definition_delete_success')
                );
                if (refresh) {
                  refresh().subscribe();
                }
              } else {
                Utils.handleError(
                  JSON.stringify(response),
                  messageService,
                  translateService.instant('settings.pricing.pricing_definition_delete_error')
                );
              }
            },
            error: (error) => {
              spinnerService.hide();
              Utils.handleHttpError(
                error,
                router,
                messageService,
                centralServerService,
                translateService.instant('settings.pricing.pricing_definition_delete_error')
              );
            },
          });
        }
      });
  }
}
