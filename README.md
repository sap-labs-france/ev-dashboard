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
* Clone this GitHub project
* Run **npm install** in the **ev-dashboard** directory (use sudo in Linux)
* Follow the setup below

## The Dashboard

#### Configuration

The server configuration is stored in the **config.json** file in the **src/assets** directory.

There are two templates already provided named **config-template-http.json** for HTTP and **config-template-https.json** for HTTPS.

Choose one according the protocol and rename it to **config.json**.

In the next chapters, you will set relevant config data.

#### Connect to the Central Service REST Server (CSRS)

The dashboard runs in the browser and will call the CSRS to retrieve and display the data.

Set the CSRS URL:

```
  "CentralSystemServer": {
    "protocol": "https",
    "host": "localhost",
    "port": 8888
  },
```

The protocol of the dashboard server (below) should be the same that the one to access the CSRS server (HTTP or HTTPS.)


## Start the EVSE Dashboard Server


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

### Development Mode


```
npm start
```
