import { AbstractControl } from '@angular/forms';
import { FormGroup } from '@angular/forms';

export class Sites {
  public static SITE_WITH_COMPANY = true;
  public static SITE_WITH_NO_COMPANY = false;

  public static SITE_WITH_IMAGE = true;
  public static SITE_WITH_NO_IMAGE = false;

  public static SITE_WITH_SITE_AREAS = true;
  public static SITE_WITH_NO_SITE_AREAS = false;

  public static SITE_WITH_CHARGERS = true;
  public static SITE_WITH_NO_CHARGERS = false;

  public static SITE_WITH_USERS = true;
  public static SITE_WITH_NO_USERS = false;

  public static SITE_NO_IMAGE = 'assets/img/theme/no-logo.jpg';
}
