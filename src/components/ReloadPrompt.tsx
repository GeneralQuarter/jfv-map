import { useRegisterSW } from 'virtual:pwa-register/solid';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@suid/material';
import type { Component } from 'solid-js';

const ReloadPrompt: Component = () => {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    immediate: true,
    onRegisteredSW(swUrl, _r) {
      console.log(`Service Worker at: ${swUrl}`);
    },
    onRegisterError(error) {
      console.error('SW registration error', error);
    },
  });

  const close = () => {
    setNeedRefresh(false);
  };

  return (
    <Dialog
      open={needRefresh()}
      aria-labelledby="update-dialog-title"
      aria-describedby="update-dialog-description"
    >
      <DialogTitle id="update-dialog-title">Mise à jour</DialogTitle>
      <DialogContent>
        <DialogContentText id="update-dialog-description">
          Une nouvelle version de l'application est disponible, cliquez sur le
          bouton recharger pour mettre à jour.
        </DialogContentText>
        <DialogActions>
          <Button onClick={() => updateServiceWorker(true)} color="secondary">
            Recharger
          </Button>
          <Button onClick={() => close()}>Fermer</Button>
        </DialogActions>
      </DialogContent>
    </Dialog>
  );
};

export default ReloadPrompt;
