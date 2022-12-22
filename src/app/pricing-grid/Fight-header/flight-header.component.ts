import { Component } from '@angular/core';
import { PathToAssets } from '../../dashboard-constants';


@Component({
    selector: 'app-flight-header',
    templateUrl: './flight-header.component.html',
    styleUrls: ['./flight-header.component.scss']
})



export class FlightHeaderComponent {

    public originAirportMunicipality: string;
    public destinationAirportMunicipality: string;
    public pathToAssets = PathToAssets;

    constructor() { }
}
