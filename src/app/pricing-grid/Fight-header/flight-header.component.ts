import { Component } from '@angular/core';


export const devPathToAssets = '../../assets/images/';
export const prodPathToAssets = '';

@Component({
    selector: 'app-flight-header',
    templateUrl: './flight-header.component.html',
    styleUrls: ['./flight-header.component.scss']
})



export class FlightHeaderComponent {

    public originAirportMunicipality: string;
    public destinationAirportMunicipality: string;
    public pathToAssets = '';

    constructor() {
        this.pathToAssets = prodPathToAssets;
    }
}
