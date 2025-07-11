import type { FeatureCollection } from 'geojson';
import { type Component, createMemo } from 'solid-js';
import { Layer, Source } from 'solid-map-gl';
import type { Rectangle } from '@/models/rectangle';

type Props = {
  rectangles: Rectangle[];
};

const rectanglesToFeatureCollection = (
  rectangles: Rectangle[],
): FeatureCollection => {
  return {
    type: 'FeatureCollection',
    features: rectangles.map((rectangle) => ({
      type: 'Feature',
      geometry: {
        type: 'Polygon',
        coordinates: [rectangle.coords.map((coords) => [coords[1], coords[0]])],
      },
      properties: {},
    })),
  };
};

const Rectangles: Component<Props> = (props) => {
  const rectangleFeatureCollection = createMemo(() =>
    rectanglesToFeatureCollection(props.rectangles),
  );
  return (
    <Source source={{ type: 'geojson', data: rectangleFeatureCollection() }}>
      <Layer
        style={{
          type: 'fill',
          paint: {
            'fill-color': 'orange',
            'fill-opacity': 0.3,
          },
        }}
      />
    </Source>
  );
};

export default Rectangles;
