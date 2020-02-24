import { Component, Input, OnInit } from '@angular/core';
import { AbstractControl, FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { AuthorizationService } from 'app/services/authorization.service';
import { CentralServerNotificationService } from 'app/services/central-server-notification.service';
import { CentralServerService } from 'app/services/central-server.service';
import { ConfigService } from 'app/services/config.service';
import { DialogService } from 'app/services/dialog.service';
import { MessageService } from 'app/services/message.service';
import { SpinnerService } from 'app/services/spinner.service';
import { Building, BuildingLogo } from 'app/types/Building';
import { RestResponse } from 'app/types/GlobalType';
import { ButtonType } from 'app/types/Table';
import { Constants } from 'app/utils/Constants';
import { ParentErrorStateMatcher } from 'app/utils/ParentStateMatcher';
import { Utils } from 'app/utils/Utils';
import { debounceTime, mergeMap } from 'rxjs/operators';

@Component({
  selector: 'app-building',
  templateUrl: './building.component.html',
})
export class BuildingComponent implements OnInit {
  public parentErrorStateMatcher = new ParentErrorStateMatcher();
  @Input() currentBuildingID!: string;
  @Input() inDialog!: boolean;
  @Input() dialogRef!: MatDialogRef<any>;

  public isAdmin = false;
  public logo: any = BuildingLogo.NO_LOGO;
  public maxSize: number;

  public formGroup!: FormGroup;
  public id!: AbstractControl;
  public name!: AbstractControl;
  public address!: FormGroup;
  public address1!: AbstractControl;
  public address2!: AbstractControl;
  public postalCode!: AbstractControl;
  public city!: AbstractControl;
  public department!: AbstractControl;
  public region!: AbstractControl;
  public country!: AbstractControl;
  public coordinates!: FormArray;

  constructor(
    private authorizationService: AuthorizationService,
    private centralServerService: CentralServerService,
    private centralServerNotificationService: CentralServerNotificationService,
    private messageService: MessageService,
    private spinnerService: SpinnerService,
    private configService: ConfigService,
    private activatedRoute: ActivatedRoute,
    private dialog: MatDialog,
    private dialogService: DialogService,
    private translateService: TranslateService,
    private router: Router) {

    this.maxSize = this.configService.getBuilding().maxLogoKb;

    // Check auth
    if (this.activatedRoute.snapshot.params['id'] &&
      !authorizationService.canUpdateBuilding()) {
      // Not authorized
      this.router.navigate(['/']);
    }

    // get admin flag
    this.isAdmin = this.authorizationService.isAdmin() || this.authorizationService.isSuperAdmin();
  }

  ngOnInit() {
    // Init the form
    this.formGroup = new FormGroup({
      id: new FormControl(''),
      name: new FormControl('',
        Validators.compose([
          Validators.required,
        ])),
      address: new FormGroup({
        address1: new FormControl(''),
        address2: new FormControl(''),
        postalCode: new FormControl(''),
        city: new FormControl(''),
        department: new FormControl(''),
        region: new FormControl(''),
        country: new FormControl(''),
        coordinates: new FormArray ([
          new FormControl('',
            Validators.compose([
              Validators.max(180),
              Validators.min(-180),
              Validators.pattern(Constants.REGEX_VALIDATION_LONGITUDE),
            ])),
          new FormControl('',
            Validators.compose([
              Validators.max(90),
              Validators.min(-90),
              Validators.pattern(Constants.REGEX_VALIDATION_LATITUDE),
            ])),
        ]),
      }),
    });
    // Form
    this.id = this.formGroup.controls['id'];
    this.name = this.formGroup.controls['name'];
    this.address = (this.formGroup.controls['address'] as FormGroup);
    this.address1 = this.address.controls['address1'];
    this.address2 = this.address.controls['address2'];
    this.postalCode = this.address.controls['postalCode'];
    this.city = this.address.controls['city'];
    this.department = this.address.controls['department'];
    this.region = this.address.controls['region'];
    this.country = this.address.controls['country'];
    this.coordinates = this.address.controls['coordinates'] as FormArray;

    // if not admin switch in readonly mode
    if (!this.isAdmin) {
      this.formGroup.disable();
    }

    if (this.currentBuildingID) {
      this.loadBuilding();
    } else if (this.activatedRoute && this.activatedRoute.params) {
      this.activatedRoute.params.subscribe((params: Params) => {
        this.currentBuildingID = params['id'];
        this.loadBuilding();
      });
    }

    // listen to escape key
    this.dialogRef.keydownEvents().subscribe((keydownEvents) => {
      // check if escape
      if (keydownEvents && keydownEvents.code === 'Escape') {
        this.onClose();
      }
    });

    this.centralServerNotificationService.getSubjectBuilding().pipe(debounceTime(
      this.configService.getAdvanced().debounceTimeNotifMillis)).subscribe((singleChangeNotification) => {
      // Update user?
      if (singleChangeNotification && singleChangeNotification.data && singleChangeNotification.data.id === this.currentBuildingID) {
        this.loadBuilding();
      }
    });
  }

  public isOpenInDialog(): boolean {
    return this.inDialog;
  }

  public setCurrentBuildingId(currentBuildingId: string) {
    this.currentBuildingID = currentBuildingId;
  }

  public refresh() {
    // Load Building
    this.loadBuilding();
  }

  public loadBuilding() {
    if (!this.currentBuildingID) {
      return;
    }

    // Show spinner
    this.spinnerService.show();
    // Yes, get it
    this.centralServerService.getBuilding(this.currentBuildingID).pipe(mergeMap((building) => {
      this.formGroup.markAsPristine();
      // Init form
      if (building.id) {
        this.formGroup.controls.id.setValue(building.id);
      }
      if (building.name) {
        this.formGroup.controls.name.setValue(building.name);
      }
      if (building.address && building.address.address1) {
        this.address.controls.address1.setValue(building.address.address1);
      }
      if (building.address && building.address.address2) {
        this.address.controls.address2.setValue(building.address.address2);
      }
      if (building.address && building.address.postalCode) {
        this.address.controls.postalCode.setValue(building.address.postalCode);
      }
      if (building.address && building.address.city) {
        this.address.controls.city.setValue(building.address.city);
      }
      if (building.address && building.address.department) {
        this.address.controls.department.setValue(building.address.department);
      }
      if (building.address && building.address.region) {
        this.address.controls.region.setValue(building.address.region);
      }
      if (building.address && building.address.country) {
        this.address.controls.country.setValue(building.address.country);
      }
      if (building.address && building.address.coordinates && building.address.coordinates.length === 2) {
        this.coordinates.at(0).setValue(building.address.coordinates[0]);
        this.coordinates.at(1).setValue(building.address.coordinates[1]);
      }
      // Yes, get logo
      return this.centralServerService.getBuildingLogo(this.currentBuildingID);
    })).subscribe((buildingLogo) => {
      if (buildingLogo && buildingLogo.logo) {
        this.logo = buildingLogo.logo.toString();
      }
      this.spinnerService.hide();
    }, (error) => {
      // Hide
      this.spinnerService.hide();
      // Handle error
      switch (error.status) {
        // Not found
        case 550:
          // Transaction not found`
          Utils.handleHttpError(error, this.router, this.messageService, this.centralServerService, 'buildings.building_not_found');
          break;
        default:
          // Unexpected error`
          Utils.handleHttpError(error, this.router, this.messageService, this.centralServerService,
            'general.unexpected_error_backend');
      }
    });
  }

  public updateBuildingLogo(building: Building) {
    // Check no building?
    if (!this.logo.endsWith(BuildingLogo.NO_LOGO)) {
      // Set to building
      building.logo = this.logo;
    } else {
      // No logo
      delete building.logo;
    }
  }

  public saveBuilding(building: Building) {
    if (this.currentBuildingID) {
      this.updateBuilding(building);
    } else {
      this.createBuilding(building);
    }
  }

  public closeDialog(saved: boolean = false) {
    if (this.inDialog) {
      this.dialogRef.close(saved);
    }
  }

  public onClose() {
    if (this.formGroup.invalid && this.formGroup.dirty) {
      this.dialogService.createAndShowInvalidChangeCloseDialog(
        this.translateService.instant('general.change_invalid_pending_title'),
        this.translateService.instant('general.change_invalid_pending_text'),
      ).subscribe((result) => {
        if (result === ButtonType.DO_NOT_SAVE_AND_CLOSE) {
          this.closeDialog();
        }
      });
    } else if (this.formGroup.dirty) {
      this.dialogService.createAndShowDirtyChangeCloseDialog(
        this.translateService.instant('general.change_pending_title'),
        this.translateService.instant('general.change_pending_text'),
      ).subscribe((result) => {
        if (result === ButtonType.SAVE_AND_CLOSE) {
          this.saveBuilding(this.formGroup.value);
        } else if (result === ButtonType.DO_NOT_SAVE_AND_CLOSE) {
          this.closeDialog();
        }
      });
    } else {
      this.closeDialog();
    }
  }

  private createBuilding(building: Building) {
    // Show
    this.spinnerService.show();
    // Set the logo
    this.updateBuildingLogo(building);
    // Yes: Update
    this.centralServerService.createBuilding(building).subscribe((response) => {
      // Hide
      this.spinnerService.hide();
      // Ok?
      if (response.status === RestResponse.SUCCESS) {
        // Ok
        this.messageService.showSuccessMessage('buildings.create_success',
          { buildingName: building.name });
        // Refresh
        this.currentBuildingID = building.id;
        this.closeDialog(true);
      } else {
        Utils.handleError(JSON.stringify(response),
          this.messageService, 'buildings.create_error');
      }
    }, (error) => {
      // Hide
      this.spinnerService.hide();
      // Check status
      switch (error.status) {
        // Building deleted
        case 550:
          // Show error
          this.messageService.showErrorMessage('buildings.building_not_found');
          break;
        default:
          // No longer exists!
          Utils.handleHttpError(error, this.router, this.messageService, this.centralServerService, 'buildings.create_error');
      }
    });
  }

  private updateBuilding(building: Building) {
    // Show
    this.spinnerService.show();
    // Set the logo
    this.updateBuildingLogo(building);
    // Yes: Update
    this.centralServerService.updateBuilding(building).subscribe((response) => {
      // Hide
      this.spinnerService.hide();
      // Ok?
      if (response.status === RestResponse.SUCCESS) {
        // Ok
        this.messageService.showSuccessMessage('buildings.update_success', { buildingName: building.name });
        this.closeDialog(true);
      } else {
        Utils.handleError(JSON.stringify(response),
          this.messageService, 'buildings.update_error');
      }
    }, (error) => {
      // Hide
      this.spinnerService.hide();
      // Check status
      switch (error.status) {
        // Building deleted
        case 550:
          // Show error
          this.messageService.showErrorMessage('buildings.building_not_found');
          break;
        default:
          // No longer exists!
          Utils.handleHttpError(error, this.router, this.messageService, this.centralServerService, 'buildings.update_error');
      }
    });
  }
}
