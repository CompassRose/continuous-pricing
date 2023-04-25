import { Injectable, Inject, Optional, InjectionToken } from '@angular/core';
import { BidPriceInfluencers, BucketDetails } from '../models/dashboard.model';

import { map, mergeMap as _observableMergeMap, catchError as _observableCatch } from 'rxjs/operators';
import { Observable, throwError as _observableThrow, from, catchError, of as _observableOf, BehaviorSubject } from 'rxjs';
import { HttpClient, HttpHeaders, HttpResponse, HttpResponseBase } from '@angular/common/http';

import { isRunningWebView } from "../shared/webview-checker";

export const API_BASE_URL = new InjectionToken<string>('API_BASE_URL');

export const BASE_LOCALHOST_5000 = "http://localhost:5000";


import {
  BidPriceInfluencesClient,
  FlightClient,
  LegBidPriceInfluences
} from "./bidPrice_client";

export class AirlineConfig {
  static fromJS(resultData200: any): any {
    throw new Error('Method not implemented.');
  }
  init(data: any) {
    throw new Error('Method not implemented.');
  }
  letter: string;
  fare: number;
  protections: number;
  Aus: number;
  bookings: number;
  discrete: boolean;
}

export class ApiException extends Error {
  override message: string;
  status: number;
  response: string;
  headers: { [key: string]: any; };
  result: any;



  constructor(message: string, status: number, response: string, headers: { [key: string]: any; }, result: any) {
    super();

    this.message = message;
    this.status = status;
    this.response = response;
    this.headers = headers;
    this.result = result;


  }

  protected isApiException = true;

  static isApiException(obj: any): obj is ApiException {
    return obj.isApiException === true;
  }
}


@Injectable()
export class AirlineConfigClient {
  private http: HttpClient;
  private baseUrl: string;
  //private airlineConfigClient: AirlineConfigClient;

  protected jsonParseReviver: ((key: string, value: any) => any) | undefined = undefined;
  public apiTarget = 'https://i6iozocg1e.execute-api.us-west-2.amazonaws.com/jsons/bucketConfigs';

  constructor(@Inject(HttpClient) http: HttpClient, @Optional() @Inject(API_BASE_URL) baseUrl?: string) {

    //  console.log('AirlineConfigClient', API_BASE_URL)

    this.http = http;

    //this.baseUrl = baseUrl !== undefined && baseUrl !== null ? baseUrl : BASE_LOCALHOST_5000;

    //console.log('AirlineConfigClient this.baseUrl ', this.baseUrl)
  }

  letter: string;
  fare: number;
  protections: number;
  Aus: number;
  bookings: number;
  discrete: boolean;

  init(_data?: AirlineConfig) {
    /// console.log('_data ', _data)
    if (_data) {
      this.letter = _data["letter"];
      this.fare = _data["fare"];
      this.protections = _data["protections"];
      this.Aus = _data["Aus"];
      this.bookings = _data["bookings"];
      this.discrete = _data["discrete"]
    }
  }


  static fromJS(data: any): AirlineConfig {
    data = typeof data === 'object' ? data : {};
    let result = new AirlineConfig();
    result.init(data);
    return result;
  }
  /**
   * @return Success.
   */
  get(): Observable<AirlineConfig> {
    let url_ = this.apiTarget
    url_ = url_.replace(/[?&]$/, "");


    let options_: any = {
      observe: "response",
      responseType: "blob",
      headers: new HttpHeaders({
        "Accept": "text/plain; charset=utf-8"
      })
    };

    // let options_: any = {
    //   observe: "response",
    //   responseType: "blob",
    //   headers: new HttpHeaders({
    //     "Accept": "application/json"
    //   })
    // };

    return this.http.request("get", url_, options_)
      .pipe(_observableMergeMap((response_: any) => {

        return this.processGet(response_);
      })).pipe(_observableCatch((response_: any) => {
        // console.log('||||||||||||||||||    url_ ', url_, ' options_ ', options_, ' response_ ', response_)
        if (response_ instanceof HttpResponseBase) {
          try {
            return this.processGet(response_ as any);
          } catch (e) {
            return _observableThrow(e) as any as Observable<AirlineConfig>;
          }
        } else
          return _observableThrow(response_) as any as Observable<AirlineConfig>;
      }));
  }

  protected processGet(response: HttpResponseBase): Observable<AirlineConfig> {
    const status = response.status;
    const responseBlob =
      response instanceof HttpResponse ? response.body :
        (response as any).error instanceof Blob ? (response as any).error : undefined;

    let _headers: any = {}; if (response.headers) { for (let key of response.headers.keys()) { _headers[key] = response.headers.get(key); } }
    // console.log('_headers ', _headers)
    if (status === 200) {
      return blobToText(responseBlob).pipe(_observableMergeMap(_responseText => {
        let result200: any = null;
        let resultData200 = _responseText === "" ? null : JSON.parse(_responseText, this.jsonParseReviver);
        result200 = AirlineConfig.fromJS(resultData200);
        return _observableOf(result200);
      }));
    } else if (status !== 200 && status !== 204) {
      return blobToText(responseBlob).pipe(_observableMergeMap(_responseText => {
        return throwException("An unexpected server error occurred.", status, _responseText, _headers);
      }));
    }
    return _observableOf<AirlineConfig>(null as any);
  }


}

function throwException(message: string, status: number, response: string, headers: { [key: string]: any; }, result?: any): Observable<any> {
  console.log('throwException ', message, ' status ', status, ' response ', response, ' headers ', headers)
  if (result !== null && result !== undefined)
    return _observableThrow(result);
  else
    return _observableThrow(new ApiException(message, status, response, headers, null));
}

function blobToText(blob: any): Observable<string> {
  return new Observable<string>((observer: any) => {
    if (!blob) {
      observer.next("");
      observer.complete();
    } else {
      let reader = new FileReader();
      reader.onload = event => {
        observer.next((event.target as any).result);
        observer.complete();
      };
      reader.readAsText(blob);
    }
  });
}


export function getClientForEnvironment(http: HttpClient): IBidPriceService {
  //console.log('Called getClientForEnvironment')
  return new BidPriceAspNetService(http);
}

export interface IBidPriceService {
  // TODO: add documentation to all methods
  // account_Login_Post(login: Login): Observable<LoginResponse>;
  // airlineConfig_Get(): Observable<AirlineConfig>;
  // bidPriceInfluences_Get(masterKey: number): Observable<LegBidPriceInfluences[]>;
  // bidPriceInfluences_Post(masterKey: number, bidPriceInfluences: LegBidPriceInfluences[]): Observable<void>;
  // bidPriceInfluenceThresholds_Get(masterKey: number): Observable<CabinBidPriceInfluenceThresholds>;
  // bidPriceInfluenceThresholds_Post(masterKey: number, thresholds: CabinBidPriceInfluenceThresholds[]): Observable<void>;
  // dailyFare_Get(masterKey: number): Observable<PosDailyFare[]>;
  flight_Get(): Observable<any>;

  flight_Post(masterKey: number, bidPriceInfluences: LegBidPriceInfluences[]): Observable<void>;

  // legBidPrice_Get(masterKey: number): Observable<CabinBidPriceValues[]>;
  // // that's all the API has described. I don't know what it's supposed to be doing
  // legBidPrice_Post(masterKey: number): Observable<void>;

  // legFlightDetails_Get(masterKey: number): Observable<LegFlightDetails>;
}

@Injectable({
  providedIn: 'root'
})

export class BidPriceAspNetService {
  readonly airportCodes_URL = './assets/csv/airports_small.csv';
  readonly mockFlightClient = './assets/config/bucketConfigs.json';
  private bidPriceInfluences: BidPriceInfluencesClient;
  private flightClient: FlightClient;
  private airlineConfigClient: AirlineConfigClient;
  // public selectedMasterKey: number;
  // public receivedUserId: string = '';

  private bpService: IBidPriceService;

  // public apiTarget = 'https://i6iozocg1e.execute-api.us-west-2.amazonaws.com/jsons/bucketConfigs';

  public apiTarget = this.mockFlightClient;

  constructor(@Inject(HttpClient) protected http: HttpClient) {

    this.airlineConfigClient = new AirlineConfigClient(this.http, this.apiTarget)

    // console.log('this.airlineConfigClient ', this.airlineConfigClient)

    //this.bidPriceInfluences = new BidPriceInfluencesClient(this.http, this.configurationLoader.getConfiguration().apiUrl);
    //this.flightClient = new FlightClient(this.http, this.configurationLoader.getConfiguration().apiUrl);
    //console.log('configurationLoader ', this.configurationLoader)
    //this.receivedUserId = window.localStorage.getItem('UserID');
    //console.log('From Dashboard API   receivedUserId ', this.receivedUserId)

    this.mockFlightClientValues();
    // this.setAirlineValues()
  }

  // public getAirlineValues() {
  //   return this.airlineConfigClient.get()
  //     .pipe(
  //       // take(1),
  //       map((response: AirlineConfig) => {
  //         console.log('|||||||   response ', response)
  //         return response;
  //       }),
  //       catchError(error => {
  //         console.log('airlineConfigClient ', error)
  //         throw error;
  //       }),
  //     );
  // }

  // public setAirlineValues() {
  //   this.getAirlineValues()
  //     .subscribe((response: AirlineConfig) => {

  //       console.log('airlineConfigClient ', response)
  //     })
  // }


  public flight_Get(): Observable<BucketDetails[]> {
    //console.log('Const flight_Get ');
    return this.bpService.flight_Get();
  }


  public flight_Post(masterKey: number, bidPriceInfluences: LegBidPriceInfluences[]): Observable<void> {
    return this.bpService.flight_Post(masterKey, bidPriceInfluences);
  }



  public mockFlightClientValues(): Observable<BucketDetails[][]> {

    let options_: any = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        "Access-Control-Allow-Headers": "Origin, Accept, Content-Type, X-Requested-W",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET,PUT,POST,DELETE,PATCH,OPTIONS",
      })
    };

    // console.log('mockFlightClientValues ', options_)

    return this.http.get(this.apiTarget, options_)
      .pipe(
        map((response: any) => {
          return response;
        }),
        catchError(error => {
          throw error;
        }),
      );

  }

  // public getAirlineValues() {
  //   return this.airlineConfigClient.get()
  //     .pipe(
  //       map((response: AirlineConfig) => {
  //         return response;
  //       }),
  //       catchError(error => {
  //         throw error;
  //       }),
  //     );
  // }


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

@Injectable({
  providedIn: 'root'
})


export class BidPriceWebViewService implements IBidPriceService {
  private bidPriceBridge;
  readonly mockFlightClient = './assets/config/bucketConfigs.json';

  constructor(@Inject(HttpClient) protected http: HttpClient) {

    // if (!this.hasBidPriceBridge()) {
    //   this.bidPriceBridge = window.chrome.webview.hostObjects.bidPrice;
    // } else {
    //   throw Error("Could not find bidPrice bridge object 'window.chrome.webview.hostObjects.bidPrice'");
    // }
    getClientForEnvironment(http)


  }

  public flight_Get(): Observable<BucketDetails[]> {

    //const p: Promise<string> = this.bidPriceBridge.FlightGet().sync();
    //const middleObservable: Observable<string> = from(p);
    console.log('flight_Get ')

    return this.http
      .get(this.mockFlightClient, { responseType: 'text' })
      .pipe(
        map((bucketCollection: any) => {
          console.log('bucketCollection ', bucketCollection)
          const details: BucketDetails[] = JSON.parse(bucketCollection);
          return details;
        })
      );
  }

  public flight_Post(masterKey: number, bidPriceInfluences: LegBidPriceInfluences[]): Observable<void> {
    const influencesStr = JSON.stringify(bidPriceInfluences);
    const p: Promise<void> = this.bidPriceBridge.FlightPost(masterKey, influencesStr).sync();
    return from(p);
  }
  private hasBidPriceBridge(): boolean {
    return isRunningWebView()
      && !!window.chrome.webview.hostObjects
      && !!window.chrome.webview.hostObjects.bidPrice;
  }

}