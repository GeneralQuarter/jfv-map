import { AppBar, Chip, Dialog, IconButton, InputBase, Slide, Stack, styled, TextField, Toolbar, Typography } from '@suid/material';
import { TransitionProps } from '@suid/material/transitions';
import { Component, createEffect, createMemo, createSignal, For, JSXElement } from 'solid-js';
import { Add, ArrowBack as ArrowBackIcon, Delete as DeleteIcon } from '@suid/icons-material';
import { Note } from '@/models/note';

const Transition = function Transition(
  props: TransitionProps & {
    children: JSXElement;
  }
) {
  return <Slide direction='up' {...props} />;
};

type Props = {
  open: boolean;
  setOpen: (open: boolean) => void;
  note: Note;
  existingTags: string[];
  onNoteUpdate: (note: Note) => void;
  onNoteClear: (objectId: string) => void;
  title: string;
};

const ChipForm = styled(Stack)({
  borderRadius: 16,
  border: '2px dashed #ccc'
});

const NoteDialog: Component<Props> = (props) => {
  const [tags, setTags] = createSignal<string[]>([]);
  const [content, setContent] = createSignal<string>('');
  const [newTag, setNewTag] = createSignal<string>('');

  createEffect(() => {
    if (!props.note) {
      return;
    }

    setTags(props.note.tags);
    setContent(props.note.content);
  })

  const close = () => {
    props.setOpen(false);

    const _tags = tags();
    const _content = content();

    if (props.note?.objectId) {
      if (_tags.length === 0 && !_content) {
        props.onNoteClear(props.note.objectId)
        return;
      }

      props.onNoteUpdate({
        objectId: props.note.objectId,
        tags: _tags,
        content: _content,
      });
    }
  }

  const clear = () => {
    setTags([]);
    setContent('');

    close();
  }

  const newAndExistingTags = createMemo<string[]>(() => [...new Set<string>(tags().concat(props.existingTags))].sort());

  const onSubmit = (e: SubmitEvent) => {
    e.preventDefault();
    setTags([...tags(), newTag()]);
    setNewTag('');
  }

  const removeTag = (tag: string) => {
    const _tags = tags();
    const index = _tags.indexOf(tag);

    if (index === -1) {
      return;
    }

    const newTags = [..._tags];
    newTags.splice(index, 1);
    setTags(newTags);
  }

  const toggleTag = (tag: string) => {
    const _tags = tags();
    const tagIndex = _tags.indexOf(tag);

    if (tagIndex === -1) {
      setTags([..._tags, tag]);
      return;
    }

    removeTag(tag);
  }

  return (<Dialog
    fullScreen
    open={props.open}
    onClose={close}
    TransitionComponent={Transition}
  >
    <AppBar sx={{ position: 'sticky' }}>
      <Toolbar>
        <IconButton
          edge='start'
          color='inherit'
          onClick={close}
          aria-label='close'
        >
          <ArrowBackIcon />
        </IconButton>
        <Typography sx={{ flexGrow: 1 }}>{props.title}</Typography>
        <IconButton 
          edge='end'
          color='inherit'
          onClick={clear}
          aria-label='clear and close'
        >
          <DeleteIcon />
        </IconButton>
      </Toolbar>
    </AppBar>
    <Stack padding={2} gap={1}>
      <Typography>Tags</Typography>
      <Stack gap={1} direction='row' flexWrap='wrap'>
        <For each={newAndExistingTags()}>{(tag) => <Chip size='medium' label={tag} onDelete={() => removeTag(tag)} onClick={() => toggleTag(tag)} color={tags().includes(tag) ? 'secondary' : 'default'} />}</For>
      </Stack>
      <ChipForm component='form' noValidate autocomplete='off' onSubmit={onSubmit} flexDirection='row' alignItems='center' px={1} >
        <Add color='disabled' />
        <InputBase value={newTag()} onChange={(e) => setNewTag(e.target.value)} placeholder='Ajouter un tag' sx={{ ml: 1 }} />
      </ChipForm>
      <TextField multiline value={content()} onChange={(e) => setContent(e.target.value)} label='Notes' sx={{ mt: 2 }} />
    </Stack>
  </Dialog>);
}

export default NoteDialog;
