import { Component, EventEmitter, Input, OnChanges, OnInit } from '@angular/core';
import { AbstractControl, FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CentralServerService } from 'services/central-server.service';
import { MessageService } from 'services/message.service';
import { WindowService } from 'services/window.service';
import { AbstractTabComponent } from 'shared/component/abstract-tab/abstract-tab.component';
import { Site } from 'types/Site';

@Component({
  selector: 'app-site-ocpi',
  templateUrl: 'site-ocpi.component.html',
})
export class SiteOcpiComponent extends AbstractTabComponent implements OnInit {
  @Input() public site!: Site;
  @Input() public formGroup!: FormGroup;

  public tariffID: AbstractControl;
  public public = false;

  // eslint-disable-next-line no-useless-constructor
  public constructor(private centralServerService: CentralServerService,
    private messageService: MessageService,
    private router: Router,
    activatedRoute: ActivatedRoute,
    windowService: WindowService) {
    super(activatedRoute, windowService, [], false);
  }

  public ngOnInit() {
    // Init the form
    this.formGroup.addControl('tariffID', new FormControl('',
      Validators.compose([
        Validators.maxLength(50),
      ])));

    // Form
    this.tariffID = this.formGroup.controls['tariffID'];
    this.tariffID.disable();
  }

  public loadSite(site: Site) {
    this.site = site;
    this.public = site.public;
    this.adaptTariffState();
    if (this.site?.tariffID) {
      this.tariffID.setValue(this.site.tariffID);
    }
  }

  public publicChanged(publicValue: boolean) {
    this.public = publicValue;
    this.adaptTariffState();
  }

  private adaptTariffState() {
    if (this.public) {
      this.tariffID.enable();
    } else {
      this.tariffID.disable();
    }
  }
}
