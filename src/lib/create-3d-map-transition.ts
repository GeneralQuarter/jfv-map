import type { Map } from 'maplibre-gl';
import { Accessor, createEffect, on } from 'solid-js';
import type { Viewport } from 'solid-map-gl';

export default function create3DMapTransition(show3D: Accessor<boolean>, viewport: Accessor<Viewport>, map: Accessor<Map | undefined>) {
  createEffect(on(show3D, () => {
    const _show3D = show3D();
    const _viewport = viewport();

    // Entering 3D with no pitch -> add pitch + small rotation
    if (_show3D && _viewport.pitch === 0) {
      const bearing = _viewport.bearing === 0 ? -30 : _viewport.bearing;
      map()?.flyTo({
        pitch: 30,
        bearing
      });
    }

    // Existing 3D with pitch -> remove pitch and reset to north bearing
    if (!_show3D && _viewport.pitch !== 0) {
      map()?.flyTo({
        pitch: 0,
        bearing: 0
      });
    }
  }));
}
