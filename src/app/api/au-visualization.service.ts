import { Injectable, Inject, Optional, InjectionToken } from '@angular/core';
import { BucketDetails, FlightClientDetails, CompetitiveFareDetails, FlightObject } from '../models/dashboard.model';

import { map, mergeMap as _observableMergeMap, catchError as _observableCatch } from 'rxjs/operators';
import { Observable, throwError as _observableThrow, from, catchError, of as _observableOf, BehaviorSubject } from 'rxjs';
import { HttpClient, HttpHeaders, HttpResponse, HttpResponseBase } from '@angular/common/http';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { isRunningWebView } from "../shared/webview-checker";

export const API_BASE_URL = new InjectionToken<string>('API_BASE_URL');

export const BASE_LOCALHOST_5000 = "http://localhost:5000";


import {
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


// @Injectable()
// export class AirlineConfigClient {
//   private http: HttpClient;
//   private baseUrl: string;
//   //private airlineConfigClient: AirlineConfigClient;

//   protected jsonParseReviver: ((key: string, value: any) => any) | undefined = undefined;
//   public apiTarget = 'https://i6iozocg1e.execute-api.us-west-2.amazonaws.com/jsons/bucketConfigs';

//   constructor(@Inject(HttpClient) http: HttpClient, @Optional() @Inject(API_BASE_URL) baseUrl?: string) {
//     this.http = http;
//   }

//   letter: string;
//   fare: number;
//   protections: number;
//   Aus: number;
//   bookings: number;
//   discrete: boolean;

//   init(_data?: AirlineConfig) {
//     console.log('_data ', _data)
//     if (_data) {
//       this.letter = _data["letter"];
//       this.fare = _data["fare"];
//       this.protections = _data["protections"];
//       this.Aus = _data["Aus"];
//       this.bookings = _data["bookings"];
//       this.discrete = _data["discrete"]
//     }
//   }


//   static fromJS(data: any): AirlineConfig {
//     data = typeof data === 'object' ? data : {};
//     let result = new AirlineConfig();
//     result.init(data);
//     return result;
//   }
//   /**
//    * @return Success.
//    */
//   get(): Observable<AirlineConfig> {
//     let url_ = this.apiTarget
//     url_ = url_.replace(/[?&]$/, "");


//     let options_: any = {
//       observe: "response",
//       responseType: "blob",
//       headers: new HttpHeaders({
//         "Accept": "text/plain; charset=utf-8"
//       })
//     };

//     // let options_: any = {
//     //   observe: "response",
//     //   responseType: "blob",
//     //   headers: new HttpHeaders({
//     //     "Accept": "application/json"
//     //   })
//     // };

//     return this.http.request("get", url_, options_)
//       .pipe(_observableMergeMap((response_: any) => {

//         return this.processGet(response_);
//       })).pipe(_observableCatch((response_: any) => {
//         // console.log('||||||||||||||||||    url_ ', url_, ' options_ ', options_, ' response_ ', response_)
//         if (response_ instanceof HttpResponseBase) {
//           try {
//             return this.processGet(response_ as any);
//           } catch (e) {
//             return _observableThrow(e) as any as Observable<AirlineConfig>;
//           }
//         } else
//           return _observableThrow(response_) as any as Observable<AirlineConfig>;
//       }));
//   }

//   protected processGet(response: HttpResponseBase): Observable<AirlineConfig> {
//     const status = response.status;
//     const responseBlob =
//       response instanceof HttpResponse ? response.body :
//         (response as any).error instanceof Blob ? (response as any).error : undefined;

//     let _headers: any = {}; if (response.headers) { for (let key of response.headers.keys()) { _headers[key] = response.headers.get(key); } }
//     // console.log('_headers ', _headers)
//     if (status === 200) {
//       return blobToText(responseBlob).pipe(_observableMergeMap(_responseText => {
//         let result200: any = null;
//         let resultData200 = _responseText === "" ? null : JSON.parse(_responseText, this.jsonParseReviver);
//         result200 = AirlineConfig.fromJS(resultData200);
//         return _observableOf(result200);
//       }));
//     } else if (status !== 200 && status !== 204) {
//       return blobToText(responseBlob).pipe(_observableMergeMap(_responseText => {
//         return throwException("An unexpected server error occurred.", status, _responseText, _headers);
//       }));
//     }
//     return _observableOf<AirlineConfig>(null as any);
//   }


// }

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


export function getClientForEnvironment(http: HttpClient, sanitizer: DomSanitizer): IBidPriceService {
  console.log('Called getClientForEnvironment')
  return new BidPriceAspNetService(http, sanitizer);
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

  private flightClient: FlightClient;
  private competitiveFareDetails: CompetitiveFareDetails
  private bpService: IBidPriceService;

  // public apiTarget = 'https://i6iozocg1e.execute-api.us-west-2.amazonaws.com/jsons/bucketConfigs';

  public readonly bucketUrl: string = 'https://rms-json-continuous-price.s3.us-west-2.amazonaws.com/bucketConfigs.json';
  public readonly continuousFaresUrl: string = 'https://rms-json-continuous-price.s3.us-west-2.amazonaws.com/continuousFares.json';
  public readonly competetiveFaresUrl: string = 'https://rms-json-continuous-price.s3.us-west-2.amazonaws.com/competitiveFares.json';

  public readonly flightClientUrl: string = 'https://rms-json-continuous-price.s3.us-west-2.amazonaws.com/flightDetails.json';

  //local file temporarily
  public readonly flightDetailsFromLocal = './assets/config/flightDetails.json';
  public apiTarget;


  constructor(@Inject(HttpClient) protected http: HttpClient, private sanitizer: DomSanitizer) {
    this.apiTarget = sanitizer.bypassSecurityTrustResourceUrl(this.bucketUrl);
    ///this.airlineConfigClient = new AirlineConfigClient(this.http, this.apiTarget.changingThisBreaksApplicationSecurity);
    //this.competitiveFareDetails = new CompetitiveFareDetails(this.http, this.apiTarget.changingThisBreaksApplicationSecurity);
  }


  public apiContinuousFareClientValues(): Observable<FlightObject> {

    return this.http.get(this.flightClientUrl)
      .pipe(
        map((response: FlightObject) => {
          // console.log('FlightObject ', response)
          return response;
        }),
        catchError(error => {
          throw error;
        }),
      );

  }

  public apiCompetitiveFareClientValues(): Observable<FlightClientDetails[]> {

    return this.http.get(this.competetiveFaresUrl)
      .pipe(
        map((response: any) => {
          return response;
        }),
        catchError(error => {
          throw error;
        }),
      );

  }


  public flight_Get(): Observable<BucketDetails[]> {
    return this.bpService.flight_Get();
  }


  public flight_Post(masterKey: number, bidPriceInfluences: LegBidPriceInfluences[]): Observable<void> {
    return this.bpService.flight_Post(masterKey, bidPriceInfluences);
  }

}

@Injectable({
  providedIn: 'root'
})


export class BidPriceWebViewService implements IBidPriceService {

  private bidPriceBridge;
  readonly mockFlightClient = './assets/config/bucketConfigs.json';

  constructor(@Inject(HttpClient) protected http: HttpClient, sanitizer: DomSanitizer) {
    getClientForEnvironment(http, sanitizer)
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