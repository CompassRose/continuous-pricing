import { Injectable, Inject, InjectionToken } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BidPriceInfluencers } from '../models/dashboard.model';
import { map, catchError } from "rxjs/operators";
import { ConfigurationLoader } from "../configuration/configuration-loader.service";

export const API_BASE_URL = new InjectionToken<string>('API_BASE_URL');

export const BASE_LOCALHOST_5000 = "http://localhost:5000";

// API Flight master keys  1294409 1294409 1352309 1293968 1293968 1294424 1293991

import {
  BidPriceInfluencesClient,
  FlightClient,
  AirlineConfigClient,
  AirlineConfig
} from './bidPrice_client';

@Injectable({
  providedIn: 'root'
})


export class DashboardApi {
  readonly airportCodes_URL = './assets/csv/airports_small.csv';
  private bidPriceInfluences: BidPriceInfluencesClient;
  private flightClient: FlightClient;
  private airlineConfigClient: AirlineConfigClient;
  public selectedMasterKey: number;
  public receivedUserId: string = '';

  constructor(@Inject(HttpClient) protected http: HttpClient, public configurationLoader: ConfigurationLoader) {

    //this.airlineConfigClient = new AirlineConfigClient(this.http, this.configurationLoader.getConfiguration().apiUrl);
    //this.bidPriceInfluences = new BidPriceInfluencesClient(this.http, this.configurationLoader.getConfiguration().apiUrl);
    //this.flightClient = new FlightClient(this.http, this.configurationLoader.getConfiguration().apiUrl);
    //console.log('configurationLoader ', this.configurationLoader)
    //this.receivedUserId = window.localStorage.getItem('UserID');
    //console.log('From Dashboard API   receivedUserId ', this.receivedUserId)
  }

  public getAirlineValues() {
    return this.airlineConfigClient.get()
      .pipe(
        map((response: AirlineConfig) => {
          return response;
        }),
        catchError(error => {
          throw error;
        }),
      );
  }


  // Returns mult, min, max, add/sub from API // BidPriceInfluences
  public getBidPriceInfluences(masterKey: number): Observable<BidPriceInfluencers[]> {
    return this.bidPriceInfluences.get(masterKey)
      .pipe(
        map((response: any) => {
          return response;
        }),
        catchError(error => {
          throw error;
        }),
      );
  }



  //  LegFlightDetailsClient
  public getFlightClient(masterKey: number): Observable<FlightClient> {
    return this.flightClient.getByMasterKey(masterKey)
      .pipe(
        map((response: any) => {
          return response;
        }),
        catchError(error => {
          throw error;
        })
      );
  }


  public postToFlightClient(masterKey, influences, userId): Observable<any> {
    return this.flightClient.post(masterKey, influences, userId)
      .pipe(
        map((response => response)
        ),
        catchError(error => {
          throw error;
        })
      )
  }


  // Returns O and D city names from local airport csv file
  public findAirportCodes(or, dest): Observable<any[]> {
    return this.http
      .get(this.airportCodes_URL, { responseType: 'text' })
      .pipe(map(res => {
        return this.findOandDAirportCodesJSON(res, or, dest);
      }));
  }

  private findOandDAirportCodesJSON(csv, o, d) {
    const lines = csv.split(/[\r\n]+/);

    for (let i = 0; i < lines.length; i++) {
      lines[i] = lines[i].replace(/\s/, '');
    }

    const result = [];
    const headers = lines[0].split(',');

    const test = headers.findIndex(code => code === 'iata_code')

    for (let i = test; i < lines.length; i++) {
      const obj = {};

      const currentline = lines[i].split(',');

      for (let j = 0; j < headers.length; j++) {
        if (headers[j] !== 'coordinates') {
          obj[headers[j].toString()] = currentline[j];
        } else {
          let temp3 = currentline[2].replace(/['"]+/g, '')
          let temp4 = currentline[3].replace(/['"|/\s/]+/g, '')

          temp3 = Math.round((+temp3 * 100) / 100)
          temp4 = Math.round((+temp4 * 100) / 100)
          const tester = [];
          tester.push(temp4, temp3);
          obj[headers[j]] = tester;
        }
      }
      if (obj['iata_code'] === o) {
        result[0] = (obj);
      }

      if (obj['iata_code'] === d) {
        result[1] = (obj);
      }
    }
    return result;
  }
}
