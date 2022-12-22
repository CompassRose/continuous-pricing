export interface ColorObject {
    key: string;
    value: string[];
}

export enum ConstraintType {
    Multiply = "mult",
    AddSubtract = "addSub",
    Minimum = "min",
    Maximum = "max",
    PartialMin = "partialMin",
    PartialMax = "partialMax",
}

export enum ImagePath {
    devPathToAssets = '../../assets/images/',
    prodPathToAssets = ''
}



export const PathToAssets = ImagePath.devPathToAssets;

export const ContinousColors: ColorObject[] = [
    { key: 'Blue Green Red', value: ['rgb(255, 255, 241)', 'rgb(255, 255, 201)', 'rgb(255, 255, 170)', 'rgb(255, 255, 147)', 'rgb(255, 255, 132)', 'rgb(255, 221, 124)', 'rgb(255, 185, 122)', 'rgb(255, 149, 124)', 'rgb(255, 114, 127)', 'rgb(255, 80, 131)', 'rgb(240, 47, 135)', 'rgb(199, 0, 132)', 'rgb(154, 0, 127)', 'rgb(106, 0, 118)', 'rgb(51, 0, 107)', 'rgb(0, 0, 92)', 'rgb(0, 0, 75)', 'rgb(0, 0, 55)', 'rgb(0, 0, 35)', 'rgb(0, 0, 5)', 'rgb(0, 0, 0)'] },
    { key: 'Red Green Blue', value: ['#ff0000', '#ff9001', '#ffd302', '#94ff00', '#01ff44', '#00ff95', '#00ffdb', '#01dbff', '#0292ff', '#0000fd'] },
    { key: 'Red Yellow Green', value: ['#a50026', '#d73027', '#f46d43', '#fdae61', '#fee08b', '#d9ef8b', '#a6d96a', '#66bd63', '#1a9850', '#006837'] },
    { key: 'Purple Green', value: ['#40004b', '#762a83', '#9970ab', '#c2a5cf', '#e7d4e8', '#d9f0d3', '#a6dba0', '#5aae61', '#1b7837', '#00441b'] },
    { key: 'Red Yellow Blue', value: ['#a50026', '#d73027', '#f46d43', '#fdae61', '#fee090', '#e0f3f8', '#abd9e9', '#74add1', '#4575b4', '#313695'] },
    { key: 'Red Blue', value: ['#67001f', '#b2182b', '#d6604d', '#f4a582', '#fddbc7', '#d1e5f0', '#92c5de', '#4393c3', '#2166ac', '#053061'] },
    { key: 'Pink Yellow Green', value: ['#8e0152', '#c51b7d', '#de77ae', '#f1b6da', '#fde0ef', '#e6f5d0', '#b8e186', '#7fbc41', '#4d9221', '#276419'] },
    { key: 'Spectral', value: ['#9e0142', '#d53e4f', '#f46d43', '#fdae61', '#fee08b', '#e6f598', '#abdda4', '#66c2a5', '#3288bd', '#5e4fa2'] },
    { key: 'Purple Orange', value: ['#7f3b08', '#b35806', '#e08214', '#fdb863', '#fee0b6', '#d8daeb', '#b2abd2', '#8073ac', '#542788', '#2d004b'] }

];

export const testColors = ['rgb(255, 255, 241)', 'rgb(255, 255, 201)', 'rgb(255, 255, 170)', 'rgb(255, 255, 147)', 'rgb(255, 255, 132)', 'rgb(255, 221, 124)', 'rgb(255, 185, 122)', 'rgb(255, 149, 124)', 'rgb(255, 114, 127)', 'rgb(255, 80, 131)', 'rgb(240, 47, 135)', 'rgb(199, 0, 132)', 'rgb(154, 0, 127)', 'rgb(106, 0, 118)', 'rgb(51, 0, 107)', 'rgb(0, 0, 92)', 'rgb(0, 0, 75)', 'rgb(0, 0, 55)', 'rgb(0, 0, 35)', 'rgb(0, 0, 5)', 'rgb(0, 0, 0)']


export const blueRamp16 = ['#2058A7', '#2A5FAB', '#3467AF', '#3E6EB3', '#4876B8', '#527EBC', '#5C85C0', '#668DC4', '#7094C9', '#7A9CCD', '#84A4D1', '#8EABD5', '#98B3DA', '#A2BADE', '#ACC2E2', '#B6CAE7'];
export const redRamp10 = ['#cb1c1e', '#d2382a', '#d84c36', '#de5e43', '#e46e51', '#e97e5f', '#ef8d6e', '#f39c7e', '#f8aa8e', '#fcb99f'];

export const ThemeCollection = [
    'dark',
    'cool',
    'helianthus',
    'inspired',
    'bee-inspired',
    'dark-digerati',
    'dark-fresh-cut',
    'dark-bold',
    'dark-blue',
    'dark-mushroom',
    'roma',
    'royal',
    'tech-blue',
    'red-velvet',
    'red',
    'azul',
    'fresh-cut'
];




export const jsonContent2 = '{"resourceNames":["ODMasterKey", "FlightNumber", "DepartureDate", "Origin", "Destination","LegSnapshot:Au/FC1","LegSnapshot:Au/FC2", "LegInventory:CapacityLF","LegInventory:LidLF", "LegInventory:LidLF/Cabin3", "LegInventory:FlightBk", "LegInventory:CabinBk/Cabin3"], "recordLimit": 1500}';

export const nTile = "M 39.766 0 L 39.766 56.875 L 28.281 56.875 L 11.484 19.57 L 11.484 56.875 L 0 56.875 L 0 0 L 11.484 0 L 28.32 37.344 L 28.32 0 L 39.766 0 Z M 85.82 0 L 85.82 9.57 L 71.758 9.57 L 71.758 56.875 L 60.234 56.875 L 60.234 9.57 L 46.406 9.57 L 46.406 0 L 85.82 0 Z";

export const loadFactor = "M 67.617 24.141 L 67.617 33.672 L 49.766 33.672 L 49.766 56.875 L 38.281 56.875 L 38.281 0 L 69.766 0 L 69.766 9.57 L 49.766 9.57 L 49.766 24.141 L 67.617 24.141 Z M 11.484 0 L 11.484 47.344 L 31.641 47.344 L 31.641 56.875 L 0 56.875 L 0 0 L 11.484 0 Z";

export const activeState = 'path://m399.99012,328.48387l-35.10692,25.50428l13.41998,-41.25577l-35.09902,-25.50428l43.38573,0.0079l11.53107,-35.47443l1.88101,-5.76158l13.39627,41.2281l43.39759,0l-35.11482,25.50428l13.42393,41.26762l-35.11482,-25.51614l0,0z';

export const inactiveState = 'path://m307.5768,228.57689l-0.05491,0l-0.01695,-0.38172l-0.00238,0.05334l-0.01459,0.32845l-0.05489,-0.00007l0.04441,0.23614l-0.01698,0.38198l0.04442,-0.23614l0.04443,0.23625l-0.01698,-0.38209l0.04443,-0.23614zm-0.06599,0.32278l-0.00587,-0.03121l-0.00587,0.03125l-0.01951,0.10369l0.00745,-0.16772l0.00225,-0.05056l-0.00588,-0.03128l-0.0195,-0.10369l0.03137,0l0.00225,-0.05053l0.00744,-0.16772l0.00744,0.16761l0.00224,0.05053l0.0314,0l-0.01953,0.10376l-0.00589,0.03125l0.00224,0.05064l0.00746,0.16772l-0.01951,-0.10373z';

export const lockSymbol = 'path://m429.3797,291.91432l0,-15.27656l-0.00464,0c-0.00464,-18.85582 -13.15246,-34.13777 -29.37507,-34.13777s-29.37507,15.28734 -29.37507,34.14316l0,0l0,15.27117l-10.62493,0l0,65.5857l79.99999,0l0,-65.5857l-10.62029,0zm-49.47478,-15.27117c0,0 0,0 0,0c0,-12.88319 9.01565,-23.36224 20.09507,-23.36224c11.08869,0 20.10435,10.47905 20.10435,23.35685c0,0 0,0 0,0l0,15.27656l-40.19942,0l0,-15.27117z';

export const unlockSymbol = 'path://m420.68437,291.56275l-10.39631,0l0,-15.93513c0,0 0,0 0,-0.00562c0,-13.43771 9.15383,-24.37237 20.39728,-24.37237c11.25286,0 20.40198,10.93466 20.40198,24.37237c0,0 0,0 0,0l0,15.94075l9.41268,0l0,-15.94075l-0.00471,0c-0.00471,-19.67564 -13.34718,-35.62202 -29.80996,-35.62202s-29.80996,15.952 -29.80996,35.62764l0,15.93513l-61.37538,0l0,68.43725l81.18437,0l0,-68.43725z';

export const arrowUpPath = 'path://m335.99999,299.84654l64,-63.78502l64,63.78502l-32,0l0,64.09194l-64,0l0,-64.09194l-32,0z';