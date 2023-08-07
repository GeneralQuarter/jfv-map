import { Component, JSX, Setter } from 'solid-js';
import MapGL, { Viewport } from 'solid-map-gl';
import * as maplibre from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

type Props = {
  children: JSX.Element,
  viewport: Viewport;
  setViewport: Setter<Viewport>;
}

const EditorMap: Component<Props> = (props) => {
  return (
    <MapGL
      mapLib={maplibre}
      options={{
        style: {
          version: 8, glyphs: 'https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf', sources: {}, layers: [{
            id: 'background',
            type: 'background',
            paint: { 'background-color': '#fffbec' }
          }]
        }
      }}
      viewport={props.viewport}
      onViewportChange={(evt: Viewport) => props.setViewport(evt)}
      debug={true}
    >
      {props.children}
    </MapGL>
  );
};

export default EditorMap;
