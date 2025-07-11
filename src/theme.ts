import { brown, green } from '@suid/material/colors';
import { createTheme } from '@suid/material/styles';

export default createTheme({
  palette: {
    primary: {
      main: brown[500],
    },
    secondary: {
      main: green[700],
    },
  },
});
