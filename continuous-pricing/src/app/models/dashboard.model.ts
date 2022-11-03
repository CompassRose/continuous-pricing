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
  min?: number;
  max?: number;
  mult?: number;
  addSub?: number;
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
  frequency?: number;
  multiplier: number;
  fare: number;
  modifiedFare?: number;
  bookings: number;
  protections: number;
  Aus?: number;
  Sa?: number;
  active: boolean;
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
