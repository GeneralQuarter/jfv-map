import type { Component } from 'solid-js';
import { Layer, Source } from 'solid-map-gl';
import staticMapFeatureCollection from '@/data/static-map-feature-collection';

const StaticMapFeatures: Component = () => {
  return (
    <Source source={{ type: 'geojson', data: staticMapFeatureCollection }}>
      <Layer
        style={{
          type: 'fill',
          paint: {
            'fill-color': 'blue',
            'fill-opacity': 0.2,
          },
          filter: ['==', 'id', 'gartempe'],
        }}
      />
      <Layer
        style={{
          type: 'line',
          paint: {
            'line-color': 'gray',
          },
          filter: ['==', 'id', 'terrain'],
        }}
      />
      <Layer
        style={{
          type: 'line',
          paint: {
            'line-color': 'gray',
          },
          filter: ['==', 'id', 'fences'],
        }}
      />
      <Layer
        style={{
          type: 'line',
          paint: {
            'line-color': 'gray',
            'line-dasharray': [2, 2],
          },
          filter: ['==', 'id', 'doors'],
        }}
      />
      <Layer
        style={{
          type: 'fill',
          paint: {
            'fill-color': 'blue',
            'fill-opacity': 0.2,
          },
          filter: ['==', 'id', 'happyLake'],
        }}
      />
      <Layer
        style={{
          type: 'fill',
          paint: {
            'fill-color': 'black',
            'fill-outline-color': 'transparent',
            'fill-opacity': 0.5,
          },
          filter: ['==', 'id', 'd116'],
        }}
      />
      <Layer
        style={{
          type: 'fill',
          paint: {
            'fill-color': 'black',
            'fill-outline-color': 'transparent',
            'fill-opacity': 0.5,
          },
          filter: ['==', 'id', 'path'],
        }}
      />
      <Layer
        style={{
          type: 'fill',
          paint: {
            'fill-color': 'blue',
            'fill-opacity': 0.2,
          },
          filter: ['==', 'id', 'ponds'],
        }}
      />
    </Source>
  );
};

export default StaticMapFeatures;
