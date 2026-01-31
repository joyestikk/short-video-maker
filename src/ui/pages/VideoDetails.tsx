import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  Box, 
  Typography, 
  Paper, 
  Button, 
  CircularProgress, 
  Alert,
  Grid,
  Card,
  CardContent,
  Fade,
  LinearProgress,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DownloadIcon from '@mui/icons-material/Download';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';
import { VideoStatus } from '../../types/shorts';

const VideoDetails: React.FC = () => {
  const { videoId } = useParams<{ videoId: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<VideoStatus>('processing');
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const isMounted = useRef(true);

  const checkVideoStatus = async () => {
    try {
      const response = await axios.get(`/api/short-video/${videoId}/status`);
      const videoStatus = response.data.status;

      if (isMounted.current) {
        setStatus(videoStatus || 'unknown');
        console.log("videoStatus", videoStatus);
        
        if (videoStatus !== 'processing') {
          console.log("video is not processing");
          console.log("interval", intervalRef.current);
          
          if (intervalRef.current) {
            console.log("clearing interval");
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
        }
        
        setLoading(false);
      }
    } catch (error) {
      if (isMounted.current) {
        setError('Failed to fetch video status');
        setStatus('failed');
        setLoading(false);
        console.error('Error fetching video status:', error);
        
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      }
    }
  };

  useEffect(() => {
    checkVideoStatus();
    
    intervalRef.current = setInterval(() => {
      checkVideoStatus();
    }, 5000);
    
    return () => {
      isMounted.current = false;
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [videoId]);

  const handleBack = () => {
    navigate('/');
  };

  const renderContent = () => {
    if (loading) {
      return (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="30vh">
          <CircularProgress />
        </Box>
      );
    }

    if (error) {
      return <Alert severity="error">{error}</Alert>;
    }

    if (status === 'processing') {
      return (
        <Box textAlign="center" py={4}>
          <CircularProgress size={60} sx={{ mb: 2 }} />
          <Typography variant="h6">Your video is being created...</Typography>
          <Typography variant="body1" color="text.secondary">
            This may take a few minutes. Please wait.
          </Typography>
        </Box>
      );
    }

    if (status === 'ready') {
      return (
        <Box>
          <Box mb={3} textAlign="center">
            <Typography variant="h6" color="success.main" gutterBottom>
              Your video is ready!
            </Typography>
          </Box>
          
          <Box sx={{ 
            position: 'relative', 
            paddingTop: '56.25%',
            mb: 3,
            backgroundColor: '#000'
          }}>
            <video
              controls
              autoPlay
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
              }}
              src={`/api/short-video/${videoId}`}
            />
          </Box>
          
          <Box textAlign="center">
            <Button 
              component="a"
              href={`/api/short-video/${videoId}`}
              download
              variant="contained" 
              color="primary" 
              startIcon={<DownloadIcon />}
              sx={{ textDecoration: 'none' }}
            >
              Download Video
            </Button>
          </Box>
        </Box>
      );
    }

    if (status === 'failed') {
      return (
        <Alert severity="error" sx={{ mb: 3 }}>
          Video processing failed. Please try again with different settings.
        </Alert>
      );
    }

    return (
      <Alert severity="info" sx={{ mb: 3 }}>
        Unknown video status. Please try refreshing the page.
      </Alert>
    );
  };

  const capitalizeFirstLetter = (str: string) => {
    if (!str || typeof str !== 'string') return 'Unknown';
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  return (
    <Box maxWidth="md" mx="auto">
      <Box display="flex" alignItems="center" mb={6}>
        <Button 
          variant="text"
          startIcon={<ArrowBackIcon />} 
          onClick={handleBack}
          sx={{ mr: 2, color: 'text.secondary' }}
        >
          Back to videos
        </Button>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 800 }}>
          Video Studio
        </Typography>
      </Box>

      <Fade in={true} timeout={800}>
        <Card sx={{ borderRadius: 4, overflow: 'hidden', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
          <CardContent sx={{ p: 0 }}>
            <Box sx={{ p: 4, borderBottom: '1px solid rgba(255, 255, 255, 0.05)', bgcolor: 'rgba(255, 255, 255, 0.02)' }}>
              <Grid container spacing={4}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="overline" color="text.secondary" sx={{ fontWeight: 700, letterSpacing: 1 }}>
                    Project ID
                  </Typography>
                  <Typography variant="h6" sx={{ fontFamily: 'monospace', fontSize: '0.9rem' }}>
                    {videoId || 'Unknown'}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="overline" color="text.secondary" sx={{ fontWeight: 700, letterSpacing: 1 }}>
                    Processing Status
                  </Typography>
                  <Box display="flex" alignItems="center">
                    <Box
                      sx={{
                        width: 10,
                        height: 10,
                        borderRadius: '50%',
                        mr: 1.5,
                        bgcolor:
                          status === 'ready' ? 'success.main' :
                          status === 'processing' ? 'info.main' :
                          status === 'failed' ? 'error.main' : 'text.disabled',
                        boxShadow:
                          status === 'ready' ? '0 0 10px rgba(102, 187, 106, 0.5)' :
                          status === 'processing' ? '0 0 10px rgba(41, 182, 246, 0.5)' : 'none'
                      }}
                    />
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 700,
                        color:
                          status === 'ready' ? 'success.light' :
                          status === 'processing' ? 'info.light' :
                          status === 'failed' ? 'error.light' : 'text.primary'
                      }}
                    >
                      {capitalizeFirstLetter(status)}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </Box>

            <Box sx={{ p: 4 }}>
              {status === 'processing' && (
                <Box sx={{ width: '100%', mt: 2, mb: 4 }}>
                  <LinearProgress color="info" sx={{ borderRadius: 5, height: 8 }} />
                </Box>
              )}
              {renderContent()}
            </Box>
          </CardContent>
        </Card>
      </Fade>
    </Box>
  );
};

export default VideoDetails; 