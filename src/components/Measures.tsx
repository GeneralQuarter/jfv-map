import { MeasureGraph } from '@/models/measure-graph';
import { Component, createMemo, onCleanup } from 'solid-js';
import type { FeatureCollection, Feature, LineString } from 'geojson';
import { Layer, Source, useMap } from 'solid-map-gl';
import length from '@turf/length';
import { MapLayerMouseEvent } from 'maplibre-gl';

type Props = {
  graph: MeasureGraph;
  onMeasureClick: (edge: [string, string]) => void;
};

const measureLayerId = 'measure-labels';

const measureGraphToFeatureCollection = (graph: MeasureGraph): FeatureCollection => ({
  type: 'FeatureCollection',
  features: graph.edges.map(([aId, bId]) => {
    const [latA, lonA] = graph.nodes[aId].position;
    const [latB, lonB] = graph.nodes[bId].position;

    const feature = {
      type: 'Feature',
      geometry: {
        type: 'LineString',
        coordinates: [
          [lonA, latA],
          [lonB, latB]
        ],
      },
      properties: {
        aId,
        bId,
      }
    } as Feature<LineString>;

    feature.properties.label = `${(length(feature) * 1000).toFixed(2)} m`;
    return feature;
  })
});

const Measures: Component<Props> = (props) => {
  const measureFeatureCollection = createMemo(() => measureGraphToFeatureCollection(props.graph));
  const [map] = useMap();

  onCleanup(() => {
    const delegateListeners = map()?._delegatedListeners.click.filter(l => l.layer === measureLayerId);
    for (const delegateListener of delegateListeners) {
      map()?.off('click', measureLayerId, delegateListener.listener);
    }
  });

  return (<Source source={{ type: 'geojson', data: measureFeatureCollection() }}>
    <Layer 
      style={{
        type: 'line',
        paint: {
          'line-color': 'purple',
          'line-width': 2,
          'line-dasharray': [2, 1]
        }
      }}
      beforeId='plant-codes'
    />
    <Layer 
      id={measureLayerId}
      style={{
        type: 'symbol',
        layout: {
          'text-field': ['get', 'label'],
          'symbol-placement': 'line-center',
          'text-offset': [0, -0.8],
        },
        paint: {
          'text-color': 'purple',
          'text-halo-color': '#fffbec',
          'text-halo-width': 2,
        }
      }}
      onClick={(evt: MapLayerMouseEvent) => {
        const clickedMeasureFeature = evt.features?.[0];
        console.log(clickedMeasureFeature);
        clickedMeasureFeature && props.onMeasureClick([clickedMeasureFeature.properties.aId, clickedMeasureFeature.properties.bId]);
      }}
    />
  </Source>);
}

export default Measures;
