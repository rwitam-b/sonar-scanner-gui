# sonar-scanner-gui
A minimalist material design GUI wrapped over the SonarQube CLI Scanner.

## Prerequisites

```
Node.js
A working SonarQube server setup
```

## Installing

```
npm install
```

## Running

```
npm start
```

## Property Configuration

sonar-scanner-gui configures the scan properties using 2 steps.
  1. A **system.properties** file can be maintained(located in /resources).
  2. User fields filled in from screen will be appended to the system properties to obtain the final **sonar-scanner.properties**.
