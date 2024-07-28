import React, { useEffect, useState } from "react";
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
import AsyncStorage from "@react-native-async-storage/async-storage";
import { MaterialIcons, Ionicons } from "@expo/vector-icons";

const PlayerList = ({ navigation }) => {
  const [playerList, setPlayerList] = useState([]);
  const [playerName, setPlayerName] = useState("");
  const { height } = useWindowDimensions();

  useEffect(() => {
    AsyncStorage.getItem("playerList").then(function (res) {
      if (!res) {
        return;
      }
      setPlayerList(JSON.parse(res));
    });
  }, []);

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
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.navigate("Home")}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
        </View>
        <Image source={require("../../assets/RAFIX.png")} style={styles.logo} />
        {height >= 800 && (
          <Image
            source={require("../../assets/octavio.png")}
            style={styles.person}
          />
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
          style={[
            styles.button,
            playerList.length < 1 && styles.buttonDisabled,
          ]}
          disabled={playerList.length < 1}
          onPress={() => {
            navigation.navigate("Categories", {
              playerList,
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
  header: {
    flexDirection: "row",
    width: "100%",
    justifyContent: "flex-start",
    position: "absolute",
    top: 40,
    left: 20,
  },
  logo: {
    width: 250,
    height: 65,
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
    fontSize: 18,
    width: "100%",
  },
  player: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
  },
  playerName: {
    color: "#FFF",
    fontSize: 18,
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
