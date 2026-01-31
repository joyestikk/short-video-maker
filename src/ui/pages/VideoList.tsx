import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  CardActions,
  IconButton,
  Chip,
  Tooltip,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import DeleteIcon from '@mui/icons-material/Delete';
import VideoLibraryIcon from '@mui/icons-material/VideoLibrary';

interface VideoItem {
  id: string;
  status: string;
}

const VideoList: React.FC = () => {
  const navigate = useNavigate();
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchVideos = async () => {
    try {
      const response = await axios.get('/api/short-videos');
      setVideos(response.data.videos || []);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch videos');
      setLoading(false);
      console.error('Error fetching videos:', err);
    }
  };

  useEffect(() => {
    fetchVideos();
  }, []);

  const handleCreateNew = () => {
    navigate('/create');
  };

  const handleVideoClick = (id: string) => {
    navigate(`/video/${id}`);
  };

  const handleDeleteVideo = async (id: string, event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    
    try {
      await axios.delete(`/api/short-video/${id}`);
      fetchVideos();
    } catch (err) {
      setError('Failed to delete video');
      console.error('Error deleting video:', err);
    }
  };

  const capitalizeFirstLetter = (str: string) => {
    if (!str || typeof str !== 'string') return 'Unknown';
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="80vh">
        <CircularProgress />
      </Box>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ready': return 'success';
      case 'processing': return 'info';
      case 'failed': return 'error';
      default: return 'default';
    }
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={6}>
        <Box>
          <Typography variant="h3" component="h1" sx={{ fontWeight: 800, mb: 1 }}>
            Your Studio
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage and create your automated short videos
          </Typography>
        </Box>
        <Button 
          variant="contained" 
          size="large"
          startIcon={<AddIcon />}
          onClick={handleCreateNew}
          sx={{
            boxShadow: '0 4px 14px 0 rgba(187, 134, 252, 0.39)',
            py: 1.5,
            px: 3
          }}
        >
          New Video
        </Button>
      </Box>
      
      {error && (
        <Alert severity="error" sx={{ mb: 4, borderRadius: 2 }}>{error}</Alert>
      )}
      
      {videos.length === 0 ? (
        <Paper
          sx={{
            p: 8,
            textAlign: 'center',
            borderRadius: 4,
            border: '2px dashed rgba(255, 255, 255, 0.1)',
            bgcolor: 'transparent'
          }}
        >
          <VideoLibraryIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
          <Typography variant="h5" color="text.secondary" gutterBottom sx={{ fontWeight: 600 }}>
            No videos yet
          </Typography>
          <Typography variant="body2" color="text.disabled" sx={{ mb: 4 }}>
            Start by creating your first automated short video.
          </Typography>
          <Button 
            variant="outlined" 
            size="large"
            startIcon={<AddIcon />}
            onClick={handleCreateNew}
          >
            Create Your First Video
          </Button>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {videos.map((video) => {
            const videoId = video?.id || '';
            const videoStatus = video?.status || 'unknown';

            return (
              <Grid item xs={12} sm={6} md={4} key={videoId}>
                <Card
                  onClick={() => handleVideoClick(videoId)}
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    cursor: 'pointer',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    position: 'relative',
                    overflow: 'hidden',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: '0 12px 24px -10px rgba(0,0,0,0.5)',
                      '& .card-action-overlay': {
                        opacity: 1
                      }
                    },
                    borderRadius: 4,
                    border: '1px solid rgba(255, 255, 255, 0.05)',
                  }}
                >
                  <Box sx={{
                    height: 160,
                    bgcolor: 'rgba(255, 255, 255, 0.03)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative'
                  }}>
                    <VideoLibraryIcon sx={{ fontSize: 48, color: 'rgba(187, 134, 252, 0.2)' }} />
                    <Box
                      className="card-action-overlay"
                      sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        bgcolor: 'rgba(0,0,0,0.4)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        opacity: 0,
                        transition: 'opacity 0.2s'
                      }}
                    >
                      {videoStatus === 'ready' && (
                        <PlayArrowIcon sx={{ fontSize: 48, color: '#fff' }} />
                      )}
                    </Box>
                  </Box>
                  <CardContent sx={{ flexGrow: 1, pt: 2 }}>
                    <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                        Video {videoId.substring(0, 8)}
                      </Typography>
                      <Chip
                        label={capitalizeFirstLetter(videoStatus)}
                        size="small"
                        color={getStatusColor(videoStatus) as any}
                        sx={{
                          fontWeight: 600,
                          fontSize: '0.65rem',
                          height: 20,
                          '& .MuiChip-label': { px: 1 }
                        }}
                      />
                    </Box>
                    <Typography variant="caption" color="text.secondary">
                      ID: {videoId}
                    </Typography>
                  </CardContent>
                  <CardActions sx={{ justifyContent: 'flex-end', px: 2, pb: 2 }}>
                    <Tooltip title="Delete video">
                      <IconButton 
                        size="small"
                        onClick={(e) => handleDeleteVideo(videoId, e)}
                        sx={{
                          color: 'rgba(255, 255, 255, 0.3)',
                          '&:hover': { color: 'error.main', bgcolor: 'rgba(211, 47, 47, 0.1)' }
                        }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </CardActions>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}
    </Box>
  );
};

export default VideoList; 