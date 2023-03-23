import { Hedge } from '@/models/hedge';
import { Component, createMemo } from 'solid-js';
import { Layer, Source } from 'solid-map-gl';
import type { FeatureCollection } from 'geojson';
import buffer from '@turf/buffer';

type Props = {
  hedges: Hedge[],
};

const hedgesToFeatureCollection = (hedges: Hedge[]): FeatureCollection => {
  return {
    type: 'FeatureCollection',
    features: hedges.map(hedge => buffer({
      type: 'LineString',
      coordinates: hedge.coords.map(coords => [coords[1], coords[0]]),
    }, 1.2 / 1000))
  }
}

const Hedges: Component<Props> = (props) => {
  const hedgeFeatureCollection = createMemo(() => hedgesToFeatureCollection(props.hedges));
  return (<Source source={{ type: 'geojson', data: hedgeFeatureCollection() }}>
    <Layer style={{
      type: 'fill',
      paint: {
        'fill-color': 'brown',
        'fill-opacity': 0.3
      }
    }}
    />
  </Source>);
}

export default Hedges;
