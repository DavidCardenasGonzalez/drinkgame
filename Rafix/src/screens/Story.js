import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ImageBackground,
  SafeAreaView,
  Image,
} from "react-native";
import { Audio } from "expo-av";
import Slider from "@react-native-community/slider";
import { Ionicons } from "@expo/vector-icons";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import { generateStoryGame } from "../services";
import Loading from "../components/Loading";

const Story = ({ navigation, route }) => {
  const { plot, playerDetails, playerList } = route.params;
  const [loading, setLoading] = useState(false);
  const [audioUrl, setAudioUrl] = useState("");
  const [sound, setSound] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoadingSound, setIsLoadingSound] = useState(false);
  const [playbackStatus, setPlaybackStatus] = useState(null);

  useEffect(() => {
    // Configuramos el modo de audio
    Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      playsInSilentModeIOS: true,
      staysActiveInBackground: true,
      shouldDuckAndroid: true,
      playThroughEarpieceAndroid: false,
    });
  }, []);

  useEffect(() => {
    // Generamos la historia al iniciar el componente
    generateStory();
    return () => {
      // Al desmontar, si existe el sonido, lo descargamos de memoria
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, []);

  const generateStory = async () => {
    setLoading(true);
    try {
      const players = playerList.map((player, index) => ({
        name: player.name,
        notes: playerDetails[index] || "",
      }));
      const data = { players, plot };
      const response = await generateStoryGame(data);
      if (response.audioUrl) {
        setAudioUrl(response.audioUrl);
      } else {
        console.error("No se obtuvo la URL del audio");
      }
    } catch (error) {
      console.error("Error al generar la historia:", error);
    } finally {
      setLoading(false);
    }
  };

  // Función para reproducir/pausar
  const handlePlayPause = async () => {
    if (!sound) {
      if (isLoadingSound) {
        Alert.alert(
          "Cargando audio",
          "Por favor espera a que el audio termine de cargar."
        );
        return;
      }
      try {
        setIsLoadingSound(true);
        console.log("Cargando audio...");
        const { sound: newSound } = await Audio.Sound.createAsync(
          { uri: audioUrl },
          { shouldPlay: true },
          (status) => setPlaybackStatus(status)
        );
        setSound(newSound);
        setIsPlaying(true);
        setIsLoadingSound(false);
      } catch (error) {
        console.error("Error al reproducir el audio:", error);
        setIsLoadingSound(false);
        Alert.alert("Error", "No se pudo cargar el audio.");
      }
    } else {
      if (playbackStatus && !playbackStatus.isLoaded) {
        Alert.alert(
          "Audio no cargado",
          "El audio aún no está completamente cargado."
        );
        return;
      }
      if (isPlaying) {
        await sound.pauseAsync();
        setIsPlaying(false);
      } else {
        await sound.playAsync();
        setIsPlaying(true);
      }
    }
  };

  // Funciones para adelantar, retroceder y reiniciar la reproducción
  const handleSkipForward = async () => {
    if (sound && playbackStatus) {
      const newPosition = playbackStatus.positionMillis + 5000;
      await sound.setPositionAsync(newPosition);
    }
  };

  const handleSkipBackward = async () => {
    if (sound && playbackStatus) {
      let newPosition = playbackStatus.positionMillis - 5000;
      if (newPosition < 0) newPosition = 0;
      await sound.setPositionAsync(newPosition);
    }
  };

  const handleRestart = async () => {
    if (sound) {
      await sound.setPositionAsync(0);
    }
  };

  // Al soltar el slider, actualizamos la posición del audio
  const handleSliderComplete = async (value) => {
    if (sound) {
      await sound.setPositionAsync(value * 1000);
    }
  };

  // Función para descargar el audio y compartirlo
  const handleDownloadAndShare = async () => {
    try {
      const fileUri = FileSystem.documentDirectory + "story.mp3";
      const fileInfo = await FileSystem.getInfoAsync(fileUri);
      if (!fileInfo.exists) {
        console.log("Descargando archivo...");
        await FileSystem.downloadAsync(audioUrl, fileUri);
      }
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri);
      } else {
        Alert.alert(
          "Función no disponible",
          "La función de compartir no está disponible en este dispositivo"
        );
      }
    } catch (error) {
      console.error("Error al descargar o compartir el archivo:", error);
    }
  };

  const formatTime = (millis) => {
    if (typeof millis !== "number" || isNaN(millis)) {
      return "0:00";
    }
    const totalSeconds = Math.floor(millis / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ImageBackground
        source={require("../../assets/background.jpg")}
        style={styles.background}
        imageStyle={styles.image}
      >
        <View style={styles.container}>
          <View style={styles.header}>
            <TouchableOpacity
              onPress={() =>
                navigation.navigate("StoryConfig", {
                  playerList,
                })
              }
            >
              <Ionicons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>
            <Image
              source={require("../../assets/RAFIX.png")}
              style={styles.logo}
            />
            <View style={{ width: 24 }} />
          </View>
          {loading ? (
            <Loading />
          ) : (
            <View style={styles.gameContainer}>
              <Text style={styles.title}>Historia generada por IA</Text>
              <View style={styles.playerContainer}>
                {/* Barra de progreso */}
                <Slider
                  style={styles.slider}
                  minimumValue={0}
                  maximumValue={
                    playbackStatus && playbackStatus.durationMillis
                      ? playbackStatus.durationMillis / 1000
                      : 1
                  }
                  value={
                    playbackStatus ? playbackStatus.positionMillis / 1000 : 0
                  }
                  minimumTrackTintColor="#FFFFFF"
                  maximumTrackTintColor="#000000"
                  thumbTintColor="#FFFFFF"
                  onSlidingComplete={handleSliderComplete}
                />
                <View style={styles.timeContainer}>
                  <Text style={styles.timeText}>
                    {playbackStatus
                      ? formatTime(playbackStatus.positionMillis)
                      : "0:00"}
                  </Text>
                  <Text style={styles.timeText}>
                    {playbackStatus && playbackStatus.durationMillis
                      ? formatTime(playbackStatus.durationMillis)
                      : "0:00"}
                  </Text>
                </View>
                {/* Controles de reproducción */}
                <View style={styles.controlsContainer}>
                  <TouchableOpacity
                    onPress={handleRestart}
                    style={styles.controlButton}
                  >
                    <Ionicons
                      name="play-skip-back-outline"
                      size={24}
                      color="white"
                    />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={handleSkipBackward}
                    style={styles.controlButton}
                  >
                    <Ionicons
                      name="play-back-outline"
                      size={24}
                      color="white"
                    />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={handlePlayPause}
                    style={styles.controlButton}
                    disabled={isLoadingSound}
                  >
                    {isPlaying ? (
                      <Ionicons name="pause-outline" size={24} color="white" />
                    ) : (
                      <Ionicons name="play-outline" size={24} color="white" />
                    )}
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={handleSkipForward}
                    style={styles.controlButton}
                  >
                    <Ionicons
                      name="play-forward-outline"
                      size={24}
                      color="white"
                    />
                  </TouchableOpacity>
                </View>
              </View>
              {/* Botones extra */}
              <View style={styles.extraButtonsContainer}>
                <TouchableOpacity
                  style={styles.button}
                  onPress={handleDownloadAndShare}
                >
                  <Text style={styles.buttonText}>Descargar y Compartir</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.button}
                  onPress={() => navigation.navigate("Home")}
                >
                  <Text style={styles.buttonText}>Volver al Inicio</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      </ImageBackground>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "black",
  },
  background: {
    flex: 1,
    resizeMode: "cover",
    backgroundColor: "black",
    justifyContent: "center",
  },
  image: { opacity: 0.5, width: "100%", height: "100%" },
  container: {
    flex: 1,
    alignItems: "center",
    padding: 20,
  },
  gameContainer: {
    flex: 1,
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    color: "white",
    fontSize: 22,
    marginBottom: 20,
    textAlign: "center",
  },
  header: {
    flexDirection: "row",
    width: "100%",
    justifyContent: "space-between",
    marginBottom: 0,
  },
  logo: {
    width: 150,
    height: 35,
    marginBottom: 10,
  },
  playerContainer: {
    width: "100%",
    alignItems: "center",
    marginBottom: 20,
    backgroundColor: "rgba(96, 13, 81, 0.8)",
    padding: 20,
    borderRadius: 20,
  },
  slider: {
    width: "90%",
    height: 40,
  },
  timeContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "90%",
  },
  timeText: {
    color: "white",
    fontSize: 14,
  },
  controlsContainer: {
    flexDirection: "row",
    marginTop: 20,
  },
  controlButton: {
    marginHorizontal: 10,
    padding: 10,
    backgroundColor: "#0F3F81",
    borderRadius: 30,
    borderWidth: 2,
    borderColor: "#FFF",
  },
  extraButtonsContainer: {
    width: "100%",
    alignItems: "center",
  },
  button: {
    backgroundColor: "#0F3F81",
    padding: 15,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: "#FFF",
    marginVertical: 10,
    width: "90%",
    alignItems: "center",
  },
  buttonText: {
    color: "#FFF",
    fontSize: 18,
  },
});

export default Story;
