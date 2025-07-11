import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
} from '@suid/material';
import { type Component, createSignal, onMount } from 'solid-js';
import postWater from '@/lib/api/post-water';

type Props = {
  waterSelectedIds: string[];
  onFinish: (result: 'Success' | 'Cancelled') => void;
};

const passwordCacheKey = 'jfv-password-v1';

const WaterSubmit: Component<Props> = (props) => {
  const [password, setPassword] = createSignal<string>('');
  const [passwordDialogOpen, setPasswordDialogOpen] =
    createSignal<boolean>(false);
  const [errorDialogOpen, setErrorDialogOpen] = createSignal<boolean>(false);

  onMount(() => {
    const p = localStorage.getItem(passwordCacheKey);

    if (p) {
      setPassword(p);
      submitWater();
    } else {
      setTimeout(() => {
        setPasswordDialogOpen(true);
      }, 1000);
    }
  });

  const cancelPasswordDialog = () => {
    props.onFinish('Cancelled');
  };

  const submitPasswordDialog = () => {
    localStorage.setItem(passwordCacheKey, password());
    setPasswordDialogOpen(false);
    submitWater();
  };

  const submitWater = async () => {
    const result = await postWater(props.waterSelectedIds, password());

    console.log(result);

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
  };

  const closeErrorDialog = () => {
    setErrorDialogOpen(false);
    props.onFinish('Cancelled');
  };

  return (
    <>
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
            La mise a jour d'arrosage n'a pas pu être faite. Réessayez plus
            tard.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeErrorDialog}>Ok</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default WaterSubmit;
