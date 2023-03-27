import { ExpandLess, TouchApp } from '@suid/icons-material';
import { Box, Paper, Stack, styled, Typography } from '@suid/material';
import { Component, createEffect, createSignal, JSX } from 'solid-js';

const Container = styled(Paper)({
  position: 'absolute',
  left: 0,
  bottom: 0,
  width: '100%',
  height: 56,
  zIndex: 1070,
  borderTopLeftRadius: 16,
  borderTopRightRadius: 16,
  overflowY: 'hidden',
  transition: 'height 150ms ease',
  display: 'flex',
  flexDirection: 'column',

  ' .MuiSvgIcon-root': {
    transition: 'rotate 300ms ease',
  },

  '&.active': {
    height: 'calc(50%)',

    '> .drawer-content': {
      overflowY: 'auto',
    },

    ' .expand-icon': {
      rotate: '180deg'
    }
  }
});

const Header = styled(Box)({
  minHeight: 56,
  height: 56,
  width: '100%',
  top: 0,
});

type Props = {
  title?: string;
  placeholder?: string;
  children: JSX.Element;
  actions?: JSX.Element;
};

const SelectionDrawer: Component<Props> = (props) => {
  const [open, setOpen] = createSignal<boolean>(false);

  createEffect(() => {
    if (!props.title && open()) {
      setOpen(false);
    }
  });

  const toggleOpen = () => {
    if (!props.title) {
      return;
    }

    setOpen(!open());
  }

  return (<Container elevation={5} class={open() ? 'active' : ''} square={true}>
    <Header onClick={toggleOpen}>
      <Stack direction='row' paddingLeft={2}>
        <Stack paddingY={2} gap={2} direction='row' sx={{ color: props.title ? 'text.primary' : 'text.secondary' }}>
          {props.title ? <ExpandLess class='expand-icon' /> : <TouchApp />}
          <Typography>{props.title ?? props.placeholder}</Typography>
        </Stack>
        <Stack direction='row' sx={{ ml: 'auto' }}>
          {props.actions}
        </Stack>
      </Stack>
    </Header>
    <Box class='drawer-content' sx={{ px: 2, pb: 2 }}>
      {props.children}
    </Box>
  </Container>);
}

export default SelectionDrawer;
