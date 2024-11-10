import { AppBar, Badge, CircularProgress, IconButton, Stack, styled, ThemeProvider, Toolbar, Typography } from '@suid/material';
import { Fab } from '@suid/material';
import { Component, createSignal, createMemo, createEffect, on } from 'solid-js';
import AppSearch from '@/components/AppSearch';
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
import { ModeStandby, Navigation, NoteAlt, Park, SquareFoot, Shower, Close, Send, HeartBroken } from '@suid/icons-material';
import { Hedge } from './models/hedge';
import Hedges from './components/Hedges';
import ReloadPrompt from './components/ReloadPrompt';
import type { Viewport } from 'solid-map-gl';
import create3DMapTransition from './lib/create-3d-map-transition';
import createSearchGroups from './lib/create-search-groups';
import type { SearchEntry } from './models/search-entry';
import createMeasureGraph from './lib/create-measure-graph';
import { MeasureNode } from './models/measure-graph';
import Measures from './components/Measures';
import { getRectangles } from './lib/api/get-rectangles';
import { Rectangle } from './models/rectangle';
import Rectangles from './components/Rectangles';
import { useMap } from './lib/use-map';
import { createStore, produce } from 'solid-js/store';
import WaterSubmit from './components/WaterSubmit';
import DeadPlantSubmit from './components/DeadPlantSubmit';

const FixedFab = styled(Fab)({
  position: 'absolute',
  zIndex: 1060
});

const App: Component = () => {
  const map = useMap();
  const [viewport, setViewport] = createSignal<Viewport>({ center: [0.88279, 46.37926], zoom: 17 });
  const [plants, setPlants] = createCachedApiCall<Plant[]>('plants', getPlantsWithPosition, []);
  const [tags] = createCachedApiCall<Tags>('tags', getTags, {});
  const [hedges, setHedges] = createCachedApiCall<Hedge[]>('hedges', getHedges, []);
  const [rectangles] = createCachedApiCall<Rectangle[]>('rectangles', getRectangles, []);
  const [graph, addMeasure, removeMeasure] = createMeasureGraph();
  const [measureNodeStart, setMeasureNodeStart] = createSignal<MeasureNode | undefined>(undefined);
  const [showCanopy, setShowCanopy] = createSignal<boolean>(false);
  const [show3D, setShow3D] = createSignal<boolean>(false);
  const [tapeActive, setTapeActive] = createSignal<boolean>(false);
  const [selectedPlantId, setSelectedPlantId] = createSignal<string | undefined>(undefined);
  const [filters, addFilter, removeFilter] = createFilters([]);
  const [waterModeActive, setWaterModeActive] = createSignal<boolean>(false);
  const [waterSelectedIds, setWaterSelectedIds] = createStore<string[]>([]);
  const [submitWater, setSubmitWater] = createSignal<boolean>(false);
  const [submitDeadPlant, setSubmitDeadPlant] = createSignal<boolean>(false);
  const searchGroups = createSearchGroups(plants, tags);

  create3DMapTransition(show3D, viewport, map);

  const flyTo = (coords: [lat: number, lon: number], zoom: number = 21) => {
    map()?.flyTo({
      center: [coords[1], coords[0]],
      zoom,
    });
  }

  const resetBearing = () => {
    map()?.flyTo({
      bearing: 0
    });
  }

  const onEntryClick = (groupId: string, entry: SearchEntry) => {
    switch (groupId) {
      case 'sponsors':
        addFilter({ id: entry.id, label: entry.id, type: 'sponsor' });
        break;
      case 'tags':
        addFilter({ id: entry.id, label: entry.primaryText, type: 'tag' });
        break;
      case 'plants':
        setSelectedPlantId(entry.id);
        flyTo(selectedPlant()?.position);
        break;
    }
  }

  const addMeasureNode = (measureNode: MeasureNode) => {
    const _measureNode = measureNodeStart();

    if (!_measureNode) {
      setMeasureNodeStart(measureNode);
      return;
    }

    addMeasure(_measureNode, measureNode);
    setMeasureNodeStart(undefined);
  }

  const onPlantClicked = (plantId: string) => {
    if (waterModeActive()) {
      return;
    }

    if (tapeActive()) {
      const plant = plants.find(p => p.id === plantId);

      if (!plant) {
        return;
      }

      addMeasureNode({ id: plantId, position: plant.position });
      return;
    }

    setSelectedPlantId(plantId === selectedPlantId() ? undefined : plantId);
  }

  const selectedPlant = createMemo<Plant | undefined>(() => {
    if (!selectedPlantId()) {
      return undefined;
    }

    return plants.find(plant => plant.id === selectedPlantId());
  });

  const onTapeClicked = () => {
    setTapeActive(!tapeActive());
    setSelectedPlantId(undefined);
  }

  const onHedgeClicked = (hedgeId: string) => {
    if (waterModeActive()) {
      setWaterSelectedIds(produce<string[]>(p => {
        const index = p.indexOf(hedgeId);

        if (index === -1) {
          p.push(hedgeId);
        } else {
          p.splice(index, 1);
        }
      }));
    }
  }

  const drawerPlaceholderText = () => {
    if (waterModeActive()) {
      return 'Sélectionnez les haires arrosées';
    }

    if (tapeActive()) {
      return 'Sélectionnez plusieurs arbres';
    } 
    
    return 'Sélectionnez un arbre';
  }

  const deadPlantClicked = (e: MouseEvent) => {
    e.stopPropagation();
    setSubmitDeadPlant(true);
  }

  const waterSendClicked = () => {
    if (submitWater()) {
      return;
    }

    setSubmitWater(true);
  }

  const waterSubmitted = (result: 'Success' | 'Cancelled') => {
    if (result === 'Success') {
      setHedges(produce<Hedge[]>(hs => {
        for (const h of hs) {
          if (!waterSelectedIds.includes(h.id)) {
            continue;
          }

          h.wateredAt = new Date().toISOString();
        }
      }))
      setWaterSelectedIds([]);
    }

    setSubmitWater(false);
  }

  const deadPlantSubmitted = (result: 'Success' | 'Cancelled') => {
    setSubmitDeadPlant(false);

    if (result === 'Success') {
      const deletedPlantId = selectedPlantId();
      setPlants(produce<Plant[]>(ps => {
        const idx = ps.findIndex(p => p.id == deletedPlantId);

        if (idx !== -1) {
          ps.splice(idx, 1);
        }
      }));
      setSelectedPlantId(undefined);
    }
  }

  createEffect(on(waterModeActive, (waterMode) => {
    if (!waterMode) {
      setWaterSelectedIds([]);
    }
  }));

  return (
    <ThemeProvider theme={theme}>
      <AppBar position='fixed' color={waterModeActive() ? 'secondary' : 'primary'}>
        {waterModeActive() ? 
        <>
          <Toolbar>
            <IconButton size='large' edge='start' color='inherit' aria-label='close' onClick={() => setWaterModeActive(false)}>
              <Close />
            </IconButton>
            <Typography sx={{ flexGrow: 1 }}>Arrossage</Typography>
            <IconButton size='large' edge='end' color='inherit' aria-label='send' onClick={waterSendClicked} disabled={submitWater()}>
              <Badge badgeContent={waterSelectedIds.length} color='primary'>
                <Send />
              </Badge>
              {submitWater() && <CircularProgress color='inherit' size={40} sx={{ position: 'absolute' }} />}
            </IconButton>
          </Toolbar>
        </>
       : <>
        <Toolbar>
          <AppSearch onEntryClick={onEntryClick} groups={searchGroups()} />
        </Toolbar>
        {filters().length > 0 && <Toolbar disableGutters={true}>
          <Filters filters={filters()} onFilterDelete={removeFilter} />
        </Toolbar>}
       </>
       }
      </AppBar>
      <EditorMap viewport={viewport()} setViewport={setViewport}>
        <StaticMapFeatures />
        <Hedges hedges={hedges ?? []} 
          onHedgeClick={onHedgeClicked} waterSelectedIds={waterSelectedIds} 
          waterModeActive={waterModeActive()}
        />
        <Rectangles rectangles={rectangles ?? []} />
        <Plants plants={plants ?? []}
          showCanopy={showCanopy()}
          show3D={show3D()}
          showLabels={!waterModeActive()}
          onPlantClick={onPlantClicked}
          selectedPlantId={selectedPlantId()}
          filters={filters()}
        />
        <Measures graph={graph()} onMeasureClick={(edge) => removeMeasure(edge)} />
      </EditorMap>
      <FixedFab sx={{ right: '16px', bottom: '72px' }} onClick={() => setShowCanopy(!showCanopy())} color={showCanopy() ? 'secondary' : 'primary'} size='small'>
        {showCanopy() ? <Park /> : <ModeStandby />}
      </FixedFab>
      <FixedFab sx={{ right: '16px', bottom: '128px' }} onClick={() => setShow3D(!show3D())} color={show3D() ? 'secondary' : 'primary'} size='small'>
        3D
      </FixedFab>
      <FixedFab sx={{ right: '16px', bottom: '184px' }} onClick={onTapeClicked} color={tapeActive() ? 'secondary' : 'primary'} size='small'>
        <SquareFoot />
      </FixedFab>
      <FixedFab sx={{ right: '16px', bottom: '240px' }} onClick={() => setWaterModeActive(!waterModeActive())} color={waterModeActive() ? 'secondary' : 'primary'} size='small'>
        <Shower />
      </FixedFab>
      <FixedFab sx={{ right: '16px', top: 72 + (filters().length > 0 ? 56 : 0) }} onClick={() => resetBearing()} size='small' color='primary'>
        <Navigation sx={{ transform: `rotate(${-viewport().bearing}deg)` }} />
      </FixedFab>
      <SelectionDrawer title={selectedPlant()?.code} placeholder={drawerPlaceholderText()} actions={selectedPlant() &&
        <>
          <IconButton sx={{ width: 56 }} color="error" onClick={deadPlantClicked} disabled={submitDeadPlant()}>
            <HeartBroken />
            {submitDeadPlant() && <CircularProgress color='inherit' size={40} sx={{ position: 'absolute' }} />}
          </IconButton>
        </>
      }>
        {selectedPlant() && <PlantDetails plant={selectedPlant()} tags={tags ?? {}} />}
      </SelectionDrawer>
      <ReloadPrompt />
      {submitWater() && <WaterSubmit waterSelectedIds={waterSelectedIds} onFinish={waterSubmitted}/>}
      {submitDeadPlant() && <DeadPlantSubmit plant={selectedPlant()} onFinish={deadPlantSubmitted}/>}
    </ThemeProvider>
  );
};

export default App;
