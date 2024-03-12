/**
 * @file mapConfig.ts
 * @fileoverview contains the configuration for the pigeon maps component.
 */

export const MAP_TILER_KEY: string = 'c9MoaJaVglEims9riUks';
export function mapTiler(darkMode: boolean, x: number, y: number, z: number, dpr: number | undefined): string {
  let MAP_TILER_ID: string = darkMode ? 'streets-v2-dark' : 'streets';
  return `https://api.maptiler.com/maps/${MAP_TILER_ID}/256/${z}/${x}/${y}.png?key=${MAP_TILER_KEY}`
};


export const zoomControlButtonsStyleDark = {
  borderRadius: '2.5px',
  background: 'var(--ion-background-color)',
  color: 'white',
  cursor: 'pointer',
  outline: 'none',
  textIndent: '0px',
}; // +/- buttons that appear on map can be styled here (dark mode version)

export const zoomControlButtonsStyle = {
  borderRadius: '2.5px',
  background: 'var(--ion-background-color)',
  color: 'black',
  cursor: 'pointer',
  border: '0.5px solid var(--ion-color-warning)',
}; // +/- buttons that appear on map can be styled here

export type MapMarker = {
  location: number[];
  title: string;
  imgSrc: string[];
  description: string[];
  tags: string[];
  color: string;
  chip?: any[];
};