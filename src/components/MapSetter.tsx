import { Map } from 'maplibre-gl';
import { Component, onMount } from 'solid-js';
import { useMap } from 'solid-map-gl';

type Props = {
  setMap: (map: Map) => void;
}

const MapSetter: Component<Props> = (props) => {
  const [map] = useMap();

  onMount(() => {
    props.setMap(map);
  });

  return (<></>);
}

export default MapSetter;
