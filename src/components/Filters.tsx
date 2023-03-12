import { Stack, styled, Chip, SvgIcon } from '@suid/material';
import { Component, For } from 'solid-js';
import { Dynamic } from 'solid-js/web';
import { Face as FaceIcon, Tag as TagIcon } from '@suid/icons-material';
import { Filter } from '@/lib/create-filters';

const HorizontalScrollableWrap = styled(Stack)({
  // @ts-ignore
  overflowX: 'auto',
  // @ts-ignore
  scrollbarWidth: 0,
  '&::-webkit-scrollbar': {
    display: 'none',
  }
});

type Props = {
  filters: Filter[];
  onFilterDelete: (filterId: string) => void
}

const typeToIcon: { [key: string]: typeof SvgIcon } = {
  sponsor: FaceIcon,
  tag: TagIcon,
}

const Filters: Component<Props> = (props) => {
  return (
    <HorizontalScrollableWrap direction='row' spacing={1} paddingLeft={2} paddingRight={2}>
      <For each={props.filters}>{(filter) =>
        <Chip label={filter.label} 
          color='secondary'
          icon={<Dynamic component={typeToIcon[filter.type]} />} 
          onDelete={() => props.onFilterDelete(filter.id)} 
        />
      }</For>
    </HorizontalScrollableWrap>
  )
}

export default Filters;
