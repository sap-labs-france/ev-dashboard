import { Component, Input, OnChanges, OnInit } from '@angular/core';
import { AbstractControl, FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { Address } from 'app/types/Address';
import { Constants } from 'app/utils/Constants';
import { Address as GoogleAddress } from 'ngx-google-places-autocomplete/objects/address';

@Component({
  selector: 'app-address',
  templateUrl: 'address.component.html',
})
export class AddressComponent implements OnInit, OnChanges {
  @Input() formGroup!: FormGroup;
  @Input() hideGeoLocation = false;
  @Input() addressData!: Address;
  public address!: FormGroup;
  public address1!: AbstractControl;
  public address2!: AbstractControl;
  public postalCode!: AbstractControl;
  public city!: AbstractControl;
  public department!: AbstractControl;
  public region!: AbstractControl;
  public country!: AbstractControl;
  public coordinates!: FormArray;
  public longitude!: AbstractControl;
  public latitude!: AbstractControl;

  ngOnInit() {
    // Set Address form group
    this.address = new FormGroup({
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
      ])
    });
    // Add the form group to the parent component
    this.formGroup.addControl('address', this.address);
    // Form
    this.address1 = this.address.controls['address1'];
    this.address2 = this.address.controls['address2'];
    this.postalCode = this.address.controls['postalCode'];
    this.city = this.address.controls['city'];
    this.department = this.address.controls['department'];
    this.region = this.address.controls['region'];
    this.country = this.address.controls['country'];
    this.coordinates = this.address.controls['coordinates'] as FormArray;
    this.longitude = this.coordinates.at(0);
    this.latitude = this.coordinates.at(1);
    // Set
    this.loadAddress();
  }

  ngOnChanges() {
    this.loadAddress();
  }

  public loadAddress() {
    if (!this.addressData) {
      return;
    }
    if (this.addressData.address1) {
      this.address.controls.address1.setValue(this.addressData.address1);
    }
    if (this.addressData.address2) {
      this.address.controls.address2.setValue(this.addressData.address2);
    }
    if (this.addressData.postalCode) {
      this.address.controls.postalCode.setValue(this.addressData.postalCode);
    }
    if (this.addressData.city) {
      this.address.controls.city.setValue(this.addressData.city);
    }
    if (this.addressData.department) {
      this.address.controls.department.setValue(this.addressData.department);
    }
    if (this.addressData.region) {
      this.address.controls.region.setValue(this.addressData.region);
    }
    if (this.addressData.country) {
      this.address.controls.country.setValue(this.addressData.country);
    }
    if (this.addressData.coordinates && this.addressData.coordinates.length === 2) {
      this.coordinates.at(0).setValue(this.addressData.coordinates[0]);
      this.coordinates.at(1).setValue(this.addressData.coordinates[1]);
      this.longitude = this.coordinates.at(0);
      this.latitude = this.coordinates.at(1);
    }
  }

  setAddress(address: GoogleAddress) {
    // Set data
    let streetNumber = '';
    let route = '';

    address.address_components.forEach(((addressComponent) => {
      switch (addressComponent.types[0]) {
        // Postal Code
        case 'postal_code':
          this.address.controls.postalCode.setValue(addressComponent.long_name);
          break;
        // Town
        case 'locality':
          this.address.controls.city.setValue(addressComponent.long_name);
          break;
        // Department
        case 'administrative_area_level_2':
          this.address.controls.department.setValue(addressComponent.long_name);
          break;
        // Region
        case 'administrative_area_level_1':
          this.address.controls.region.setValue(addressComponent.long_name);
          break;
        // Country
        case 'country':
          this.address.controls.country.setValue(addressComponent.long_name);
          break;
        case 'route':
          route = addressComponent.long_name;
          break;
        case 'street_number':
          streetNumber = addressComponent.long_name;
          break;
      }
    }));
    // build Address 2
    const address2 = `${streetNumber} ${route}`;
    // Address
    this.address.controls.address1.setValue(address.name);
    // Set Address 2 if different from Address 1
    if (address2 !== address.name) {
      this.address.controls.address2.setValue(address2);
    } else {
      this.address.controls.address2.setValue('');
    }
    // Latitude
    this.latitude.setValue(address.geometry.location.lat());
    this.latitude.markAsTouched();
    // Longitude
    this.longitude.setValue(address.geometry.location.lng());
    this.longitude.markAsTouched();
    // set as dirty
    this.formGroup.markAsDirty();
  }

  showPlace() {
    window.open(`http://maps.google.com/maps?q=${this.latitude.value},${this.longitude.value}`);
  }
}
