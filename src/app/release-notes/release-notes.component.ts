import { Component } from '@angular/core';
import { AuthorizationService } from 'app/services/authorization-service';

interface ReleaseNotes {
  version: string;
  date: Date;
  componentChanges: ComponentChange[];
}

interface ComponentChange {
  name: string;
  changes: String [];
}

@Component({
  templateUrl: './release-notes.component.html'
})
export class ReleaseNotesComponent {
  public releaseNotes: ReleaseNotes[] = [];

  constructor(
    private authorizationService: AuthorizationService
  ) {
    this.buidlReleaseNotes();
  }

  buidlReleaseNotes(): any {
    this.releaseNotes = [
      {
        version: '2.0.29',
        date: new Date('2019-07-07'),
        componentChanges: [
          {
            name: 'Front-end',
            changes: [
              `Added in Refund list's footer statistics on refunded/pending sessions`,
              `Added inactivity in Statistics`,
              `Set a User as 'Site Admin' on a given a Site and Basic Users`,
              `Switch on/off Statistics in Tenant's configuration`,
              `Split charts and fit them in the visible area`,
              `Limited the Statistics to the Top 20 Consumptions/Usages for better readability`,
              `Filter on all years`,
              `Split Statistics chart to Year/Month`,
              `Migrated the application to Angular version 8`,
              `Displayed Statistic chart's legends `
            ]
          },
          {
            name: 'Backend',
            changes: [
              `Typescript migration`,
              `Encrypt sensitive data stored in database (password, secret key...)`,
              `Added Site Admin role for Basic users`
            ]
          }
        ]
      },
      {
        version: '2.0.28',
        date: new Date('2019-07-04'),
        componentChanges: [
          {
            name: 'Front-end',
            changes: [
              `Fixed when there is only one connector in charger's details`,
              `Added capability to search in detailed logs`
            ]
          },
          {
            name: 'Backend',
            changes: [
              `Fixed BootNotification for DBT charger with registration URL in uppercase in OCPP 1.5 (Soap)`,
              `Fixed BootNotification for Hager charger with wrong parsed Soap Headers`,
              `Handle getting the charging stations with not all the connectors registered`,
              `Check that the chargeBoxIdentity is always provided in OCPP`,
              `Enhanced OCPP SOAP logging by adding SOAP Headers`,
              `Fixed new registered Users are not auto-assigned to Sites`,
            ]
          }
        ]
      },
      {
        version: '2.0.27',
        date: new Date('2019-06-08'),
        componentChanges: [
          {
            name: 'Front-end',
            changes: [
              `Add the Tenant name into the notification email's subject`,
              `Statistics' pie chart: Added the unit in labels and added a legend`,
              `Use authorization based on scopes`,
              `Use theme colors in chart`,
              `Enhanced Logging's Actions for OCPI`,
              `Center vertically the tooltip in Statistics' bar chart`,
              `Removed double scroll bar when displaying the Session's charging curve`
            ]
          },
          {
            name: 'Backend',
            changes: [
              `Set first consumption to 0 kW.h in the Session's charging curve`,
              `Refactoring of Authorizations based on scopes`
            ]
          }
        ]
      },
      {
        version: '2.0.26',
        date: new Date('2019-06-03'),
        componentChanges: [
          {
            name: 'Front-end',
            changes: [
              `Added units in Statistics + Format numbers with locale in User's profile`,
              `Fixed all values appear in Session's charging curve`
            ]
          },
          {
            name: 'Backend',
            changes: [
              `Removed from Log's source the instance ID`,
              `Take into consideration the price to optimize the Session charging curve`,
              `Fixed auto disconnect user when he/she has more than 2 badges in his/her profile`
            ]
          }
        ]
      },
      {
        version: '2.0.25',
        date: new Date('2019-06-01'),
        componentChanges: [
          {
            name: 'Front-end',
            changes: [
              `Migrated reCaptcha V2 to V3 in Reset Password, Register User and Resend Verification Link screens`,
              `User's role is not translated in Faulty list`,
              `Added extra inactivity (until connector is unplugged) in session's list footer stats`,
              `Fixed date filters not working anymore in all list`,
              `Added missing actions in Log action filter`,
              `Added inactivity in Charging Station list`,
              `Added Statistics on Consumption and Usage`
            ]
          },
          {
            name: 'Backend',
            changes: [
              `Optimized Session's consumptions with lots of duplicate points`,
              `Clear charging data on connectors if Charging Station is unavailable`,
              `Reworked database indexes in Logs collection`,
              `Migrate database only in master NodeJs instance not in workers`,
              `Watch MongoDB collections at DB level to enhance the performances`,
              `Removed query string in LEGRAND charging station supervision URL`,
              `Handle Meter Value consumption as floating point instead of integer for KEBA certification`,
              `Round instant power in transaction's consumption`,
              `Fixed Is Authorized to Stop Transaction for Mobile app`,
              `Add inactivity in Charging Station's connectors`
            ]
          }
        ]
      },
      {
        version: '2.0.24',
        date: new Date('2019-05-26'),
        componentChanges: [
          {
            name: 'Front-end',
            changes: [
              `Fixed when two Charging Station details are opened, the second one overrode the first one`,
              `Fixed Dialog Filters kept the last selection`,
              `Can perform a Remote Start Session on Occupied connector (Keba)`,
              `Show IDs in all list for Admin users`,
              `Super Admin cannot access Settings and Connectors in Master Tenant`,
              `Added creation of Tenant with Components`,
              `Added Component's type drop-down per component`,
              `Unfold the sidebar when the screen width is greater than 1280 pixels`
            ]
          },
          {
            name: 'Backend',
            changes: [
              `Removed unnecessary authorizations for Super Admin user`,
              `Enhanced Concur logging`,
              `Check Serial Number if the Vendor/Model does not match during a Boot Notification`,
              `Make all connectors unavailable if the charger does not report to the backend`,
              `Convergent Charging based on Site Area instead of Charging Station`,
              `Add extra inactivity when the connector's status changes from Finishing to Available at the end of the transaction`,
              `Updated the authentication token size`,
              `Changed storage structure of Component's settings`
            ]
          }
        ]
      },
      {
        version: '2.0.23',
        date: new Date('2019-05-18'),
        componentChanges: [
          {
            name: 'Front-end',
            changes: [
              `Enable the price for Basic users`,
              `Hide Concur connector when Refunding is not activated`,
              `Update columns in refund table`,
              `Add table action to jump to Concur`,
              `Added statistics in sessions history footer`,
              `Hide spinner in case of network exception in tables`,
              `Fix charger's detail layout and connector types in dorp-down`,
              `Uncheck unselectable refund rows in table after a refunding`,
              `Improved performances of lists + fix sticky list header issue on Firefox and Safari`,
              `Users are logged off if their profile or tenant's config are changed`,
              `Admin can disable the notifications for a given user`
            ]
          },
          {
            name: 'Backend',
            changes: [
              `Fixed Charging Station, Company, Site and Site Area to not break pagination in the frontend`,
              `Post expense entries in parallel and add retry process in case of error`,
              `OCPI - OData - Requires authentication for metadata and schema`,
              `Add OCPP validation of Session request (1.6 and 1.5)`,
              `Save last reboot date of Charging Station`,
              `Fix potential duplicate keys when computing IDs with timestamp (use of ISO date instead of to string date)`,
              `Migration task to update the price of existing Sessions`
            ]
          }
        ]
      },
      {
        version: '2.0.22',
        date: new Date('2019-05-09'),
        componentChanges: [
          {
            name: 'Front-end',
            changes: [
              `Unchecked unselectable row in all lists`,
              `Added a link in refunded sessions to jump to the Concur report`,
              `Added a confirmation dialog for starting and stopping the OCPI background job`,
              `Added missing entries 'Action' filter field in Logs`,
              `Reinit list paging after searching`,
              `Disabled master selection checkbox in header list if no records`,
              `Refactored table data management`,
              `Changed page size to 200 in logs`,
              `Load total number of records in list only when necessary`,
              `Add spinner to data source`,
              `Simplify dialog constructors`,
              `Reload data with spinner when filter is changed`,
              `Added auto-refresh to session's details pop-up when a session in ongoing`,
              `Enabled polling auto-refresh only when enabled in configuration`,
              `Fixed Google map autocomplete issue`
            ]
          },
          {
            name: 'Backend',
            changes: [
              `Stored Concur report ID in session for tracking purpose`,
              `Stored timezone in sessions`,
              `Fixed the auto reconnect logic on a valid web socket close`,
              `Updated session duration in notification`,
              `Fixed basic user see all charging stations`,
              `Fixed Site-Area filter does not work in Sessions`,
              `Always create a new report in Concur when a refund is requested`
            ]
          }
        ]
      },
      {
        version: '2.0.21',
        date: new Date('2019-05-01'),
        componentChanges: [
          {
            name: 'Front-end',
            changes: [
              `Handling of number of phases of DC Chargers`,
              `Should be able to start a Session when connector status is 'Preparing'`,
              `Should be able to see the list of chargers in Site Area`,
              `Display an error message when Session fails to start`,
              `Handle auto stop of Session when user got locked after starting one`,
            ]
          },
          {
            name: 'Backend',
            changes: [
              `Validate charger's messages with JSon schemas`,
            ]
          }
        ]
      },
      {
        version: '2.0.20',
        date: new Date('2019-04-29'),
        componentChanges: [
          {
            name: 'Front-end',
            changes: [
              `Dialog Filters: Overlay appears without showing the pop-up`,
              `Chargers: Concatenate connector's errors in one column instead of three`,
              `Site Area: User access control checkbox value is displayed for Basic user`,
              `Session Details: Added the percentage of inactivity`
            ]
          }
        ]
      },
      {
        version: '2.0.19',
        date: new Date('2019-04-28'),
        componentChanges: [
          {
            name: 'Front-end',
            changes: [
              `Productive use of the new e-Mobility front-end`
            ]
          },
          {
            name: 'Backend',
            changes: [
              `Concur: Add quick expense V4 implementation`,
              `Convergent Invoicing: Enhanced logs when an error occurred`,
              `Ignored connector ID 0 for EBEE charger`            ]
          }
        ]
      }
    ];
  }
}
