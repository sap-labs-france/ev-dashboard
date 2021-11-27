import { Component, Input, OnChanges, OnInit } from '@angular/core';
import { AbstractControl, FormControl, FormGroup } from '@angular/forms';
import { User, UserNotifications, UserRole } from 'types/User';

import { AuthorizationService } from '../../../../services/authorization.service';
import { Utils } from '../../../../utils/Utils';

@Component({
  selector: 'app-user-notifications',
  templateUrl: './user-notifications.component.html',
})
// @Injectable()
export class UserNotificationsComponent implements OnInit, OnChanges {
  @Input() public formGroup: FormGroup;
  @Input() public user!: User;

  public isAdmin = false;
  public isSuperAdmin = false;
  public isBasic = false;

  public currentRole: UserRole;

  public notificationsActive!: AbstractControl;
  public notifications!: FormGroup;
  public sendSessionStarted!: AbstractControl;
  public sendOptimalChargeReached!: AbstractControl;
  public sendCarCatalogSynchronizationFailed!: AbstractControl;
  public sendEndOfCharge!: AbstractControl;
  public sendEndOfSession!: AbstractControl;
  public sendUserAccountStatusChanged!: AbstractControl;
  public sendUnknownUserBadged!: AbstractControl;
  public sendChargingStationStatusError!: AbstractControl;
  public sendChargingStationRegistered!: AbstractControl;
  public sendOfflineChargingStations!: AbstractControl;
  public sendOcpiPatchStatusError!: AbstractControl;
  public sendOicpPatchStatusError!: AbstractControl;
  public sendPreparingSessionNotStarted!: AbstractControl;
  public sendBillingSynchronizationFailed!: AbstractControl;
  public sendBillingPeriodicOperationFailed!: AbstractControl;
  public sendComputeAndApplyChargingProfilesFailed!: AbstractControl;
  public sendSessionNotStarted!: AbstractControl;
  public sendUserAccountInactivity!: AbstractControl;
  public sendEndUserErrorNotification!: AbstractControl;
  public sendBillingNewInvoice!: AbstractControl;
  public sendAdminAccountVerificationNotification!: AbstractControl;

  private adminNotificationControls: AbstractControl[] = [];
  private notificationControls: AbstractControl[] = [];

  public constructor(
    private authorizationService: AuthorizationService) {
    // Admin?
    this.isAdmin = this.authorizationService.isAdmin();
    this.isSuperAdmin = this.authorizationService.isSuperAdmin();
    this.isBasic = this.authorizationService.isBasic();
  }

  public ngOnInit(): void {
    // Init the form
    this.formGroup.addControl('notificationsActive', new FormControl(true));
    this.formGroup.addControl('notifications', new FormGroup({
      sendSessionStarted: new FormControl(true),
      sendOptimalChargeReached: new FormControl(true),
      sendCarCatalogSynchronizationFailed: new FormControl(true),
      sendEndOfCharge: new FormControl(true),
      sendEndOfSession: new FormControl(true),
      sendUserAccountStatusChanged: new FormControl(true),
      sendSessionNotStarted: new FormControl(true),
      sendUserAccountInactivity: new FormControl(true),
      sendUnknownUserBadged: new FormControl(false),
      sendChargingStationStatusError: new FormControl(false),
      sendChargingStationRegistered: new FormControl(false),
      sendOfflineChargingStations: new FormControl(false),
      sendPreparingSessionNotStarted: new FormControl(false),
      sendOcpiPatchStatusError: new FormControl(false),
      sendOicpPatchStatusError: new FormControl(false),
      sendBillingSynchronizationFailed: new FormControl(false),
      sendBillingPeriodicOperationFailed: new FormControl(false),
      sendComputeAndApplyChargingProfilesFailed: new FormControl(false),
      sendEndUserErrorNotification: new FormControl(false),
      sendBillingNewInvoice: new FormControl(true),
      sendAdminAccountVerificationNotification: new FormControl(true)
    }));
    // Form
    this.notificationsActive = this.formGroup.controls['notificationsActive'];
    this.notifications = this.formGroup.controls['notifications'] as FormGroup;
    this.sendSessionStarted = this.notifications.controls['sendSessionStarted'];
    this.sendOptimalChargeReached = this.notifications.controls['sendOptimalChargeReached'];
    this.sendCarCatalogSynchronizationFailed = this.notifications.controls['sendCarCatalogSynchronizationFailed'];
    this.sendEndOfCharge = this.notifications.controls['sendEndOfCharge'];
    this.sendEndOfSession = this.notifications.controls['sendEndOfSession'];
    this.sendUserAccountStatusChanged = this.notifications.controls['sendUserAccountStatusChanged'];
    this.sendUnknownUserBadged = this.notifications.controls['sendUnknownUserBadged'];
    this.sendChargingStationStatusError = this.notifications.controls['sendChargingStationStatusError'];
    this.sendChargingStationRegistered = this.notifications.controls['sendChargingStationRegistered'];
    this.sendOfflineChargingStations = this.notifications.controls['sendOfflineChargingStations'];
    this.sendOcpiPatchStatusError = this.notifications.controls['sendOcpiPatchStatusError'];
    this.sendOicpPatchStatusError = this.notifications.controls['sendOicpPatchStatusError'];
    this.sendPreparingSessionNotStarted = this.notifications.controls['sendPreparingSessionNotStarted'];
    this.sendBillingSynchronizationFailed = this.notifications.controls['sendBillingSynchronizationFailed'];
    this.sendBillingPeriodicOperationFailed = this.notifications.controls['sendBillingPeriodicOperationFailed'];
    this.sendSessionNotStarted = this.notifications.controls['sendSessionNotStarted'];
    this.sendUserAccountInactivity = this.notifications.controls['sendUserAccountInactivity'];
    this.sendComputeAndApplyChargingProfilesFailed = this.notifications.controls['sendComputeAndApplyChargingProfilesFailed'];
    this.sendEndUserErrorNotification = this.notifications.controls['sendEndUserErrorNotification'];
    this.sendBillingNewInvoice = this.notifications.controls['sendBillingNewInvoice'];
    this.sendAdminAccountVerificationNotification = this.notifications.controls['sendAdminAccountVerificationNotification'];
    this.formGroup.updateValueAndValidity();
    // Keep notifs
    this.notificationControls.push(...[
      this.notifications.controls.sendSessionStarted,
      this.notifications.controls.sendOptimalChargeReached,
      this.notifications.controls.sendEndOfCharge,
      this.notifications.controls.sendEndOfSession,
      this.notifications.controls.sendUserAccountStatusChanged,
      this.notifications.controls.sendSessionNotStarted,
      this.notifications.controls.sendUserAccountInactivity,
      this.notifications.controls.sendBillingNewInvoice,
      this.notifications.controls.sendPreparingSessionNotStarted,
    ]);
    this.adminNotificationControls.push(...[
      this.notifications.controls.sendUnknownUserBadged,
      this.notifications.controls.sendUnknownUserBadged,
      this.notifications.controls.sendChargingStationStatusError,
      this.notifications.controls.sendOfflineChargingStations,
      this.notifications.controls.sendOcpiPatchStatusError,
      this.notifications.controls.sendOicpPatchStatusError,
      this.notifications.controls.sendBillingSynchronizationFailed,
      this.notifications.controls.sendBillingPeriodicOperationFailed,
      this.notifications.controls.sendComputeAndApplyChargingProfilesFailed,
      this.notifications.controls.sendEndUserErrorNotification,
      this.notifications.controls.sendChargingStationRegistered,
      this.notifications.controls.sendAdminAccountVerificationNotification,
    ]);
  }

  public ngOnChanges() {
    this.loadUser();
  }

  // eslint-disable-next-line complexity
  public loadUser() {
    if (this.user) {
      // Init form
      this.currentRole = this.user.role;
      if (Utils.objectHasProperty(this.user, 'notificationsActive')) {
        this.formGroup.controls.notificationsActive.setValue(this.user.notificationsActive);
      }
      this.enableAllNotifications(this.user.notificationsActive);
      // Set notifications
      this.setNotificationsInitialValue(this.user.notifications, 'sendSessionStarted');
      this.setNotificationsInitialValue(this.user.notifications, 'sendOptimalChargeReached');
      this.setNotificationsInitialValue(this.user.notifications, 'sendCarCatalogSynchronizationFailed');
      this.setNotificationsInitialValue(this.user.notifications, 'sendEndOfCharge');
      this.setNotificationsInitialValue(this.user.notifications, 'sendEndOfSession');
      this.setNotificationsInitialValue(this.user.notifications, 'sendUserAccountStatusChanged');
      this.setNotificationsInitialValue(this.user.notifications, 'sendUnknownUserBadged');
      this.setNotificationsInitialValue(this.user.notifications, 'sendChargingStationStatusError');
      this.setNotificationsInitialValue(this.user.notifications, 'sendChargingStationRegistered');
      this.setNotificationsInitialValue(this.user.notifications, 'sendOfflineChargingStations');
      this.setNotificationsInitialValue(this.user.notifications, 'sendOcpiPatchStatusError');
      this.setNotificationsInitialValue(this.user.notifications, 'sendOicpPatchStatusError');
      this.setNotificationsInitialValue(this.user.notifications, 'sendPreparingSessionNotStarted');
      this.setNotificationsInitialValue(this.user.notifications, 'sendBillingSynchronizationFailed');
      this.setNotificationsInitialValue(this.user.notifications, 'sendBillingPeriodicOperationFailed');
      this.setNotificationsInitialValue(this.user.notifications, 'sendUserAccountInactivity');
      this.setNotificationsInitialValue(this.user.notifications, 'sendSessionNotStarted');
      this.setNotificationsInitialValue(this.user.notifications, 'sendComputeAndApplyChargingProfilesFailed');
      this.setNotificationsInitialValue(this.user.notifications, 'sendEndUserErrorNotification');
      this.setNotificationsInitialValue(this.user.notifications, 'sendBillingNewInvoice');
      this.setNotificationsInitialValue(this.user.notifications, 'sendBillingNewInvoice');
      this.setNotificationsInitialValue(this.user.notifications, 'sendAdminAccountVerificationNotification');
    }
  }

  public setNotificationsInitialValue(notifications: UserNotifications, name: string) {
    if (notifications && Utils.objectHasProperty(this.user.notifications, name)) {
      this.notifications.controls[name].setValue(this.user.notifications[name]);
    } else {
      this.notifications.controls[name].setValue(false);
    }
  }

  public roleChanged(role: UserRole) {
    this.currentRole = role;
    switch (role) {
      case UserRole.DEMO:
        this.formGroup.controls.notificationsActive.setValue(false);
        this.formGroup.controls.notificationsActive.disable();
        this.enableAllNotifications(false);
        this.setAllNotificationsValue(false);
        break;
      case UserRole.BASIC:
        this.formGroup.controls.notificationsActive.setValue(true);
        this.formGroup.controls.notificationsActive.enable();
        this.enableNotifications(this.notificationControls, true);
        this.setNotificationsValue(this.notificationControls, true);
        this.enableNotifications(this.adminNotificationControls, false);
        this.setNotificationsValue(this.adminNotificationControls, false);
        break;
      case UserRole.ADMIN:
        this.formGroup.controls.notificationsActive.setValue(true);
        this.formGroup.controls.notificationsActive.enable();
        this.enableAllNotifications(true);
        this.setAllNotificationsValue(true);
        break;
    }
  }

  // TODO: the event 'checked' is not provided with the current version of Angular (11) -> 13 should be okay
  public toggleNotificationsActive(checked: boolean) {
    this.enableAllNotifications(!this.formGroup.controls.notificationsActive.value);
  }

  private enableAllNotifications(enabled: boolean) {
    this.enableNotifications(this.notificationControls, enabled);
    this.enableNotifications(this.adminNotificationControls, enabled);
  }

  private enableNotifications(notificationControls: AbstractControl[], enabled: boolean) {
    for (const notificationControl of notificationControls) {
      if (enabled) {
        notificationControl.enable();
      } else {
        notificationControl.disable();
      }
    }
  }

  private setAllNotificationsValue(value: boolean) {
    this.setNotificationsValue(this.adminNotificationControls, value);
    this.setNotificationsValue(this.notificationControls, value);
  }

  private setNotificationsValue(notificationControls: AbstractControl[], value: boolean) {
    for (const notificationControl of notificationControls) {
      notificationControl.setValue(value);
    }
  }
}
