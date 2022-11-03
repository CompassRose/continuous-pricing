import { Component } from '@angular/core';

@Component({
    selector: 'app-flight-header',
    templateUrl: './flight-header.component.html',
    styleUrls: ['./flight-header.component.scss']
})

export class FlightHeaderComponent {

    public originAirportMunicipality: string;
    public destinationAirportMunicipality: string;

    constructor() { }
}
