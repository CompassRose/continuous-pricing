

export interface FlightClientDetails {
  masterKey?: number;
  prevYearMasterKey?: number | undefined;
  airlineCode?: string | undefined;
  origin?: string | undefined;
  destination?: string | undefined;
  equipment?: string | undefined;
  flightNumber?: number;
  departureDateTime?: Date;
  arrivalDateTime?: Date;
  lid?: number;
  capacity?: number;
  cabinDetails?: CabinDetails[] | undefined;
  bookings?: number[] | undefined;
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
  originalBezierPoints?: BezierPoints[];
  showDecimals?: boolean;
  value: any;
  updValue?: any;
  originalValue?: any;
  maxSeats?: number;
}

export interface BidPriceConstraint {
  categories?: any[];
  name?: string;
  constraint: string;
  originalBezierPoints?: BezierPoints[];
  showDecimals?: boolean;
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
}

export interface xAxisTextValue {
  value?: string | undefined;
  textStyle?: textColor | undefined;
}

export interface textColor {
  color?: string | undefined;
}

export interface InverseFareDetails {
  percentOfTop: number;
  inverseDistribute: number;
  remaining?: number;
  protections?: number;
  inverseFare?: number;
}

export interface ODLocate {
  continent: string;
  coordinates: number[];
  elevation_ft: string;
  iata_code: string;
  iso_country: string;
  iso_region: string;
  longitude_deg: string;
  municipality: string;
  name: string;
}

export interface AnalyticsQueryRequest {
  resourceNames: string[];
}

export interface AnalyticsQueryResponse {
  resourceNames: string[];
  recordLimit?: number;
}

export interface LineChartObject {
  key: string;
  max: number;
  value: any[];
}
export interface ColumnValues {
  Column: any[];
  ContinuousFlightScore: any[];
  DaysCounter: any[];
  FreeFormText: any[];
  MarketGroup: any[];
  OrdinalFlightScore: any[];
  SeatInventory: any[];
}

export interface TableValues {
  airRmDomain: string;
  dataSourceType: string;
  grain: string;
  name: string;
}


export interface InventoryValues {
  cabinConfigs: cabinConfigs[];
}

export interface cabinConfigs {
  buckets: any[];
  cabinLetter: any;
  cabinPosition: number;
}

export interface QueryMap {
  airRmDomain: string;
  autoGenerateIdentityColumns: boolean;
  columns: QueryMapColumn[];
  dataSourceType: string;
  grain: string;
  idScheme: string;
  identityColumns: string[];
  models: any[];
  name: string;
  run: any;
  tableScheme: string;
}

export interface QueryMapColumn {
  columnType: string;
  container?: string;
  isNullable: boolean;
  modelIndex?: number;
  name: string;
  ordinal?: string;
  ordinalType?: string;
  resourceName?: string;
}
export interface HistoryData {
  DaysLeft: string;
  DepartureDate: string;
  Cap: string;
  CapPY: string;
  Bk: string;
  AuSends?: string;
  LAF: string;
  LAFPY: string;
  Overview: string;
  Rv: string;
  RvPY: string;
  Worksheet?: string;
  IC?: string;
  Other?: string;
  BusRules: string;
}
