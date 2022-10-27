import { Injectable } from '@angular/core';

import { TenantFeatures } from '../types/Tenant';
import { CentralServerService } from './central-server.service';

@Injectable()
export class FeatureService {
  private activeFeatures!: string[]|null;

  public constructor(
    private centralServerService: CentralServerService) {
    this.centralServerService.getCurrentUserSubject().subscribe((user) => {
      if (user && user.activeFeatures) {
        this.activeFeatures = user.activeFeatures;
      } else {
        this.activeFeatures = null;
      }
    });
  }

  public isActive(featureName: TenantFeatures): boolean {
    if (this.activeFeatures) {
      return this.activeFeatures.includes(featureName);
    }
    return false;
  }
}
