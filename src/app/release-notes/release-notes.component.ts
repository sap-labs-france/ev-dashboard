import {Component} from '@angular/core';

interface ReleaseNotes {
  version: string;
  date: Date;
  componentChanges: ComponentChange[];
}

interface ComponentChange {
  name: string;
  changes: String []
}

@Component({
  templateUrl: './release-notes.component.html',
  styleUrls: ['./release-notes.component.scss']
})
export class ReleaseNotesComponent {
  // Release Notes
  public releaseNotes: ReleaseNotes[] = [
    {
      version: '2.0.13',
      date: new Date('2019-02-22'),
      componentChanges: [
        {
          name: 'Front-end',
          changes: [
            `Added the Dashboard Front-page 1/2 (in progress)`,
            `Added Convergent Charging features`,
            `Changed to a completely new design (Fiori like)`,
            `Enhanced OCPI interface`,
            `Improve performances`,
            `Bug fixes`
          ]
        },
        {
          name: 'Backend',
          changes: [
            `Transaction consumption migration (convert meter values to consumption values)`,
            `Transaction consumption can be used in SAP Cloud Analytics`,
            'Passed OCPI certification as CPO (Charge Point Operator)',
            'Added Convergent Charging consumption calculation + invoicing',
            'Fix total duration secs during a charge',
            'Fix SoC/Price calculation in Consumption calculation',
            'SiteManagement - add filter for Company and Site',
            'Update heartbeat timestamp in Start/Stop Transaction',
            'Fix issue with assignment of users and chargingStations',
            'Handle Status Notif with connector 0 for EBEE',
            'Odata - add ChargingStations SiteAreas Sites',
            'Add charger info in Notification logs to trace user\'s transaction',
            'Stop the transaction for ABB when status changes from Finishing to Available',
            'Fixed no error provided when connector is faulty'
          ]
        }
      ]
    },
    {
      version: '2.0.12',
      date: new Date('2019-02-10'),
      componentChanges: [
        {
          name: 'Front-end',
          changes: [
            `Added Transactions to be refunded with Concur`,
            `Added GPS localization for Charging Station`,
            `Added 'Auto assign new user to Site' checkbox in Site management`,
            `Propagate Refresh event to dialogs`,
            `Restore Search and Filters in table toolbar`,
            `Set details and select columns with fixed width`,
            `Bug + CSS fixes`
          ]
        },
        {
          name: 'Backend',
          changes: [
            `Created background jobs to update Charger's statuses for GIREVE`,
            'Added more info in logs for OCPI registration',
            'Added User IDs and Tad IDs in OData for SAP Analytics',
            `Added GPS localization for Charging Stations`,
            `Handled new flag 'Auto assign new user to Site' in Site entity`,
            `Removed handling of unavailable connector status on ABB (charge in //)`,
            `Fixed Unit Tests on Transaction`,
            `Set Charger's inactivity to 5 mins`,
            `Added Charger info in User's notifications logs`,
            `Fixed Available/Occupied Chargers for Site/Site Area for the mobile app`,
            `Fixed invalid consumption computation for charts`,
            `Fixed badge saving + Start Transaction with no Badge ID`,
            `Handled Status Notif with connector '0' for EBEE`,
            `Fixed no error info provided when connector is faulty`,
            `Fixed ABB bug on not sending Stop Transaction when user unlocks his car`,
            `Fixed User not assigned to a Site (error handling)`,
            `Checked Badge ID in Start/Stop Transaction + Fix exception handling`,
            `Simplified oData server`
          ]
        }
      ]
    },
    {
      version: '2.0.11',
      date: new Date('2019-01-26'),
      componentChanges: [
        {
          name: 'Front-end',
          changes: [
            `Added Transactions to be refunded with Concur`,
            `Numerous Bug + CSS fixes`
          ]
        },
        {
          name: 'Backend',
          changes: [
            `OData prototype for integrating live data connection with SAP Analytics`,
            `Minor bug fixes`
          ]
        }
      ]
    },
    {
      version: '2.0.10',
      date: new Date('2019-01-22'),
      componentChanges: [
        {
          name: 'Front-end / Backend',
          changes: [
            `Concur Authentication`,
            `Smart Charging implementation`,
            `OCPI finalization`,
            `Site Management`
          ]
        }
      ]
    },
    {
      version: '2.0.9',
      date: new Date('2019-01-14'),
      componentChanges: [
        {
          name: 'Backend',
          changes: [
            `All admins receive a notification in case of errors on chargers`,
            `OCPI Beta version`
          ]
        }
      ]
    },
    {
      version: '2.0.8',
      date: new Date('2019-01-01'),
      componentChanges: [
        {
          name: 'Components',
          changes: [
            `Added Charging Station Details + Actions`,
            `Added Transactions In Progress and In Error`,
            `Added Transaction's Charging Curves`,
            `Added OCPI Configuration`,
          ]
        },
        {
          name: 'Backend',
          changes: [
            `Transactions optimizations`,
            `OCPI Alpha version`
          ]
        }
      ]
    },
    {
      version: '2.0.7',
      date: new Date('2018-12-01'),
      componentChanges: [
        {
          name: 'Components',
          changes: [
            `Added User Management`,
            `Added Charging Station List`,
            `Added Transaction History`
          ]
        }
      ]
    },
    {
      version: '2.0.6',
      date: new Date('2018-11-14'),
      componentChanges: [
        {
          name: 'Tenant',
          changes: [
            `Fixed access to EULA within the tenant`,
            `Fixed Max Current setting`,
            `Add error messages in Tenant management Create/Update form`,
            `Add Tenant ID column in the Tenant list`,
            `Handle ABB Status Notification with Connector ID = 0`,
            `Fixed pricing change in multi-tenant`,
            `Set the default Json Server URL for Chargers running OCPP 1.6`
          ]
        }
      ]
    },
    {
      version: '2.0.5',
      date: new Date('2018-11-10'),
      componentChanges: [
        {
          name: 'Tenant',
          changes: [
            `Deployed tenant management on SCP`,
            `Created a new tenant for SAP Labs France (slf)`,
            `Migrated the Database to the new 'slf' tenant`,
            `Connected of the SAP Labs France chargers to the new 'slf' tenant`
          ]
        }
      ]
    },
    {
      version: '2.0.4',
      date: new Date('2018-10-10'),
      componentChanges: [
        {
          name: 'Tenant Management',
          changes: [
            `Implemented Super Admin role`,
            `Implemented Tenant Management (only visible to users with Super Admin role)`
          ]
        },
        {
          name: 'Unit Test',
          changes: [
            `Implemented Unit Tests framework`,
            `Delivered Unit Test: User Registration`
          ]
        }
      ]
    },
    {
      version: '2.0.3',
      date: new Date('2018-09-29'),
      componentChanges: [
        {
          name: 'Account Activation',
          changes: [
            `Implemented automatic Account activation (via email)`,
            `Resend Account activation link via email (in case of the first email is lost)`
          ]
        },
        {
          name: 'Logs',
          changes: [
            `Added hi-avail pop-up filter`,
            `Added User's pop-up filter`,
            `Added Charger's pop-up filter`
          ]
        }
      ]
    },
    {
      version: '2.0.1',
      date: new Date('2018-09-11'),
      componentChanges: [
        {
          name: 'Logs',
          changes: [
            `Added Details section`
          ]
        }
      ]
    },
    {
      version: '2.0.0',
      date: new Date('2018-09-07'),
      componentChanges: [
        {
          name: 'Authentication',
          changes: [
            `Implementation of Log in, Register and Reset Password views`
          ]
        },
        {
          name: 'Logs',
          changes: [
            `Implementation of Logs view with Filtering, Sorting and Pagination`
          ]
        },
        {
          name: 'Users',
          changes: [
            `Implementation of user's profile edition`
          ]
        }
      ]
    }
  ];
}
