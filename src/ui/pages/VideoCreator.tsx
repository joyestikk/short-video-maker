import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  TextField,
  Typography,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
  IconButton,
  Divider,
  InputAdornment,
  Card,
  CardContent,
  Stack,
  Chip,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import MovieIcon from "@mui/icons-material/Movie";
import SettingsIcon from "@mui/icons-material/Settings";
import SearchIcon from "@mui/icons-material/Search";
import NotesIcon from "@mui/icons-material/Notes";
import {
  SceneInput,
  RenderConfig,
  MusicMoodEnum,
  CaptionPositionEnum,
  VoiceEnum,
  OrientationEnum,
  MusicVolumeEnum,
} from "../../types/shorts";

interface SceneFormData {
  text: string;
  searchTerms: string;
}

const VideoCreator: React.FC = () => {
  const navigate = useNavigate();
  const [scenes, setScenes] = useState<SceneFormData[]>([
    { text: "", searchTerms: "" },
  ]);
  const [config, setConfig] = useState<RenderConfig>({
    paddingBack: 1500,
    music: MusicMoodEnum.chill,
    captionPosition: CaptionPositionEnum.bottom,
    captionBackgroundColor: "blue",
    voice: VoiceEnum.af_heart,
    orientation: OrientationEnum.portrait,
    musicVolume: MusicVolumeEnum.high,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [voices, setVoices] = useState<VoiceEnum[]>([]);
  const [musicTags, setMusicTags] = useState<MusicMoodEnum[]>([]);
  const [loadingOptions, setLoadingOptions] = useState(true);

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const [voicesResponse, musicResponse] = await Promise.all([
          axios.get("/api/voices"),
          axios.get("/api/music-tags"),
        ]);

        setVoices(voicesResponse.data);
        setMusicTags(musicResponse.data);
      } catch (err) {
        console.error("Failed to fetch options:", err);
        setError(
          "Failed to load voices and music options. Please refresh the page.",
        );
      } finally {
        setLoadingOptions(false);
      }
    };

    fetchOptions();
  }, []);

  const handleAddScene = () => {
    setScenes([...scenes, { text: "", searchTerms: "" }]);
  };

  const handleRemoveScene = (index: number) => {
    if (scenes.length > 1) {
      const newScenes = [...scenes];
      newScenes.splice(index, 1);
      setScenes(newScenes);
    }
  };

  const handleSceneChange = (
    index: number,
    field: keyof SceneFormData,
    value: string,
  ) => {
    const newScenes = [...scenes];
    newScenes[index] = { ...newScenes[index], [field]: value };
    setScenes(newScenes);
  };

  const handleConfigChange = (field: keyof RenderConfig, value: any) => {
    setConfig({ ...config, [field]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const apiScenes: SceneInput[] = scenes.map((scene) => ({
        text: scene.text,
        searchTerms: scene.searchTerms
          .split(",")
          .map((term) => term.trim())
          .filter((term) => term.length > 0),
      }));

      const response = await axios.post("/api/short-video", {
        scenes: apiScenes,
        config,
      });

      navigate(`/video/${response.data.videoId}`);
    } catch (err) {
      setError("Failed to create video. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loadingOptions) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height="80vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box maxWidth="md" mx="auto">
      <Box mb={6}>
        <Typography variant="h3" component="h1" sx={{ fontWeight: 800, mb: 1 }}>
          Create Video
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Craft your story scene by scene and customize the final output.
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 4, borderRadius: 2 }}>
          {error}
        </Alert>
      )}

      <form onSubmit={handleSubmit}>
        <Stack spacing={6}>
          <Box>
            <Box display="flex" alignItems="center" mb={3}>
              <MovieIcon sx={{ mr: 1.5, color: 'primary.main' }} />
              <Typography variant="h5" component="h2" sx={{ fontWeight: 700 }}>
                Storyboard
              </Typography>
            </Box>

            {scenes.map((scene, index) => (
              <Card key={index} sx={{ mb: 3, border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                <CardContent sx={{ p: 4 }}>
                  <Box
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                    mb={3}
                  >
                    <Chip
                      label={`Scene ${index + 1}`}
                      color="primary"
                      variant="outlined"
                      sx={{ fontWeight: 700 }}
                    />
                    {scenes.length > 1 && (
                      <IconButton
                        onClick={() => handleRemoveScene(index)}
                        color="error"
                        size="small"
                        sx={{ bgcolor: 'rgba(211, 47, 47, 0.05)' }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    )}
                  </Box>

                  <Grid container spacing={3}>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Narration Text"
                        multiline
                        rows={3}
                        placeholder="What should be said in this scene?"
                        value={scene.text}
                        onChange={(e) =>
                          handleSceneChange(index, "text", e.target.value)
                        }
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <NotesIcon color="action" sx={{ mr: 1 }} />
                            </InputAdornment>
                          ),
                        }}
                        required
                      />
                    </Grid>

                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Visual Search Terms"
                        placeholder="e.g. city, sunset, futuristic"
                        value={scene.searchTerms}
                        onChange={(e) =>
                          handleSceneChange(index, "searchTerms", e.target.value)
                        }
                        helperText="Keywords to find relevant background footage (comma-separated)"
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <SearchIcon color="action" sx={{ mr: 1 }} />
                            </InputAdornment>
                          ),
                        }}
                        required
                      />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            ))}

            <Box display="flex" justifyContent="center">
              <Button
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={handleAddScene}
                sx={{ borderStyle: 'dashed', borderWidth: 2, px: 4 }}
              >
                Add Another Scene
              </Button>
            </Box>
          </Box>

          <Divider />

          <Box>
            <Box display="flex" alignItems="center" mb={3}>
              <SettingsIcon sx={{ mr: 1.5, color: 'secondary.main' }} />
              <Typography variant="h5" component="h2" sx={{ fontWeight: 700 }}>
                Video Settings
              </Typography>
            </Box>

            <Card sx={{ border: '1px solid rgba(255, 255, 255, 0.05)' }}>
              <CardContent sx={{ p: 4 }}>
                <Grid container spacing={4}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      type="number"
                      label="End Padding"
                      value={config.paddingBack}
                      onChange={(e) =>
                        handleConfigChange("paddingBack", parseInt(e.target.value))
                      }
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">ms</InputAdornment>
                        ),
                      }}
                      helperText="Keep playing after narration ends"
                      required
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth>
                      <InputLabel>Music Mood</InputLabel>
                      <Select
                        value={config.music}
                        onChange={(e) => handleConfigChange("music", e.target.value)}
                        label="Music Mood"
                        required
                      >
                        {musicTags.map((tag) => (
                          <MenuItem key={tag} value={tag}>
                            {tag.charAt(0).toUpperCase() + tag.slice(1)}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth>
                      <InputLabel>Caption Position</InputLabel>
                      <Select
                        value={config.captionPosition}
                        onChange={(e) =>
                          handleConfigChange("captionPosition", e.target.value)
                        }
                        label="Caption Position"
                        required
                      >
                        {Object.values(CaptionPositionEnum).map((position) => (
                          <MenuItem key={position} value={position}>
                            {position.charAt(0).toUpperCase() + position.slice(1)}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Caption Background"
                      value={config.captionBackgroundColor}
                      onChange={(e) =>
                        handleConfigChange("captionBackgroundColor", e.target.value)
                      }
                      helperText="CSS color (e.g. blue, #ff0000)"
                      required
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth>
                      <InputLabel>Voice Artist</InputLabel>
                      <Select
                        value={config.voice}
                        onChange={(e) => handleConfigChange("voice", e.target.value)}
                        label="Voice Artist"
                        required
                      >
                        {voices.map((voice) => (
                          <MenuItem key={voice} value={voice}>
                            {voice.replace('af_', 'Female ').replace('am_', 'Male ').replace('bf_', 'British F ').replace('bm_', 'British M ')}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth>
                      <InputLabel>Orientation</InputLabel>
                      <Select
                        value={config.orientation}
                        onChange={(e) =>
                          handleConfigChange("orientation", e.target.value)
                        }
                        label="Orientation"
                        required
                      >
                        {Object.values(OrientationEnum).map((orientation) => (
                          <MenuItem key={orientation} value={orientation}>
                            {orientation.charAt(0).toUpperCase() + orientation.slice(1)}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth>
                      <InputLabel>Music Volume</InputLabel>
                      <Select
                        value={config.musicVolume}
                        onChange={(e) =>
                          handleConfigChange("musicVolume", e.target.value)
                        }
                        label="Music Volume"
                        required
                      >
                        {Object.values(MusicVolumeEnum).map((vol) => (
                          <MenuItem key={vol} value={vol}>
                            {vol.charAt(0).toUpperCase() + vol.slice(1)}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Box>
        </Stack>

        <Box
          sx={{
            mt: 8,
            mb: 8,
            display: 'flex',
            justifyContent: 'center',
          }}
        >
          <Button
            type="submit"
            variant="contained"
            size="large"
            disabled={loading}
            sx={{
              minWidth: 320,
              py: 2.5,
              borderRadius: 4,
              fontSize: '1.2rem',
              fontWeight: 800,
              boxShadow: '0 8px 32px rgba(187, 134, 252, 0.4)',
              background: 'linear-gradient(45deg, #bb86fc 30%, #9965f4 90%)',
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'scale(1.02)',
                boxShadow: '0 12px 40px rgba(187, 134, 252, 0.5)',
              }
            }}
          >
            {loading ? (
              <CircularProgress size={28} color="inherit" />
            ) : (
              "Render Video"
            )}
          </Button>
        </Box>
      </form>
    </Box>
  );
};

export default VideoCreator;
