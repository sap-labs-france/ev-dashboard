# Electric Vehicule Charging Station (EVSE) - Dashboard

## Summary

The Angular dashboard connects to the [EVSE Server](https://github.com/LucasBrazi06/ev-server) to display the charging stations in real time.

The application:
* Displays of the charging stations, their status and their delivered power in real time.
* User management (create, update, delete, authorize, change role...)
* Charging station charging curve real time
* Actions on charging stations: Reboot, Clear Cache, Stop Transaction, Unlock Connector...
* Energy control: Set the maximum energy delivered by the charging station

**Live demo here** [Smart EVSE](https://smart-evse.com/)

## Installation
* Install NodeJS: https://nodejs.org/ (install the LTS version)
* Install Python version 2.7 (not the version 3.7!)
* Clone this GitHub project
* Go into the **ev-dashboard** directory and run **npm install** or **yarn install** (use sudo in Linux)
* Follow the rest of the setup below

## The Dashboard

#### Configuration

There are two templates provided: **config-template-http.json** for HTTP and **config-template-https.json** for HTTPS.

Choose one and rename it to **config.json**.

Move this configuration file into the **src/assets** directory.

#### Connect to the Central Service REST Server (CSRS)

The dashboard is served by a web server, downloaded into the browser and will call the REST Server to retrieve and display the data.

Set the REST Server URL:

```
  "CentralSystemServer": {
    "protocol": "http",
    "host": "localhost",
    "port": 80
  },
```

## Start the Dashboard Server

### Development Mode

```
npm start
```

### Production Mode
First build the sources with:
```
npm run build:prod
```

Next, start the server with:
```
npm run start:prod:dist
```

### Secured Production Mode (SSL)
Build the sources as above and run it with:
```
npm run start:prod:dist:ssl
```

## Tests End To End
To run e2e tests, you first need to have a server and UI up and running. Then start the e2e suite with:
``` 
npm run e2e
```

That's it!