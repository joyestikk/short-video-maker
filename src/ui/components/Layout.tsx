import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AppBar,
  Box,
  Container,
  CssBaseline,
  Toolbar,
  Typography,
  Button,
  ThemeProvider,
  createTheme
} from '@mui/material';
import VideoIcon from '@mui/icons-material/VideoLibrary';
import AddIcon from '@mui/icons-material/Add';

interface LayoutProps {
  children: React.ReactNode;
}

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#bb86fc',
    },
    secondary: {
      main: '#03dac6',
    },
    background: {
      default: '#121212',
      paper: '#1e1e1e',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
      },
    },
  },
});

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const navigate = useNavigate();

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #121212 0%, #1a1a1a 100%)',
      }}>
        <AppBar
          position="sticky"
          elevation={0}
          sx={{
            backgroundColor: 'rgba(18, 18, 18, 0.8)',
            backdropFilter: 'blur(10px)',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          }}
        >
          <Toolbar>
            <VideoIcon sx={{ mr: 2, color: 'primary.main' }} />
            <Typography 
              variant="h6" 
              component="div" 
              sx={{
                flexGrow: 1,
                cursor: 'pointer',
                fontWeight: 700,
                letterSpacing: '-0.5px',
                background: 'linear-gradient(45deg, #bb86fc 30%, #03dac6 90%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
              onClick={() => navigate('/')}
            >
              Short Video Maker
            </Typography>
            <Button 
              variant="contained"
              disableElevation
              startIcon={<AddIcon />}
              onClick={() => navigate('/create')}
              sx={{
                borderRadius: '8px',
                background: 'linear-gradient(45deg, #bb86fc 30%, #9965f4 90%)',
              }}
            >
              Create Video
            </Button>
          </Toolbar>
        </AppBar>
        <Container component="main" sx={{ flexGrow: 1, py: 6 }}>
          {children}
        </Container>
        <Box 
          component="footer" 
          sx={{ 
            py: 4,
            mt: 'auto', 
            borderTop: '1px solid rgba(255, 255, 255, 0.05)',
            textAlign: 'center'
          }}
        >
          <Typography variant="body2" color="text.secondary">
            Short Video Maker &copy; {new Date().getFullYear()} • Powered by Remotion & Kokoro
          </Typography>
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default Layout; 