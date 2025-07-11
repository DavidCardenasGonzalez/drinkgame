import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  ImageBackground,
  StyleSheet,
  TouchableOpacity,
  Linking,
  Alert,
} from "react-native";
import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import { getAllCategories, versionCheck } from "../../src/services";

function HomeScreen({ route, navigation }) {
  const [showLastGame, setShowLastGame] = useState(false);

  useEffect(() => {
    getAllCategories();
    async function fetchData() {
      const lastGame = await AsyncStorage.getItem("lastGame");
      setShowLastGame(!!lastGame);
    }
    fetchData();
    console.log("HomeScreen mounted");
  }, [route.params]);

  const openInstagram = () => {
    const instagramUrl = "https://www.instagram.com/rafix.app";

    Linking.canOpenURL(instagramUrl)
      .then((supported) => {
        if (supported) {
          Linking.openURL(instagramUrl);
        } else {
          Alert.alert("Error", "No se pudo abrir Instagram.");
        }
      })
      .catch((err) => console.error("Error al intentar abrir Instagram:", err));
  };

  useEffect(() => {
    const checkVersion = async () => {
      try {
        const result = await versionCheck();
        console.log("Resultado de versionCheck:", result);
        // Define aquí las URLs de tu app en tiendas:
        const playStorePackage = "com.cardi7.Rafix";
        const playStoreUrl = `market://details?id=${playStorePackage}`;
        const playStoreWebUrl = `https://play.google.com/store/apps/details?id=${playStorePackage}`;
        const appStoreUrl = "https://apps.apple.com/us/app/rafix/id6615065809";

        // Función para abrir la URL adecuada según plataforma y fallback
        const openStore = () => {
          if (Platform.OS === "android") {
            // Intentar abrir app de Play Store; si falla, abrir web
            Linking.openURL(playStoreUrl).catch(() => {
              Linking.openURL(playStoreWebUrl).catch((err) =>
                console.error("Error abriendo Play Store web:", err)
              );
            });
          } else if (Platform.OS === "ios") {
            Linking.openURL(appStoreUrl).catch((err) =>
              console.error("Error abriendo App Store:", err)
            );
          }
        };

        if (result === "requestUpdate") {
          // Actualización forzada: no permitimos "Más tarde"
          Alert.alert(
            "Actualización obligatoria",
            "Hay una nueva versión que debes instalar para seguir usando la aplicación.",
            [
              {
                text: "Actualizar ahora",
                onPress: openStore,
              },
            ],
            { cancelable: false }
          );
        } else if (result === "updateAvailable") {
          // Actualización opcional: permitimos posponer
          Alert.alert(
            "Actualización disponible",
            "Hay una nueva versión de la aplicación. ¿Quieres actualizar ahora?",
            [
              {
                text: "Actualizar",
                onPress: openStore,
              },
              {
                text: "Más tarde",
                style: "cancel",
                onPress: () => {
                  console.log("Usuario pospuso la actualización");
                },
              },
            ],
            { cancelable: true }
          );
        }
      } catch (error) {
        console.error("Error al verificar la versión:", error);
      }
    };

    checkVersion();
  }, []);

  return (
    <ImageBackground
      source={require("../../assets/background.jpg")}
      style={styles.background}
      imageStyle={styles.image}
    >
      <TouchableOpacity
        style={styles.settingsIcon}
        onPress={() => navigation.navigate("Settings")}
      >
        <Ionicons name="settings-outline" size={30} color="#FFF" />
      </TouchableOpacity>

      <View style={styles.container}>
        <Image source={require("../../assets/RAFIX.png")} style={styles.logo} />
        <Image
          source={require("../../assets/octavio.png")}
          style={styles.person}
        />
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate("Players")}
        >
          <Text style={styles.buttonText}>Clásico</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate("PlayersStory")}
        >
          <Text style={styles.buttonText}>Modo Historia</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate("Script")}
        >
          <Text style={styles.buttonText}>Modo Actuación</Text>
        </TouchableOpacity>
        {showLastGame && (
          <TouchableOpacity
            style={styles.button}
            onPress={() => navigation.navigate("Game")}
          >
            <Text style={styles.buttonText}>Continuar juego anterior</Text>
          </TouchableOpacity>
        )}
        <Text style={styles.footerText}>
          Al hacer clic en "Nuevo juego" o "Continuar juego anterior", aceptas
          <Text
            style={styles.link}
            onPress={() => navigation.navigate("Info", { type: "terms" })}
          >
            {" "}
            Términos de Servicio
          </Text>{" "}
          y
          <Text
            style={styles.link}
            onPress={() => navigation.navigate("Info", { type: "privacy" })}
          >
            {" "}
            Política de Privacidad
          </Text>
        </Text>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    resizeMode: "cover",
    backgroundColor: "black",
  },
  image: { opacity: 0.5, width: "100%", height: "100%" },
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  logo: {
    width: 250,
    height: 65,
  },
  person: {
    marginTop: -30,
    width: 350,
    height: 350,
    marginBottom: -20,
  },
  button: {
    backgroundColor: "#FF6F61",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginVertical: 10,
    width: "80%",
  },
  buttonText: {
    color: "#FFF",
    fontSize: 18,
  },
  footerText: {
    textAlign: "center",
    color: "#FFF",
    marginTop: 20,
  },
  link: {
    textDecorationLine: "underline",
    color: "#FFF",
  },
  contactUs: {
    color: "#FFF",
    marginTop: 10,
    textDecorationLine: "underline",
  },
  settingsIcon: {
    position: "absolute",
    top: 50,
    right: 10,
    zIndex: 1,
    padding: 5,
  },
});

export default HomeScreen;
