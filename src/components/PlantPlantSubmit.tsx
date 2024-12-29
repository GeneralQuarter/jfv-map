import postPlantPlant from '@/lib/api/post-plant-plant';
import { Plant } from '@/models/plant';
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, TextField } from '@suid/material';
import { Component, createSignal, onMount } from 'solid-js';

type Props = {
  plant: Plant;
  onFinish: (result: 'Success' | 'Cancelled') => void;
};

const passwordCacheKey = 'jfv-password-v1';

const PlantPlantSubmit: Component<Props> = (props) => {
  const [password, setPassword] = createSignal<string>('');
  const [passwordDialogOpen, setPasswordDialogOpen] = createSignal<boolean>(false);
  const [errorDialogOpen, setErrorDialogOpen] = createSignal<boolean>(false);

  onMount(() => {
    const p = localStorage.getItem(passwordCacheKey);
    
    if (p) {
      setPassword(p);
      submitPlantPlant();
    } else {
      setTimeout(() => {
        setPasswordDialogOpen(true);
      }, 1000);
    }
  });

  const cancelPasswordDialog = () => {
    props.onFinish('Cancelled');
  }

  const submitPasswordDialog = () => {
    localStorage.setItem(passwordCacheKey, password());
    setPasswordDialogOpen(false);
    submitPlantPlant();
  }

  const submitPlantPlant = async () => {
    const result = await postPlantPlant(props.plant.id, password());

    switch (result) {
      case 'Success':
        props.onFinish('Success');
        return;
      case 'AuthError':
        setPassword('');
        localStorage.removeItem(passwordCacheKey);
        setPasswordDialogOpen(true);
        return;
      case 'Error':
        setErrorDialogOpen(true);
        return;
    }
  }

  const closeErrorDialog = () => {
    setErrorDialogOpen(false);
    props.onFinish('Cancelled');
  }

  return <>
    <Dialog open={passwordDialogOpen()} onClose={cancelPasswordDialog}>
      <DialogTitle>Mot de passe</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          id="password"
          label="Password"
          type="password"
          fullWidth
          variant="standard"
          value={password()}
          onChange={(evt) => setPassword(evt.target.value)}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={cancelPasswordDialog}>Annuler</Button>
        <Button onClick={submitPasswordDialog}>Valider</Button>
      </DialogActions>
    </Dialog>
    <Dialog open={errorDialogOpen()} onClose={closeErrorDialog}>
      <DialogTitle>Erreur</DialogTitle>
      <DialogContent>
        <DialogContentText>
          La mise a jour de {props.plant.code} n'a pas pu être faite. Réessayez plus tard.
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={closeErrorDialog}>Ok</Button>
      </DialogActions>
    </Dialog>
  </>
}

export default PlantPlantSubmit;
