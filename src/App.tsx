import { AppBar, styled, ThemeProvider, Toolbar } from '@suid/material';
import { Fab } from '@suid/material';
import { Component, createSignal, Suspense, createMemo } from 'solid-js';
import AppSearch, { SearchEntry, SearchEntryGroup } from '@/components/AppSearch';
import EditorMap from '@/components/EditorMap';
import Filters from '@/components/Filters';
import Plants from '@/components/Plants';
import StaticMapFeatures from '@/components/StaticMapFeatures';
import { getPlantsWithPosition } from '@/lib/api/get-plants-with-position';
import { getHedges } from '@/lib/api/get-hedges';
import { createCachedResource } from '@/lib/create-cached-resource';
import { Plant } from '@/models/plant';
import createFilters from '@/lib/create-filters';
import theme from '@/theme';
import { Tags } from '@/models/tags';
import getTags from '@/lib/api/get-tags';
import SelectionDrawer from './components/SelectionDrawer';
import PlantDetails from './components/PlantDetails';
import { Map } from 'maplibre-gl';
import { ModeStandby, Park } from '@suid/icons-material';
import { Hedge } from './models/hedge';
import Hedges from './components/Hedges';

const FixedFab = styled(Fab)({
  position: 'absolute',
  zIndex: 1060
});

const App: Component = () => {
  const [map, setMap] = createSignal<Map | undefined>(undefined);
  const [plants] = createCachedResource<Plant[]>('plants', getPlantsWithPosition);
  const [tags] = createCachedResource<Tags>('tags', getTags);
  const [hedges] = createCachedResource<Hedge[]>('hedges', getHedges)
  const [showCanopy, setShowCanopy] = createSignal<boolean>(false);
  const [show3D, setShow3D] = createSignal<boolean>(false);
  const [selectedPlantId, setSelectedPlantId] = createSignal<string | undefined>(undefined);
  const [filters, addFilter, removeFilter] = createFilters([]);

  const flyTo = (coords: [lat: number, lon: number], zoom: number = 21) => {
    map()?.flyTo({
      center: [coords[1], coords[0]],
      zoom,
    });
  }

  const onEntryClick = (groupId: string, entry: SearchEntry) => {
    switch (groupId) {
      case 'sponsors':
        addFilter({id: entry.id, label: entry.id, type: 'sponsor'});
        break;
      case 'tags':
        addFilter({id: entry.id, label: entry.primaryText, type: 'tag'});
        break;
      case 'plants':
        setSelectedPlantId(entry.id);
        flyTo(selectedPlant()?.position);
        break;
    }
  }

  const searchGroups = createMemo<SearchEntryGroup[]>(() => {
    const _plants = plants.loading ? [] : plants();
    const _tags = tags.loading ? {} : tags();
    const sponsors = new Set<string>();
    const plantEntries: SearchEntry[] = _plants.map(plant => {
      if (plant.sponsor) {
        sponsors.add(plant.sponsor);
      }

      return ({
        id: plant.id,
        primaryText: plant.code,
        secondaryText: plant.commonName,
        tertiaryText: plant.sponsor,
        searchTerms: [plant.code, plant.fullLatinName, plant.commonName].concat(plant.sponsor ? [plant.sponsor] : [])
      });
    });
    const sponsorEntries: SearchEntry[] = [...sponsors].map(sponsor => ({
      id: sponsor,
      primaryText: sponsor,
      searchTerms: [sponsor]
    }));

    return [
      {
        id: 'tags',
        headerText: 'Tags',
        entries: [
          {
            id: 'sponsored',
            primaryText: 'Parrainé',
            searchTerms: ['Parrainé']
          },
          ...Object.entries(_tags).map<SearchEntry>(([tagId, label]) => ({
            id: tagId,
            primaryText: label,
            searchTerms: [label]
          }))
        ]
      },
      {
        id: 'sponsors',
        headerText: 'Parrains/Marraines',
        entries: sponsorEntries
      },
      {
        id: 'plants',
        headerText: 'Plantes',
        entries: plantEntries
      }
    ]
  });

  const selectedPlant = createMemo<Plant>(() => {
    if (!selectedPlantId() || plants.loading) {
      return undefined;
    }

    return plants().find(plant => plant.id === selectedPlantId());
  });

  return (
    <ThemeProvider theme={theme}>
      <AppBar position='fixed'>
        <Toolbar>
          <AppSearch onEntryClick={onEntryClick} groups={searchGroups()} />
        </Toolbar>
        {filters().length > 0 && <Toolbar disableGutters={true}>
            <Filters filters={filters()} onFilterDelete={removeFilter} />
          </Toolbar>}
      </AppBar>
      <EditorMap setMap={setMap}>
        <StaticMapFeatures />
        <Hedges hedges={hedges.loading ? [] : hedges()} />
        <Plants plants={plants.loading ? [] : plants()}
          showCanopy={showCanopy()}
          show3D={show3D()}
          onPlantClick={(plantId: string) => setSelectedPlantId(plantId === selectedPlantId() ? undefined : plantId)}
          selectedPlantId={selectedPlantId()}
          filters={filters()}
        />
      </EditorMap>
      <FixedFab sx={{ right: '16px', bottom: '72px' }} onClick={() => setShowCanopy(!showCanopy())} color={showCanopy() ? 'secondary' : 'primary'}>
        {showCanopy() ? <Park /> : <ModeStandby />}
      </FixedFab>
      <FixedFab sx={{ right: '16px', bottom: '144px' }} onClick={() => setShow3D(!show3D())} color={show3D() ? 'secondary' : 'primary'}>
        3D
      </FixedFab>
      <SelectionDrawer title={selectedPlant()?.code} placeholder='Sélectionnez une plante'>
        {selectedPlant() && <PlantDetails plant={selectedPlant()} tags={tags()} />}
      </SelectionDrawer>
    </ThemeProvider>
  );
};

export default App;
