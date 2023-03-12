import { Component, createSignal, JSX } from 'solid-js';
import MapGL, { Viewport } from 'solid-map-gl';
import * as maplibre from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

const EditorMap: Component<{ children: JSX.Element }> = (props) => {
  const [viewport, setViewport] = createSignal({
    center: [0.88279, 46.37926],
    zoom: 17,
  } as Viewport);

  return (
    <MapGL
      mapLib={maplibre}
      options={{ style: { version: 8, glyphs: 'https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf', sources: {}, layers: [] } }}
      viewport={viewport()}
      onViewportChange={(evt: Viewport) => setViewport(evt)}
      debug={true}
    >
      {props.children}
    </MapGL>
  );
};

export default EditorMap;
