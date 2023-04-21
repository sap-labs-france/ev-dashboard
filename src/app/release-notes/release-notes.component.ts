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
  templateUrl: 'release-notes.component.html',
  styleUrls: ['release-notes.component.scss']
})
export class ReleaseNotesComponent {
  public releaseNotes: ReleaseNotes[] = [];

  public constructor() {
    this.buildReleaseNotes();
  }
  public buildReleaseNotes() {
    this.releaseNotes = [
      {
        version: '2.7.8',
        date: new Date('2023-04-18'),
        componentChanges: [
          {
            name: 'Dashboard',
            changes: [
              'OCPI - Roaming - Push CDRs only when the extra inactivity is known',
              'Transactions - fix - Avoid closing transactions too early'
            ],
          },
        ],
      },
      {
        version: '2.7.7',
        date: new Date('2023-04-04'),
        componentChanges: [
          {
            name: 'Dashboard',
            changes: [
              'Rate Limiter - new settings to prevent DDOS',
              'Monitoring - new metrics on notifications',
              'Smart Charging - fix - targetStateOfCharge can be null'
            ],
          },
        ],
      },
      {
        version: '2.7.6',
        date: new Date('2023-03-28'),
        componentChanges: [
          {
            name: 'Dashboard',
            changes: [
              'Smart Charging - Advanced Parameters for Departure Time',
              'Smart Charging - Limit the number of periods to 16 (4 hours)',
              'Smart Charging - fix - default value not properly used',
              'Billing - Stripe Integration - update dependency to the latest API version - 2022-11-15',
              'Pricing - fix - Delete pricing definitions',
              'Security - Removed vulnerability from strong-soap dependencies',
              'Statistics - Export to CSV files - filtering is now taken into account',
              'Authorizations - Migrated Statistics endpoints to the new authorization framework',
              'Authorizations - Site owners can change the power limit of a site',
              'OCPP - Allow a distinct CPMS Domain Name per Tenant',
              'Performance - Fix - Partial index creation',
              'Performance - some logs less verbose'
            ],
          },
        ],
      },
      {
        version: '2.7.5',
        date: new Date('2022-11-21'),
        componentChanges: [
          {
            name: 'Dashboard',
            changes: [
              'Charging Sessions - new endpoint "getUserSessionContext" replacing the former "getUserDefaultTagCar" (which is deprecated).',
              'Authorizations - Migrated Settings endpoints to the new authorization framework',
              'Authorizations - Migrated OCPI endpoints to the new authorization framework',
              'MongoDB - K8S Configuration Flexibility - minimal pool size and maximal pool size can be defined per server'
            ],
          },
        ],
      },
      {
        version: '2.7.4',
        date: new Date('2022-11-02'),
        componentChanges: [
          {
            name: 'Dashboard',
            changes: [
              'Security - Libraries have been updated to address security issues and avoid vulnerabilities',
              'Billing - STRIPE - Code cleanup to avoid using deprecated methods',
              'Billing - improvement - Some code reorganization for a better abstraction of the underlying implementation',
              'Pricing - UI improvements - Editing/Deleting pricing definitions is now also possible when viewing the full list',
              'Authorizations - fix - Authorization check on start charging session has been fixed',
              'Authorizations - fix - Assignment of site admin and site owner roles',
              'Authorizations - fix - Admin can refund charging sessions when being site owner',
              'Logging - improvement - minor change - application errors logged in their tenant'
            ],
          },
        ],
      },
      {
        version: '2.7.3',
        date: new Date('2022-10-25'),
        componentChanges: [
          {
            name: 'Dashboard',
            changes: [
              'Charging Station Error - The subject of the email includes information about the charger',
              'Charging Station List - Navigation from the charger to its session list has been fixed',
              'RFID Cards - New button to generate an RFID when creating cards',
              'Pricing - Restriction on the days of the week is now sorted',
              'Charging Sessions - fix - User information was missing when exporting to a CSV file',
              'Charging Sessions - fix - Exporting OCPI CDR was not possible',
            ],
          },
        ],
      },
      {
        version: '2.7.2',
        date: new Date('2022-10-04'),
        componentChanges: [
          {
            name: 'Dashboard',
            changes: [
              'Authorization - Transaction and User endpoints have been migrated to the new authorization framework',
              'Email Notifications - Code improvements and new look and feel',
              'UI Improvements - New menu item to navigate from a charger to the corresponding sessions',
              'UI Improvements - New sorting option on list of charging stations - public / non public',
              'Performance Improvements - new options to reduce data size when fetching collections',
              'Pricing - New column to preview pricing restrictions in the list',
              'Car Connectors - Targa Telematics - New connector to get the SoC on AC Charging Stations',
              'Security - OCPI Tariff IDs not shown to basic users',
              'OCPI - The owner name can be set per site and sent to the GIREVE Roaming Platform',
              'Car Catalog - Adaptation to version 29 of the ev-database API'
            ],
          },
        ],
      },
      {
        version: '2.7.1',
        date: new Date('2022-09-15'),
        componentChanges: [
          {
            name: 'Dashboard',
            changes: [
              `Pricing - new filtering option <View all>`,
              `Billing Platform [beta] - New module to send funds to Stripe connected accounts`,
              `User interface for maintaining Organization data`,
              `Administration tool to maintain charging station templates`,
            ],
          },
        ],
      },
      {
        version: '2.7.0',
        date: new Date('2022-08-03'),
        componentChanges: [
          {
            name: 'Dashboard',
            changes: [
              `Cosmetic changes and UI responsiveness improvements`,
              `Some fixes related to the authorizations and permissions`,
              `Configuration and scalability improvements (Kubernetes)`
            ],
          },
        ],
      },
      {
        version: '2.6.10',
        date: new Date('2022-07-26'),
        componentChanges: [
          {
            name: 'Dashboard',
            changes: [
              `Migrated Charging Station endpoint to the new authorization framework`,
              `Added automatic redirection of migrated tenants to a k8s cluster`,
              `Fixed Site not provided in Charging Profile`,
              `Use Outlet in OCPP Meter Value's Location for Energy.Active.Import.Register`,
              `Reduced charging curve optimization`,
              `Fixed Charging Profile's CSS issues`,
              `Migration to Angular 14`,
            ],
          },
        ],
      },
      {
        version: '2.6.9',
        date: new Date('2022-06-19'),
        componentChanges: [
          {
            name: 'Dashboard',
            changes: [
              `Fixed OCPI Tag type to match RFID standard`,
              `Handle Tag ID sent by payment terminals`,
              `Retrigger the Async task framework after it has run once`,
              `Check of OCPI CPO Locations is now done once a day`,
              `Log in error failed Remote Push Notification`,
              `Virtual RFID ID are generated now on 8 bytes`,
            ],
          },
        ],
      },
      {
        version: '2.6.8',
        date: new Date('2022-06-13'),
        componentChanges: [
          {
            name: 'Dashboard',
            changes: [
              `Aligned pop-ups with new authorization framework`,
              `Fix Charging Station's Statistics wrong label tooltip`,
              `Handle Connectors' statuses of inactive Charging Stations in the backend`,
              `Fixed OCPI Token updated with User ID instead of UID`,
              `Pull the last 2 weeks OCPI eMSP Cdrs/Sessions when triggered manually in the UI`,
              `Track OCPP JSON WS memory footprints`,
              `Display all Charging Stations in Log list filter`,
              `Fixed cannot change URL for SOAP Charging Station`,
              `Used Ramer Douglas Peucker algo to optimize the charging curve`,
              `Log more information on OCPI wrong Token`,
            ],
          },
        ],
      },
      {
        version: '2.6.7',
        date: new Date('2022-05-27'),
        componentChanges: [
          {
            name: 'Dashboard',
            changes: [
              `Implemented sub Site Areas`,
              `Log in error failed OCPI Commands`,
              `Fixed Admin and Site Admin cannot create a Car with a user`,
              `Get OCPI eMSP Tags with createdOn in addition to lastChangedOn`,
              `Ignore the Smart Charging if no Charging Station is used`,
              `Fixed Mobile App does not receive the Charging Station connector's stats for Sites and Site Areas`,
              `Ensure last transaction handling will not make the Status notification failing`,
              `Do not send 'null' value in pricing via OCPI`,
              `Fixed connector stats does not contain connector level information`,
              `Enhanced OCPI Job management`,
            ],
          },
        ],
      },
      {
        version: '2.6.6',
        date: new Date('2022-05-11'),
        componentChanges: [
          {
            name: 'Dashboard',
            changes: [
              `Removed Limit URL parameter when calling payment methods endpoint`,
              `Migrated Billing endpoint to the new authorization framework`,
              `OCPI RFID Cards are created on the fly when Remote Start is triggered by the Roaming platform`,
              `Never calculate the cost of an OCPI Transaction`,
              `Do not price the Roaming transaction`,
              `Ensured OCPP Heartbeart message is correct before being validated with a Json schema`,
              `Validate OCPP Meter Value requests with a Json schema`,
              `Do not update Charging Station max power in master/slave`,
              `Fixed date/time picker when data is entered manually`,
              `Avoid API User to login using the mobile app`,
              `Enhanced error management when pushing OCPI Cdr`,
            ],
          },
        ],
      },
      {
        version: '2.6.5',
        date: new Date('2022-04-15'),
        componentChanges: [
          {
            name: 'Dashboard',
            changes: [
              `Added update of OCPI Credentials`,
              `Use Session optimized consumptions to send OCPI Session/CDR`,
              `Fixed OCPI CPO Services call return eMSP ones`,
              `Added Mobile phone in register user`,
              `Fixed CSS issues in pop-ups`,
              `Default Tenant's users can reset their passwords`,
              `Added RFID Card filter in Refund session list`,
              `Added Authorization ID in Session and CDR for Gireve`,
              `Return HTTP 404 when image is not found`,
            ],
          },
        ],
      },
      {
        version: '2.6.4',
        date: new Date('2022-04-08'),
        componentChanges: [
          {
            name: 'Dashboard',
            changes: [
              `Align OCPI endpoints with REST`,
              `Enhanced OCPI and Axios logs`,
              `Fixed missing Logo in master tenant`,
              `Updated German translation`,
              `Aligned Charging Profile's amperage floating points with OCPP specifications`,
              `Fixed new OCPI authorization is requested during Start Transaction when IOP sends a Remote Start`,
              `Fixed cannot scroll tabs in User pop-up`,
            ],
          },
        ],
      },
      {
        version: '2.6.3',
        date: new Date('2022-03-30'),
        componentChanges: [
          {
            name: 'Dashboard',
            changes: [
              `Enhanced Web Socket management in Charging Station's server`,
              `Do not override Transaction ID in Meter Value from Connector if it's empty`,
              `Simplified Web Socket traces`,
              `Migrated Car endpoint to the new authorization framework`,
              `Avoid too many payment attempts`,
              `Fixed OCPI must return Charging when OCPP status is SuspendedEV/EVSE`,
              `Fixed OCPI Sessions sync after Transaction has been taken place`,
              `Use human readable name for OCPI Site Area`,
              `Display default images in Car and Company list when not provided`,
              `Aligned Organization endpoint with new authorization framework`,
              `Show pricing details in the Session History and Session In Progress dialogs`,
              `Cannot assign a non public Site Area in Edit Charging Station`,
            ],
          },
        ],
      },
      {
        version: '2.6.2',
        date: new Date('2022-02-26'),
        componentChanges: [
          {
            name: 'Dashboard',
            changes: [
              `Fixed OCPI eMSP Session and CDR modules`,
              `Display OCPI Charging Stations in read-only`,
              `Centralize Transaction Start/Stop in one endpoint`,
              `Aligned minimum Consumption and Duration to Afirev standard`,
              `Allow to remote Start Transaction when Billing is active and Site Area has no Access Control`,
            ],
          },
        ],
      },
      {
        version: '2.6.1',
        date: new Date('2022-02-19'),
        componentChanges: [
          {
            name: 'Dashboard',
            changes: [
              `Fixed OCPI eMSP Locations and Authorize modules`,
              `Soft Stop of faulty ongoing Transactions`,
              `Adjusted the Roaming Charging Station's status`,
              `Fixed filtering of Logs based on date time value set in URL`,
              `Updated Charging Station's template with new Vendors`,
              `Clear Site Admin flag when User's role is changed to Admin`,
            ],
          },
        ],
      },
      {
        version: '2.6.0',
        date: new Date('2022-02-14'),
        componentChanges: [
          {
            name: 'Dashboard',
            changes: [
              `Final Pricing engine`,
              `Added master/slave capability in Charging Station's template`,
              `Check and Stop Transactions that haven't received the OCPP Stop Transaction message`,
              `Made the address mandatory for public Sites`,
              `Fixed change of Site / Site Area is not propagated to Charging Stations, Transactions and Assets`,
              `Fixed synchronization of new Cars + Optimize image's size`,
              `Fixed Roaming RFID Cards cannot start a Transaction when access control is disabled in Site Area`,
              `Sanitize HTTP params on Export feature only once`,
              `Fixed no RFID Card has been found when the end-user sends a Remote Stop`,
              `Display amperage per phase in Site Area`,
              `Refactor aggregation of consumption charts for Sites`,
              `Clear Connector's runtime data on Status Notification Available/Preparing`,
              `Display RFID Cards in read-only for certain role`,
              `DBT model WDC314P25MP1 supports credit card in template`,
              `Fixed pop-up wrong size issues`,
              `Cleanup of unused Billing jobs`,
            ],
          },
        ],
      },
      {
        version: '2.5.15',
        date: new Date('2022-01-27'),
        componentChanges: [
          {
            name: 'Dashboard',
            changes: [
              `Added Pricing restrictions on Duration, Energy, Time range and Days of week`,
              `Added Roaming Tariff ID in Tenant' settings, Site, Site Area, Charging Station and Connector`,
              `Migrated Registration Token and Billing endpoints to RESTful API`,
              `Migrated Asset endpoint to the new authorization framework`,
              `Switched Date From/To controls to Data Range`,
              `Lowered, track and added in conf reCaptcha score`,
              `Enhanced health-check to throw an error in case of low server performance`,
              `Fixed Site Admin cannot create Cars for other Users`,
              `Fixed cannot edit Charging Station with Connector IDs starting at 11`,
              `Fixed cannot export OCPI CDRs with Swagger`,
              `Fixed emails of eMSP in lower case in OCPI`
            ],
          },
        ],
      },
      {
        version: '2.5.14',
        date: new Date('2021-12-20'),
        componentChanges: [
          {
            name: 'Dashboard',
            changes: [
              `Added traces on the Web Socket server`,
              `Made locking on Web Sockets more permissive`,
              `Added Search in Charging Station's Registration Tokens`,
              `Fixed few Sessions not priced during the migration to the new Pricing`,
              `Fixed user cannot create Asset Connections in Settings`,
              `Limited the OCPP Heartbeat traffic (replaced by the WS ping)`,
              `Enhanced OCPP performances with async notifications`,
              `Fixed Charging Station OCPP parameters not refreshed after change`,
              `Fixed Czech language`,
            ],
          },
        ],
      },
      {
        version: '2.5.13',
        date: new Date('2021-12-12'),
        componentChanges: [
          {
            name: 'Dashboard',
            changes: [
              `Added dependencies between filters in Statistics`,
              `Migrated Statistics endpoints to RESTful API`,
              `Allow the User to start a transaction without a Car`,
              `Site Owner can read Users in Session lists`,
            ],
          },
        ],
      },
      {
        version: '2.5.12',
        date: new Date('2021-12-07'),
        componentChanges: [
          {
            name: 'Dashboard',
            changes: [
              `New Built-in Pricing engine`,
              `Added OCPI Tariff ID in Tenant's Settings and Site`,
              `API users are only allowed to perform B2B requests`,
              `Migrated Registration Token, Organization and Setting endpoints to RESTful API`,
              `Simplified authorizations on lists`,
              `Fixed Tenant's logo is not loaded when entering a new password`,
              `Forced RFID Cards to uppercase in OCPP requests`,
              `Added missing Data Transfer in OCPP command whitelist`,
              `Adjusted roaming handling in Company, Site and Site Area (OCPI)`,
              `Soft Stop of a Transaction is allowed when there is a different ongoing Transaction`,
              `Fixed Site Admin cannot Soft Stop his own Transaction`,
              `Added Autralian locale`,
            ],
          },
        ],
      },
      {
        version: '2.5.11',
        date: new Date('2021-11-15'),
        componentChanges: [
          {
            name: 'Dashboard',
            changes: [
              `User is mandatory when creating a new RFID Card for Site Admin`,
              `Site Admin cannot change 'Automatic user assignment to this site' property`,
              `Enabled WS Compression in WS Server`,
              `Reuse the Asset's token between two calls every minute`,
              `Migrated OICP (Hubject) endpoints to RESTful API`,
              `Return OCPI status Inoperative when connector is Unavailable`,
            ],
          },
        ],
      },
      {
        version: '2.5.10',
        date: new Date('2021-11-13'),
        componentChanges: [
          {
            name: 'Dashboard',
            changes: [
              `Deployment of the new high performance Web Socket server (best on the market)`,
              `Enforced synchonicity of the incoming OCPP requests per Charging Station in the Web Socket server (WS Server)`,
              `Queued all incoming OCPP requests until the WS connection is fully checked`,
              `Removed database locking per Charging Station (done in the WS Server now)`,
              `Prevent new duplicate Web Socket connections in the WS Server`,
              `Enhanced Logs to better track Web Socket connections`,
              `Check and clean-up WS connections every 30 mins (ping)`,
              `Removed links to the non secure WS connection in the UI (the WS service will stay up until all chargers have been migrated to WSS)`,
              `Migrated to the latest NodeJs LTS (V16) + use a new Node container in production`,
            ],
          },
        ],
      },
      {
        version: '2.5.9',
        date: new Date('2021-11-05'),
        componentChanges: [
          {
            name: 'Dashboard',
            changes: [
              `Fixed Soft Stop of an opened Transaction (OCPP Stop Transaction not received)`,
              `Removed the global lock of the Async Task Manager, only kept at Task level`,
              `Limit the Async Task processing duration to 15 mins before trying to process it again`,
              `Return a clean error message when Billing settings are not set`,
              `Fixed Add payment method not displayed in User's profile`,
              `Fixed Refund buttons not displayed in Refunding Transaction list`,
              `Added back Export button in Log list`,
              `Check that the Token ID is well formed`,
            ],
          },
        ],
      },
      {
        version: '2.5.8',
        date: new Date('2021-11-03'),
        componentChanges: [
          {
            name: 'Dashboard',
            changes: [
              `Enforce security checks in OCPP requests`,
              `Made all notification non blocking`,
              `Avoid scheduled tasks execution overlapping`,
              `Added Import, Export, Sync Billing authorizations in Users' list`,
              `Added dedicated Charging Station's column in Logs`,
              `Added new Source and Site filters in Logs`,
              `Ensure Async Task manager to always resume after a long processing tasks`,
              `Migrated Log endpoint to the new Authorization framework`,
              `Randomized lock waiting time when the same lock is requested several times`,
            ],
          },
        ],
      },
      {
        version: '2.5.7',
        date: new Date('2021-10-23'),
        componentChanges: [
          {
            name: 'Dashboard',
            changes: [
              `User can now have free access to Charging Stations (not billable)`,
              `Reject OCPP requests if the Charging Station has been manually made inactive`,
              `Enforced Charging Station's registration check on revoked tokens`,
              `Send notification once every 10 mins for Charging Station in error`,
              `Ignore OCPP Status Notification with same values`,
              `Log when a notification is not sent to the user`,
              `Improved logging for Site Admins`,
              `Fixed User and Car not seen in Session Refund list`,
              `Fixed cannot see User in Charging Station's connector when charging`,
              `Fixed performance issue when retrieving the last Transaction's consumption`,
              `Fixed Refresh error handling`,
              `User is mandatory when creating an RFID Card for Site Admins`,
              `Get Car Images with URL instead of Base64 in Car list`,
              `Added new firmware version for Kempower Charging Station and added Siemens model CPC-20/90/120 in template`,
              `Removed server side refresh of lists (SocketIO)`,
              `Removed listening of unused database collections`,
              `Security: Prevent XSS injections`,
            ],
          },
        ],
      },
      {
        version: '2.5.6',
        date: new Date('2021-10-21'),
        componentChanges: [
          {
            name: 'Dashboard',
            changes: [
              `User is mandatory when creating an RFID Card for Site Admins`,
              `Get Car Images with URL instead of Base64 in Car list`,
              `Added new firmware version for Kempower Charging Station and added Siemens model CPC-20/90/120 in template`,
              `Removed server side refresh of lists (SocketIO)`,
              `Removed listening of unused database collections`,
              `Security: Prevent XSS injections`,
            ],
          },
        ],
      },
      {
        version: '2.5.5',
        date: new Date('2021-10-20'),
        componentChanges: [
          {
            name: 'Dashboard',
            changes: [
              `Fixed Performance correlation ID is send along the OCPP request`,
              `RFID Cards can always be reassigned even if already used before`,
              `Improved Charging Station's manual config and exclude from smart charging parameters`,
              `Check OCPI only when access control is active at Site Area level`,
              `Removed OCPI logo when empty and non standard properties`,
              `Enhanced performance logs for tracing traffic per organization`,
              `Adding Setec as Charging Station Vendor`,
              `Added Charging Station's Model in list`,
            ],
          },
        ],
      },
      {
        version: '2.5.4',
        date: new Date('2021-10-10'),
        componentChanges: [
          {
            name: 'Dashboard',
            changes: [
              `Fixed Technical filter in User's list`,
              `Fixed Retrieve OCPP Parameters in Charging Station's details`,
              `Send OCPI Cdr only when there is charging periods and consumption`,
              `Made the Visual ID unique in imported RFID Cards`,
              `Fixed infinite loop when User is not authorized to list the charging stations`,
              `Added schema validation for Authorizations`,
              `Enforced schema validation in Charging Station Template`,
              `Enhanced performances and stability of the REST server`,
            ],
          },
        ],
      },
      {
        version: '2.5.3',
        date: new Date('2021-10-04'),
        componentChanges: [
          {
            name: 'Dashboard',
            changes: [
              `Enhanced hidding sensitive data in Logs`,
              `Sanitize data in export CSV`,
              `Added metadata to Authorization's fields`,
              `Fixed authorization inheritance in dynamic filtering`
            ],
          },
        ],
      },
      {
        version: '2.5.2',
        date: new Date('2021-10-03'),
        componentChanges: [
          {
            name: 'Dashboard',
            changes: [
              `Site Admin can create users that are assigned to his sites`,
              `Added API User filter in list`,
              `Added Czech locale for formatting decimals`,
              `Fixed Asset push REST API`,
              `Fixed OCPI CDR not sent right after the OCPP Status Notification 'Available'`,
              `Fixed cannot retrieve the next page of Tenants in the list`,
              `Fixed OCPI local token cannot be generated`,
            ],
          },
        ],
      },
      {
        version: '2.5.1',
        date: new Date('2021-09-29'),
        componentChanges: [
          {
            name: 'Dashboard',
            changes: [
              `Added Schema validation in Charging Station templates`,
              `Improved performances of Authorizations and Schemas validation (caching)`,
              `Added Kempower T500 Charging Station's vendor in templates`,
              `Added OCPP Reserve Now command`,
              `Added Czech language`,
              `Fixed navigation to Tags in table row action`,
              `Fixed OCPI Remote Authorization is rejected in OCPP Authorize request`,
            ],
          },
        ],
      },
      {
        version: '2.5.0',
        date: new Date('2021-09-24'),
        componentChanges: [
          {
            name: 'Dashboard',
            changes: [
              `Implemented Tronity Car connector`,
              `Basic User can register or delete his own RFID Cards`,
              `RFID Cards has been moved in a dedicated menu`,
              `Admin can create an RFID Card not assigned to a User`,
              `Fixed Charging Station's template is not applied when the connectors already exist`,
              `Split OCPP Change Availability, Data Transfer, Unlock Connector and Change/Get Configuration commands in REST public API`,
              `Added API User for querying the REST API (B2B)`,
              `Fixed Retrieve Configuration button in Charging Station's OCPP Parameters`,
              `Fixed exception handling when sending an OCPP command to a disconnected Charging Station`,
              `Display 'Installed' firmware update status in Charging Station list`,
              `Fixed side menu cannot be scrolled on small screen`,
            ],
          },
        ],
      },
      {
        version: '2.4.91',
        date: new Date('2021-09-20'),
        componentChanges: [
          {
            name: 'Dashboard',
            changes: [
              `Added Zeta Charging Station's vendor in templates`,
              `Fixed Export of OCPP parameters`,
              `Fixed Remote Start Transaction command in OCPI`,
              `Migrated Company and OCPI endpoints to REST public API`,
              `Split OCPP Reset and Clear Cache commands in REST public API`,
              `Added Car connector in User's profile`,
              `Billing should not throw an error when no User is provided`,
              `Fixed documentation CSV upload`
            ],
          },
        ],
      },
      {
        version: '2.4.90',
        date: new Date('2021-09-09'),
        componentChanges: [
          {
            name: 'Dashboard',
            changes: [
              `Added OCPP Get Composite Schedule command in public REST endpoint`,
              `Ensure Site and Charging Station are public when checking the public flag`,
              `Enhanced Charging Station logging when the response cannot be parsed (malformed)`,
              `Added Setec Charging Station's vendor in templates`,
              `Migrated Car endpoints to REST public API`,
              `Fixed logo size in notification emails`,
            ],
          },
        ],
      },
      {
        version: '2.4.89',
        date: new Date('2021-09-06'),
        componentChanges: [
          {
            name: 'Dashboard',
            changes: [
              `Smart Charging - Enable Charging Stations without static limitation support`,
              `Added OCPP Get Diagnostics command in public REST endpoint`,
              `Return new fields in User's default Tag and Car REST API`,
            ],
          },
        ],
      },
      {
        version: '2.4.88',
        date: new Date('2021-09-05'),
        componentChanges: [
          {
            name: 'Dashboard',
            changes: [
              `Added Mercedes connector to get the SoC on AC Charging Stations`,
              `Enhanced consumption charts with different series`,
              `Added Site ID in Logs for Site Admin role`,
              `Made 'email' and 'name' not mandatory when updating an User`,
              `Transaction and Log endpoints RESTful have been migrated`,
              `Limit the number of Logs to 10 millions max`,
              `Fixed lost of OCPI configuration`,
              `Finalized DBT Charging Station's model in templates`,
            ],
          },
        ],
      },
      {
        version: '2.4.87',
        date: new Date('2021-08-25'),
        componentChanges: [
          {
            name: 'Dashboard',
            changes: [
              `Added OCPP Trigger Data Transfer in RESTful API`,
              `Remove prefix from OCPI tariff and use 'Default' as default tariff`,
              `Added new DBT Charging Station's model in templates`,
            ],
          },
        ],
      },
      {
        version: '2.4.86',
        date: new Date('2021-08-17'),
        componentChanges: [
          {
            name: 'Dashboard',
            changes: [
              `Improvement of the translation to Spanish`,
              `Implicit log filtering for Site Administrators`
            ],
          },
        ],
      },
      {
        version: '2.4.85',
        date: new Date('2021-08-13'),
        componentChanges: [
          {
            name: 'Dashboard',
            changes: [
              `Show asset's consumption/production in the Site Area charts`,
              `EVlink Smart Wallbox - new serial number added to the templates`,
              `Wall Box Chargers - new firmware added to the templates`,
              `Fixed: Domestic connector for OCPI`
            ],
          },
        ],
      },
      {
        version: '2.4.84',
        date: new Date('2021-08-06'),
        componentChanges: [
          {
            name: 'Dashboard',
            changes: [
              `Check Billing payment method in OCPP Authorize`,
              `Do not create automatically the RFID Card when not known`,
              `Clean-up current Transaction when OCPP Start Transaction fails on the same Connector`,
              `Added new CongCongTech, Alpitronic, Alfen Single Proline and Efacec QC45 Charging Station's model in templates`,
            ],
          },
        ],
      },
      {
        version: '2.4.83',
        date: new Date('2021-08-04'),
        componentChanges: [
          {
            name: 'Dashboard',
            changes: [
              `Fixed OCPI Register Endpoint not getting the IOP information`,
            ],
          },
        ],
      },
      {
        version: '2.4.82',
        date: new Date('2021-08-02'),
        componentChanges: [
          {
            name: 'Dashboard',
            changes: [
              `Billing invoicing is now checked daily`,
              `Enhancement of Logs`,
            ],
          },
        ],
      },
      {
        version: '2.4.81',
        date: new Date('2021-07-30'),
        componentChanges: [
          {
            name: 'Dashboard',
            changes: [
              `Implemented Mercedez access for getting Car's battery level during the charging session for the Smart Charging`,
              `Added new ARK Charging Station's model in templates`,
              `Clean up Charging Station's connector when Available Status Notification is sent with no Stop Transaction`,
            ],
          },
        ],
      },
      {
        version: '2.4.80',
        date: new Date('2021-07-29'),
        componentChanges: [
          {
            name: 'Dashboard',
            changes: [
              `Import Tags and Users with Sites + Auto activate Tags and Users' account`,
              `Add Transaction endpoints to RESTfull public API`,
              `Optimized Database performances on Charging Stations, Transactions, Users, Stats and Site Areas`,
              `Display Web Socket protocol not provided in customer's Tenant`,
            ],
          },
        ],
      },
      {
        version: '2.4.79',
        date: new Date('2021-07-26'),
        componentChanges: [
          {
            name: 'Dashboard',
            changes: [
              `Fixed Site Admin cannot see Statistics of his Users`,
              `Fixed missing IDs in RESTful file documentation`,
              `Lacroix / Linky Asset integration`,
              `Check Charging Station Registration Token at Web Socket connection and refuse it if not valid`,
              `Set OCPI Opening Hours and Tariff ID for SLF Caen`,
              `Set the OCPP heartbeat to 60 secs in OCPP 1.6-J`,
              `Stop OCPI Transaction if receiving OCPP Meter Values with unknown Transaction ID`,
              `Do not create a Transaction before checking Roaming Authorization`,
              `Request OCPI Authorization Token also in OCPP Start Transaction in addition to OCPP Authorize`,
              `Restrain OCPI Remote Authorization Token validity from 10 mins to 2 mins`
            ],
          },
        ],
      },
      {
        version: '2.4.78',
        date: new Date('2021-07-20'),
        componentChanges: [
          {
            name: 'Dashboard',
            changes: [
              `Do not try to process OCPI sessions in progress`,
              `Always check OCPI Sessions and CDRs once in the Job`,
              `End of Charge notification is sent only once`,
              `Increase database performances in clustered environment`,
            ],
          },
        ],
      },
      {
        version: '2.4.77',
        date: new Date('2021-07-18'),
        componentChanges: [
          {
            name: 'Dashboard',
            changes: [
              `Introduced the RFID Card visual ID in the Transaction's lists and pop-ups`,
              `Start a Transaction with the RFID Card visual ID`,
              `Fixed excluded already processed Charge Points`,
              `Fixed get lastest Assets' consumptions`,
              `Do not update the Charging Station's heart beat when checked by the job`,
              `Check OCPI Transactions on only finished Transactions`,
              `Free the Connector's runtime data of already stopped Transaction`,
              `Web Socket simplification`,
            ],
          },
        ],
      },
      {
        version: '2.4.76',
        date: new Date('2021-07-14'),
        componentChanges: [
          {
            name: 'Dashboard',
            changes: [
              `Clear Firmware Status Notification after Charging Station's reboot`,
              `Fixed User is not displayed in Charging Station's connector during a charging session`,
              `Update the the Charging Station's heart beat whenever it connects to the backend`,
              `Cars management use the new authorization framework`,
              `Adjusted the language's locales management and fixed some not found ones`,
              `Send OCPI and OICP status Unavailable when Charging Station's Web Socket is disconnected`,
              `Enhanced the Log's search to match sentences in Message column`,
              `Removed some Billing feature toggles`,
            ],
          },
        ],
      },
      {
        version: '2.4.75',
        date: new Date('2021-07-08'),
        componentChanges: [
          {
            name: 'Dashboard',
            changes: [
              `Smart Charging: Use efficiency when excluding the Charging Stations`,
              `Force the Charging Station unavailability's status after 2 mins instead of 9 mins when not responding`,
              `Set the standard Heartbeat OCPP param first and try workarounds next if it failed`,
              `Make Log's Action filter more specifics (REST, OCPP...)`,
              `Added new Joint Charging Station's model in templates`,
              `Optimized DB access in OICP endpoint (Hubject)`,
              `Prevent deletion of Users in Stripe`,
            ],
          },
        ],
      },
      {
        version: '2.4.74',
        date: new Date('2021-07-06'),
        componentChanges: [
          {
            name: 'Dashboard',
            changes: [
              `Save Status Notification right after Boot Notification even if the status has not changed`,
              `Added Company, Site and Site Area in Session list`,
              `Hide Delete button when user image is not set`,
              `Optimized DB access in OCPI endpoint`,
            ],
          },
        ],
      },
      {
        version: '2.4.73',
        date: new Date('2021-07-02'),
        componentChanges: [
          {
            name: 'Dashboard',
            changes: [
              `Do not bill Sessions < 1 kWh and < 1 min`,
              `Billing montly payment with Stripe`,
              `Added Low Consumption (< 1 kWh) and Low Duration (< 1 min) in Sessions In Error`,
              `Improve perfs to get Log details`,
              `Added Connector's information in Charging Station and Session In Progress lists`,
              `Added Stop reason in Session History list`,
              `Saved Stop reason OCPP Stop Transaction`,
              `Only log stack trace of exceptions`,
              `Reduce number of updates in DB of Charging Station's Heart Beats`,
              `Returned distance meters of Charging Stations`,
              `Keep performance logs for 2 weeks instead of 4`,
              `Added Car and User info in Sessions in Error`,
            ],
          },
        ],
      },
      {
        version: '2.4.72',
        date: new Date('2021-06-30'),
        componentChanges: [
          {
            name: 'Dashboard',
            changes: [
              `Migrated Tag endpoints to REST public API`,
              `Fixed User with role Basic cannot change his password`,
              `Added new Nexans new Charging Station's models in templates`,
              `Optimized DB access in Notification and Site management`,
              `Added clear of Billing test data`,
              `Took into account Transaction timezone in Billing`,
              `Display on going transaction stats in footer`,
              `Construct of URLs without 'safe-url-assembler' open source`,
            ],
          },
        ],
      },
      {
        version: '2.4.71',
        date: new Date('2021-06-28'),
        componentChanges: [
          {
            name: 'Dashboard',
            changes: [
              `Synchronized all OCPP calls`,
              `Fixed cannot assign a Site to a User`,
              `Enhanced Billing's logs`,
              `Added new G2Mobility new Charging Station's models in templates`,
              `Refactored timestamps of optimizer request`,
            ],
          },
          {
            name: 'Mobile (1.3.42)',
            changes: [
              `Fixed Billing payment method is not refresh after creating one`,
              `Added missing Invoice statuses`,
              `Set the Site name is Site Area list`,
              `Set the Site Area name in Charging Station list`,
              `Added default sorting in all HTTP requests`,
              `Avoid retrieving User for each invoice`,
              `Do not retrieve all User's images in User list`,
              `Reduced the number of HTTP requests (optimization)`,
              `UI/Design Improvements`,
              `Removed debug logs`,
            ],
          },
        ],
      },
      {
        version: '2.4.70',
        date: new Date('2021-06-26'),
        componentChanges: [
          {
            name: 'Dashboard',
            changes: [
              `Allow external systems to push Asset's consumption for the Smart Charging`,
              `Check payment method is provided in Start Transaction`,
              `Empty Charging Station's connectors at Boot Notification`,
              `Added new AixCharger, Alfen, Schneider and Ebee new Charging Station's models in templates`,
              `Authorization on Assign Assets is driven by the backend`,
              `Fixed static filters in lists were overriden by dependent toolbar filters`,
              `Fixed Extra Inactivity is only calculated between Finishing and Available status notification`,
              `Fixed OICP EVSE was not saved in DB`,
              `Fixed Eichrecht Signed Data handling in Stop Transaction`,
              `Migrated the User Service to the REST public API`,
              `Assert that OICP and OCPI Roaming components cannot be both active in the same tenant`,
              `Optimized DB access for Car`,
            ],
          },
        ],
      },
      {
        version: '2.4.69',
        date: new Date('2021-06-18'),
        componentChanges: [
          {
            name: 'Dashboard',
            changes: [
              `Added filter dependencies`,
              `Stripe beta version enhancements`,
              `Optimized database access`,
              `Enforced Smart Charging safety + minor fixes`,
              `Return authorized fields to the UI to adjust visible columns`,
              `Added new Lafon, Delta and Gewiss new Charging Station's models in templates`,
              `Keep the Action filter selection after a search in Logs`,
              `Fixed send End of Charge notification for Legrand Charging Station`,
              `Fixed Session detail pop-up does not show up when clicked from email`,
            ],
          },
        ],
      },
      {
        version: '2.4.68',
        date: new Date('2021-06-11'),
        componentChanges: [
          {
            name: 'Dashboard',
            changes: [
              `Handle Transaction.End meter value outside the Stop Transaction`,
              `Do not automatically stop the ongoing Transaction when Status Notification changes from Charging to Available`,
              `Allow to clean-up Billing Test data`,
              `Ebee, Wallbox: fixes for latest firmware version`,
              `Migrated Cars to the new authorization framework`,
              `Fixed cannot import RFID Cards without Users`,
              `Added filter dependencies (Organization, Site, Site Area...)`,
              `Added get default Car and Tag, get Sites and assign Sites in REST User's endpoint`,
            ],
          },
        ],
      },
      {
        version: '2.4.67',
        date: new Date('2021-05-29'),
        componentChanges: [
          {
            name: 'Dashboard',
            changes: [
              `Fix users filter on RFID Card`,
              `Fix asset consumption backup calculation`,
              `Add periodic billing support`,
              `Add RESTful API for boot and status notifications`,
              `Fix smart charging URI handling`,
              `Support asynchronous billing`,
              `Fix the migration for visual ID tag support`,
              `Charging station template: Add Delta model EVDE25D4DUM`,
              `Security: Ensure basic user without a site can't see anything`,
              `Log OCPP-J transaction events inconsistencies`,
              `WIT Asset integration`,
              `Billing: Add country code to address`,
              `Add RESTful endpoints for invoices`,
              `Various fixes to the RFID Card Visual ID support`,
              `Convert tags authorization to new scheme`,
              `Various fixes to the billing dashboard UI`,
              `Add billing invoices detailed description support`,
              `Add assets information refresh interval support`,
              `Add notification support for billing payment failure`,
              `Fix RFID support to search filter`,
              `Fix consumption computation from MeterValues Current.Import measurand`,
              `Fix organizations read permission for admin role with also site admin role`,
              `Allow site admin role to view transaction RFID if done on their site`,
              `Add a visual ID field to RFID Card record`,
              `Fix RFID Cards CSV import/export`,
              `Fix user site assignment`,
              `Server side german translation update`,
              `Fix assets consumption retrieval if empty`,
              `Ensure the currently charging station active connection to the OCPP-J server is used to send commands`
            ],
          },
        ],
      },
      {
        version: '2.4.66',
        date: new Date('2021-05-12'),
        componentChanges: [
          {
            name: 'Dashboard',
            changes: [
              `Add backward compatibility to REST API charging station endpoints for the mobile application`,
              `New authorization framework on Site and Site Area`,
              `Add Export of Tags with Users`,
              `Execute the push of CDRs task only on finished transactions`,
              `Charging Profile create or update is depending on the Charging Profile ID`,
              `Billing - Stripe Invoice - Add customer address`,
              `Disable 24/7 in OCPI if opening times are provided`,
              `Fixed ioThink current instant watts in Battery asset`,
              `Fixed Shelly amperage`,
              `Fixed power slider in Charging Profiles`,
              `Synchronize Billing Users only sync Users (not Invoices)`,
              `IoThink integration response filtering according new model`,
              `Fixed user with role Demo can see the user in session's details pop-up`,
              `Change performance logs from error to warning to avoid confusion in prod with real errors`,
            ],
          },
        ],
      },
      {
        version: '2.4.65',
        date: new Date('2021-05-03'),
        componentChanges: [
          {
            name: 'Dashboard',
            changes: [
              `Fixed user with role Demo cannot read his profile`,
              `Fixed OCPI wrong ID passed in Start Transaction`,
            ],
          },
        ],
      },
      {
        version: '2.4.64',
        date: new Date('2021-05-01'),
        componentChanges: [
          {
            name: 'Dashboard',
            changes: [
              `Made all the pop-up scrollable if content is too big`,
              `Handle Web Socket connections from a Charging Station with an unique ID`,
              `Fixed export of transaction with rounded price`,
              `Fixed OCPI CDR is sent multiple times on OCPP status notification`,
              `Add opening hours in SAP Labs France Mougins' Site`,
              `Use the local CPO Transaction ID in OCPI Session and CDR`,
              `Fixed RFID Card cannot be created if used in Transactions with no User`,
              `Eichrecht: Signed Data is not correctly transmitted with some systems`,
              `Added Atess, Ecotap DC30, CC612_1M4PR and Alfen Charging Stations in template`,
              `Fixed Charging Profiles cannot be displayed`,
            ],
          },
        ],
      },
      {
        version: '2.4.63',
        date: new Date('2021-04-21'),
        componentChanges: [
          {
            name: 'Dashboard',
            changes: [
              `Only Assets belonging to e-Mobility can be updated or deleted`,
              `Allow delete of RFID Card with linked transactions but forbid its creation`,
              `Added getChargingStationTransactions, firmwareDownload, SmartChargingTrigger, InError validation in RESTful endpoint`,
              `Ensure that each User has only one default RFID Card`,
              `Fixed Charging Plan is lost when the Charging Station is reloaded from the backend`,
              `Add Legrand model 059012 in Charging Station's template`,
              `Use Watts unit in AC/DC in Charging Station's template`,
              `Billing - Added Stripe feature toggle`,
            ],
          },
        ],
      },
      {
        version: '2.4.62',
        date: new Date('2021-04-17'),
        componentChanges: [
          {
            name: 'Dashboard',
            changes: [
              `Handle the Billing Production Mode flag in the Settings`,
              `Added broader firmware version for Exadys Charging Station`,
              `Put min amperage limit to 6A instead of 13A per phase`,
              `Fixed missing transaction's extra inactivity information + Formatting of medium/high inactivity`,
              `Fixed cannot display ongoing Session from Charging Station's connector`,
              `Optimized Car Catalog Image loading`,
              `Fixed minor bugs`,
            ],
          },
        ],
      },
      {
        version: '2.4.61',
        date: new Date('2021-04-15'),
        componentChanges: [
          {
            name: 'Dashboard',
            changes: [
              `Add DBT-CEV and EVMeter Charging Station's vendors`,
              `Fixed Tag Import Mime type check in Windows`,
              `Billing Stripe's settings refactoring`,
            ],
          },
        ],
      },
      {
        version: '2.4.60',
        date: new Date('2021-04-14'),
        componentChanges: [
          {
            name: 'Dashboard',
            changes: [
              `Auto compute Max Power of Charging Station when manually configured`,
              `Forbid Start of Transaction if OCPI didn't provide a valid authorization ID`,
              `Ensured that the connector's minimum amperage limit is always the EV Ready one (never 0A)`,
              `Fixed certified Transaction with Eichrecht Signed Data`,
              `Wrapped exported CSV data in double quotes (avoid to have the comma separator in the data)`,
              `Added new RESTful endpoints for Billing`,
              `Added the Export of Sessions authorization for Basic users`,
              `Display explicit message when error occurred during Tenant creation`,
              `Do not try to retrieve the default Car in OCPP Start Transaction when no User has been found`,
            ],
          },
        ],
      },
      {
        version: '2.4.59',
        date: new Date('2021-04-08'),
        componentChanges: [
          {
            name: 'Dashboard',
            changes: [
              `Sub-domain cannot be empty in both Tenant's Create and Update operations`,
              `Added EV Meter Bee, Delta 10722 and DBT QCNG Charging Stations in templates`,
              `Billing (alpha) - Check bank details reuse + Match the payment method modal with the current Dashboard's theme`,
              `Billing (alpha) - Fixed current user ID in delete payment method`,
              `New authorization concept added in Company, Site and Site Area`,
            ],
          },
        ],
      },
      {
        version: '2.4.58',
        date: new Date('2021-04-06'),
        componentChanges: [
          {
            name: 'Dashboard',
            changes: [
              `SAP Concur - Fixed Access token was not refreshed when connection updated date is not defined`,
              `OCPI - Improved performances and Fixed reported bugs`,
              `Adjusted authorizations in Company and Site pop-ups`,
              `Billing: Added number of Transactions in Invoice list`,
            ],
          },
        ],
      },
      {
        version: '2.4.57',
        date: new Date('2021-04-01'),
        componentChanges: [
          {
            name: 'Dashboard',
            changes: [
              `Integrated ioThink backend in Asset Management`,
              `Import of Users`,
              `Use lock with timeout for the Smart Charging`,
              `Roaming Company, Site and Site Area cannot be updated`,
              `Company and Site authorizations are led by the backend`,
              `Security updates`,
            ],
          },
        ],
      },
      {
        version: '2.4.56',
        date: new Date('2021-03-29'),
        componentChanges: [
          {
            name: 'Dashboard',
            changes: [
              `Set Schneider minimum intensity to 6A in Charging Station's template`,
              `Fixed User with role Basic should be able to read settings`,
              `Fixed Charging Profile Schema in RESTful endpoint`
            ],
          },
        ],
      },
      {
        version: '2.4.55',
        date: new Date('2021-03-27'),
        componentChanges: [
          {
            name: 'Dashboard',
            changes: [
              `EN+ and Exadys Charging Stations have been integrated`,
              `Security: Generate a new encryption key per tenant and migrate sensitive data`,
              `Billing: Added Stripe payment methods (alpha)`,
              `Car images are synchronized one by one to avoid high memory consumption`,
              `Enhanced Import Tags documentation`,
              `Add Create Charging Profile in the RESTful endpoint`,
              `Migrated Sites to authorizations based`,
              `Adjusted Settings authorizations`,
              `Upgrade to Angular 11.2.7`,
            ],
          },
        ],
      },
      {
        version: '2.4.54',
        date: new Date('2021-03-25'),
        componentChanges: [
          {
            name: 'Dashboard',
            changes: [
              `Import Tags`,
              `Fixed Site Area limit in Smart Charging`,
              `Billing: refactor of User and Invoice synchronizations`,
              `Fixed Tenant creation issue with OICP`,
              `Added REST Charging station QR-Code and Get OCPP Parameters JSon schema validations`
            ],
          },
        ],
      },
      {
        version: '2.4.53',
        date: new Date('2021-03-22'),
        componentChanges: [
          {
            name: 'Dashboard',
            changes: [
              `Manually configure a Charging Station linked to a configuration's Template`,
              `Added Car Connector's configuration for Daimler's backend`,
              `Allow to delete an OCPI User (eMSP) with all its Tags`,
              `Keba: Add support for latest firmware version`,
              `Billing - Check that Stripe settings are provided in Start Transaction`,
              `Billing - Enrich Stripe invoice information`,
              `Added Lock acquisition with a timeout`,
              `Changed Vendor ID length to 255 chars in OCPP-J status notification schema validation`,
              `Added SMTP error codes that should not trigger a retry`,
              `Added Exadys Charging Station in templates`,
              `Added Get Transaction's consumptions in RESTful endpoint`,
              `Added Get Charging Station endpoint schema validation in RESTful endpoint`,
              `Optimized Assets with Site ID like Charging Stations`,
              `Accept more firmware versions on Ingeteam Charging Station`,
              `Angular front-end uses the new RESTful endpoint for Charging Station's actions`,
              `Do not try to resend E-mail notification with error 450`,
            ],
          },
        ],
      },
      {
        version: '2.4.50',
        date: new Date('2021-03-15'),
        componentChanges: [
          {
            name: 'Dashboard',
            changes: [
              `Roaming: Hubject CPO implementation (beta)`,
              `Billing: Stripe implementation (alpha)`,
              `Enhanced the RESTful documentation API`,
              `Added Ingeteam Charging Station in template`,
            ],
          },
        ],
      },
      {
        version: '2.4.49',
        date: new Date('2021-03-12'),
        componentChanges: [
          {
            name: 'Dashboard',
            changes: [
              `Increased Charging Station's REST performances`,
              `Updated Charging Station's action in RESTful endpoint`,
              `Aligned all Sessions' consumptions`,
              `Added RFID Card CRUD operations in RESTful endpoint`,
              `Fixed Shelly Charging Station's amperage`,
              `Fixed Signed Meter Values on EBEE Charging Station`,
            ],
          },
        ],
      },
      {
        version: '2.4.48',
        date: new Date('2021-03-10'),
        componentChanges: [
          {
            name: 'Dashboard',
            changes: [
              `Accept more firmware versions for IES Charging Stations`,
              `Fixed Shelly in Charging Station's template`,
              `Added Joint Lightning Charging Station in template`,
              `Made Company RESTful endpoints based on authorization (Security)`,
              `Added User CRUD operations in RESTful endpoint`,
              `Fixed Firmware download RESTful endpoint`,
              `Fixed empty fields in User's profile are not saved in the database`,
            ],
          },
        ],
      },
      {
        version: '2.4.47',
        date: new Date('2021-03-09'),
        componentChanges: [
          {
            name: 'Dashboard',
            changes: [
              `Added IES Wallbox G3 MonoCombo in Charging Station's template`,
              `Added Ingeteam in Charging Station's template`,
              `Added getUsers and getUser in RESTful endpoint`,
              `Remove usage of Roles in the front-end (Security)`,
              `Linked both Site Area and Site in Asset’s Consumptions`,
              `Firmware patches in Charging Station's template are always accepted`,
              `Added new Unit Tests on crypto changes on sensitive data (Security)`,
            ],
          },
        ],
      },
      {
        version: '2.4.45',
        date: new Date('2021-03-03'),
        componentChanges: [
          {
            name: 'Dashboard',
            changes: [
              `Retrieve the completed Transactions via the new RESTful endpoint`,
              `Crypto key used for encrypting sensitive data can now be changed per tenant`,
              `Admin users are now notified when new end-users register and need their account activated`,
              `Export RFID and Description in Session History`,
              `Do not try to retrieve the Settings if Tenant's components are not active`,
              `Added Legrand model 059011 in Charging Station's template`,
              `Fixed Car's thumbnails not displayed`,
              `Track backend server's performances in database`
            ],
          },
        ],
      },
      {
        version: '2.4.44',
        date: new Date('2021-02-24'),
        componentChanges: [
          {
            name: 'Dashboard',
            changes: [
              `Can now exclude some Assets from the Smart Charging`,
              `Enhanced obfuscation of sensitive data in Logs + Unit Tests`,
              `Get OCPI Charging Station by Serial Number`,
              `Added support for latest Ebee firmware version in Charging Station's template`,
              `Fixed Site Admin cannot read Charging Station's logs`,
              `Cannot create Asset connection when different providers have been selected`,
              `Handled Registration Token for Site Admin role`,
              `Fixed cannot retrieve Site's image`,
            ],
          },
        ],
      },
      {
        version: '2.4.43',
        date: new Date('2021-02-23'),
        componentChanges: [
          {
            name: 'Dashboard',
            changes: [
              `Retrieve SoC of battery Assets and display it in the Asset's charts`,
              `Manually activate new Users accounts`,
              `Charging Station's Token can now be extended after having expired`,
              `Charging Stations public API for B2B access`,
              `Adjusted the Site Admin role to not have access to all Users`,
              `Do not return deleted Users when filtering is provided`,
            ],
          },
        ],
      },
      {
        version: '2.4.42',
        date: new Date('2021-02-15'),
        componentChanges: [
          {
            name: 'Dashboard',
            changes: [
              `Added Circontrol and Wallbox Copper SB Charging Stations in templates`,
              `Fix sending email error handling to avoid useless sending retries`,
              `Handle Charging Station's vendors property longer than 20 characters at Boot Notification`,
              `Fixed User Account activation + Reset password in new RESTful endpoint`,
              `Inbound OSS Security updates`,
            ],
          },
        ],
      },
      {
        version: '2.4.41',
        date: new Date('2021-02-09'),
        componentChanges: [
          {
            name: 'Dashboard',
            changes: [
              `Handle Assets consumptions and productions in Smart Charging`,
            ],
          },
        ],
      },
      {
        version: '2.4.40',
        date: new Date('2021-02-07'),
        componentChanges: [
          {
            name: 'Dashboard',
            changes: [
              `Allow OCPI Remote Start Transaction on Charging Stations with status Preparing`,
              `Enhanced OCPI logs for Remote Start/Stop`,
              `Added Renault Twizzy and Goupil G5 EVs`,
              `Italian translation provided`,
            ],
          },
        ],
      },
      {
        version: '2.4.39',
        date: new Date('2021-02-02'),
        componentChanges: [
          {
            name: 'Dashboard',
            changes: [
              `Greencom Asset integration`,
              `Let the car increases its consumption in sticky Smart Charging`,
              `Added Connector ID filter in Transaction lists`,
              `Stored encryption key of sensitive data in the database per organization (tenant)`,
              `Split Settings menu into Technical Settings and Integration Settings`,
              `Moved Charging Station registration from Settings to Charging Stations menu`,
              `Aligned Transaction's time with Charging Station's locale in Export CSV`,
              `Translated CSV headers in all export`,
            ],
          },
        ],
      },
      {
        version: '2.4.38',
        date: new Date('2021-01-25'),
        componentChanges: [
          {
            name: 'Dashboard',
            changes: [
              `Added EVBox G4 Elvi and BusinessLine Charging Station in templates`,
              `Added Innogy eBox Professional S Charging Station in templates`,
              `Disable firmware upload in production`,
              `Remove ABB workarounds: firmware have been upgraded`,
              `Clear the locks by hostname at server startup`,
              `Fixed sync of car's images with EV-Database due to a change on their interface`,
              `Linked toolbar button activation with list selection`,
              `Store credentials in SAP User Provided Services`,
              `Fixed Stats legend is not displayed in wide screen`,
            ],
          },
        ],
      },
      {
        version: '2.4.37',
        date: new Date('2021-01-09'),
        componentChanges: [
          {
            name: 'Dashboard',
            changes: [
              `Added Tag multi-selection + Mass delete`,
              `Added Active/Inactive Tag filter`,
              `Added static consumption/production and fluctuation percentage in Asset`,
              `Handle Asset that consumes and produces energy like a battery`,
              `Do not display Car's image when no image is provided`,
              `Disable row actions in list when Charging Station is inactive`,
              `Improve WebSocket events logging to help debugging`,
              `Added Wallbox Commander 2 in Charging Station's template`,
              `Fix initial Static Charging Station's limitation value`,
              `Add OCPP backend configuration support for secure and insecure URIs`,
            ],
          },
        ],
      },
      {
        version: '2.4.36',
        date: new Date('2021-01-04'),
        componentChanges: [
          {
            name: 'Dashboard',
            changes: [
              `Handle Scheduled status in OCPP Change Availability command`,
              `Fixed Roaming RFID Cards are not checked when Site Area access control is not active`,
            ],
          },
        ],
      },
      {
        version: '2.4.35',
        date: new Date('2020-12-24'),
        componentChanges: [
          {
            name: 'Dashboard',
            changes: [
              `Set Sticky Smart Charging threshold to 20%`,
              `Fixed configuration file not loading at the right time in Firefox`,
              `Handle connection issues with the Refunding system`,
              `Fixed Demo role cannot read its profile`,
            ],
          },
        ],
      },
      {
        version: '2.4.34',
        date: new Date('2020-12-21'),
        componentChanges: [
          {
            name: 'Dashboard',
            changes: [
              `Generate QR-Codes for Charging Stations`,
              `Export OCPI Session CDR in Session History list`,
              `Handle Charging Station with time in the future in Smart Charging`,
              `Set non public OCPP parameters when applying templates (Delta)`,
              `Do not take into account amperage leaks on a phase in Smart Charging`,
            ],
          },
        ],
      },
      {
        version: '2.4.33',
        date: new Date('2020-12-12'),
        componentChanges: [
          {
            name: 'Dashboard',
            changes: [
              `Implemented sticky Smart Charging that adjusts limitation to real Car's consumption`,
              `Fixed Smart Charging rounding amperage per phase in Car`,
              `Do not authorize roaming RFID Cards on a private Charging Station`,
              `Add Charging Station vendor integration for Shelly wallboxes`,
              `Added QA flag in Charging Station's templates for testing purpose`,
              `Added Tenant Logo in auth pages and in side bar`,
              `Auto refresh of user data and logo in side bar`,
              `Enabled database notification on Charging Station's backends`,
              `Use of default image when not provided and limit image types in Company Site, Site Area, Asset and Tenant`,
              `Fixed auto-focus not working in auth pages`,
            ],
          },
        ],
      },
      {
        version: '2.4.32',
        date: new Date('2020-12-08'),
        componentChanges: [
          {
            name: 'Dashboard',
            changes: [
              `Do not show Car plate ID in Session details for role Demo`,
              `Fixed Car Default and Owner props not returned to Basic users`,
              `Fixed CSS in Car Catalog popup for mid-size screens`,
              `Enhanced performances of the Carousel control used to display all the Car's images`,
              `Hide car features in front if Car component is not active`,
              `Added new Delta OCPP parameter in templates to correctly read RFID with shorter length like New Motion`,
              `Setup backup notification email server in AWS in addition to the one in SCP`,
              `Fixed translation issues`,
            ],
          },
        ],
      },
      {
        version: '2.4.31',
        date: new Date('2020-12-05'),
        componentChanges: [
          {
            name: 'Dashboard',
            changes: [
              `Start a Transaction with a given Car and RFID`,
              `Fixed refresh of power when nbr phase is changed`,
              `Fixed Instant Power progress bar with wrong Max Power in Charging Station's list`,
              `Added debug logs for Charging Stations connection issues`,
              `Fixed Save button is disabled in Tenant pop-up`,
              `Fix Keba Model in Charging Station's template`,
              `Add support for Static Limitation for Shelly in Charging Station's template`,
              `Fixed cannot set the phase order for a connector with single phase Site Area`,
            ],
          },
        ],
      },
      {
        version: '2.4.30',
        date: new Date('2020-12-02'),
        componentChanges: [
          {
            name: 'Dashboard',
            changes: [
              `Do not exclude Charging Station permanently when Smart Charging fails to push the Charging Plans to it`,
              `Moved Site column after the Charging Station's name in Charging Station's list`,
              `Add Keba P30 model in Charging Station's template`,
              `Increased performances for listing 800k RFID Cards`,
            ],
          },
        ],
      },
      {
        version: '2.4.29',
        date: new Date('2020-11-30'),
        componentChanges: [
          {
            name: 'Dashboard',
            changes: [
              `Truncate the OCPI pricing to 2 decimals instead of rounding it`,
              `Fixed wrong Connector status displayed in Sessions in progress`,
              `Enhanced Unlock Connector error message when not supported by the Charging Station`,
              `Used OCPI EVSE ID for Charging Station's name`,
              `Fixed pushing OCPI Charging Station with connectors that cannot charge in parallel`,
              `Force sort of Connector IDs in Charging Station list`,
            ],
          },
        ],
      },
      {
        version: '2.4.28',
        date: new Date('2020-11-29'),
        componentChanges: [
          {
            name: 'Dashboard',
            changes: [
              `Unlock Charging Station's Connector`,
              `Added JSon security schemas to filter Tenant HTTP requests`,
              `Published public REST API for Authentication and Tenants endpoints`,
              `Fixed computation of total DC Charging Station's power in UI`,
              `Optimized Heartbeat intervals for Charging Stations using WebSocket connections (OCPP 1.6)`,
            ],
          },
        ],
      },
      {
        version: '2.4.27',
        date: new Date('2020-11-24'),
        componentChanges: [
          {
            name: 'Dashboard',
            changes: [
              `Demo user can now display the Cars`,
              `Fixed Connector with wrong status in Session History`,
              `Fixed rounded consumptions in OCPI`,
              `Fixed default sorting in all lists`,
              `Hide spinner when EULA is displayed`,
              `Fixed Demo users can display User in Session details`,
              `Registration Token Site Area is hidden when Organization is inactive`,
              `Keep track of unmatched template sections`,
              `Do not add custom OCPP param if already exists in OCPP (Delta)`
            ],
          },
        ],
      },
      {
        version: '2.4.26',
        date: new Date('2020-11-18'),
        componentChanges: [
          {
            name: 'Dashboard',
            changes: [
              `Notify Admins when the Smart Charging cannot push a plan to a Charging Station`,
              `Jump from Charging Plan list to Site Area`,
              `Angular 11 migration`,
              `Enhanced OCPI CPO logs`,
              `Added locks at Transaction level when pushing OCPI CDRs`,
              `Fixed cannot select Transaction to Refund in list`,
              `Fixed Transaction in progress connector not animated when charging`,
            ],
          },
        ],
      },
      {
        version: '2.4.24',
        date: new Date('2020-11-15'),
        componentChanges: [
          {
            name: 'Dashboard',
            changes: [
              `Fixed OCPI CDR was not sent to Gireve at the end of the Session`,
              `Optimized Remote Start Transaction of eMSPs with several thousand RFID Cards`,
              `OCPI Pull Tokens second optimization pass`,
              `Increased to 2 the number of jobs pulling the RFID Cards from the Gireve`,
              `Added locks to all OCPI eMSP and CPO's actions`,
              `Fixed and optimized OCPI Pull Tokens`,
              `Enhanced OCPI logs`,
              `Fixed Remote Start Transaction not working`
            ],
          },
        ],
      },
      {
        version: '2.4.20',
        date: new Date('2020-11-07'),
        componentChanges: [
          {
            name: 'Dashboard',
            changes: [
              `Hide table list actions for OCPI entities`,
              `Push all the OCPI locations once a day`,
              `Retrieve all the OCPI RFID Cards once a day`,
              `Notify the user when a new invoice is available`,
              `Fixed billing invoice deletion during invoice synchronization`,
              `Added Car Maker filter in Car Management`,
              `Jump from User to RFID Card list should take into account the organization filter`,
              `Format OCPI Country codes`,
              `Aligned REST sorting with standard`,
              `Optimized MongoDB free text search in Logs`,
            ],
          },
        ],
      },
      {
        version: '2.4.17',
        date: new Date('2020-10-31'),
        componentChanges: [
          {
            name: 'Dashboard',
            changes: [
              `Workaround Gireve for Charging Station's specs`,
              `Jump from Session In Progress to the Charging Plans`,
              `Jump from Session lists to the Logs with the proper filters`,
            ],
          },
        ],
      },
      {
        version: '2.4.16',
        date: new Date('2020-10-27'),
        componentChanges: [
          {
            name: 'Dashboard',
            changes: [
              `Implemented the Car Management in the Smart Charging`,
              `Delete/Assignment of an RFID Card with anonymous Sessions should be allowed`,
              `Display Users in Car Management list`,
              `Added Navigate from Transaction History to To Charging Plans`,
              `Increased error margin from 5% to 10% in Session In Error over consumption`,
              `Ensure the static limitation value is never over the connector value`,
              `Fixed Email service disruption due to not provided value in CC`,
              `Handle all the Charge Point status transitions to compute the parking time`,
              `Fixed connection issues with Concur when the previous granted access has expired`,
              `Added Portuguese translation`,
              `Export users to CSV`,
              `Handle Schneider model EV2S22P4 in Charging Station's Template`,
              `RESTful endpoint PoC for external consumer (Open Data, Proviridis)`,
            ],
          },
        ],
      },
      {
        version: '2.4.11',
        date: new Date('2020-10-10'),
        componentChanges: [
          {
            name: 'Dashboard',
            changes: [
              `Persist custom OCPP Parameters in the database for Delta Charging Station`,
              `Added default RFID Card property`,
              `Added Site filter in User list`,
              `Static Power limitation must not be provided by the Charging Station Template`,
              `Fixed ABB RFID Card reader configuration`,
              `Added Schneider model EV2S7P04 in Charging Station's Template`,
              `Minor bug fixes`
            ],
          },
        ],
      },
      {
        version: '2.4.8',
        date: new Date('2020-10-03'),
        componentChanges: [
          {
            name: 'Dashboard',
            changes: [
              `Fixed cannot update new registered Users`,
              `Send notification to Admins when an unknown RFID Card is used on a Charging Station`,
              `Enable the Basic users to activate/deactivate his Notifications`,
              `Allow high volume of data in export functions`,
              `Migration tasks for aligning the local RFID Cards with local Users + default description`,
              `For RFID to be in upper case when created manually`,
              `Auto refresh RFID Card management list`,
              `Build Smart Charging safe Car + Override with Meter Values`,
              `Enable vehicle identifier in OCPP for the Ebee Charging Station`,
              `Handle Meter Values with L1_N, L2_N and L3_N phases`,
              `Add Voltage Meter Value on Legrand Charging Station`,
              `Enable authentication with RFID Card on Schneider Charging Station`,
              `Display a relevant error message when trying to create an RFID Card that already exists`,
            ],
          },
        ],
      },
      {
        version: '2.45',
        date: new Date('2020-09-25'),
        componentChanges: [
          {
            name: 'Dashboard',
            changes: [
              `New RFID Card Management framework`,
              `Enable Charging Profile support on ABB`,
              `Assign a User to an RFID Card in one step`,
              `Added a drop down list to activate/deactivate an RFID Card`,
              `Can only assign a Company or a Site issued by the current organization`,
              `When Charging Stations are excluded from the Smart Charging they can be tuned manually`,
              `Fixed retrieving the current connector power limit for the recursive daily Charging Plans and for the ones with one schedule period`,
              `Charging Station Template updates`,
              `Added navigation between Tag, User and Session lists`,
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
              `Added RFID in Sessions' lists`,
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
              `Added ATESS Charging Station vendor in templates`,
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
              `Handle multiple OCPI Authorizations with the same RFID`,
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
              `Enhanced RFID Card unit tests`,
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
              `Fixed RFID Card is no longer mandatory in user's profile`,
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
              `Fixed RFID Cards got deactivated after saving User's profile`,
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
              `Fixed User got notified with Session Not Started when he stopped his Session with his RFID Card`,
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
              `Fixed cannot delete unused User's RFID Card in User's profile`,
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
              `Set the minimum power to 2 Amps in the Connector Limitation`,
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
              `Remote Start Transaction is now using the first active RFID Card of the User`,
              `Fixed notification is sent when user has RFID Cardd and session is not started after 10 mins`,
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
              `Refactor the User's RFID Cards for eMSP implementation`,
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
              `User's RFID is not regenerated when not existing in profile`,
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
              `Fixed save of User's profile with multiple same RFIDs`,
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
              `Cannot assign an RFID which is already used by another user`,
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
              `Fixed auto disconnect user when he/she has more than 2 RFID Cards in his/her profile`,
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
              `Ignored connector ID 0 for EBEE charger`],
          },
        ],
      },
    ];
  }
}
