import { Component, EventEmitter, Input, OnChanges, OnInit, Output } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, Validators } from '@angular/forms';
import { CentralServerService } from 'services/central-server.service';
import { ConfigService } from 'services/config.service';
import { MessageService } from 'services/message.service';
import { USER_STATUSES, UserRoles } from 'shared/model/users.model';
import { AuthorizationDefinitionFieldMetadata } from 'types/Authorization';
import { KeyValue } from 'types/GlobalType';
import { User, UserRole, UserStatus } from 'types/User';
import { Constants } from 'utils/Constants';
import { Users } from 'utils/Users';

import { AuthorizationService } from '../../../../services/authorization.service';
import { ComponentService } from '../../../../services/component.service';
import { LocaleService } from '../../../../services/locale.service';
import { TenantComponents } from '../../../../types/Tenant';

@Component({
  selector: 'app-user-main',
  templateUrl: './user-main.component.html',
})
// @Injectable()
export class UserMainComponent implements OnInit, OnChanges {
  @Input() public formGroup: FormGroup;
  @Input() public user!: User;
  @Input() public metadata!: Record<string, AuthorizationDefinitionFieldMetadata>;
  @Input() public currentUserID!: string;
  @Output() public roleChanged = new EventEmitter<UserRole>();

  public isAdmin = false;
  public isSuperAdmin = false;

  public isBillingComponentActive: boolean;

  public originalEmail!: string;
  public userImageSet = false;
  public image = Constants.USER_NO_PICTURE;
  public imageMaxSize: number;
  public userLocales: KeyValue[];
  public userStatuses: KeyValue[];
  public userRoles: KeyValue[];

  public id!: AbstractControl;
  public issuer!: AbstractControl;
  public name!: AbstractControl;
  public firstName!: AbstractControl;
  public email!: AbstractControl;
  public phone!: AbstractControl;
  public mobile!: AbstractControl;
  public plateID!: AbstractControl;
  public status!: AbstractControl;
  public role!: AbstractControl;
  public locale!: AbstractControl;
  public technical: AbstractControl;
  public freeAccess: AbstractControl;

  private currentLocale!: string;

  public constructor(
    private centralServerService: CentralServerService,
    private authorizationService: AuthorizationService,
    private messageService: MessageService,
    private componentService: ComponentService,
    private configService: ConfigService,
    private localeService: LocaleService) {
    // Admin?
    this.isAdmin = this.authorizationService.isAdmin();
    this.isSuperAdmin = this.authorizationService.isSuperAdmin();
    // Get Locales
    this.userLocales = this.localeService.getLocales();
    // Get statuses
    this.userStatuses = USER_STATUSES;
    // Get Roles
    this.userRoles = UserRoles.getAvailableRoles(this.centralServerService.getLoggedUser().role);
    // Get default locale
    this.localeService.getCurrentLocaleSubject().subscribe((locale) => {
      this.currentLocale = locale.currentLocale;
    });
    this.isBillingComponentActive = this.componentService.isActive(TenantComponents.BILLING);
    this.imageMaxSize = this.configService.getUser().maxPictureKb;
  }

  public ngOnInit(): void {
    // Init the form
    this.formGroup.addControl('id', new FormControl(''));
    this.formGroup.addControl('issuer', new FormControl(true));
    this.formGroup.addControl('name', new FormControl('',
      Validators.compose([
        Validators.required,
        Validators.maxLength(255)
      ]))
    );
    this.formGroup.addControl('firstName', new FormControl('',
      Validators.compose([
        Validators.required,
        Validators.maxLength(255)
      ]))
    );
    this.formGroup.addControl('email', new FormControl('',
      Validators.compose([
        Validators.required,
        Validators.email,
      ]))
    );
    this.formGroup.addControl('phone', new FormControl('',
      Validators.compose([
        Users.validatePhone,
      ]))
    );
    this.formGroup.addControl('mobile', new FormControl('',
      Validators.compose([
        Users.validatePhone,
      ]))
    );
    this.formGroup.addControl('plateID', new FormControl('',
      Validators.compose([
        Validators.pattern('^[A-Z0-9- ]*$'),
      ]))
    );
    this.formGroup.addControl('status', new FormControl(
      UserStatus.ACTIVE,
      Validators.compose([
        Validators.required,
      ]))
    );
    this.formGroup.addControl('role', new FormControl(
      this.isSuperAdmin ? UserRole.SUPER_ADMIN : UserRole.BASIC,
      Validators.compose([
        Validators.pattern('^[A-Z0-9- ]*$'),
      ]))
    );
    this.formGroup.addControl('locale', new FormControl(
      this.currentLocale,
      Validators.compose([
        Validators.required,
      ]))
    );
    this.formGroup.addControl('technical', new FormControl(false));
    this.formGroup.addControl('freeAccess', new FormControl(false));
    // Form
    this.id = this.formGroup.controls['id'];
    this.issuer = this.formGroup.controls['issuer'];
    this.name = this.formGroup.controls['name'];
    this.firstName = this.formGroup.controls['firstName'];
    this.email = this.formGroup.controls['email'];
    this.phone = this.formGroup.controls['phone'];
    this.mobile = this.formGroup.controls['mobile'];
    this.plateID = this.formGroup.controls['plateID'];
    this.status = this.formGroup.controls['status'];
    this.role = this.formGroup.controls['role'];
    this.locale = this.formGroup.controls['locale'];
    this.technical = this.formGroup.controls['technical'];
    this.freeAccess = this.formGroup.controls['freeAccess'];
    if (this.metadata?.status?.mandatory) {
      this.status.setValidators(Validators.required);
    }
    this.formGroup.updateValueAndValidity();
  }

  public ngOnChanges() {
    this.loadUser();
  }

  public loadUser() {
    if (this.user) {
      if (this.user.id) {
        this.formGroup.controls.id.setValue(this.user.id);
      }
      this.formGroup.controls.issuer.setValue(this.user.issuer);
      if (this.user.name) {
        this.formGroup.controls.name.setValue(this.user.name.toUpperCase());
      }
      if (this.user.firstName) {
        this.formGroup.controls.firstName.setValue(this.user.firstName);
      }
      if (this.user.email) {
        this.formGroup.controls.email.setValue(this.user.email);
        this.originalEmail = this.user.email;
      }
      if (this.user.phone) {
        this.formGroup.controls.phone.setValue(this.user.phone);
      }
      if (this.user.mobile) {
        this.formGroup.controls.mobile.setValue(this.user.mobile);
      }
      if (this.user.status) {
        this.formGroup.controls.status.setValue(this.user.status);
      }
      if (this.user.role) {
        this.formGroup.controls.role.setValue(this.user.role);
      }
      if (this.user.locale) {
        this.formGroup.controls.locale.setValue(this.user.locale);
      }
      if (this.user.plateID) {
        this.formGroup.controls.plateID.setValue(this.user.plateID);
      }
      if (this.user.projectFields.includes('technical')) {
        if (this.user.technical) {
          this.formGroup.controls.technical.setValue(this.user.technical);
        }
      } else {
        this.formGroup.controls.technical.disable();
      }
      if (this.user.projectFields.includes('freeAccess') && this.isBillingComponentActive) {
        if (this.user.freeAccess) {
          this.formGroup.controls.freeAccess.setValue(this.user.freeAccess);
        }
      } else {
        this.formGroup.controls.freeAccess.disable();
      }
      // Load Image
      if (!this.userImageSet) {
        this.centralServerService.getUserImage(this.currentUserID).subscribe((userImage) => {
          this.userImageSet = true;
          if (userImage && userImage.image) {
            this.image = userImage.image.toString();
          }
        });
      }
    }
  }

  public onRoleChanged(role: UserRole) {
    this.roleChanged.emit(role);
  }

  public updateUserImage(user: User) {
    if (this.image !== Constants.USER_NO_PICTURE) {
      user.image = this.image;
    } else {
      user.image = null;
    }
  }

  public clearImage() {
    this.image = Constants.USER_NO_PICTURE;
    this.userImageSet = false;
    this.formGroup.markAsDirty();
  }

  public onImageChanged(event: any) {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      if (file.size > (this.imageMaxSize * 1024)) {
        this.messageService.showErrorMessage('users.picture_size_error', { maxPictureKb: this.imageMaxSize });
      } else {
        const reader = new FileReader();
        reader.onload = () => {
          this.image = reader.result as string;
          this.userImageSet = true;
          this.formGroup.markAsDirty();
        };
        reader.readAsDataURL(file);
      }
    }
  }
}
