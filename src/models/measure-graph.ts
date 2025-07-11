export type MeasureNode = {
  id: string;
  position: [lat: number, lon: number];
};

export type MeasureGraph = {
  nodes: { [id: string]: MeasureNode };
  edges: [aId: string, bId: string][];
};
