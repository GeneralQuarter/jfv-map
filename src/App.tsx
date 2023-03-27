import { AppBar, IconButton, styled, ThemeProvider, Toolbar } from '@suid/material';
import { Fab } from '@suid/material';
import { Component, createSignal, createMemo } from 'solid-js';
import AppSearch, { SearchEntry, SearchEntryGroup } from '@/components/AppSearch';
import EditorMap from '@/components/EditorMap';
import Filters from '@/components/Filters';
import Plants from '@/components/Plants';
import StaticMapFeatures from '@/components/StaticMapFeatures';
import { getPlantsWithPosition } from '@/lib/api/get-plants-with-position';
import { getHedges } from '@/lib/api/get-hedges';
import { createCachedApiCall } from '@/lib/create-cached-api-call';
import { Plant } from '@/models/plant';
import createFilters from '@/lib/create-filters';
import theme from '@/theme';
import { Tags } from '@/models/tags';
import getTags from '@/lib/api/get-tags';
import SelectionDrawer from './components/SelectionDrawer';
import PlantDetails from './components/PlantDetails';
import { Map } from 'maplibre-gl';
import { ModeStandby, Navigation, NoteAlt, Park } from '@suid/icons-material';
import { Hedge } from './models/hedge';
import Hedges from './components/Hedges';
import createNotes from './lib/create-notes';
import { Note } from './models/note';
import NoteDialog from './components/NoteDialog';
import ReloadPrompt from './components/ReloadPrompt';
import { normalizeSearchTerms } from './lib/normalize-search-term';
import type { Viewport } from 'solid-map-gl';
import create3DMapTransition from './lib/create-3d-map-transition';

const FixedFab = styled(Fab)({
  position: 'absolute',
  zIndex: 1060
});

const App: Component = () => {
  const [map, setMap] = createSignal<Map | undefined>(undefined);
  const [viewport, setViewport] = createSignal<Viewport>({ center: [0.88279, 46.37926], zoom: 17 });
  const [plants] = createCachedApiCall<Plant[]>('plants', getPlantsWithPosition);
  const [tags] = createCachedApiCall<Tags>('tags', getTags);
  const [hedges] = createCachedApiCall<Hedge[]>('hedges', getHedges);
  const [notes, noteTags, upsertNote, clearNote] = createNotes();
  const [showCanopy, setShowCanopy] = createSignal<boolean>(false);
  const [show3D, setShow3D] = createSignal<boolean>(false);
  const [selectedPlantId, setSelectedPlantId] = createSignal<string | undefined>(undefined);
  const [filters, addFilter, removeFilter] = createFilters([]);
  const [noteDialogOpen, setNoteDialogOpen] = createSignal<boolean>(false);

  create3DMapTransition(show3D, viewport, map);

  const flyTo = (coords: [lat: number, lon: number], zoom: number = 21) => {
    map()?.flyTo({
      center: [coords[1], coords[0]],
      zoom,
    });
  }

  const resetViewport = () => {
    map()?.flyTo({
      bearing: 0
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
    const _plants = plants() ?? [];
    const _tags = tags() ?? {};
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
        searchTerms: normalizeSearchTerms([plant.code, plant.fullLatinName, plant.commonName].concat(plant.sponsor ? [plant.sponsor] : []))
      });
    });
    const sponsorEntries: SearchEntry[] = [...sponsors].map(sponsor => ({
      id: sponsor,
      primaryText: sponsor,
      searchTerms: normalizeSearchTerms([sponsor])
    }));

    return [
      {
        id: 'tags',
        headerText: 'Tags',
        entries: [
          {
            id: 'sponsored',
            primaryText: 'Parrainé',
            searchTerms: ['parraine']
          },
          {
            id: 'hasNote',
            primaryText: 'Noté',
            searchTerms: ['note']
          },
          ...Object.entries(_tags).map<SearchEntry>(([tagId, label]) => ({
            id: tagId,
            primaryText: label,
            searchTerms: normalizeSearchTerms([label])
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

  const selectedPlant = createMemo<Plant | undefined>(() => {
    if (!selectedPlantId() || !plants()) {
      return undefined;
    }

    return plants().find(plant => plant.id === selectedPlantId());
  });

  const note = createMemo<Note | undefined>(() => {
    const _selectedPlantId = selectedPlantId();

    if (!_selectedPlantId) {
      return undefined;
    }

    return notes().find(n => n.objectId === _selectedPlantId) ?? {objectId: _selectedPlantId, tags: [], content: ''};
  });

  const openNoteDialog = (e: MouseEvent) => {
    e.stopPropagation();
    setNoteDialogOpen(true);
  }

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
      <EditorMap setMap={setMap} viewport={viewport()} setViewport={setViewport}>
        <StaticMapFeatures />
        <Hedges hedges={hedges() ?? []} />
        <Plants plants={plants() ?? []}
          showCanopy={showCanopy()}
          show3D={show3D()}
          onPlantClick={(plantId: string) => setSelectedPlantId(plantId === selectedPlantId() ? undefined : plantId)}
          selectedPlantId={selectedPlantId()}
          filters={filters()}
          notes={notes()}
        />
      </EditorMap>
      <FixedFab sx={{ right: '16px', bottom: '72px' }} onClick={() => setShowCanopy(!showCanopy())} color={showCanopy() ? 'secondary' : 'primary'}>
        {showCanopy() ? <Park /> : <ModeStandby />}
      </FixedFab>
      <FixedFab sx={{ right: '16px', bottom: '144px' }} onClick={() => setShow3D(!show3D())} color={show3D() ? 'secondary' : 'primary'}>
        3D
      </FixedFab>
      <FixedFab sx={{ right: '24px', top: 72 + (filters().length > 0 ? 56 : 0) }} onClick={() => resetViewport()} size='small' color='primary'>
        <Navigation sx={{ transform: `rotate(${-viewport().bearing}deg)`}} />
      </FixedFab>
      <SelectionDrawer title={selectedPlant()?.code} placeholder='Sélectionnez une plante' actions={selectedPlant() && 
        <>
          <IconButton onClick={openNoteDialog} sx={{ width: 56 }}>
            <NoteAlt />
          </IconButton>
        </>
      }>
        {selectedPlant() && <PlantDetails plant={selectedPlant()} tags={tags() ?? {}} />}
      </SelectionDrawer>
      <NoteDialog title={selectedPlant()?.code} open={noteDialogOpen()} setOpen={setNoteDialogOpen} note={note()} existingTags={noteTags()} onNoteUpdate={upsertNote} onNoteClear={clearNote} />
      <ReloadPrompt />
    </ThemeProvider>
  );
};

export default App;
