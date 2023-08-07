export interface Rectangle {
  id: string;
  label: string;
  code: string;
  width: number;
  length: number;
  coords?: [lat: number, lon: number][];
}
