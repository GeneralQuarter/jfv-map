import { Component, createEffect, createSignal, JSX, Setter } from 'solid-js';
import MapGL, { Viewport } from 'solid-map-gl';
import * as maplibre from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import MapSetter from './MapSetter';

type Props = {
  children: JSX.Element,
  setMap: (map: maplibre.Map) => void;
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
      <MapSetter setMap={props.setMap} />
      {props.children}
    </MapGL>
  );
};

export default EditorMap;
