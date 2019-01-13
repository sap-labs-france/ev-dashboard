import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { AbstractControl, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material';
import { mergeMap } from 'rxjs/operators';

import { LocaleService } from 'app/services/locale.service';
import { CentralServerService } from 'app/services/central-server.service';
import { SpinnerService } from 'app/services/spinner.service';
import { AuthorizationService } from 'app/services/authorization-service';
import { MessageService } from 'app/services/message.service';
import { ParentErrorStateMatcher } from 'app/utils/ParentStateMatcher';
import { DialogService } from 'app/services/dialog.service';
import { Constants } from 'app/utils/Constants';
import { Utils } from 'app/utils/Utils';

@Component({
  selector: 'app-site-area-cmp',
  templateUrl: 'site-area.component.html'
})
export class SiteAreaComponent implements OnInit {
  public parentErrorStateMatcher = new ParentErrorStateMatcher();
  @Input() currentSiteAreaID: string;
  @Input() inDialog: boolean;
  public image = Constants.SITE_AREA_NO_IMAGE;

  public formGroup: FormGroup;
  public id: AbstractControl;
  public name: AbstractControl;
  public siteID: AbstractControl;

  public sites: any;

  constructor(
    private authorizationService: AuthorizationService,
    private centralServerService: CentralServerService,
    private messageService: MessageService,
    private spinnerService: SpinnerService,
    private localeService: LocaleService,
    private activatedRoute: ActivatedRoute,
    private dialog: MatDialog,
    private dialogService: DialogService,
    private router: Router) {

    // Check auth
    if (this.activatedRoute.snapshot.params['id'] &&
      !authorizationService.canUpdateSiteArea({ 'id': this.activatedRoute.snapshot.params['id'] })) {
      // Not authorized
      this.router.navigate(['/']);
    }

    // TODO: test
    this.sites = [{ 'id': '5abeba8d4bae1457eb565e5b', 'name': 'Test' }];
  }

  ngOnInit() {
    // Init the form
    this.formGroup = new FormGroup({
      'id': new FormControl(''),
      'name': new FormControl('',
        Validators.compose([
          Validators.required
        ])),
      'siteID': new FormControl('',
        Validators.compose([
          Validators.required
        ])),
    });
    // Form
    this.id = this.formGroup.controls['id'];
    this.name = this.formGroup.controls['name'];
    this.siteID = this.formGroup.controls['siteID'];

    if (this.currentSiteAreaID) {
      this.loadSiteArea();
    } else if (this.activatedRoute && this.activatedRoute.params) {
      this.activatedRoute.params.subscribe((params: Params) => {
        this.currentSiteAreaID = params['id'];
        // this.loadSiteArea();
      });
    }
    // Scroll up
    jQuery('html, body').animate({ scrollTop: 0 }, { duration: 500 });
  }

  public isOpenInDialog(): boolean {
    return this.inDialog;
  }

  public setCurrentSiteAreaId(currentSiteAreaId) {
    this.currentSiteAreaID = currentSiteAreaId;
  }

  public showPlace() {
    window.open(`http://maps.google.com/maps?q=${this.address.controls.latitude.value},${this.address.controls.longitude.value}`);
  }

  public refresh() {
    // Load SiteArea
    this.loadSiteArea();
  }

  public loadSiteArea() {
    if (!this.currentSiteAreaID) {
      return;
    }
    // Show spinner
    this.spinnerService.show();
    // Yes, get it
    this.centralServerService.getSiteArea(this.currentSiteAreaID).pipe(mergeMap((siteArea) => {
      this.formGroup.markAsPristine();
      // Init form
      if (siteArea.id) {
        this.formGroup.controls.id.setValue(siteArea.id);
      }
      if (siteArea.name) {
        this.formGroup.controls.name.setValue(siteArea.name);
      }
      if (siteArea.siteID) {
        this.formGroup.controls.siteID.setValue(siteArea.siteID);
      }
      // Yes, get image
      return this.centralServerService.getSiteAreaImage(this.currentSiteAreaID);
    })).subscribe((siteAreaImage) => {
      if (siteAreaImage && siteAreaImage.image) {
        this.image = siteAreaImage.image.toString();
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
          Utils.handleHttpError(error, this.router, this.messageService, this.centralServerService, 'users.user_not_found');
          break;
        default:
          // Unexpected error`
          Utils.handleHttpError(error, this.router, this.messageService, this.centralServerService,
            'general.unexpected_error_backend');
      }
    });
  }

  public updateUserImage(user) {
    // Set the image
    this.image = jQuery('.fileinput-preview img')[0]['src'];
    // Check no user?
    if (!this.image.endsWith(Constants.USER_NO_PICTURE)) {
      // Set to user
      user.image = this.image;
    } else {
      // No image
      user.image = null;
    }
  }

  public saveSiteArea(siteArea) {
    if (this.currentSiteAreaID) {
      this._updateSiteArea(siteArea);
    } else {
      this._createSiteArea(siteArea);
    }
  }

  private _createSiteArea(siteArea) {
    // // Show
    // this.spinnerService.show();
    // // Set the image
    // this.updateSiteAreaImage(siteArea);
    // // Yes: Update
    // this.centralServerService.createUser(user).subscribe(response => {
    //   // Hide
    //   this.spinnerService.hide();
    //   // Ok?
    //   if (response.status === Constants.REST_RESPONSE_SUCCESS) {
    //     // Ok
    //     this.messageService.showSuccessMessage('users.create_success',
    //       {'userFullName': user.firstName + ' ' + user.name});
    //     // Refresh
    //     this.currentUserID = user.id;
    //     this.refresh();
    //   } else {
    //     Utils.handleError(JSON.stringify(response),
    //       this.messageService, 'users.create_error');
    //   }
    // }, (error) => {
    //   // Hide
    //   this.spinnerService.hide();
    //   // Check status
    //   switch (error.status) {
    //     // Email already exists
    //     case 510:
    //       // Show error
    //       this.messageService.showErrorMessage('authentication.email_already_exists');
    //       break;
    //     // User deleted
    //     case 550:
    //       // Show error
    //       this.messageService.showErrorMessage('users.user_do_not_exist');
    //       break;
    //     default:
    //       // No longer exists!
    //       Utils.handleHttpError(error, this.router, this.messageService, this.centralServerService, 'users.create_error');
    //   }
    // });
  }

  private _updateSiteArea(siteArea) {
    // // Show
    // this.spinnerService.show();
    // // Set the image
    // this.updateUserImage(user);
    // // Yes: Update
    // this.centralServerService.updateUser(user).subscribe(response => {
    //   // Hide
    //   this.spinnerService.hide();
    //   // Ok?
    //   if (response.status === Constants.REST_RESPONSE_SUCCESS) {
    //     // Ok
    //     this.messageService.showSuccessMessage('users.update_success', {'userFullName': user.firstName + ' ' + user.name});
    //     this.refresh();
    //   } else {
    //     Utils.handleError(JSON.stringify(response),
    //       this.messageService, 'users.update_error');
    //   }
    // }, (error) => {
    //   // Hide
    //   this.spinnerService.hide();
    //   // Check status
    //   switch (error.status) {
    //     // Email already exists
    //     case 510:
    //       // Show error
    //       this.messageService.showErrorMessage('authentication.email_already_exists');
    //       break;
    //     // User deleted
    //     case 550:
    //       // Show error
    //       this.messageService.showErrorMessage('users.user_do_not_exist');
    //       break;
    //     default:
    //       // No longer exists!
    //       Utils.handleHttpError(error, this.router, this.messageService, this.centralServerService, 'users.update_error');
    //   }
    // });
  }

  public imageChanged() {
    // Set form dirty
    this.formGroup.markAsDirty();
  }

  public clearImage() {
    // Clear
    jQuery('.fileinput-preview img')[0]['src'] = Constants.SITE_AREA_NO_IMAGE
    // Set form dirty
    this.formGroup.markAsDirty();
  }
}
