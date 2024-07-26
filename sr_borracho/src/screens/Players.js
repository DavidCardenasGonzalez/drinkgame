import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ImageBackground,
  Image,
  useWindowDimensions,
} from "react-native";
import { MaterialIcons } from '@expo/vector-icons'; // Asegúrate de tener @expo/vector-icons instalado

const PlayerList = ({ navigation }) => {
  const [playerList, setPlayerList] = useState([
    { name: "Octavio" },
    { name: "Rafael" },
  ]);
  const [playerName, setPlayerName] = useState("");
  const { height } = useWindowDimensions();

  const addPlayer = () => {
    if (!playerName) {
      return;
    }
    const player = { name: playerName };
    setPlayerList([...playerList, player]);
    setPlayerName("");
  };

  const deletePlayer = (index) => {
    const players = [...playerList];
    players.splice(index, 1);
    setPlayerList(players);
  };

  return (
    <ImageBackground
      source={require("../../assets/background.jpg")}
      style={styles.background}
      imageStyle={{ opacity: 0.5 }}
    >
      <View style={styles.container}>
        <Image source={require("../../assets/RAFIX.png")} style={styles.logo} />
        {height >= 800 && (
          <Image source={require("../../assets/octavio.png")} style={styles.person} />
        )}
        <ImageBackground
          source={require("../../assets/wall.jpg")}
          style={styles.formContainer}
          imageStyle={styles.formBackground}
        >
          <Text style={styles.title}>Agrega a los jugadores</Text>
          <TextInput
            style={styles.input}
            placeholder="Agregar jugador"
            value={playerName}
            onChangeText={(value) => setPlayerName(value)}
            onSubmitEditing={addPlayer}
          />
          <FlatList
            data={playerList}
            renderItem={({ item, index }) => (
              <View style={styles.player}>
                <Text style={styles.playerName}>{item.name}</Text>
                <TouchableOpacity
                  style={styles.deleteIcon}
                  onPress={() => deletePlayer(index)}
                >
                  <MaterialIcons name="close" size={22} color="white" />
                </TouchableOpacity>
              </View>
            )}
            keyExtractor={(item, index) => index.toString()}
          />
        </ImageBackground>
        <TouchableOpacity
          // style={styles.button}
          style={[styles.button, playerList.length < 1 && styles.buttonDisabled]}
          disabled={playerList.length < 1}
          onPress={() => {
            navigation.navigate('Categories', {
              playerList
            });
          }}
        >
          <Text style={styles.buttonText}>JUGAR</Text>
        </TouchableOpacity>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    resizeMode: "cover",
    backgroundColor: "black",
  },
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  logo: {
    width: 250,
    height: 65,
    // marginBottom: 20,
  },
  person: {
    width: 230,
    height: 230,
    marginBottom: -20,
  },
  formContainer: {
    borderRadius: 10,
    padding: 20,
    height: "55%",
    marginBottom: 20,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 10,
    borderColor: "#4d4d4d",
    // shadowColor: "#888888",
    // shadowOffset: { width: 10, height: 10 },
    // shadowOpacity: 1,
    // shadowRadius: 5,
  },
  formBackground: {
    borderRadius: 10,
    height: "100%",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFF",
    marginBottom: 20,
    textAlign: "center",
  },
  input: {
    backgroundColor: "#FFF",
    padding: 15,
    borderRadius: 10,
    // marginBottom: 20,
    fontSize: 18,
    width: "100%",
  },
  player: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    minWidth: 100,
    // marginBottom: 10,
  },
  playerName: {
    color: "#FFF",
    fontSize: 18,
    fontFamily: "ChalkboardSE-Regular", // Necesitarás una fuente de tiza instalada
  },
  deleteIcon: {
    padding: 10,
  },
  button: {
    backgroundColor: "#0F3F81",
    padding: 15,
    borderRadius: 30,
    alignItems: "center",
    width: "80%",
    // marginTop: 20,
    borderWidth: 3,
    borderColor: "#FFF",
  },
  buttonText: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "bold",
  },
  buttonDisabled: {
    opacity: 0.5,
  },
});

export default PlayerList;
