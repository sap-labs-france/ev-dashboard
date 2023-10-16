import { Component, EventEmitter, Input, OnChanges, OnInit, Output } from '@angular/core';
import {
  AbstractControl,
  UntypedFormArray,
  UntypedFormControl,
  UntypedFormGroup,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { CentralServerService } from 'services/central-server.service';
import { ComponentService } from 'services/component.service';
import { MessageService } from 'services/message.service';
import { SpinnerService } from 'services/spinner.service';
import { QrCodeDialogComponent } from 'shared/dialogs/qr-code/qr-code-dialog.component';
import { CONNECTOR_TYPE_MAP } from 'shared/formatters/app-connector-type.pipe';
import {
  ChargePoint,
  ChargingStation,
  Connector,
  CurrentType,
  OCPPPhase,
  Voltage,
} from 'types/ChargingStation';
import { Image } from 'types/GlobalType';
import { TenantComponents } from 'types/Tenant';
import { Utils } from 'utils/Utils';

@Component({
  selector: 'app-charging-station-connector',
  templateUrl: 'charging-station-connector.component.html',
})
export class ChargingStationConnectorComponent implements OnInit, OnChanges {
  @Input() public chargingStation!: ChargingStation;
  @Input() public connector!: Connector;
  @Input() public chargePoint!: ChargePoint;
  @Input() public formConnectorsArray: UntypedFormArray;
  @Input() public isPublic!: boolean;
  @Input() public readOnly: boolean;
  @Input() public manualConfiguration!: boolean;
  @Output() public connectorChanged = new EventEmitter<any>();

  public ocpiActive: boolean;
  public connectorTypeMap = CONNECTOR_TYPE_MAP;
  public connectedPhaseMap = [
    { key: 1, description: 'chargers.single_phase' },
    { key: 3, description: 'chargers.tri_phases' },
  ];
  public currentTypeMap = [
    { key: CurrentType.AC, description: 'chargers.alternating_current' },
    { key: CurrentType.DC, description: 'chargers.direct_current' },
  ];
  public phaseAssignmentToGridMapThreePhased = [
    {
      description: 'chargers.phase_combinations.three_phased.cs_1_g_1',
      phaseAssignmentToGrid: {
        csPhaseL1: OCPPPhase.L1,
        csPhaseL2: OCPPPhase.L2,
        csPhaseL3: OCPPPhase.L3,
      },
    },
    {
      description: 'chargers.phase_combinations.three_phased.cs_1_g_2',
      phaseAssignmentToGrid: {
        csPhaseL1: OCPPPhase.L2,
        csPhaseL2: OCPPPhase.L3,
        csPhaseL3: OCPPPhase.L1,
      },
    },
    {
      description: 'chargers.phase_combinations.three_phased.cs_1_g_3',
      phaseAssignmentToGrid: {
        csPhaseL1: OCPPPhase.L3,
        csPhaseL2: OCPPPhase.L1,
        csPhaseL3: OCPPPhase.L2,
      },
    },
  ];
  public phaseAssignmentToGridMapSinglePhased = [
    {
      description: 'chargers.phase_combinations.single_phased.cs_1_g_1',
      phaseAssignmentToGrid: { csPhaseL1: OCPPPhase.L1, csPhaseL2: null, csPhaseL3: null },
    },
    {
      description: 'chargers.phase_combinations.single_phased.cs_1_g_2',
      phaseAssignmentToGrid: { csPhaseL1: OCPPPhase.L2, csPhaseL2: null, csPhaseL3: null },
    },
    {
      description: 'chargers.phase_combinations.single_phased.cs_1_g_3',
      phaseAssignmentToGrid: { csPhaseL1: OCPPPhase.L3, csPhaseL2: null, csPhaseL3: null },
    },
  ];
  public phaseAssignmentToGridMap = this.phaseAssignmentToGridMapThreePhased;
  public initialized = false;

  public formConnectorGroup: UntypedFormGroup;
  public connectorID!: AbstractControl;
  public type!: AbstractControl;
  public power!: AbstractControl;
  public voltage!: AbstractControl;
  public amperage!: AbstractControl;
  public amperagePerPhase!: AbstractControl;
  public numberOfConnectedPhase!: AbstractControl;
  public currentType!: AbstractControl;
  public phaseAssignmentToGrid!: AbstractControl;
  public tariffID: AbstractControl;

  public constructor(
    private dialog: MatDialog,
    private componentService: ComponentService,
    private centralServerService: CentralServerService,
    private spinnerService: SpinnerService,
    private router: Router,
    private messageService: MessageService
  ) {
    this.ocpiActive = this.componentService.isActive(TenantComponents.OCPI);
  }

  public ngOnInit() {
    // Init connectors
    this.formConnectorGroup = new UntypedFormGroup({
      connectorId: new UntypedFormControl(this.connector.connectorId),
      type: new UntypedFormControl(
        '',
        Validators.compose([Validators.required, Validators.pattern('^[^U]*$')])
      ),
      power: new UntypedFormControl(
        0,
        Validators.compose([
          Validators.required,
          Validators.min(1),
          Validators.pattern('^[+]?[0-9]*$'),
        ])
      ),
      voltage: new UntypedFormControl(
        Voltage.VOLTAGE_230,
        Validators.compose([
          Validators.required,
          Validators.min(1),
          Validators.pattern('^[+]?[0-9]*$'),
        ])
      ),
      amperage: new UntypedFormControl(
        0,
        Validators.compose([
          Validators.required,
          Validators.min(1),
          Validators.pattern('^[+]?[0-9]*$'),
          this.amperagePhaseValidator.bind(this),
        ])
      ),
      amperagePerPhase: new UntypedFormControl(
        0,
        Validators.compose([
          Validators.required,
          Validators.min(1),
          Validators.pattern('^[+]?[0-9]*$'),
        ])
      ),
      numberOfConnectedPhase: new UntypedFormControl(3, Validators.compose([Validators.required])),
      phaseAssignmentToGrid: new UntypedFormControl('', Validators.compose([Validators.required])),
      currentType: new UntypedFormControl(CurrentType.AC),
      tariffID: new UntypedFormControl(null, Validators.compose([Validators.maxLength(36)])),
    });
    // Add to form array
    this.formConnectorsArray.push(this.formConnectorGroup);
    // Form
    this.type = this.formConnectorGroup.controls['type'];
    this.power = this.formConnectorGroup.controls['power'];
    this.voltage = this.formConnectorGroup.controls['voltage'];
    this.amperage = this.formConnectorGroup.controls['amperage'];
    this.amperagePerPhase = this.formConnectorGroup.controls['amperagePerPhase'];
    this.currentType = this.formConnectorGroup.controls['currentType'];
    this.numberOfConnectedPhase = this.formConnectorGroup.controls['numberOfConnectedPhase'];
    this.phaseAssignmentToGrid = this.formConnectorGroup.controls['phaseAssignmentToGrid'];
    this.tariffID = this.formConnectorGroup.controls['tariffID'];
    this.phaseAssignmentToGrid.enable();
    if (this.readOnly) {
      this.type.disable();
      this.voltage.disable();
      this.amperagePerPhase.disable();
      this.numberOfConnectedPhase.disable();
    }
    this.initialized = true;
    this.loadConnector();
  }

  public ngOnChanges() {
    this.loadConnector();
  }

  public loadConnector() {
    if (this.initialized && this.connector && this.formConnectorGroup) {
      const chargePoint = Utils.getChargePointFromID(
        this.chargingStation,
        this.connector.chargePointID
      );
      // Update connector values
      this.type.setValue(this.connector.type);
      this.power.setValue(
        Utils.getChargingStationPower(
          this.chargingStation,
          this.chargePoint,
          this.connector.connectorId
        )
      );
      this.voltage.setValue(
        Utils.getChargingStationVoltage(
          this.chargingStation,
          this.chargePoint,
          this.connector.connectorId
        )
      );
      this.amperage.setValue(
        Utils.getChargingStationAmperage(
          this.chargingStation,
          this.chargePoint,
          this.connector.connectorId
        )
      );
      this.currentType.setValue(
        Utils.getChargingStationCurrentType(
          this.chargingStation,
          this.chargePoint,
          this.connector.connectorId
        )
      );
      this.numberOfConnectedPhase.setValue(
        Utils.getNumberOfConnectedPhases(
          this.chargingStation,
          chargePoint,
          this.connector.connectorId
        )
      );
      if (this.numberOfConnectedPhase.value === 1) {
        this.phaseAssignmentToGridMap = this.phaseAssignmentToGridMapSinglePhased;
      } else {
        this.phaseAssignmentToGridMap = this.phaseAssignmentToGridMapThreePhased;
      }
      if (this.connector.phaseAssignmentToGrid) {
        this.phaseAssignmentToGrid.setValue(
          this.phaseAssignmentToGridMap[
            this.phaseAssignmentToGridMap.findIndex(
              (phaseAssignmentToGridMap) =>
                phaseAssignmentToGridMap.phaseAssignmentToGrid.csPhaseL1 ===
                this.connector.phaseAssignmentToGrid.csPhaseL1
            )
          ].phaseAssignmentToGrid
        );
      }
      this.amperagePerPhase.setValue(
        (this.amperage.value as number) / (this.numberOfConnectedPhase.value as number)
      );
      if (this.chargePoint && !this.manualConfiguration) {
        this.formConnectorGroup.disable();
        if (!this.readOnly) {
          this.phaseAssignmentToGrid.enable();
        }
      } else {
        this.formConnectorGroup.enable();
        this.power.disable();
        this.amperage.disable();
        this.refreshPower();
        this.refreshNumberOfPhases();
      }
      this.tariffID.enable();
      if (this.connector.tariffID) {
        this.tariffID.setValue(this.connector.tariffID);
      }
    }
  }

  public refreshPower() {
    if ((this.amperage.value as number) > 0 && (this.voltage.value as number) > 0) {
      this.power.setValue(
        Math.floor((this.amperage.value as number) * (this.voltage.value as number))
      );
    } else {
      this.power.setValue(0);
    }
    this.connectorChanged.emit();
  }

  public refreshNumberOfPhases() {
    if (this.currentType.value === CurrentType.DC) {
      this.numberOfConnectedPhase.setValue(3);
      this.phaseAssignmentToGridMap = this.phaseAssignmentToGridMapThreePhased;
      this.phaseAssignmentToGrid.setValue(this.phaseAssignmentToGridMap[0].phaseAssignmentToGrid);
      this.numberOfConnectedPhase.disable();
      this.amperage.updateValueAndValidity();
    } else {
      this.numberOfConnectedPhase.enable();
      this.phaseAssignmentToGrid.enable();
      if (this.numberOfConnectedPhase.value === 1) {
        this.phaseAssignmentToGridMap = this.phaseAssignmentToGridMapSinglePhased;
      } else {
        this.phaseAssignmentToGridMap = this.phaseAssignmentToGridMapThreePhased;
      }
    }
  }

  public refreshTotalAmperage() {
    if ((this.amperagePerPhase.value as number) > 0) {
      this.amperage.setValue(
        (this.amperagePerPhase.value as number) * (this.numberOfConnectedPhase.value as number)
      );
    } else {
      this.amperage.setValue(0);
    }
    this.connectorChanged.emit();
  }

  public currentTypeChanged() {
    this.refreshNumberOfPhases();
    this.refreshTotalAmperage();
  }

  public generateQRCode() {
    this.spinnerService.show();
    this.centralServerService
      .getConnectorQrCode(this.chargingStation.id, this.connector.connectorId)
      .subscribe({
        next: (qrCode: Image) => {
          this.spinnerService.hide();
          if (qrCode) {
            // Create the dialog
            const dialogConfig = new MatDialogConfig();
            dialogConfig.minWidth = '70vw';
            dialogConfig.minHeight = '70vh';
            dialogConfig.disableClose = false;
            dialogConfig.panelClass = 'transparent-dialog-container';
            // Set data
            dialogConfig.data = {
              qrCode: qrCode.image,
              connectorID: this.connector.connectorId,
              chargingStationID: this.chargingStation.id,
            };
            // Disable outside click close
            dialogConfig.disableClose = true;
            // Open
            this.dialog
              .open(QrCodeDialogComponent, dialogConfig)
              .afterClosed()
              .subscribe((result) => {});
          }
        },
        error: (error) => {
          this.spinnerService.hide();
          Utils.handleHttpError(
            error,
            this.router,
            this.messageService,
            this.centralServerService,
            'chargers.qr_code_generation_error'
          );
        },
      });
  }

  public amperageChanged() {
    this.refreshTotalAmperage();
    this.refreshPower();
  }

  public voltageChanged() {
    this.refreshPower();
  }

  public emptyStringToNull(control: AbstractControl) {
    Utils.convertEmptyStringToNull(control);
  }

  public numberOfConnectedPhaseChanged() {
    this.refreshTotalAmperage();
    this.refreshPower();
    this.amperage.updateValueAndValidity();
    if (this.numberOfConnectedPhase.value === 1) {
      this.phaseAssignmentToGridMap = this.phaseAssignmentToGridMapSinglePhased;
    } else {
      this.phaseAssignmentToGridMap = this.phaseAssignmentToGridMapThreePhased;
    }
    this.phaseAssignmentToGrid.setValue(null);
  }

  private amperagePhaseValidator(amperageControl: AbstractControl): ValidationErrors | null {
    if (
      !amperageControl.value ||
      (amperageControl.value as number) % (this.numberOfConnectedPhase.value as number) === 0
    ) {
      return null;
    }
    return { amperagePhases: true };
  }
}
