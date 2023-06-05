# Continuous Pricing

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 14.1.3.

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The application will automatically reload if you change any of the source files.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via a platform of your choice. To use this command, you need to first add a package that implements end-to-end testing capabilities.

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI Overview and Command Reference](https://angular.io/cli) page.

<!---
This is a proposal of how the Frontend-Backend communication could work during the session lifecycle of the APP:
•	The App is started from airRM and an ODMasterkey is provided along with the URL
•	The App uses this ODMasterkey to call the GetFlightDetails and get back the FlightDetails
•	After we get the response back but before the App starts rendering any of the data on FlightDetails, we call RecalculateAvailability for the cabin we will be displaying by default (The lowest). Even if it’s optional, the auSingleBucketValues object can already be provided taking the data from the FlightDetails object.
•	Before we receive a response from the RecalculateAvailability method we start rendering all the FlightDetails data
•	Once the Availability data is received we also render the availability
•	Every time the uses drag one of the Au points the RecalculateAvailability method should be called again providing an Updated auSingleBucketValues object.
•	We can start rendering all the charts and expect to have a delay receiving a response with the availability. Once it has been received, we will be able to render the updated values, meanwhile we can keep rendering the old values.
•	Once the users saves the Data ContinuousFaresPost method should be called providing a ContinuousFares object with the lates data on the APP (including the Updated Price Vector)
•	The data will be saved and the app will be refreshed and loaded again from the db with the newly saved data and the life cycle will restart
--->
