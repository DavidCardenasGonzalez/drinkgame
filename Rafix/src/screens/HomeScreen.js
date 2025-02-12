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
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getAllCategories } from "../../src/services";

function HomeScreen({ route, navigation }) {
  const [showLastGame, setShowLastGame] = useState(false);
  useEffect(() => {
    getAllCategories();
    async function fetchData() {
      const lastGame = await AsyncStorage.getItem("lastGame");
      console.log(lastGame);
      if (lastGame) {
        setShowLastGame(true);
      } else {
        setShowLastGame(false);
      }
    }
    fetchData();
    console.log("HomeScreen mounted");
  }, [route.params]);

  const openInstagram = () => {
    const instagramUrl = 'https://www.instagram.com/rafix.app';
  
    Linking.canOpenURL(instagramUrl)
      .then((supported) => {
        if (supported) {
          Linking.openURL(instagramUrl);
        } else {
          Alert.alert('Error', 'No se pudo abrir Instagram.');
        }
      })
      .catch((err) => console.error('Error al intentar abrir Instagram:', err));
  };

  return (
    <ImageBackground
      source={require("../../assets/background.jpg")}
      style={styles.background}
      imageStyle={styles.image}
    >
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
        <TouchableOpacity onPress={openInstagram}>
          <Text style={styles.contactUs}>Contáctanos</Text>
        </TouchableOpacity>
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
});

export default HomeScreen;
