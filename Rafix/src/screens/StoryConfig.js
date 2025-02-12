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
  KeyboardAvoidingView,
  SafeAreaView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

const StoryConfig = ({ navigation, route }) => {
  const { height } = useWindowDimensions();
  const { playerList } = route.params;

  const [plot, setPlot] = useState("");
  const [playerDetails, setPlayerDetails] = useState([]);

  useEffect(() => {
    if (playerList) {
      setPlayerDetails(Array(playerList.length).fill(""));
    }
  }, [playerList]);

  const handleContinue = () => {
    navigation.navigate("Story", { plot, playerDetails, playerList });
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <SafeAreaView style={styles.safeArea}>
        <ImageBackground
          source={require("../../assets/background.jpg")}
          style={styles.background}
          imageStyle={styles.image}
        >
          <View style={styles.container}>
            <View style={styles.header}>
              <TouchableOpacity onPress={() => navigation.navigate("Home")}>
                <Ionicons name="arrow-back" size={24} color="white" />
              </TouchableOpacity>
              {height > 600 && (
                <Image
                  source={require("../../assets/RAFIX.png")}
                  style={styles.logo}
                />
              )}
              {/* Se usa un View vacío para ocupar el espacio de un botón en el lado derecho */}
              <View style={{ width: 24 }} />
            </View>

            <View style={styles.formWrapper}>
              <ImageBackground
                source={require("../../assets/wall.jpg")}
                style={styles.formContainer}
                imageStyle={styles.formBackground}
              >
                <View style={{ padding: 20 }}>
                  {/* Campo para la trama */}
                  <TextInput
                    style={[styles.input, { marginBottom: 20 }]}
                    placeholder="Describe brevemente la trama que deseas generar. Si dejas este campo vacío, se asignará una trama aleatoria."
                    placeholderTextColor="#000"
                    value={plot}
                    onChangeText={setPlot}
                    multiline
                  />
                  <FlatList
                    data={playerList}
                    renderItem={({ item, index }) => (
                      <View style={styles.playerDetail}>
                        <Text style={styles.playerName}>{item.name}</Text>
                        <TextInput
                          style={styles.detailInput}
                          placeholder={`Introduce algunos detalles para enriquecer la historia de ${item.name}`}
                          placeholderTextColor="#000"
                          value={playerDetails[index]}
                          onChangeText={(text) => {
                            const newDetails = [...playerDetails];
                            newDetails[index] = text;
                            setPlayerDetails(newDetails);
                          }}
                          multiline
                        />
                      </View>
                    )}
                    keyExtractor={(item, index) => index.toString()}
                  />
                </View>
              </ImageBackground>
            </View>

            <TouchableOpacity style={styles.button} onPress={handleContinue}>
              <Text style={styles.buttonText}>GENERAR HISTORIA</Text>
            </TouchableOpacity>
          </View>
        </ImageBackground>
      </SafeAreaView>
    </KeyboardAvoidingView>
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
    justifyContent: "center",
    padding: 20,
    paddingTop: 30,
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
  formWrapper: {
    width: "100%",
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  formContainer: {
    borderRadius: 10,
    alignItems: "center",
    borderWidth: 10,
    borderColor: "#4d4d4d",
    height: "55%",
    flex: 1,
  },
  formBackground: {
    width: "100%",
    height: "100%",
  },
  input: {
    flex: 1,
    padding: 15,
    fontSize: 18,
    backgroundColor: "#FFF",
    borderRadius: 10,
  },
  playerDetail: {
    marginBottom: 15,
  },
  playerName: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "bold",
  },
  detailInput: {
    padding: 10,
    fontSize: 16,
    backgroundColor: "#FFF",
    borderRadius: 10,
    marginTop: 5,
  },
  button: {
    backgroundColor: "#0F3F81",
    padding: 15,
    borderRadius: 30,
    alignItems: "center",
    width: "80%",
    borderWidth: 3,
    borderColor: "#FFF",
    marginTop: 20,
  },
  buttonText: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default StoryConfig;
