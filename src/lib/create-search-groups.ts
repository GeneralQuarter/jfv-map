import { Plant } from '@/models/plant';
import type { SearchEntry, SearchEntryGroup } from '@/models/search-entry';
import { Tags } from '@/models/tags';
import { Accessor, createMemo } from 'solid-js';
import { normalizeSearchTerms } from './normalize-search-term';

export default function createSearchGroups(plants: Plant[], tags: Tags): Accessor<SearchEntryGroup[]> {
  return createMemo(() => {
    const sponsors = new Set<string>();

    const plantEntries: SearchEntry[] = plants.map(plant => {
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
          ...Object.entries(tags).map<SearchEntry>(([tagId, label]) => ({
            id: tagId,
            primaryText: label,
            searchTerms: normalizeSearchTerms([label])
          })),
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
  }, []);
}
