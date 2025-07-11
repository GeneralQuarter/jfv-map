import circle from '@turf/circle';
import type { FeatureCollection } from 'geojson';
import type { MapLayerMouseEvent } from 'maplibre-gl';
import { type Component, createMemo, onCleanup, onMount } from 'solid-js';
import { Layer, Source } from 'solid-map-gl';
import type { Filter } from '@/lib/create-filters';
import { useMap } from '@/lib/use-map';
import type { Plant } from '@/models/plant';
import theme from '@/theme';

const plantTagged = (plant: Plant, filters: Filter[]): boolean => {
  return (
    (plant.sponsor &&
      filters.some((f) => f.type === 'tag' && f.id === 'sponsored')) ||
    filters
      .filter((f) => f.type === 'sponsor')
      .some((f) => plant.sponsor === f.id) ||
    filters
      .filter((f) => f.type === 'tag')
      .some((f) => plant.tags.includes(f.id))
  );
};

const plantsToFeatureCollection = (
  plants: Plant[],
  showCanopy: boolean,
  selectedPlantId: string,
  filters: Filter[],
): FeatureCollection => {
  return {
    type: 'FeatureCollection',
    features: plants.map((plant) =>
      circle(
        [plant.position[1], plant.position[0]],
        (showCanopy || plant.width < 2 ? plant.width : 2) / 2000,
        {
          properties: {
            id: plant.id,
            code: plant.code,
            selected: selectedPlantId === plant.id,
            tagged: plantTagged(plant, filters),
            height: plant.height,
          },
        },
      ),
    ),
  };
};

type Props = {
  plants: Plant[];
  showCanopy: boolean;
  show3D: boolean;
  showLabels: boolean;
  onPlantClick: (plantId: string) => void;
  selectedPlantId: string;
  filters: Filter[];
};

const layerId = 'plants';

const Plants: Component<Props> = (props) => {
  const plantFeatureCollection = createMemo(() =>
    plantsToFeatureCollection(
      props.plants,
      props.showCanopy,
      props.selectedPlantId,
      props.filters,
    ),
  );
  const map = useMap();

  onMount(() => {
    map().setLayoutProperty('3d-plants', 'visibility', 'none');
  });

  onCleanup(() => {
    const delegateListeners = map()?._delegatedListeners.click.filter((l) =>
      l.layers.includes(layerId),
    );
    for (const delegateListener of delegateListeners) {
      map()?.off('click', layerId, delegateListener.listener);
    }
  });

  return (
    <Source source={{ type: 'geojson', data: plantFeatureCollection() }}>
      <Layer
        id={layerId}
        style={{
          type: 'fill',
          paint: {
            'fill-color': [
              'case',
              ['boolean', ['get', 'selected'], false],
              'blue',
              ['boolean', ['get', 'tagged'], false],
              theme.palette.secondary.main,
              'transparent',
            ],
            'fill-opacity': 0.5,
          },
        }}
        onClick={(evt: MapLayerMouseEvent) => {
          const clickedPlantFeature = evt.features?.[0];
          clickedPlantFeature &&
            props.onPlantClick(clickedPlantFeature.properties.id);
        }}
      />
      <Layer
        style={{
          type: 'line',
          paint: {
            'line-color': 'gray',
          },
        }}
      />
      <Layer
        id="3d-plants"
        style={{
          type: 'fill-extrusion',
          paint: {
            'fill-extrusion-height': ['get', 'height'],
            'fill-extrusion-color': 'gray',
            'fill-extrusion-opacity': 1,
          },
        }}
        visible={props.show3D}
      />
      <Layer
        id="plant-codes"
        style={{
          type: 'symbol',
          layout: {
            'text-field': ['get', 'code'],
          },
          paint: {
            'text-halo-color': '#fffbec',
            'text-halo-width': 2,
            'text-opacity': ['step', ['zoom'], 0, 19, 1], // under 19 -> hidden, above 19 -> shown
          },
        }}
        visible={!props.show3D && props.showLabels}
      />
    </Source>
  );
};

export default Plants;
