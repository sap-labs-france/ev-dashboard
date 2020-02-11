import { Component, OnInit } from '@angular/core';
import { ComponentService, ComponentType } from 'app/services/component.service';

@Component({
  selector: 'app-settings-building',
  templateUrl: './settings-building.component.html',
})
export class SettingsBuildingComponent implements OnInit {
  public isActive = false;

  constructor(
    private componentService: ComponentService,
  ) {
    this.isActive = this.componentService.isActive(ComponentType.BUILDING);
  }

  ngOnInit(): void {
  }
}
