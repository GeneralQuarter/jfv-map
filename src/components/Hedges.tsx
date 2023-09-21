import { Hedge } from '@/models/hedge';
import { Component, createMemo } from 'solid-js';
import { Layer, Source } from 'solid-map-gl';
import type { FeatureCollection } from 'geojson';
import buffer from '@turf/buffer';
import { MapLayerMouseEvent } from 'maplibre-gl';
import { differenceInCalendarDays } from 'date-fns';

type Props = {
  hedges: Hedge[];
  waterModeActive: boolean;
  waterSelectedIds: string[];
  onHedgeClick: (hedgeId: string) => void;
};

const colorFromWateredAt = (wateredAt?: string) => {
  if (!wateredAt) {
    return 'red';
  }

  const wateredAtDate = new Date(wateredAt);
  const difference = differenceInCalendarDays(new Date(), wateredAtDate);

  if (difference > 7) {
    return 'red';
  } else if (difference > 5) {
    return 'orange';
  }

  return 'green';
}

const hedgesToFeatureCollection = (hedges: Hedge[], waterModeActive: boolean): FeatureCollection => {
  return {
    type: 'FeatureCollection',
    features: hedges.map(hedge => ({
      ...buffer({
        type: 'LineString',
        coordinates: hedge.coords.map(coords => [coords[1], coords[0]]),
      }, 0.8 / 1000),
      properties: {
        id: hedge.id,
        label: hedge.name,
        color: waterModeActive ? colorFromWateredAt(hedge.wateredAt) : 'brown',
      }
    })),
  }
}

const selectedHedgesToFeatureCollection = (hedges: Hedge[], waterSelectedIds: string[]): FeatureCollection => {
  return {
    type: 'FeatureCollection',
    features: hedges.filter(h => waterSelectedIds.includes(h.id)).map(hedge => ({
      ...buffer({
        type: 'LineString',
        coordinates: hedge.coords.map(coords => [coords[1], coords[0]]),
      }, 0.8 / 1000),
      properties: {},
    })),
  };
}

const Hedges: Component<Props> = (props) => {
  const hedgeFeatureCollection = createMemo(() => hedgesToFeatureCollection(props.hedges, props.waterModeActive));
  const selectedHedgesFeatureCollection = createMemo(() => selectedHedgesToFeatureCollection(props.hedges, props.waterSelectedIds));
  return <>
    <Source id='hedges' source={{ type: 'geojson', data: hedgeFeatureCollection() }}>
      <Layer style={{
        type: 'fill',
        paint: {
          'fill-color': ['get', 'color'],
          'fill-opacity': 0.3
        }
      }}
        onClick={(evt: MapLayerMouseEvent) => {
          const clickedHedgeFeature = evt.features?.[0];
          clickedHedgeFeature && props.onHedgeClick(clickedHedgeFeature.properties.id);
        }}
      />
      <Layer
        id='hedge-names'
        style={{
          type: 'symbol',
          layout: {
            'text-field': ['get', 'label'],
            'symbol-placement': 'line',
            'text-offset': [0, 1],
            'symbol-spacing': 180,
            'text-allow-overlap': true,
          },
          paint: {
            'text-color': 'brown',
            'text-opacity': ['step', ['zoom'], 0, 19, 1],
          }
        }}
      />
    </Source>
    <Source id='selected-hedges' source={{ type: 'geojson', data: selectedHedgesFeatureCollection() }}>
      <Layer style={{
        type: 'line',
        paint: {
          'line-width': 3,
          'line-color': 'green'
        }
      }} />
    </Source>
  </>;
}

export default Hedges;
