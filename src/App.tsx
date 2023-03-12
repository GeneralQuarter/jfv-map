import { AppBar, styled, ThemeProvider, Toolbar } from '@suid/material';
import { Fab } from '@suid/material';
import { Component, createSignal, Suspense, createMemo } from 'solid-js';
import AppSearch, { SearchEntry, SearchEntryGroup } from '@/components/AppSearch';
import EditorMap from '@/components/EditorMap';
import Filters from '@/components/Filters';
import Plants from '@/components/Plants';
import StaticMapFeatures from '@/components/StaticMapFeatures';
import { getPlantsWithPosition } from '@/lib/api/get-plants-with-position';
import { createCachedResource } from '@/lib/create-cached-resource';
import { PaginatedResult } from '@/models/paginated-result';
import { Plant } from '@/models/plant';
import createFilters from '@/lib/create-filters';
import theme from '@/theme';

const FixedFab = styled(Fab)({
  position: 'absolute',
  zIndex: 1060
});

const App: Component = () => {
  const [plants] = createCachedResource<PaginatedResult<Plant>>('plants', getPlantsWithPosition);
  const [showCanopy, setShowCanopy] = createSignal<boolean>(false);
  const [selectedPlantId, setSelectedPlantId] = createSignal<string | undefined>(undefined);
  const [filters, addFilter, removeFilter] = createFilters([]);

  const onEntryClick = (groupId: string, entry: SearchEntry) => {
    switch (groupId) {
      case 'sponsors':
        addFilter({id: entry.id, label: entry.id, type: 'sponsor'});
        break;
      case 'tags':
        addFilter({id: entry.id, label: entry.primaryText, type: 'tag'});
        break;
    }
  }

  const searchGroups = createMemo<SearchEntryGroup[]>(() => {
    const _plants = plants.loading ? [] : plants().items;
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
          }
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
      <EditorMap>
        <StaticMapFeatures />
        <Suspense>
          <Plants plants={plants()}
            showCanopy={showCanopy()}
            onPlantClick={(plantId: string) => setSelectedPlantId(plantId === selectedPlantId() ? undefined : plantId)}
            selectedPlantId={selectedPlantId()}
            filters={filters()}
          />
        </Suspense>
      </EditorMap>
      <FixedFab sx={{ right: '16px', top: '144px' }} onClick={() => setShowCanopy(!showCanopy())}>
        T
      </FixedFab>
    </ThemeProvider>
  );
};

export default App;
