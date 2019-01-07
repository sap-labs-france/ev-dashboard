// tslint:disable-next-line:max-line-length
import {Component, Input, OnInit, Injectable, ViewChildren, QueryList, ElementRef, ViewChild, AfterViewInit, Output, EventEmitter} from '@angular/core';
import {Charger, ConnectorSchedule, ScheduleSlot} from '../../../../../common.types';
import {LocaleService} from '../../../../../services/locale.service';
import {Router} from '@angular/router';
import {MatDialog, MatDialogConfig} from '@angular/material';
import {TranslateService} from '@ngx-translate/core';
import {CentralServerService} from '../../../../../services/central-server.service';
import {SpinnerService} from '../../../../../services/spinner.service';
import {AuthorizationService} from '../../../../../services/authorization-service';
import {MessageService} from '../../../../../services/message.service';
import {Utils} from '../../../../../utils/Utils';
import {ChargingStations} from '../../../../../utils/ChargingStations';
import {Constants} from '../../../../../utils/Constants';
import {MatSlider} from '@angular/material/slider';
import {DialogService} from '../../../../../services/dialog.service';
import {AppUnitPipe} from '../../../../../shared/formatters/app-unit.pipe'
import {SmartChargingPowerSliderComponent} from '../smart-charging-power-slider.component';
import {SmartChargingUtils} from '../smart-charging-utils';

const MIN_POWER = 3000; // Minimum power in W under which we can't go
const LIMIT_FOR_STEP_CHANGE = 10000;  // Limit in W for which we are changing the step of the slider
const SMALL_SLIDER_STEP = 500;
const LARGE_SLIDER_STEP = 1000;
const DISPLAY_UNIT = 'kW';

@Component({
  selector: 'app-smart-charging-simple-limit',
  templateUrl: './smart-charging-simple-limit.html'
})
@Injectable()
export class SmartChargingSimpleLimitComponent implements OnInit, AfterViewInit {
  @Input() charger: Charger;
  @Output() onApplyPlanning = new EventEmitter<any>();
  private messages;
  public userLocales;
  public isAdmin;

  public powerUnit;
  public compositeSchedule;
  public hasNoActivePlanning = true;
  public hasNoCompositeResultAccepted = true;
  public startScheduleDate: Date;
  public endScheduleDate: Date;
  public minChargingRate: number;
  public internalFormatCurrentLimit: number;
  public currentDisplayedLimit: number;
  public limitPlanning: ConnectorSchedule[] = [];
  displayedColumns: string[] = ['from', 'to', 'limit'];

  private powerDigitPrecision = 2;
  private powerFloatingPrecision = 0;

  @ViewChild('powerSlider') powerSliderComponent: SmartChargingPowerSliderComponent;

  constructor(
    private authorizationService: AuthorizationService,
    private centralServerService: CentralServerService,
    private messageService: MessageService,
    private spinnerService: SpinnerService,
    private translateService: TranslateService,
    private localeService: LocaleService,
    private dialog: MatDialog,
    private router: Router,
    private dialogService: DialogService,
    private appUnitFormatter: AppUnitPipe) {

    // Check auth
    if (!authorizationService.canUpdateChargingStation({'id': 'charger.id'})) {
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
    // Initialize slider values
    this.powerUnit = (this.charger.powerLimitUnit ? this.charger.powerLimitUnit : Constants.OCPP_UNIT_WATT)
    // For small charger increase display precision
    if (this.charger.maximumPower < 10000) {
      this.powerDigitPrecision = 1;
      this.powerFloatingPrecision = 2;
    }
  }

  ngAfterViewInit(): void {
    // Initialize slider
//    this.powerSliderComponent.setSliderValue(this.internalFormatCurrentLimit, 'W');
  }

  public applyPowerLimit() {
    // show yes/no dialog
    const self = this;
    this.dialogService.createAndShowYesNoDialog(
      this.dialog,
      this.translateService.instant('chargers.smart_charging.power_limit_title'),
      this.translateService.instant('chargers.smart_charging.power_limit_confirm',
                                    {'chargeBoxID': this.charger.id, 'power': this.powerSliderComponent.getDisplayedValue('kW')})
    ).subscribe((result) => {
      if (result === Constants.BUTTON_TYPE_YES) {
        // call REST service
        // tslint:disable-next-line:max-line-length
        this.centralServerService.chargingStationLimitPower(this.charger, 0, this.powerUnit, this.powerSliderComponent.powerSliderValue, 0).subscribe(response => {
            if (response.status === Constants.OCPP_RESPONSE_ACCEPTED) {
              // success + reload
              this.messageService.showSuccessMessage(this.translateService.instant('chargers.smart_charging.power_limit_success'),
                                          {'chargeBoxID': self.charger.id, 'power': this.powerSliderComponent.getDisplayedValue('kW')});
              this.onApplyPlanning.emit();
            } else {
              Utils.handleError(JSON.stringify(response),
                this.messageService, this.translateService.instant('chargers.smart_charging.power_limit_error'));
            }
          }, (error) => {
            this.spinnerService.hide();
            this.dialog.closeAll();
            Utils.handleHttpError(error, this.router, this.messageService, this.centralServerService,
              this.translateService.instant('chargers.smart_charging.power_limit_error'));
          });
      }
    });
  }

  public limitChanged(newValue) {
    this.internalFormatCurrentLimit = newValue;
//    this.powerSliderComponent.powerSliderValue = newValue;
    this.powerSliderComponent.setSliderValue(this.internalFormatCurrentLimit, 'W');
  }

}
