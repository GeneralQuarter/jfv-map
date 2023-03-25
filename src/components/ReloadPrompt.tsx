import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@suid/material';
import { Component } from 'solid-js';
import { useRegisterSW } from 'virtual:pwa-register/solid';

const ReloadPrompt: Component = () => {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({ 
    immediate: true,
    onRegisteredSW(swUrl, r) {
      console.log(`Service Worker at: ${swUrl}`);
    },
    onRegisterError(error) {
      console.error('SW registration error', error);
    },
  });

  const close = () => {
    setNeedRefresh(false);
  }

  return (<Dialog 
    open={needRefresh()}
    aria-labelledby='update-dialog-title'
    aria-describedby='update-dialog-description'
  >
    <DialogTitle id='update-dialog-title'>Mise à jour</DialogTitle>
    <DialogContent>
      <DialogContentText id='update-dialog-description'>
        Une nouvelle version de l'application est disponible, cliquez sur le bouton recharger pour mettre à jour.
      </DialogContentText>
      <DialogActions>
        <Button onClick={() => updateServiceWorker(true)} color='secondary'>Recharger</Button>
        <Button onClick={() => close()}>Fermer</Button>
      </DialogActions>
    </DialogContent>
  </Dialog>);
}

export default ReloadPrompt;
