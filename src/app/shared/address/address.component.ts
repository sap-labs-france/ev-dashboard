import { Component, Input, OnChanges, OnInit } from '@angular/core';
import {
  AbstractControl,
  UntypedFormArray,
  UntypedFormControl,
  UntypedFormGroup,
  Validators,
} from '@angular/forms';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { Address as GoogleAddress } from 'ngx-google-places-autocomplete/objects/address';
import { GeoMapDialogData, GeoMapDialogResult } from 'types/Dialog';

import { Address } from '../../types/Address';
import { Constants } from '../../utils/Constants';
import { GeoMapDialogComponent } from '../dialogs/geomap/geomap-dialog.component';

@Component({
  selector: 'app-address',
  templateUrl: 'address.component.html',
})
export class AddressComponent implements OnInit, OnChanges {
  @Input() public formGroup!: UntypedFormGroup;
  @Input() public hideGeolocation = false;
  @Input() public onlyReadGeolocation = false;
  @Input() public address!: Address;
  @Input() public componentName!: string;
  @Input() public itemComponentName!: string;
  @Input() public mandatory!: boolean;
  public addressFormGroup!: UntypedFormGroup;
  public address1!: AbstractControl;
  public address2!: AbstractControl;
  public postalCode!: AbstractControl;
  public city!: AbstractControl;
  public department!: AbstractControl;
  public region!: AbstractControl;
  public country!: AbstractControl;
  public coordinates!: UntypedFormArray;
  public longitude!: AbstractControl;
  public latitude!: AbstractControl;
  public initialized = false;

  // eslint-disable-next-line no-useless-constructor
  public constructor(private translateService: TranslateService, private dialog: MatDialog) {}

  public ngOnInit() {
    // Set Address form group
    this.addressFormGroup = new UntypedFormGroup({
      address1: new UntypedFormControl(''),
      address2: new UntypedFormControl(''),
      postalCode: new UntypedFormControl(''),
      city: new UntypedFormControl(''),
      department: new UntypedFormControl(''),
      region: new UntypedFormControl(''),
      country: new UntypedFormControl(''),
      coordinates: new UntypedFormArray([
        new UntypedFormControl(
          '',
          Validators.compose([
            Validators.max(180),
            Validators.min(-180),
            Validators.pattern(Constants.REGEX_VALIDATION_LONGITUDE),
          ])
        ),
        new UntypedFormControl(
          '',
          Validators.compose([
            Validators.max(90),
            Validators.min(-90),
            Validators.pattern(Constants.REGEX_VALIDATION_LATITUDE),
          ])
        ),
      ]),
    });
    // Add the form group to the parent component
    if (!this.formGroup.disabled) {
      this.formGroup.addControl('address', this.addressFormGroup);
    } else {
      this.addressFormGroup.disable();
    }
    // Form
    this.address1 = this.addressFormGroup.controls['address1'];
    this.address2 = this.addressFormGroup.controls['address2'];
    this.postalCode = this.addressFormGroup.controls['postalCode'];
    this.city = this.addressFormGroup.controls['city'];
    this.department = this.addressFormGroup.controls['department'];
    this.region = this.addressFormGroup.controls['region'];
    this.country = this.addressFormGroup.controls['country'];
    this.coordinates = this.addressFormGroup.controls['coordinates'] as UntypedFormArray;
    this.longitude = this.coordinates.at(0);
    this.latitude = this.coordinates.at(1);
    this.initialized = true;
    this.loadAddress();
  }

  public ngOnChanges() {
    this.loadAddress();
  }

  public loadAddress() {
    if (this.initialized && this.address) {
      if (this.address.address1) {
        this.address1.setValue(this.address.address1);
      }
      if (this.address.address2) {
        this.address2.setValue(this.address.address2);
      }
      if (this.address.postalCode) {
        this.postalCode.setValue(this.address.postalCode);
      }
      if (this.address.city) {
        this.city.setValue(this.address.city);
      }
      if (this.address.department) {
        this.department.setValue(this.address.department);
      }
      if (this.address.region) {
        this.region.setValue(this.address.region);
      }
      if (this.address.country) {
        this.country.setValue(this.address.country);
      }
      if (this.address.coordinates && this.address.coordinates.length === 2) {
        this.coordinates?.at(0).setValue(this.address.coordinates[0]);
        this.coordinates?.at(1).setValue(this.address.coordinates[1]);
        this.longitude = this.coordinates?.at(0);
        this.latitude = this.coordinates?.at(1);
      }
      if (this.mandatory) {
        this.address1.addValidators(Validators.required);
        this.city.addValidators(Validators.required);
        this.postalCode.addValidators(Validators.required);
        this.country.addValidators(Validators.required);
        this.latitude.addValidators(Validators.required);
        this.longitude.addValidators(Validators.required);
      }
      this.address1.updateValueAndValidity();
      this.city.updateValueAndValidity();
      this.postalCode.updateValueAndValidity();
      this.country.updateValueAndValidity();
      this.latitude.updateValueAndValidity();
      this.longitude.updateValueAndValidity();
    }
  }

  public setAddress(address: GoogleAddress) {
    // Set data
    let streetNumber = '';
    let route = '';
    address.address_components.forEach((addressComponent) => {
      switch (addressComponent.types[0]) {
        // Postal Code
        case 'postal_code':
          this.postalCode.setValue(addressComponent.long_name);
          break;
        // Town
        case 'locality':
          this.city.setValue(addressComponent.long_name);
          break;
        // Department
        case 'administrative_area_level_2':
          this.department.setValue(addressComponent.long_name);
          break;
        // Region
        case 'administrative_area_level_1':
          this.region.setValue(addressComponent.long_name);
          break;
        // Country
        case 'country':
          this.country.setValue(addressComponent.long_name);
          break;
        case 'route':
          route = addressComponent.long_name;
          break;
        case 'street_number':
          streetNumber = addressComponent.long_name;
          break;
      }
    });
    // Address
    this.address1.setValue(address.name);
    // Latitude
    this.latitude.setValue(address.geometry.location.lat());
    this.latitude.markAsTouched();
    // Longitude
    this.longitude.setValue(address.geometry.location.lng());
    this.longitude.markAsTouched();
    // set as dirty
    this.formGroup.markAsDirty();
  }

  public showPlace() {
    window.open(`http://maps.google.com/maps?q=${this.latitude.value},${this.longitude.value}`);
  }

  public assignGeoMap() {
    // Create the dialog
    const dialogConfig = new MatDialogConfig<GeoMapDialogData>();
    dialogConfig.minWidth = '70vw';
    dialogConfig.disableClose = false;
    dialogConfig.panelClass = 'transparent-dialog-container';
    // Get latitude/longitude from form
    let latitude = this.latitude.value;
    let longitude = this.longitude.value;
    // If one is not available try to get from SiteArea and then from Site
    if (!latitude || !longitude) {
      if (this.address) {
        if (this.address.coordinates && this.address.coordinates.length === 2) {
          latitude = this.address.coordinates[1];
          longitude = this.address.coordinates[0];
        } else {
          if (this.address && this.address.coordinates && this.address.coordinates.length === 2) {
            latitude = this.address.coordinates[1];
            longitude = this.address.coordinates[0];
          }
        }
      }
    }
    // Set data
    dialogConfig.data = {
      dialogTitle:
        this.componentName && this.itemComponentName
          ? this.translateService.instant('geomap.dialog_geolocation_title', {
            componentName: this.componentName,
            itemComponentName: this.itemComponentName,
          })
          : this.translateService.instant('geomap.select_geolocation'),
      latitude,
      longitude,
      label: this.itemComponentName ? this.itemComponentName : '',
      displayOnly: this.onlyReadGeolocation ?? false,
    };
    // Disable outside click close
    dialogConfig.disableClose = true;
    // Open
    this.dialog
      .open<GeoMapDialogComponent, GeoMapDialogData, GeoMapDialogResult>(
      GeoMapDialogComponent,
      dialogConfig
    )
      .afterClosed()
      .subscribe((result: GeoMapDialogResult) => {
        if (result) {
          if (result.latitude) {
            this.latitude.setValue(result.latitude);
            this.formGroup.markAsDirty();
          }
          if (result.longitude) {
            this.longitude.setValue(result.longitude);
            this.formGroup.markAsDirty();
          }
        }
      });
  }
}
