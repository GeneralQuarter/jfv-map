import { Component, createMemo, createSignal, For } from 'solid-js';
import { InputBase, styled, alpha, IconButton, Fade, Popover, List, ListSubheader, ListItem, ListItemButton, ListItemText, Typography } from '@suid/material';
import { Search as SearchIcon, Close as CloseIcon } from '@suid/icons-material';
import theme from '@/theme';
import { normalizeSearchTerm } from '@/lib/normalize-search-term';
import { createSignaledWorker } from '@solid-primitives/workers';
import { createScheduled, debounce } from '@solid-primitives/scheduled';
import type { SearchEntry, SearchEntryGroup } from '@/models/search-entry';
 
const Search = styled('div')(({ theme }) => ({
  position: 'relative',
  borderRadius: theme.shape.borderRadius,
  backgroundColor: alpha(theme.palette.common.white, 0.15),
  '&:hover': {
    backgroundColor: alpha(theme.palette.common.white, 0.25),
  },
  //marginRight: theme.spacing(2),
  marginLeft: 0,
  width: '100%',
}));

const SearchIconWrapper = styled('div')(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: '100%',
  position: 'absolute',
  pointerEvents: 'none',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}));

const CloseIconWrapper = styled('div')(({ theme }) => ({
  height: '100%',
  position: 'absolute',
  right: 0,
  top: 0,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: 'inherit',
  width: '100%',
  '& .MuiInputBase-input': {
    padding: theme.spacing(1, 1, 1, 0),
    // vertical padding + font size from searchIcon
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create('width'),
    width: '100%',
  },
}));

const PopoverFull = styled(Popover)(({ theme }) => ({
  top: 48,
}));

type Props = {
  groups: SearchEntryGroup[];
  onEntryClick: (groupId: string, entryId: SearchEntry) => void;
}

function search([normalizedTerm, groups]: [string, SearchEntryGroup[]]): SearchEntryGroup[] {
  if (normalizedTerm.length < 2) {
    return [];
  }

  return groups.map(group => ({
    ...group,
    entries: group.entries
      .filter(entry => entry.searchTerms.some(t => t.includes(normalizedTerm)))
      .sort((a, b) => a.primaryText.localeCompare(b.primaryText))
      .slice(0, 100),
  })).filter(group => group.entries.length > 0);
}

const AppSearch: Component<Props> = (props) => {
  const [textValue, setTextValue] = createSignal<string>('');
  const [anchorEl, setAnchorEl] = createSignal<HTMLDivElement | undefined>(undefined);
  const [filteredGroups, setFilteredGroups] = createSignal<SearchEntryGroup[]>([]);
  const scheduledSearch = createScheduled(fn => debounce(fn, 300));

  const workerInput = createMemo<[normalizedTerm: string, groups: SearchEntryGroup[]]>(() => {
    const normalizedTerm = normalizeSearchTerm(textValue() ?? '');
    return [normalizedTerm, props.groups];
  });

  const debouncedWorkerInput = createMemo<[normalizedTerm: string, groups: SearchEntryGroup[]]>((p) => {
    const value = workerInput();
    return scheduledSearch() ? value : p;
  }, ['', props.groups]);

  createSignaledWorker({
    input: debouncedWorkerInput,
    output: setFilteredGroups,
    func: search,
  });

  const showResults = () => textValue() !== '';

  return (
    <>
      <Search ref={(el) => setAnchorEl(el)}>
        <SearchIconWrapper>
          <SearchIcon />
        </SearchIconWrapper>
        <StyledInputBase
          placeholder='Recherche...'
          inputProps={{ 'aria-label': 'search' }}
          onChange={(evt) => {
            setTextValue(evt.target.value);
          }}
          value={textValue()}
        />
        <CloseIconWrapper>
          <Fade in={showResults()}>
            <IconButton aria-label='clear search' color='inherit' onClick={() => setTextValue('')}>
              <CloseIcon />
            </IconButton>
          </Fade>
        </CloseIconWrapper>
      </Search>
      <PopoverFull id="search-results"
        open={showResults()}
        anchorEl={anchorEl()}
        onBackdropClick={() => setTextValue('')}
        BackdropProps={{ sx: { top: 56 } }}
        PaperProps={{ sx: { width: '100%' } }}
      >
        <List
          sx={{
            width: '100%',
            bgcolor: 'background.paper',
            position: 'relative',
            overflow: 'auto',
            maxHeight: 300,
            '& ul': { padding: 0 },
          }}
          subheader={<li />}
        >
          <For each={filteredGroups()}>{(group) =>
            <li>
              <ul>
                <ListSubheader color='primary' sx={{ bgcolor: theme.palette.primary.main, color: theme.palette.primary.contrastText }}>{group.headerText}</ListSubheader>
                <For each={group.entries}>{(entry) =>
                  <ListItemButton onClick={() => {
                    props.onEntryClick(group.id, entry);
                    setTextValue('');
                  }}>
                    <ListItemText 
                      primary={entry.primaryText}
                      secondary={entry.secondaryText && <>
                        {entry.secondaryText}{entry.tertiaryText && <>
                          {' • '}
                          <Typography component='span' color='secondary' variant='body2'>{entry.tertiaryText}</Typography>
                        </>}
                      </>}
                    />
                  </ListItemButton>
                }</For>
              </ul>
            </li>
          }</For>
          {filteredGroups().length === 0 && <ListItem><ListItemText primary='Pas de résultat'/></ListItem>}
        </List>
      </PopoverFull>
    </>
  )
}

export default AppSearch;
