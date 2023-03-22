import { Component, createSignal, JSX } from 'solid-js';
import MapGL, { Viewport } from 'solid-map-gl';
import * as maplibre from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import MapSetter from './MapSetter';

type Props = {
  children: JSX.Element,
  setMap: (map: maplibre.Map) => void;
}

const EditorMap: Component<Props> = (props) => {
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
      <MapSetter setMap={props.setMap}/>
      {props.children}
    </MapGL>
  );
};

export default EditorMap;
