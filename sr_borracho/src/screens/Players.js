import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
} from "react-native";

const PlayerList = ({ navigation }) => {
  const [playerList, setPlayerList] = useState([
    { name: "playerName", gender: "male" },
  ]);
  const [playerName, setPlayerName] = useState("");

  const addPlayer = () => {
    if (!playerName) {
      return;
    }
    const player = { name: playerName, gender: "male" };
    setPlayerList([...playerList, player]);
    setPlayerName("");
  };

  const changeGender = (index) => {
    const players = [...playerList];
    players[index].gender = players[index].gender == "male" ? "female" : "male";
    setPlayerList(players);
  };

  const deletePlayer = (index) => {
    const players = [...playerList];
    players.splice(index, 1);
    setPlayerList(players);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Agrega a los jugadores</Text>
      <TextInput
        style={styles.input}
        placeholder="Agregar jugador"
        value={playerName}
        onChangeText={(value) => setPlayerName(value)}
        onBlur={addPlayer}
      />
      <FlatList
        data={playerList}
        renderItem={({ item, index }) => (
          <View style={styles.player}>
            <Text style={styles.playerName}>{item.name}</Text>
            <View style={styles.playerOptions}>
              <TouchableOpacity
                style={
                  item.gender == "male" ? styles.maleIcon : styles.femaleIcon
                }
                onPress={() => changeGender(index)}
              >
                <Image
                  source={
                    item.gender == "male"
                      ? require("../../assets/man.png")
                      : require("../../assets/woman.png")
                  }
                  style={styles.genderIcon}
                />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.deleteIcon}
                onPress={() => deletePlayer(index)}
              >
                <Image
                  source={require("../../assets/trash.png")}
                  style={styles.deleteIcon}
                />
              </TouchableOpacity>
            </View>
          </View>
        )}
        keyExtractor={(item, index) => index.toString()}
      />
      <TouchableOpacity style={styles.button} onPress={() => {
         navigation.navigate('Categories', {
          playerList
        });
      }}>
        <Text style={styles.buttonText}>JUGAR</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.gearIcon}
        onPress={() => alert("Engranaje!")}
      >
        <Image
          source={require("../../assets/icon.png")}
          style={styles.gearIcon}
        />
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.starIcon}
        onPress={() => alert("Estrella!")}
      >
        <Image
          source={require("../../assets/icon.png")}
          style={styles.starIcon}
        />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#2E2E2E",
    flex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#FFF",
    margin: 20,
    alignSelf: "center",
  },
  input: {
    backgroundColor: "#FFF",
    margin: 10,
    padding: 10,
    borderRadius: 10,
    height: 60,
    fontSize: 22,
  },
  player: {
    flexDirection: "row",
    alignItems: "center",
    flex: 2,
    justifyContent: "space-between",
    marginVertical: 10,
    padding: 10,
    margin: 10,
    backgroundColor: "#3b3939",
    borderRadius: 25,
  },
  playerOptions: {
    flexDirection: "row",
    alignItems: "right",
  },
  playerName: {
    fontSize: 22,
    fontWeight: 600,
    color: "#FFF",
    marginLeft: 10,
    whiteSpace: "pre-wrap",
    overflowWrap: "break-word",
    wordBreak: "break-all",
  },
  maleIcon: {
    height: 50,
    width: 50,
    backgroundColor: "#0F3F81",
    borderRadius: 10,
    borderColor: "#fff",
    borderWidth: 1,
    marginRight: 20,
  },
  femaleIcon: {
    height: 50,
    width: 50,
    backgroundColor: "#AF1F6E",
    borderRadius: 10,
    borderColor: "#fff",
    borderWidth: 1,
    marginRight: 20,
  },
  genderIcon: {
    height: 40,
    width: 40,
    margin: 4,
    // marginLeft: 30,
  },
  deleteIcon: {
    height: 50,
    width: 50,
    // marginLeft: 30,
  },
  button: {
    backgroundColor: "#0F3F81",
    width: "80%",
    padding: 10,
    borderRadius: 10,
    margin: 10,
    alignSelf: "center",
  },
  buttonText: {
    fontSize: 40,
    fontWeight: "bold",
    color: "#FFF",
    textAlign: "center",
  },
  gearIcon: {
    position: "absolute",
    top: 10,
    left: 10,
    height: 20,
    width: 20,
  },
  starIcon: {
    position: "absolute",
    top: 10,
    right: 10,
    height: 20,
    width: 20,
  },
});

export default PlayerList;
