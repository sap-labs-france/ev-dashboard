import { Component, Input, OnInit } from '@angular/core';
import { AbstractControl, FormArray, FormGroup } from '@angular/forms';
import { Address } from 'ngx-google-places-autocomplete/objects/address';

@Component({
  selector: 'app-address',
  templateUrl: 'address.component.html',
})
export class AddressComponent implements OnInit {
  @Input() formGroup: FormGroup;
  @Input() hideGeoLocation = false;
  public address: FormGroup;
  public address1: AbstractControl;
  public address2: AbstractControl;
  public postalCode: AbstractControl;
  public city: AbstractControl;
  public department: AbstractControl;
  public region: AbstractControl;
  public country: AbstractControl;
  public coordinates: FormArray;
  public longitude: AbstractControl;
  public latitude: AbstractControl;

  ngOnInit() {
    // Form
    this.address = (this.formGroup.controls['address'] as FormGroup);
    this.address1 = this.address.controls['address1'];
    this.address2 = this.address.controls['address2'];
    this.postalCode = this.address.controls['postalCode'];
    this.city = this.address.controls['city'];
    this.department = this.address.controls['department'];
    this.region = this.address.controls['region'];
    this.country = this.address.controls['country'];
    this.coordinates = this.address.controls['coordinates'] as FormArray;
    if (this.coordinates) {
      this.longitude = this.coordinates.at(0);
      this.latitude = this.coordinates.at(1);
    }
  }

  setAddress(address: Address) {
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
