

export interface FlightClientDetails {
  odMasterKey?: number;
  flightline?: string;
  airlineCode?: string | undefined;
  origin?: string | undefined;
  destination?: string | undefined;
  flightNumber?: number;
  departureDate?: string;
  departureTime?: string;
  arrivalTime?: string;
  arrivalDateTime?: Date;
}

export interface CabinDetails {
  cabinLetter?: string | undefined;
  cabinName?: string | undefined;
  lid?: number;
  capacity?: number;
  adjustedBidPrices?: number[];
  originalBidPrices?: number[] | undefined;
  bucketConfigs?: ApiBucketDetails[] | undefined;
  bookings?: number;
}

export interface ApiBucketDetails {
  bucketLetter?: string;
  bucketOrder?: number;
  fare?: number;
  adjustedFare?: number;
  bookings?: number;
  multiplier?: number;
  modifiedFare?: number;
  adjustedFareES?: number;
  adjustedFareOE?: number;
  esPos?: string;
  oePos?: string;
  sa?: number;
  oeSa?: number;
  esSa?: number;
}

export interface SeasonalItems {
  OriginalRASM: string;
  Time;
  key?;
  LinearValue: string;
  FittedSeasonalValue: string;
  Residual: string;
}

export interface BidPriceInfluencers {
  legMasterKey?: number;
  cabinLetter?: string | undefined;

  mult?: number;
  addSub?: number;
  partialMax?: string
}

export interface IFlightInfluencesByCabin {
  legMasterKey?: number;
  cabinLetter?: string;
  constraints?: BidPriceConstraint[];
}

export interface BidPriceConstraint {
  categories?: any[];
  name?: string;
  constraint: string;
  value: any;
  updValue?: any;
  originalValue?: any;
  maxSeats?: number;
}


export interface BezierPoints {
  x: number;
  y: number;
}

export interface QueryItems {
  regions: string[];
  plotType: number;
  ndoList: any[];
}

export interface ChartDisplayType {
  id: number;
  value: string;
  metric: string;
}

export interface BarSeries {
  value: number;
  //width: number;
  barColor: string;
}

export interface ScriptContentItems {
  items: ScriptContent[]
}

export interface ScriptContent {
  id: number;
  name: string;
  values: AnalyticsQueryResponse;
  default?: boolean;
}

export interface BucketDetails {
  letter: string;
  fare: number;
  bookings: number;
  protections: number;
  Aus?: number;
  Sa?: number;
  discrete?: boolean;
  color?: string;
}

export interface FlightObject {
  airlineCode: string;
  cabinContinuousFares: CabinContinuousFares[];
  departureDate: string;
  departureTime: string;
  arrivalTime: string;
  flightline: string;
  oDmasterKey: number
}

export interface CabinContinuousFares {
  ODMasterkey: number;
  bucketStructure: BucketStructure[];
  cabinLetter: string;
  competitiveFares: CompetitiveFareDetails[];
  lid: number;
  priceVector: number[];
}

export interface BucketStructure {
  adjustedAu: number;
  bk: number;
  currentAu: number;
  fare: number;
  index: number;
  protections?: number;
  isDiscrete: boolean;
  letter: string;
  color?: string;
}

export interface CompetitiveFareDetails {
  odMasterkey: number;
  carrier?: string;
  fare: number;
  origin: string;
  destination: string;
  flightNumber: number;
  departureDate: string;
  departureTime: string;
  cabinNumber: number;
}


export interface InverseFareDetails {
  percentOfTop: number;
  inverseDistribute: number;
  remaining?: number;
  protections?: number;
  inverseFare?: number;
}


export interface AnalyticsQueryRequest {
  resourceNames: string[];
}

export interface AnalyticsQueryResponse {
  resourceNames: string[];
  recordLimit?: number;
}



