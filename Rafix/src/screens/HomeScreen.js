import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Button,
  Image,
  ImageBackground,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getAllCategories } from "../../src/services";

function HomeScreen({ navigation }) {
  const [showLastGame, setShowLastGame] = useState(false);

  useEffect(() => {
    getAllCategories();
    async function fetchData() {
      const lastGame = await AsyncStorage.getItem("lastGame");
      console.log("lastGame", lastGame);
      if (lastGame) {
        setShowLastGame(true);
      }
    }
    fetchData();
  }, []);

  return (
    <ImageBackground
      source={require("../../assets/background.jpg")}
      style={styles.background}
      imageStyle={styles.image}
    >
      <View style={styles.container}>
        <Image source={require("../../assets/RAFIX.png")} style={styles.logo} />
        <Image source={require("../../assets/octavio.png")} style={styles.person} />
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate("Players")}
        >
          <Text style={styles.buttonText}>Nuevo juego</Text>
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
          <Text style={styles.link}> Términos de Servicio</Text> y
          <Text style={styles.link}> Política de Privacidad</Text>
        </Text>
        <TouchableOpacity
          onPress={() => {
            /* Handle contact us */
          }}
        >
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
  },
  contactUs: {
    color: "#FFF",
    marginTop: 10,
    textDecorationLine: "underline",
  },
});

export default HomeScreen;
