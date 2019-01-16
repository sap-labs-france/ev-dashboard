// tslint:disable-next-line:max-line-length
import { Component, Input, OnInit, Injectable, ViewChildren, QueryList, ElementRef, ViewChild, AfterViewInit, Output, EventEmitter } from '@angular/core';
import { Charger, ConnectorSchedule, ScheduleSlot } from 'app/common.types';
import { LocaleService } from 'app/services/locale.service';
import { Router } from '@angular/router';
import { MatDialog, MatDialogConfig } from '@angular/material';
import { TranslateService } from '@ngx-translate/core';
import { CentralServerService } from 'app/services/central-server.service';
import { SpinnerService } from 'app/services/spinner.service';
import { AuthorizationService } from 'app/services/authorization-service';
import { MessageService } from 'app/services/message.service';
import { Utils } from 'app/utils/Utils';
import { Constants } from 'app/utils/Constants';
import { DialogService } from 'app/services/dialog.service';


@Component({
  selector: 'app-get-diagnostics',
  templateUrl: './get-diagnostics.html'
})
@Injectable()
export class ChargingStationGetDiagnosticsComponent implements OnInit, AfterViewInit {
  @Input() charger: Charger;
  private messages;
  public userLocales;
  public isAdmin;

  public fileURL = '';
  public fileName: 'No file';

  constructor(
    private authorizationService: AuthorizationService,
    private centralServerService: CentralServerService,
    private messageService: MessageService,
    private spinnerService: SpinnerService,
    private translateService: TranslateService,
    private localeService: LocaleService,
    private dialog: MatDialog,
    private router: Router,
    private dialogService: DialogService) {

    // Check auth
    if (!authorizationService.canUpdateChargingStation({ 'id': 'charger.id' })) {
      // Not authorized
      this.router.navigate(['/']);
    }
    // Get translated messages
    this.translateService.get('chargers', {}).subscribe((messages) => {
      this.messages = messages;
    });
    // Get Locales
    this.userLocales = this.localeService.getLocales();
    // Admin?
    this.isAdmin = this.authorizationService.isAdmin() || this.authorizationService.isSuperAdmin();
  }

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
  }

  changeURL(event) {
    this.fileURL = event.target.value;
  }

  triggerAction() {
    // show yes/no dialog
    const self = this;
    this.dialogService.createAndShowYesNoDialog(
      this.dialog,
      this.translateService.instant('chargers.more_actions.get_diagnostics_dialog_title'),
      this.translateService.instant('chargers.more_actions.get_diagnostics_dialog_confirm', { 'chargeBoxID': this.charger.id })
    ).subscribe((result) => {
      if (result === Constants.BUTTON_TYPE_YES) {
        try {
          // call REST service
          const date = new Date();
          date.setHours(0, 0, 0, 0);
          // tslint:disable-next-line:max-line-length
          this.centralServerService.actionChargingStation('ChargingStationGetDiagnostics', this.charger.id, `{ "location" : "${this.fileURL}", "startTime": "${date.toISOString()}"}`).subscribe(response => {
            if (response.fileName && response.fileName.length > 0) {
              this.fileName = response.fileName;
              // success + reload
              this.messageService.showSuccessMessage(this.translateService.instant('chargers.more_actions.get_diagnostics_success',
                { 'chargeBoxID': self.charger.id }));
            } else {
              Utils.handleError(JSON.stringify(response),
                this.messageService, this.translateService.instant('chargers.more_actions.get_diagnostics_error'));
            }
          }, (error) => {
            this.spinnerService.hide();
            this.dialog.closeAll();
            Utils.handleHttpError(error, this.router, this.messageService, this.centralServerService,
              this.translateService.instant('chargers.more_actions.get_diagnostics_error'));
          });
        } catch (error) {
          Utils.handleError(JSON.stringify(error),
            this.messageService, this.translateService.instant('chargers.more_actions.get_diagnostics_error'));
        }
      }
    });
  }
}
