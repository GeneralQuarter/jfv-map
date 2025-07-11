import { Chip, Stack, Typography } from '@suid/material';
import { type Component, createMemo, For } from 'solid-js';
import type { Plant } from '@/models/plant';
import type { Tags } from '@/models/tags';

type Props = {
  plant: Plant | undefined;
  tags: Tags;
};

const PlantDetails: Component<Props> = (props) => {
  const plantedAt = createMemo(
    () =>
      props.plant?.plantedAt &&
      new Intl.DateTimeFormat('fr', {
        dateStyle: 'long',
        timeStyle: 'short',
      }).format(new Date(props.plant?.plantedAt)),
  );

  return (
    <Stack>
      {props.plant?.plantedAt && (
        <Typography variant="body2">
          Planté le{' '}
          <Typography variant="subtitle2" component="span">
            {plantedAt()}
          </Typography>
        </Typography>
      )}
      <Typography variant="h5">{props.plant?.fullLatinName}</Typography>
      <Typography variant="subtitle1">{props.plant?.commonName}</Typography>
      <Typography mt={1}>
        {props.plant?.height}&nbsp;m x {props.plant?.width}&nbsp;m
      </Typography>
      {props.plant?.sponsor && (
        <Typography variant="body2">
          Parrainé par{' '}
          <Typography color="secondary" component="span">
            {props.plant?.sponsor}
          </Typography>
        </Typography>
      )}
      <Stack flexDirection="row" gap={1} mt={2} flexWrap="wrap">
        <For each={props.plant?.tags ?? []}>
          {(tag) => <Chip label={props.tags[tag]} />}
        </For>
      </Stack>
    </Stack>
  );
};

export default PlantDetails;
