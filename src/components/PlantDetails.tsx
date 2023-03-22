import { Plant } from '@/models/plant';
import { Tags } from '@/models/tags';
import { Chip, Stack, Typography } from '@suid/material';
import { Component, For } from 'solid-js';

type Props = {
  plant: Plant;
  tags: Tags;
}

const PlantDetails: Component<Props> = (props) => {
  return (<Stack>
    {props.plant.sponsor && <Typography variant="body2">Parrainé par <Typography color="secondary" component="span">{props.plant.sponsor}</Typography></Typography>}
    <Typography variant="h5">{props.plant.fullLatinName}</Typography>
    <Typography variant="subtitle1">{props.plant.commonName}</Typography>
    <Typography mt={1}>{props.plant.height}&nbsp;m x {props.plant.width}&nbsp;m</Typography>
    <Stack flexDirection="row" gap={1} mt={2} flexWrap="wrap">
      <For each={props.plant?.tags ?? []}>{(tag) => 
        <Chip label={props.tags[tag]} />
      }</For>
    </Stack>
  </Stack>);
}

export default PlantDetails;
