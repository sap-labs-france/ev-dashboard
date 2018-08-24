import { Component, Input, OnInit } from '@angular/core';
import { FormGroup, AbstractControl } from '@angular/forms';
import { Address } from 'ngx-google-places-autocomplete/objects/address';
import 'rxjs/add/operator/mergeMap';

@Component({
    selector: 'app-address-cmp',
    templateUrl: 'address.component.html'
})
export class AddressComponent implements OnInit {
    @Input() formGroup: FormGroup;
    public address: FormGroup;
    public address1: AbstractControl;
    public address2: AbstractControl;
    public postalCode: AbstractControl;
    public city: AbstractControl;
    public department: AbstractControl;
    public region: AbstractControl;
    public country: AbstractControl;
    public latitude: AbstractControl;
    public longitude: AbstractControl;

    constructor() {
    }

    ngOnInit() {
        // Form
        this.address = <FormGroup>this.formGroup.controls['address'];
        this.address1 = this.address.controls['address1'];
        this.address2 = this.address.controls['address2'];
        this.postalCode = this.address.controls['postalCode'];
        this.city = this.address.controls['city'];
        this.department = this.address.controls['department'];
        this.region = this.address.controls['region'];
        this.country = this.address.controls['country'];
        this.latitude = this.address.controls['latitude'];
        this.longitude = this.address.controls['longitude'];
    }

    setAddress(address: Address) {
        // Set data
        address.address_components.forEach(((address_component) => {
            switch (address_component.types[0]) {
                // Postal Code
                case 'postal_code':
                    this.address.controls.postalCode.setValue(address_component.long_name);
                    break;
                // Town
                case 'locality':
                    this.address.controls.city.setValue(address_component.long_name);
                    break;
                // Department
                case 'administrative_area_level_2':
                    this.address.controls.department.setValue(address_component.long_name);
                    break;
                // Region
                case 'administrative_area_level_1':
                    this.address.controls.region.setValue(address_component.long_name);
                    break;
                // Country
                case 'country':
                    this.address.controls.country.setValue(address_component.long_name);
                    break;
            }
        }));
        // Address
        this.address.controls.address1.setValue(address.name);
        // Latitude
        this.address.controls.latitude.setValue(address.geometry.location.lat());
        // Longitude
        this.address.controls.longitude.setValue(address.geometry.location.lng());
    }

    showPlace() {
        window.open(`http://maps.google.com/maps?q=${this.address.controls.latitude.value},${this.address.controls.longitude.value}`);
    }
}