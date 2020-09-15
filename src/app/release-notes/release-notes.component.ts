import { Component } from '@angular/core';

interface ReleaseNotes {
  version: string;
  date: Date;
  componentChanges: ComponentChange[];
}

interface ComponentChange {
  name: string;
  changes: string[];
}

@Component({
  templateUrl: './release-notes.component.html',
})
export class ReleaseNotesComponent {
  public releaseNotes: ReleaseNotes[] = [];

  constructor() {
    this.buidlReleaseNotes();
  }

  public buidlReleaseNotes() {
    this.releaseNotes = [
      {
        version: '2.4.1',
        date: new Date('2020-09-14'),
        componentChanges: [
          {
            name: 'Dashboard',
            changes: [
              `New Badge Management framework`,
              `Charging Station Template updates`,
              `Set the phase order in the Charging Station parameters for 3 phases Site Area`,
              `Fixed minor bugs`,
            ],
          },
        ],
      },
      {
        version: '2.3.38',
        date: new Date('2020-09-09'),
        componentChanges: [
          {
            name: 'Dashboard',
            changes: [
              `Added ATESS vendor for Smart Charging support`,
              `Fixed number of phase in Smart Charging when no consumption`,
              `Added Logo and Address in Tenant management`,
              `Added Badge ID in Sessions' lists`,
              `Always try to get the User during Start Transaction when ACL is not active on Site Area`,
              `Ignore OCPP Status Notification on Connector ID '0'`,
              `Get OCPI public Locations with no Charging Station`,
              `Push CDRs not pushed at the end of the Session every 15 mins`
            ],
          },
        ],
      },
      {
        version: '2.3.35',
        date: new Date('2020-09-06'),
        componentChanges: [
          {
            name: 'Dashboard',
            changes: [
              `Add manual push of the CDR in Session list`,
              `Do not push OCPI Locations (Sites) if there is no public Charging Station`,
              `Make a charging station inactive`,
              `Added locks in scheduled OCPI jobs`,
              `Do not send notification on offline charging stations that are set inactive`,
              `Display Asset dynamic consumption/production curve`,
              `Don't take into account Inactivity when a Charging Plan is lowering the power below 13 Amps per phase`,
              `Send End of Charge Notification when the last 5 mins consumption is 0 kW.h`,
              `Added Atess Charging Station vendor in templates`,
              `Add a new field Amps per phase in Edit Charging Station`,
              `Added Date/Time range picker control in Statistics`,
              `Updated German and Spanish translations`,
            ],
          },
        ],
      },
      {
        version: '2.3.32',
        date: new Date('2020-08-27'),
        componentChanges: [
          {
            name: 'Dashboard',
            changes: [
              `Push the OCPI CDR when the user unplug the connector with the extra parking time`,
              `Add an additional inactivity consumption when the connector's status changes from Finishing to Available (session stopped by the Charging Station)`,
              `Created a migration task to add an additional inactivity consumption to the existing sessions`,
              `Handling of extra inactivity consumptions in the Sessions/OCPP Unit Tests`,
              `Total consumption renamed for SAP Analytics`,
            ],
          },
        ],
      },
      {
        version: '2.3.30',
        date: new Date('2020-08-21'),
        componentChanges: [
          {
            name: 'Dashboard',
            changes: [
              `Handle multiple OCPI Authorizations with the same Badge ID`,
              `Convert the total parking time in hours in the OCPI CDR`,
              `Put back the price in the OCPI CDR even if the pricing is not active`,
            ],
          },
        ],
      },
      {
        version: '2.3.28',
        date: new Date('2020-08-09'),
        componentChanges: [
          {
            name: 'Dashboard',
            changes: [
              `Get all consumptions to build the CDR sent to the Roaming platform (Gireve)`,
              `Removed the price when the CDR is sent to the Roaming platform (Gireve)`,
              `Fixed the Site Admin users cannot read their Charging Plan`,
              `Smart Charging - Limit the charging schedule periods according the OCPP parameter`,
              `Added the Price Unit in the OCPI Settings when the price is managed by the IOP platform (Gireve)`,
              `Log the URL connection of the Charging Station trying to connect to our backend`,
              `Security: Log all HTTP requests`,
            ],
          },
        ],
      },
      {
        version: '2.3.25',
        date: new Date('2020-08-01'),
        componentChanges: [
          {
            name: 'Dashboard',
            changes: [
              `Dynamic Asset consumptions are now pulled every minute (Schneider BMS)`,
              `Check if Charging Station is offline before sending notification to administrators`,
              `User can report error from the mobile app`,
              `Fixed billing synchronization failure notification`,
              `Provided workaround for Stop Transaction with no ID for Cahors Charging Stations`,
              `Log more information when B2B HTTP Requests fail`,
              `Fixed OCPI CDR total duration is sent in hours`,
              `Force update of OCPP Params of the latest parameters in the template`,
              `Force request OCPP parameters from the Charging Station`,
              `Add Google Map helper in Company, Site and Site Area`,
            ],
          },
        ],
      },
      {
        version: '2.3.22',
        date: new Date('2020-07-23'),
        componentChanges: [
          {
            name: 'Dashboard',
            changes: [
              `Handling of GPS coordinates to locate the Charging Stations`,
              `Added OCPI Tariff module for Gireve`,
              `Handle GPS coordinates of Sites, Site Areas and Charging Stations`,
              `Car Catalog list loading performance improvement`,
              `German translation fixes`,
            ],
          },
        ],
      },
      {
        version: '2.3.19',
        date: new Date('2020-07-18'),
        componentChanges: [
          {
            name: 'Dashboard',
            changes: [
              `Car images are retrieved asynchronously`,
              `Updated Delta Charging Station templates`,
              `Set a default departure time for the SAP Smart Charging`,
              `Synchronize invoices between Stripe and e-Mobility`,
              `Create invoice on Sessions without Billing data`,
              `Store and Download invoices (pdf) from e-Mobility`,
              `Prevent billed sessions from being deleted`,
              `Enhanced Badge unit tests`,
            ],
          },
        ],
      },
      {
        version: '2.3.16',
        date: new Date('2020-07-11'),
        componentChanges: [
          {
            name: 'Dashboard',
            changes: [
              `Added synchronization of User's Invoices with Stripe`,
              `Disabled in SAP Smart Charging the check of the three phases Car on single phase Charging Station`,
              `Added new firmware versions in Charging Station templates`,
              `Fixed Charging Station cannot change limits when not assigned to a Site Area`,
              `Fixed add a single phase Charging Station failed on a single phase Site Area`,
              `Updated Car VIN validator`,
              `Send 24/7 Charging Station availability by default to the Gireve platform`,
              `Do not send Locations with no Charging Station to the Gireve platform`,
              `Do not send the number of phases when DC Charging Stations to the Gireve platform`,
              `Assign an Asset to a Schneider Building Management System and manually retrieve the consumption of the Buildings, Solar Panels...`,
              `Add more columns to distinguish between same Car makers/models/versions in Car selection pop-up`,
              `Converted Action filter in Logs to a pop-up`,
              `Added jump to Logs with predefined filters`,
              `Added Public column in Charging Station list`,
              `Changed Car VIN validator`,
              `Fixed missing spanish translation`,
              `Updated German translation`,
            ],
          },
        ],
      },
      {
        version: '2.3.12',
        date: new Date('2020-07-05'),
        componentChanges: [
          {
            name: 'Dashboard',
            changes: [
              `Added Charging Plan list`,
              `Added Converter selection in Car Management`,
              `Added Static Limitation on Legrand Charging Station`,
              `Added a minimum of 3 schedules when building the Charging Profiles with SAP Smart Charging`,
              `Fixed rounded Amps/Watts numbers in Charging Plans`,
              `Charging Station's total power not updated when not belonging to the templates`,
              `Fixed display power with wrong unit in consumption chart`,
              `Fixed badge is no longer mandatory in user's profile`,
              `Removed Charging Station from the Gireve when changing it to private`,
              `Added a free OCPP key/value input fields in OCPP Parameters`,
              `Notify Admin Users when Charging Stations are overheating`,
              `Use of RegExp to match firmware versions in Charging Station's Templates`,
              `Display DC Power in Session's consumption charts`,
              `Enabled German and Spanish beta translations`,
              `Ensure OCPP error messages always follow the OCPP specs`,
              `Fixed Smart Charging minor bugs`,
            ],
          },
        ],
      },
      {
        version: '2.3.7',
        date: new Date('2020-06-28'),
        componentChanges: [
          {
            name: 'Dashboard',
            changes: [
              `Limit the max power of the 'safe' car to the power of the connector in the SAP Smart Charging`,
              `Auto-detect single phase Car in SAP Smart Charging using new Meter Values per phase`,
              `Implemented EV-Ready minimal amperage of 13A per phase in Static Limitation and SAP Smart Charging`,
              `Excluded Suspended EV from the SAP Smart Charging`,
              `Fixed Badges got deactivated after saving User's profile`,
              `Fixed typos in French translation`,
              `Admin and Basic users can create Cars`,
              `Added Amps/Power of L1, L2 and L3 phases in session's charts`,
              `Added test of Schneider BMS' connection in Asset Settings`,
              `Keep selected legends in consumption charts when the unit is changed (kW/A)`,
              `Fixed sorting on Charging Station list`,
              `Set Static Limitation OCPP parameter for Legrand Charging Station`,
              `Translated EULA in Spanish and German`,
              `Fixed Site Area filter was hanging`,
              `Do not push backend notifications to the front-end if the app is not connected anymore`,
              `Add support for Ebee firmware version 5.10.x`,
            ],
          },
        ],
      },
      {
        version: '2.3.2',
        date: new Date('2020-06-21'),
        componentChanges: [
          {
            name: 'Dashboard',
            changes: [
              `Added auto-refresh toggle button in Charging Plans`,
              `Added AC/DC Voltage and Voltage per phase when available in Session's consumption chart`,
              `Added new firmware versions in Charging Station's Templates`,
              `First Session tab is now Session In Progress`,
              `Fixed translation errors`,
              `Fixed User got notified with Session Not Started when he stopped his Session with his badge`,
              `Handle Power Meter Values per phase on Ebee Charging Station`,
              `Add latest stable Ebee firmware version in templates`,
              `Removed timezone in templates for Schneider Charging Station`,
              `Renamed Charging Station 'private' property to 'public'`,
              `100% Completed the OCPI eMSP and CPO Gireve certification`,
              `Integrated German and Spanish translation`
            ],
          },
        ],
      },
      {
        version: '2.2.76',
        date: new Date('2020-06-13'),
        componentChanges: [
          {
            name: 'Dashboard',
            changes: [
              `Provided Spanish an German translations`,
              `Fixed cannot save Site Area with single phase`,
              `Fixed User name is not hidden for role Demo in Charging Station's connector details`,
              `Fixed cannot delete unused User's badge in User's profile`,
              `Fixed amperage per connector is not displayed for Legrand Charging Stations`,
              `Fixed save of Charging Station parameters does not work when not belonging to a template`,
              `Sort Users In Error list by Created By column in descending order by default`,
              `Added Legrand Charging Station model 059004 in templates`,
              `Send all the Charging Plan schedules provided by the SAP Smart Charging to the Charging Station (remove limit of 3 Schedules max)`,
              `Handling of new Meter Values in the backend: Power, Voltage, Voltage per phase, Amperage, Amperage per phase`,
              `Enabled Charging Plan for Legrand Charging Station validation`,
              `Increased Web Socket timeout for Webasto in templates`,
              `Unlock User when password has been reset successfully`,
              `Updated Shelly wallbox in templates`,
              `Charging Station's Geo Map dialog takes too much space in 720p`,
              `Fixed Charging Plan list height in 720p`
            ],
          },
        ],
      },
      {
        version: '2.2.71',
        date: new Date('2020-06-06'),
        componentChanges: [
          {
            name: 'Dashboard',
            changes: [
              `Added Ebee Charging Station in template`,
              `Enable Amperage and Voltage per phase in Meter Values in templates`,
              `Added Asset integration for Schneider Building Management system access in the backend`,
              `Display Site Area max limitation and if smart charging enabled in the list`,
              `Add User in Connector details in Charging Station's list`,
              `Demo User cannot see the Sessions History`,
              `Use unique ID to build the tree fuse for the SAP Smart Charging service`,
              `Fixed total number of records not refreshed after delete action in all list`,
              `Renamed Session chart legends with grid`,
              `Call delete of TxProfile after consumption calculation in Stop Transaction`,
              `Retrieve the Charging Plans in database if it fails on Charging Station (workaround Cahors)`,
              `Added Schneider 22 kW Charging Station in template (2 x Type 2 of 11 kW)`,
              `Limited Legrand Charging Station's total power to 44 kW`,
              `Switch to Amps in Site Area, Session and Charging Profile's charts`,
              `Added Delta charging station model 10962 (150 kW, 3 connectors) in template`,
              `Added connection to Schneider Build Management system in Assets' settings`,
              `Added missing auto-refresh button in Assets, Cars and Car Catalog`,
              `Fixed Charging Plans auto refresh when changed by the Smart Charging`,
              `Charging Plans and Static Limitation are enabled/disabled when Smart Charging is disabled/enabled`,
              `Static Limitation cursor not modifiable when Smart Charging has been disabled`,
            ],
          },
        ],
      },
      {
        version: '2.2.65',
        date: new Date('2020-05-30'),
        componentChanges: [
          {
            name: 'Dashboard',
            changes: [
              `Increased Safe Car power limitation in Smart Charging to not limit them on DC charging stations`,
              `Simplified Smart Charging logs`,
              `Fixed Site Admin users can see all user's sessions belonging to his Sites`,
              `Fixed Site Admin users can now edit the Charging Station and charge their Site Areas`,
              `Removed Charging Station's power recalculation`,
              `Added Charge Point in OCPI`,
              `Added Charge Point level in Smart Charging`,
              `Enhanced performance of displaying Site Area's consumption chart`,
              `Provide Charging Plan in Watts for Cahors DC Charging Station`,
              `Keep the power of the site area always enabled`,
              `Migrated Charging Stations with Charge Point level`,
              `Amps is stored for all phases in consumptions`,
              `Provide new templates with Charge Point level`,
              `Add Voltage in Site Area`,
              `Fixed auto-refresh handling when user is already logged in`,
              `Fixed Charging Station's token not always accepted`,
              `Fixed Charging Limitation pop-up not closing`,
              `Enhanced auto-refresh of lists when data is changing in database`,
              `Fixed CSS in save pop-up`,
            ],
          },
        ],
      },
      {
        version: '2.2.54',
        date: new Date('2020-05-17'),
        componentChanges: [
          {
            name: 'Dashboard',
            changes: [
              `Accept Charging Station's iccid and imsi properties with empty value during Boot Notification`,
              `Save button in pop-up with many tabs is always visible`,
              `Search input field gets always the focus`,
              `Disable Remove button on assignment pop-ups when no record is selected`,
              `Enter key does no longer closes the pop-up in all Add/Remove templates`,
              `General handling on Enter / Escape key in all Create / Update pop-ups`,
              `Fix OCPI invalid status when remote start is rejected`,
              `Fixed first SoC value is not provided on Cahors after starting a session`,
              `Create Schneider Building Management connection in Asset Settings (front-end)`,
              `Display consumption chart at the first consumption value`,
              `Handle duplicate Meter Values for ABB`,
              `Add Default, Company and Private Car information for end-user`,
              `Refresh Charging Plan's chart when the user changes values in the list`,
              `Do not propagate cell new values in editable list if it's invalid`,
              `Add OCPI data to Charging Stations`,
              `Optimized lists with forms`,
              `Minor bugs fix`,
            ],
          },
        ],
      },
      {
        version: '2.2.47',
        date: new Date('2020-05-09'),
        componentChanges: [
          {
            name: 'Dashboard',
            changes: [
              `Create a new car for Basic user 1/2`,
              `Added Force Invoice synchronization for a given user`,
              `Added free field key/value for setting hidden OCPP params for Cahors`,
              `Added single/three phases configuration in Site Area for Smart Charging`,
              `Added single phase charging station handling with the SAP Smart Charging`,
              `Smart Charging display connectors max limit in chart according connector's max power`,
              `Migration task to store the Site Area's max limitation in former Transactions`,
              `Missing mandatory field flag in Site Area`,
              `Implement OCPI Check Sessions, CDRs and Locations`,
              `When Smart Charging is enabled, inform the user that this will take over the static limitation and the charging plans`,
              `Added Locking on all Scheduler's tasks`
            ],
          },
        ],
      },
      {
        version: '2.2.43',
        date: new Date('2020-05-01'),
        componentChanges: [
          {
            name: 'Dashboard',
            changes: [
              `Added Asset In Error`,
              `Added Invoices synchronization`,
              `Store Site Area max limitation in consumptions`,
              `Add corresponding Maximum Power in amperes in Site Area`,
              `Enable Static Limitation and Charging Plan for Delta charger`,
              `Display price and date in Invoice list`,
              `Selection context not cleared in Asset, Site Area or Charging Station pop-ups`,
              `Divide by 3 the power of the Charging Plan`
            ],
          },
        ],
      },
      {
        version: '2.2.39',
        date: new Date('2020-04-26'),
        componentChanges: [
          {
            name: 'Dashboard',
            changes: [
              `Added Invoices storage in the backend`,
              `Remove units in Charging Plans' columns`,
              `Added Amperage in Charging Plans' power limitation when Smart Charging is active`,
              `Allow decimal number in the Site Area Maximum Power Limitation (Kw) field`,
              `Add the name of the Charger in the Charging Plan's drop down and remove the Level`,
              `When the Charging Plan's schedule list is empty, you cannot delete the plan`,
              `When the Charging Plan list is empty, you cannot delete it`,
              `Use a dialog pop-up to select Company and Site instead of drop down`,
              `Asset button in Site Area list should not be displayed if Asset component is not active`,
              `Maximum Site Area Power Limitation issue should not be modifiable when read-only`,
              `Display 400V in Car's converter voltage column when there are 3 phases`,
              `Add a date filter for displaying the Site Area's consumption at a given date`,
              `Add a checkbox to display all the session chart's points (no optimization)`,
              `Refactored Cars to Cars Catalog`,
              `Add OCPI charging periods in update and stop sessions`,
              `Fixed Smart Charging checkbox disabled Site Area's Max Power Limitation`
            ],
          },
        ],
      },
      {
        version: '2.2.34',
        date: new Date('2020-04-18'),
        componentChanges: [
          {
            name: 'Dashboard',
            changes: [
              `Show Site Area current Consumption`,
              `Force the Smart Charging in Charging Plans`,
              `Converted Build to Asset with Consumption or Production of energy`,
              `Fixed Charging Station's Connectors not aligned`,
              `Fixed SAP Smart Charging root fuses not correctly provided`,
              `Migrated Site/Site Area/User to Object IDs in Consumptions`,
              `Multi-selection on Internal/External Organization filter`
            ],
          },
        ],
      },
      {
        version: '2.2.29',
        date: new Date('2020-04-11'),
        componentChanges: [
          {
            name: 'Dashboard',
            changes: [
              `Added new SupendedEV/EVSE statuses in Smart Charging`,
              `Round Amps in Charging Profile before applying it to the Charging Station`,
              `Delay the Smart Charging call when Start Transaction is received`,
              `Delete the Tx Profile after Stop Transaction`,
              `Delete all the Tx Profiles of all Charging Stations after deactivating the Smart Charge for a given Site Area (keep the Tx Default ones)`,
              `Removed the 4th safe slot in Smart Charging`,
              `Do not delete the Tx Default Profile`,
              `Add the Transaction ID in the Tx Profile`,
              `Display Profile Type in Charging Plan drop down`,
              `Keep the Charging Plan drop down always enabled`,
              `Store Car images in the database`,
              `Optimized Car images loading management`,
              `Made Smart Charging button always visible in Charging Stations list`,
            ],
          },
        ],
      },
      {
        version: '2.2.24',
        date: new Date('2020-04-04'),
        componentChanges: [
          {
            name: 'Dashboard',
            changes: [
              `When Smart Charging is unset in Site Area, all Charging Plans are deleted`,
              `Optimized Session's chart consumptions and limitations using Charging Plans`,
              `Trigger the Smart Charging when the User starts a new Session`,
              `Added Site Area column in Asset list`,
              `Reworked the OCPP Parameter list`,
              `Added Car Maker filter`,
              `Disable coordinates button in address if not provided`,
              `Added the Source of the limitation in Smart Charging (Connector, Static Limitation, Charging Profiles)`,
              `Upgraded to Angular 9`,
            ],
          },
        ],
      },
      {
        version: '2.2.20',
        date: new Date('2020-03-28'),
        componentChanges: [
          {
            name: 'Dashboard',
            changes: [
              `Added Billing invoice list`,
              `SAP Smart Charging implementation`,
              `Assign a Asset to a Site Area`,
              `Webasto implementation in Charging Plan management`,
              `Fixed bug in retrieving the current limitation during a Session`,
              `Fixed Session not starting notification when Connector is in Preparing mode`,
              `Added debug logs for third party Charging Station vendor libraries`,
              `Fixed Charging Station's inactive flag`,
              `Renamed Charging Plan Debug tab to Advanced`,
              `Fixed translation issues in Static Limitation`,
              `Allow to display the Charge Limitation in read-only when Charging Station is disconnected from the backend`,
              `Car structure adaptation for internal converters`,
              `Add Car synchronization in Master tenant`,
              `Fixed cannot update User's status in Master Tenant`,
              `Implemented Car unit tests`,
              `Fixed User In Error with Billing`,
            ],
          },
        ],
      },
      {
        version: '2.2.15',
        date: new Date('2020-03-21'),
        componentChanges: [
          {
            name: 'Dashboard',
            changes: [
              `Added filters on Connector Types (Type 2, Chademo...)`,
              `Fixed number of values in x-axis in chart consumption`,
              `Changed I-Number to Corporate Number in User's profile`,
              `Roaming: Implement PUT and PATCH token from IOP`,
              `Added new parameters to check in Charging Station In Errors`,
              `Update Charging Station's template without migration`,
              `Fixed issues with ABB not getting the limits when asset consumption metrics`,
              `Hide Companies, Sites, Site Areas and Charging Stations coming from the Roaming platform by default`,
              `Add Issuer filtering to display Roaming entities (Companies, Sites, Site Areas...)`,
              `Fixed Connection Lost in Charger in Error`,
              `Added AWS deployment and configuration files`,
              `Switched the Charging Station's Heartbeat interval to 300 seconds`,
              `Update of Charging Stations with Template is always applied during Boot Notification`,
              `Set the minimum power to 2 Amps in the Charging Station Limitation`,
              `Fixed Jump in Maps button not disabled when GPS coordinates are not provided in Site, Site Area, Company, Charging Station and Asset lists`,
              `Fixed Delete action not displayed in User's list`,
            ],
          },
        ],
      },
      {
        version: '2.2.11',
        date: new Date('2020-03-13'),
        componentChanges: [
          {
            name: 'Dashboard',
            changes: [
              `Remote Start Transaction is now using the first active badge of the User`,
              `Fixed notification is sent when user has badged and session is not started after 10 mins`,
              `Add the maximum limit when creating a Charging Plan`,
              `Limit the max amp in charging plan to the max static limitation`,
              `Set the Temporary Charging Plan start date to 10 mins in the future`,
              `Enable Smart Charging for a Site Area`,
              `Reorder Charging Station's Connectors`,
              `Disable Debug of Charging Plan if not supported`,
              `eMSP/CPO implementation`,
            ],
          },
        ],
      },
      {
        version: '2.2.7',
        date: new Date('2020-03-07'),
        componentChanges: [
          {
            name: 'Dashboard',
            changes: [
              `Store in consumption the current connector limit during a session`,
              `CPO/eMSP first Gireve certification`,
              `Handling of OCPP Firmware Status updates`,
              `Added import of Cars from EV-Database via scheduled job`,
              `Enable Car component in the Tenant Management`,
              `Notification of failed Car synchronization is sent to the Super Admin Users`,
              `Refactoring of the Charging Plan`,
              `Change the availability of a charging station`,
              `Notify the user when he forgot to start his session`,
              `Activation of Asset Management in Master Tenant`,
              `Added Asset Management in Tenants`,
              `Static Power Limitation for Schneider vendor`,
              `Show Sessions not assigned to a user when ACL is active in a Site Area`,
              `Set default notifications to new registered users`,
              `The Charging Station's heartbeat is stored in the database`,
              `Zero technical and OCPP configuration of new Charging Station`,
              `Added the copy of the OCPP 1.6 SOAP supervision URL for Hager Charging Station`,
              `Changing the value of an OCPP parameter is now reflected in the UI`,
              `Export all OCPP parameters from Sites and Site Areas`,
              `Show users that have not logged in from more than 6 months in User In Error list`,
              `Billing: Added User synchronization`,
              `Billing: Synchronize Billing information regularly`,
              `MSP Locations: Store CPO Charging Stations from Gireve`,
              `Notification: Admins are notified when billing user's synchronization has failed`,
              `Connector's data is not cleaned until it becomes available`,
              `Move the action row at the beginning of the list`,
              `Added account activation in mobile app`,
              `Enable Charging Station's URL field if the protocol is SOAP`,
              `Handle change of OCPP params that requires the Charging Station to be rebooted`,
              `TypeScript: Alignment between front-end and backend types`,
              `TypeScript: Migration of Settings anf Logging API`,
              `All Lists: Optimized performances by optimizing third party libs import usages`,
            ],
          },
        ],
      },
      {
        version: '2.1.18',
        date: new Date('2019-12-14'),
        componentChanges: [
          {
            name: 'Dashboard',
            changes: [
              `Add Inactivity filter in Session History`,
              `Add Smart Charging component in Tenant management`,
              `Add Smart Charging Settings section in Tenant`,
              `New Charging Station are automatically registered and enriched with template`,
              `Fixed Users synchronization in Billing system`,
              `Stop a Session in progress in Session list`,
            ],
          },
        ],
      },
      {
        version: '2.1.17',
        date: new Date('2019-12-07'),
        componentChanges: [
          {
            name: 'Dashboard',
            changes: [
              `Fixed error if no data in Statistics > Pricing`,
              `Removed mouse scroll from consumption Chart`,
              `OCPI > Gireve > Push Users' tokens`,
            ],
          },
        ],
      },
      {
        version: '2.1.16',
        date: new Date('2019-11-30'),
        componentChanges: [
          {
            name: 'Dashboard',
            changes: [
              `Set the Site Owner role in Users Management`,
              `Be able to unset the the Site Owner role in Site Management`,
              `Includes extra inactivity in Sessions in Error with inactivity greater than 24h`,
              `Added Date filter in Statistics`,
              `Made Session/Charging Station/Logs CSV export more user friendly`,
              `Side bar text missing if the browser language is not french or english`,
              `Change CSV separator to tabs instead commas`,
              `No GPS coordinates error in Site Areas fixed`,
              `Fix issue in Sending email to Admin when creating a tenant`,
              `Do not compute extra inactivity after several same status notifications`,
              `Prevent deletion of Refunded Sessions in Sessions In Error`,
              `Fixed Reset Password redirected to the Login page`,
              `Convert Inactivity in mins in Export Session`,
            ],
          },
        ],
      },
      {
        version: '2.1.15',
        date: new Date('2019-11-22'),
        componentChanges: [
          {
            name: 'Dashboard',
            changes: [
              `Notify Site Owner when the User forgot to start his Session`,
              `Notify Admins when a Charging Station is no longer reporting to the backend`,
              `Notify the User when he has been inactive for 6 months (profile will be deleted)`,
              `Put in Session In Error list, the Sessions that have an inactivity greater than one day`,
              `Impossible to update an User in the Master Tenant`,
              `Change the color of the inactivity according its importance`,
              `Added Report ID filter in Refunded Session list`,
              `Enhance OCPI settings to handle different identifiers for CPO and EMSP roles`,
              `Refactor the User's Badges for eMSP implementation`,
            ],
          },
        ],
      },
      {
        version: '2.1.14',
        date: new Date('2019-11-09'),
        componentChanges: [
          {
            name: 'Dashboard',
            changes: [
              `Fixed Fold/Unfold the side menu manually`,
              `TypeScript migration of Exceptions`,
              `Charging Station can be deleted if an attached ongoing Session is finished`,
              `Fixed URL in OCPI credential object according endpoint role`,
              `Fixed bug in Log's Search`,
              `OCPI eMSP ongoing implementation`,
            ],
          },
        ],
      },
      {
        version: '2.1.13',
        date: new Date('2019-10-28'),
        componentChanges: [
          {
            name: 'Dashboard',
            changes: [
              `Prevent registration of Charging Stations with special characters`,
              `Allow Soft Stop a Session on a Charging Station that is not connected to the backend`,
              `Allow to delete a Charging Station linked with an outdated Session`,
              `Admin Users receive the notifications with the right locale`,
              `Connector IDs are translated into letters in notifications`,
              `Format numbers, currency according user's locale`,
            ],
          },
        ],
      },
      {
        version: '2.1.12',
        date: new Date('2019-10-18'),
        componentChanges: [
          {
            name: 'Dashboard',
            changes: [
              `Implemented Remote Push Notification`,
              `Refactored Notification to implement Remote Push Notification`,
              `Increased End of Session notification frequency according the charging station power`,
              'TypeScript migration of Notification and Configuration',
              `Fixed handling of the State Of Charge when it starts at 0 %`,
              `Update End User Licence Agreement with third party products`,
            ],
          },
        ],
      },
      {
        version: '2.1.11',
        date: new Date('2019-10-14'),
        componentChanges: [
          {
            name: 'Dashboard',
            changes: [
              `Admin Users can enable/disable Notifications`,
              `Fix stop authorization for Basic User`,
              `Admins cannot delete a Session that has already been refunded`,
              `User's Badge ID is not regenerated when not existing in profile`,
              `Hide column when the browser is resized`,
              `Both OCPI and Notification entities has been migrated to TypeScript`,
            ],
          },
        ],
      },
      {
        version: '2.1.10',
        date: new Date('2019-10-05'),
        componentChanges: [
          {
            name: 'Dashboard',
            changes: [
              `Fixed Tenant creation (email activation + user's password)`,
              `Notify Admins when authentication with primary Email server failed`,
              `Notify Admins when OCPI patching of Charging Station's statuses failed`,
              `User filter has been added in Refund Session`,
              `Filter on Charging Station's OCPP parameters`,
              `Added Export of Charging Station's OCPP parameters`,
              `Reset password occurs now in Mobile App`,
              `Fixed User's image was not retrieved correctly`,
              `Fixed User account activation`,
            ],
          },
        ],
      },
      {
        version: '2.1.9',
        date: new Date('2019-09-29'),
        componentChanges: [
          {
            name: 'Dashboard',
            changes: [
              `Renamed Tenant to Organization`,
              `Reset Password now is done in the application by the User and is no longer generated`,
              `Delete Connector when a User is deleted`,
              `Add endpoint for Mobile App to enable Auto Login feature`,
              `Fixed bottom list's stats in Refunded Sessions to take into account cancelled expenses`,
              `Fixed Charging Station's connection token cannot be revoked when it has already expired`,
              `Fixed 'More' button in list disappears when Log's Message column is too wide`,
              `Changed handling of locked connectors for ABB chargers`,
            ],
          },
        ],
      },
      {
        version: '2.1.8',
        date: new Date('2019-09-20'),
        componentChanges: [
          {
            name: 'Dashboard',
            changes: [
              `Removed battery level from charging curve when not needed`,
              `Last line in the Charger's list is not displayed in Firefox`,
              `Selection of Sites pop-up is not cleared when trying to assign a User to a Site`,
              `User that is not assigned to a Site and is not Active should appear twice in User In Error`,
              `Wrong pagination in Sessions In Error`,
              `Site Admin Users no longer have the right to change their status their profile`,
              `Site Admins can now refund any Users that charged on their Sites`,
              `Added in Sessions In Error the Sessions that have not been priced when the Pricing has been activated later on`,
              `Fixed Admin Users got wrong number of records (Paging) in Refunding`,
            ],
          },
        ],
      },
      {
        version: '2.1.7',
        date: new Date('2019-09-16'),
        componentChanges: [
          {
            name: 'Dashboard',
            changes: [
              `Fixed Site Admin users couldn't see their Refunded Sessions`,
              `Fixed wrong Email is sent when User's status is changed by an Admin`,
              `Fixed Charging Station ID was not saved during a BootNotification`,
              `Migrated Consumption in backend to TypeScript`,
              `Fixed Basic User cannot see his Sessions`,
              `Get the Charging Station from the Transaction in SAP Convergent Charging`,
            ],
          },
        ],
      },
      {
        version: '2.1.6',
        date: new Date('2019-09-11'),
        componentChanges: [
          {
            name: 'Dashboard',
            changes: [
              `Only Site Admin can get refunded in Concur`,
              `Fixed Soft Stop of Sessions`,
              `Fixed user Basic cannot change his password`,
              `User can get assigned orphan sessions when his profile is changed`,
              `Fixed filters not working in Sessions`,
              `Added Charging Station's Connector ID in Email notification`,
              `Enhanced Backend logs to better follow the the Session lifecycle`,
              `Fixed Sessions In Error list should not be refreshed after Session's details pop-up is closed`,
              `Can search for a user in Logs using his name, first name or email in free text search field`,
            ],
          },
        ],
      },
      {
        version: '2.1.5',
        date: new Date('2019-09-05'),
        componentChanges: [
          {
            name: 'Dashboard',
            changes: [
              `Added the Site Admin check box in Site assignment pop-up in the User's list view`,
              `Allow Users with Site Admin role to run Actions on their Charging Stations`,
              `Added the User that stopped the Session if different`,
              `Added Error drop down filter in User In Error`,
              `Registration token Description is mandatory`,
              `Removed access to User list and update of Users for Users with Site Admin role`,
              `Display the User who stopped the Session if different from the one who started it`,
              `Added Error filter drop down in User in Errors`,
              `Added Site Area filter drop down in Charging Station lists`,
              `Fixed performance issues on displaying all the Session lists`,
              `Fixed wrong Charging Stations' count in list when Basic User is not assigned to any Site`,
              `Transaction has been migrated to Typescript in the backend`,
              `Fixed misnamed values in the Refund Type drop-down filter`,
              `Fixed Basic User cannot create Concur connectors`,
              `Fixed Basic User cannot refund his Sessions to Concur`,
              `Fixed Admin User did not receive a confirmation email after Tenant creation`,
              `Fixed malformed Session ID for SAP CC`,
              `Fixed backup to Company address when User's Site address is not know in Concur`,
            ],
          },
        ],
      },
      {
        version: '2.1.4',
        date: new Date('2019-08-24'),
        componentChanges: [
          {
            name: 'Dashboard',
            changes: [
              `Enabled Site Admin role`,
              `Site Admin can delete his Charging Station`,
              `Site Admin cannot delete his Site`,
              `Display the last Session details in Charging Station's Connector when no Session is ongoing`,
              `Display Charging Station's registration token in Site Area if it's still valid`,
              `Added Users that are not assigned to a Site in User In Error`,
              `Fixed filter not reinitialized in Statistics between two tabs`,
              `Analytics drop down displays only demo links for Demo user`,
              `Add Sessions with negative duration in Session In Error`,
              `Enable Charging Station and Sessions for Site Admin users`,
              `Add Token description`,
              `Fixed Remote Start with another User`,
              `Site Admin can see the Sessions made on his Charging Stations`,
            ],
          },
        ],
      },
      {
        version: '2.1.3',
        date: new Date('2019-08-17'),
        componentChanges: [
          {
            name: 'Dashboard',
            changes: [
              `Improved security of Charging Stations registration with a token generated by an Admin or a Site Admin user`,
              `Fixed save of User's profile with multiple same Badge IDs`,
              `Email validation in User's profile should be the same as in the backend`,
              `Fixed Basic User cannot change his picture in his profile`,
              `Fixed filter named Type not working in Session Refund view`,
              `Date From/To filters now accept empty value`,
              `Added Price in Statistics`,
              `Limit the size of uploaded pictures in User, Company, Site and Site Area`,
              `Added new filter named Host in Logs`,
              `Fixed Basic User can see an empty Session Details pane of another User`,
              `Enabled multi-selection for all filters throughout the application`,
              `Fixed sorting not working on Charging Station`,
            ],
          },
        ],
      },
      {
        version: '2.1.2',
        date: new Date('2019-08-10'),
        componentChanges: [
          {
            name: 'Front-end',
            changes: [
              `Add the number of Sessions in Statistics`,
              `Cannot assign a Badge ID which is already used by another user`,
              `Force mandatory fields to be highlighted in Charging Station Settings`,
              `Added Sessions with a wrong inactivity in Faulty Sessions`,
              `Added multi-selection in all drop-down filters`,
              `Fixed navigation issues`,
            ],
          },
          {
            name: 'Backend',
            changes: [
              `Fixed search with an ID in Site, Site Area, Company and User list`,
              `Send a new notification email for signed and certified Sessions to the User`,
              `Added several tens of Unit Tests`,
            ],
          },
        ],
      },
      {
        version: '2.1.1',
        date: new Date('2019-07-28'),
        componentChanges: [
          {
            name: 'Front-end',
            changes: [
              `New registered Super Admin can only be activated by another Super Admin`,
              `Added Sessions with wrong inactivity in Faulty Sessions`,
              `Activated multi-selection on Log Levels and Actions at first`,
              `EBEE XML Signed Data is no longer interpreted as HTML tags in Log details`,
              `Latest IP of Charging Station is displayed in Charging Station's details`,
              `View filters, state is not kept between navigation`,
              `Fixed user is delogged when his profile has changed`,
              `Fixed wrong messages when Charging Station is saved`,
              `Fixed Session's stats in list footer disappear when filters are reset`,
              `Fixed Max Record in paginator is not recalculated after applying a filter`,
              `Invoice button is removed for Basic Users (used only for SAP CC testing)`,
            ],
          },
          {
            name: 'Backend',
            changes: [
              `Stored the Sessions Signed Certificate of the EBEE Charging Station in DB`,
              `Added multi-selection capabilities in DB requests`,
              `Fixed setting were lost when Tenant's component changed`,
              `IP of Charging Stations is stored when Boot Notification and Heartbeat is received (Soap and JSon)`,
              `Removed useless logs (save DB space)`,
            ],
          },
        ],
      },
      {
        version: '2.1.0',
        date: new Date('2019-07-24'),
        componentChanges: [
          {
            name: 'Front-end',
            changes: [
              `Refunded sessions status are now synchronized with Concur and displayed (submitted, cancelled...)`,
              `Possibility to resubmit a Cancelled expense to Concur`,
              `Added in Refund list's footer statistics on refunded/pending sessions`,
              `Added inactivity in Statistics`,
              `Fixed Session History footer statistics for Basic users`,
              `Switch on/off Statistics in Tenant's configuration`,
              `Split charts and fit them in the visible area`,
              `Limited the Statistics to the Top 20 Consumptions/Usages for better readability`,
              `Added filter on all years in Statistics`,
              `Split Statistics chart to Year/Month`,
              `Migrated the application to Angular version 8`,
              `Displayed Statistic chart's legends`,
            ],
          },
          {
            name: 'Backend',
            changes: [
              `Encrypt sensitive data stored in database (password, secret key...)`,
              `Added Site Admin role for Basic users`,
              `All Tenant' settings were reset when activating a component in a Tenant`,
              `Use of backup email server in case the main server is blocked`,
              `Migrated the backend in Typescript (first phase)`,
            ],
          },
        ],
      },
      {
        version: '2.0.28',
        date: new Date('2019-07-04'),
        componentChanges: [
          {
            name: 'Front-end',
            changes: [
              `Fixed when there is only one connector in charger's details`,
              `Added capability to search in detailed logs`,
            ],
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
            ],
          },
        ],
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
              `Removed double scroll bar when displaying the Session's charging curve`,
            ],
          },
          {
            name: 'Backend',
            changes: [
              `Set first consumption to 0 kW.h in the Session's charging curve`,
              `Refactoring of Authorizations based on scopes`,
            ],
          },
        ],
      },
      {
        version: '2.0.26',
        date: new Date('2019-06-03'),
        componentChanges: [
          {
            name: 'Front-end',
            changes: [
              `Added units in Statistics + Format numbers with locale in User's profile`,
              `Fixed all values appear in Session's charging curve`,
            ],
          },
          {
            name: 'Backend',
            changes: [
              `Removed from Log's source the instance ID`,
              `Take into consideration the price to optimize the Session charging curve`,
              `Fixed auto disconnect user when he/she has more than 2 badges in his/her profile`,
            ],
          },
        ],
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
              `Added Statistics on Consumption and Usage`,
            ],
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
              `Add inactivity in Charging Station's connectors`,
            ],
          },
        ],
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
              `Unfold the sidebar when the screen width is greater than 1280 pixels`,
            ],
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
              `Changed storage structure of Component's settings`,
            ],
          },
        ],
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
              `Admin can disable the notifications for a given user`,
            ],
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
              `Migration task to update the price of existing Sessions`,
            ],
          },
        ],
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
              `Fixed Google map autocomplete issue`,
            ],
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
              `Always create a new report in Concur when a refund is requested`,
            ],
          },
        ],
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
            ],
          },
          {
            name: 'Backend',
            changes: [
              `Validate charger's messages with JSon schemas`,
            ],
          },
        ],
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
              `Session Details: Added the percentage of inactivity`,
            ],
          },
        ],
      },
      {
        version: '2.0.19',
        date: new Date('2019-04-28'),
        componentChanges: [
          {
            name: 'Front-end',
            changes: [
              `Productive use of the new e-Mobility front-end`,
            ],
          },
          {
            name: 'Backend',
            changes: [
              `Concur: Add quick expense V4 implementation`,
              `Convergent Invoicing: Enhanced logs when an error occurred`,
              `Ignored connector ID 0 for EBEE charger`            ],
          },
        ],
      },
    ];
  }
}
