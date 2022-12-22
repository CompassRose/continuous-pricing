
import { Injectable, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, } from 'rxjs';
//import { BidPriceInfluencers } from '../models/dashboard.model';
import { map, catchError } from "rxjs/operators";
//import { ConfigurationLoader } from "../configuration/configuration-loader.service";
import { HttpHeaders } from '@angular/common/http';

export const httpOptions = {
    headers: new HttpHeaders({
        'Content-Type': 'application/json',
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Origin": "https://www.example.com",
        "Access-Control-Allow-Methods": "OPTIONS,POST,GET",
    })
};

export const handler = async (event) => {
    console.log('event ', event)
    const response = {
        statusCode: 200,
        headers: {
            "Access-Control-Allow-Headers": "Content-Type",
            "Access-Control-Allow-Origin": "https://www.example.com",
            "Access-Control-Allow-Methods": "OPTIONS,POST,GET"
        },
        body:
        {
            "input": "{  \"sessionId\": \"PostmanExpress\",  \"seatQuantity\": 2}",
            "name": "PostmanExpress3",
            "stateMachineArn": "arn:aws:states:us-west-2:733705224063:stateMachine:ShoppingRequest_Express"
        }

    };
    return response;
};

@Injectable({
    providedIn: 'root'
})

export class DashboardApi {

    public allFlights: any[] = [];
    public errorMessage: any;

    public payload = {
        "input": "{  \"sessionId\": \"PostmanExpress\",  \"seatQuantity\": 2}",
        "name": "PostmanExpress3",
        "stateMachineArn": "arn:aws:states:us-west-2:733705224063:stateMachine:ShoppingRequest_Express"
    }

    constructor(public http: HttpClient) { }


    public postToFlightClient(): any {
        const endPoint = "https://fhbr2gjccj.execute-api.us-west-2.amazonaws.com/beta/flightsearch-express";

        console.log(' stringify ', JSON.stringify(this.payload))
        const payloadString = JSON.stringify(this.payload)

        return this.http.post<any>(endPoint, this.payload, httpOptions)
            .pipe(catchError((error: any, caught: Observable<any>): Observable<any> => {
                this.errorMessage = error.message;
                console.error('Error!', this.errorMessage, ' caught ', caught);
                return of();
            }))
            .subscribe(data => {
                console.log(' parse ', JSON.parse(data))
            });
    }

}