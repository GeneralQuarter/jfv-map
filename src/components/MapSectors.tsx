import { differenceInCalendarDays } from 'date-fns';
import type { FeatureCollection } from 'geojson';
import type { MapLayerMouseEvent } from 'maplibre-gl';
import { type Component, createMemo } from 'solid-js';
import { Layer, Source } from 'solid-map-gl';
import type { MapSector } from '@/models/map-sector';

type Props = {
  mapSectors: MapSector[];
  waterSelectedIds: string[];
  onMapSectorClick: (mapSectorId: string) => void;
};

const colorFromWateredAt = (wateredAt?: string) => {
  if (!wateredAt) {
    return 'red';
  }

  const wateredAtDate = new Date(wateredAt);
  const difference = differenceInCalendarDays(new Date(), wateredAtDate);

  if (difference > 16) {
    return 'red';
  } else if (difference > 8) {
    return 'orange';
  }

  return 'green';
};

const mapSectorsToFeatureCollection = (
  mapSectors: MapSector[],
): FeatureCollection => {
  return {
    type: 'FeatureCollection',
    features: mapSectors.map((mapSector) => {
      const feature = { ...mapSector.geojson };
      feature.properties = {
        id: mapSector.id,
        color: colorFromWateredAt(mapSector.wateredAt),
      };
      return feature;
    }),
  };
};

const selectedMapSectorsToFeatureCollection = (
  mapSectors: MapSector[],
  waterSelectedIds: string[],
): FeatureCollection => {
  return {
    type: 'FeatureCollection',
    features: mapSectors
      .filter((ms) => waterSelectedIds.includes(ms.id))
      .map((mapSector) => mapSector.geojson),
  };
};

const MapSectors: Component<Props> = (props) => {
  const mapSectorFeatureCollection = createMemo(() =>
    mapSectorsToFeatureCollection(props.mapSectors),
  );
  const selectedMapSectorFeatureCollection = createMemo(() =>
    selectedMapSectorsToFeatureCollection(
      props.mapSectors,
      props.waterSelectedIds,
    ),
  );

  return (
    <>
      <Source
        id="mapSectors"
        source={{ type: 'geojson', data: mapSectorFeatureCollection() }}
      >
        <Layer
          style={{
            type: 'fill',
            paint: {
              'fill-color': ['get', 'color'],
              'fill-opacity': 0.3,
            },
          }}
          onClick={(evt: MapLayerMouseEvent) => {
            const clickedMapSectorFeature = evt.features?.[0];
            clickedMapSectorFeature &&
              props.onMapSectorClick(clickedMapSectorFeature.properties.id);
          }}
        />
        <Layer
          style={{
            type: 'line',
            paint: {
              'line-dasharray': [4, 2],
              'line-color': ['get', 'color'],
              'line-opacity': 0.3,
            },
          }}
        />
      </Source>
      <Source
        id="selected-map-sectors"
        source={{ type: 'geojson', data: selectedMapSectorFeatureCollection() }}
      >
        <Layer
          style={{
            type: 'line',
            paint: {
              'line-width': 3,
              'line-color': 'green',
            },
          }}
        />
      </Source>
    </>
  );
};

export default MapSectors;
