import { createSignal, Accessor } from 'solid-js';
import { HUE_FRACTIONS } from './color-from-hue-index';

export type Filter = {
  id: string;
  type: string;
  label: string;
}

type CreateFilters = [
  filters: Accessor<Filter[]>,
  addFilter: (filter: Filter) => void,
  removeFilter: (filterId: string) => void,
]

export default function createFilters(initialFilters: Filter[] = []): CreateFilters {
  const [filters, setFilters] = createSignal<Filter[]>(initialFilters);
  
  const addFilter = (filter: Filter) => {
    const exists = filters().some(f => f.id === filter.id);

    if (exists) {
      return;
    }

    setFilters([...filters(), filter]);
  };

  const removeFilter = (filterId: string) => {
    const filterIndex = filters().findIndex(f => f.id === filterId);

    if (filterIndex === -1) {
      return;
    }

    const newFilters = [...filters()];
    newFilters.splice(filterIndex, 1);
    setFilters(newFilters);
  };

  return [filters, addFilter, removeFilter];
}
