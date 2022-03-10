# Open e-Mobility Angular Dashboard App

## Summary

The Angular dashboard connects to the [Open e-Mobility NodeJs Server](https://github.com/sap-labs-france/ev-server) to display the charging stations in real time.

The application features:

* Charging Stations details and real-time statuses
* Charging sessions curves in real time
* Charging stations remote control (Reboot, Clear Cache, Stop Transaction, Unlock Connector)
* Charging Station Template management: Zero configuration
* User management
* Badge management
* Role management (ABAC)
* Static Energy Management: Manually limit the charging station
* Smart Charging with Assets, Fair Sharing, Peak Shaving, Cost Management and Phase Balancing
* Realtime Asset Management (Building, Battery, Solar Panel) 
* Billing with Stripe
* Complex Pricing
* Roaming integration (Gire, Hubject)
* Refunding (SAP Concur)
* Simple Statistics + Advanced Analytics (SAP Analytics)
* Car Connector Management (Get the car's data to optimize the charging session)

**Contact the author** <a href="https://www.linkedin.com/in/serge-fabiano-a420a218/" target="_blank">Serge FABIANO</a>

## Installation

* Install NodeJS: https://nodejs.org/ (install the LTS version)
* Clone this GitHub project
* Go into the **ev-dashboard** directory and run **npm install** or **yarn install** (use sudo in Linux)

**NOTE**:

* On Windows with **chocolatey** (https://chocolatey.org/), do as an administrator:

```powershell
choco install -y nodejs-lts
```

* On Mac OSX with **Homebrew** (https://brew.sh/), do:

```shell
brew install node
```

* Follow the rest of the setup below

## The Dashboard

#### Configuration

There is one template provided: **src/assets/config-template.json**.

Rename it to **config.json**.

Move this configuration file into the **src/assets** directory.

Edit this file, you will set relevant config data in it.

#### Connect to the Central Service REST Server (CSRS)

The dashboard is served by a web server, downloaded into the browser and will call the REST Server to retrieve and display the data.

Set the REST Server URL:

```json
  "CentralSystemServer": {
    "protocol": "http",
    "host": "localhost",
    "port": 80
  },
```

### Create and set a Google Maps API key
Ev-dashboard requires you to setup a Google API key: https://developers.google.com/maps/documentation/javascript/get-api-key#restrict_key.
Once the key is created it must be enabled (from the Google Console) and the value must replace the one present in /src/index.html, in Google Maps section:

	src="https://maps.googleapis.com/maps/api/js?key=<YOUR_KEY_HERE>&libraries=places&language=en"></script>

### Setup the reCaptcha API key
In order to call REST endpoints of ev-server, a reCaptcha key is required. Refers to this link https://www.google.com/recaptcha/admin/create to create one then copy the client key in config.json, in User section:

```json 
	"User": {
	  "maxPictureKb": 150,
	  "captchaSiteKey": "<GOOGLE_RECAPTCHA_KEY_CLIENT>"
	},
```

## Start the Dashboard Server

### Development Mode

```shell
npm start
```

### Production Mode

First build the sources with:
```shell
npm run build:prod
```

Next, start the server with:
```shell
npm run start:prod
```

### Secured Production Mode (SSL)

Build the sources as above and run it with:
```shell
npm run start:prod:ssl
```

## Integration tests

To run integration tests, you first need to start the UI and run the below command:
```shell
npm run test
```

This will run all integraiton tests written with **Jest** framework.

## License

This file and all other files in this repository are licensed under the Apache Software License, v.2 and copyrighted under the copyright in [NOTICE](NOTICE) file, except as noted otherwise in the [LICENSE](LICENSE) file.

Please note that Docker images can contain other software which may be licensed under different licenses. This LICENSE and NOTICE files are also included in the Docker image. For any usage of built Docker images please make sure to check the licenses of the artifacts contained in the images.
