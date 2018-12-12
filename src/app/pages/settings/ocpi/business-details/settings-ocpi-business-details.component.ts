import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { AuthorizationService } from '../../../../services/authorization-service';
import { AbstractControl, FormControl, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-settings-ocpi-business-details',
  templateUrl: 'settings-ocpi-business-details.component.html'
})
export class SettingsOcpiBusinessDetailsComponent implements OnInit {
  public isAdmin;
  public formGroup: FormGroup;
  public logoGroup: FormGroup;

  public name: AbstractControl;
  public country_code: AbstractControl;
  public party_id: AbstractControl;
  public website: AbstractControl;

  public logo_url: AbstractControl;
  public logo_thumbnail: AbstractControl;
  public logo_category: AbstractControl;
  public logo_type: AbstractControl;
  public logo_width: AbstractControl;
  public logo_height: AbstractControl;

  public logoTypes: any = [
    { key: '', description: '' },
    { key: 'jpg', description: 'JPG' },
    { key: 'png', description: 'PNG' },
    { key: 'svg', description: 'SVG' },
    { key: 'gif', description: 'GIF' }
  ];

  public logoCategories: any = [
    { key: 'CHARGER', description: 'Charger' },
    { key: 'ENTRANCE', description: 'Entrance' },
    { key: 'LOCATION', description: 'Location' },
    { key: 'NETWORK', description: 'Network' },
    { key: 'OPERATOR', description: 'Operator' },
    { key: 'OWNER', description: 'Owner' },
    { key: 'OTHER', description: 'Other' }
  ]

  private urlPattern = /^(http:\/\/www\.|https:\/\/www\.|http:\/\/|https:\/\/)?[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,5}(:[0-9]{1,5})?(\/.*)?$/;
  private numberPattern = /^[0-9]*$/;

  
  private readonly currentCPODetails: any;

  constructor(
    private authorizationService: AuthorizationService,
    private translateService: TranslateService
  ) {
    this.currentCPODetails = {
      'country_code': 'FR',
      'party_id': 'SLF',
      'businessDetails': {
        'name': 'SAP Labs France',
        'logo': {
          "url": "https://example.com/img/logo.jpg",
          "thumbnail": "https://example.com/img/logo_thumb.jpg",
          "category": "OPERATOR",
          "type": "jpeg",
          "width": 512,
          "height": 512
        },
        "website": "http://example.com"
      }
    }
  }

  ngOnInit(): void {
    // Scroll up
    // jQuery('html, body').animate({ scrollTop: 0 }, { duration: 500 });

    this.formGroup = new FormGroup({
      'country_code': new FormControl(this.currentCPODetails.country_code,
        Validators.compose([
          Validators.required,
          Validators.maxLength(2),
          Validators.minLength(2)
        ])),
      'party_id': new FormControl(this.currentCPODetails.party_id,
        Validators.compose([
          Validators.required,
          Validators.maxLength(3),
          Validators.minLength(3)
        ])),
      'businessDetails': new FormGroup({
        'name': new FormControl(this.currentCPODetails.businessDetails.name),
        'website': new FormControl(this.currentCPODetails.businessDetails.website,
          Validators.pattern(this.urlPattern)),
        'logo': new FormGroup({
          'url': new FormControl(this.currentCPODetails.businessDetails.logo.url,
            Validators.pattern(this.urlPattern)),
          'thumbnail':  new FormControl(this.currentCPODetails.businessDetails.logo.thumbnail),
          'category': new FormControl(this.currentCPODetails.businessDetails.logo.category),
          'type': new FormControl(this.currentCPODetails.businessDetails.logo.type),
          'width': new FormControl(this.currentCPODetails.businessDetails.logo.width,
            Validators.pattern(this.numberPattern)),
          'height': new FormControl(this.currentCPODetails.businessDetails.logo.height,
            Validators.pattern(this.numberPattern))
        })
      })
    });

    // business details - CPO identifier
    this.country_code = this.formGroup.controls['country_code'];
    this.party_id = this.formGroup.controls['party_id'];
  

    // business details - logo
    this.name = (<FormGroup>this.formGroup.controls['businessDetails']).controls['name'];
    this.website = (<FormGroup>this.formGroup.controls['businessDetails']).controls['website'];
    this.logoGroup = <FormGroup>(<FormGroup>this.formGroup.controls['businessDetails']).controls['logo'];
    this.logo_url = this.logoGroup.controls['url'];
    this.logo_thumbnail = this.logoGroup.controls['thumbnail'];
    this.logo_category = this.logoGroup.controls['category'];
    this.logo_type = this.logoGroup.controls['type'];
    this.logo_width = this.logoGroup.controls['width'];
    this.logo_height = this.logoGroup.controls['height'];
  }
}
