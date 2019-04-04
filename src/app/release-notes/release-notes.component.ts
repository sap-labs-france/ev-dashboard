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
  templateUrl: './release-notes.component.html'
})
export class ReleaseNotesComponent {
  // Release Notes
  public releaseNotes: ReleaseNotes[] = [
    {
      version: '2.0.17',
      date: new Date('2019-03-26'),
      componentChanges: [
        {
          name: 'Front-end (Stabilization)',
          changes: [
            `Deactivate dashboard page`,
            `Remove useless HTML comments`,
            `Enhance Datetime Picker with popup is opened only when the user click on the toggle`,
            `Fixed issues for missing settings`,
            `Fix padding for toolbar in cards`,
            `Reset Filter is now a left action`,
            `Remove charging station filter for Super Admin`,
            `Fix missing tooltip`,
            `Fix improper Reset Filter button placement`,
            `First version of new tooltip`,
            `Fixed user assignment dialog`,
            `Always create a toolbar above filters for reset`,
            `Allow Admins to search a user by car's Plate ID`,
            `Add the vehicle Plate ID in User's profile for Admin only`,
            `Fixed search reset`,
            `Add password HTML Form styles for Chromium`,
            `Placed filter reset action in toolbar`,
            `Charger's Connector cell simplification and tooltips continuation`,
            `Fixed button resets search value but not field`,
            `Creates button and action for reseting all filters`,
            `Add High Consumption in Action filter for Faulty Sessions list`,
            `Handle high consumption in faulty sessions`,
            `Changed minimum height for dialogs`,
            `Remove unnecessary calls to jquery Remove dead code`,
            `Use of tooltip bootsrap style`,
            `List's Paginator: default min lines set to 50`,
            `All filters now reset the list's Paginator`,
            `Move tab 'Applications' before 'Miscs' in User's profile and rename it to 'Connectors'`,
            `Add french duration language and do not display minutes if duration is greater than 24h`,
            `Settings: Move Save btn at top left in a toolbar`,
            `OCPI: add action SendEVSEStatuses to logs action list`,
            `Adapt charger error data source to inject logic to improve perfs`,
            `List's Paginator now resets when filter changes`,
            `Update battery percentage format in Session`,
            `Pricing > Settings: Handle Information Card`,
            `Chargers: Fix issues and move connector's images to svg`,
            `Remove use of Perfect ScrollBar`,
            `Avoid too many calls in table data source`,
            `OCPI: Background job: adjust i18n message`,
            `OCPI: Implement start stop background job`,
            `OCPI: Add more action buttons and move send and activate/inactivate job`,
            `Remove export button for demo users`,
            `Filters pop-ups: change button 'Select' to 'Set Filter'`,
            `OCPI: Add confirmation dialog before sending all EVSE statuses`,
            `OCPI: Don't display change confirmation on create`,
            `OCPI: Change eMSP to IOP`,
            `OCPI: Fix change confirmation dialog`,
            `Create dedicated service for Components + Enum`,
            `Component: Update descr for SAC and Roaming: Fix error in pricing`,
            `Pop-ups: Disable outside click close`,
            `Fixed sync issues in translation files`,
            `Sessions: Fix arrow filter position`,
            `Master Tenant: Fix simple pricing tenant issue`,
            `OCPI: Change send EVSEs status display`,
            `Make sure dialogs are closed when user is logged out`,
            `inform the user instead of hiding refunding`,
            `Fixes and change layout of filters`,
            `Fallback angular.json for improving the perfs`,
            `Fixed CSS on material buttons`,
            `Fix progress bar max value`,
            `Fixed CSS in material disabled buttons`,
            `Darken table header/footer`,
          ]
        }
      ]
    },
    {
      version: '2.0.16',
      date: new Date('2019-03-14'),
      componentChanges: [
        {
          name: 'Front-end (Stabilization)',
          changes: [
            `Added more contrast in list's header and paginator + background list set to brand-inverse`,
            `Set Alert close button color to brand inverse`,
            `Fix navigation issue`,
            `Use providers in component instead of module`,
            `Center header title`,
            `Improve tab navigation - Add custom route strategy`,
            `Better handling of dialog height for charging station`,
            `Add docker image generation for the dashboard.`,
            `Add initial date value in filters`,
          ]
        }
      ]
    },
    {
      version: '2.0.15',
      date: new Date('2019-03-09'),
      componentChanges: [
        {
          name: 'Front-end (Stabilization)',
          changes: [
            `Enhanced UI according test feedbacks`,
            `Updated charger's connector CSS`,
            `Fix tab loop changes`,
            `Rename 'Edit location' to 'Assign site'`,
            `Fix the chrome debugger to open the slf tenant by default`,
            `Toggle menu button is white now + increased size in login screen to read CGU checkbox`,
            `Final connector CSS update`,
            `Connector Glow + Border rotate`,
            `Charger - Disable close on Geomap dialog`,
            `Site Management - Add listener to escape for closing dialog`,
            `Geomap - Fix issue with placing charging station`,
            `Geomap - Redesign dialog accoridng to guidelines`,
            `Address - Remove lattitude and longitude in user's profile`,
            `Geomap - change and lat/long manadatory in Chargers`,
            `Charers - Bug fixes and new connector`,
            `Site Area - Rename Maximum Power to Maximum Power Limitation`,
            `Site Management - Add padding to logo/image`,
            `Updated CSS for material date picker`,
            `Confirmation Dialog - Set mat-primary button`,
            `ConfirmationDialog - Change text and option when closing dialog`,
            `Fix transaction chart issue`,
            `Add SiteArea filter on completed transactions history view`,
            `Fix user demo column in small screen`,
            `Fixed hover in selected element in all dowp-downs`,
          ]
        }
      ]
    },
    {
      version: '2.0.14',
      date: new Date('2019-03-02'),
      componentChanges: [
        {
          name: 'Front-end (Stabilization)',
          changes: [
            `Fix OCPP and properties dialog tabs`,
            `Bug fixes and layout improvement`,
            `Charging station - confirmation window when closing dialog`,
            `OCPI - confirmaiton window before exiting dialog`,
            `Correct session page when displaying connector`,
            `Fix charger list`,
            `Fix TS lint error TS2339`,
            `Avoid exec in // in npm target 'clean-install-xxx'`,
            `Organization - add confirmation before leaving window`,
            `Fix longitude regex and address validation (save disabled)`,
            `Fix W.h unit`,
            `Upgrade to latest version of Angular`,
            `Changed CSS on button in list`,
            `Updated CSS`,
            `Fix empty table after navigation`,
            `Updated CSS`,
            `Updated design`          ]
        }
      ]
    },
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
