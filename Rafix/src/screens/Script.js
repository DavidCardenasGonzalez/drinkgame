import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ImageBackground,
  Image,
  SafeAreaView,
  TextInput,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

function Script({ route, navigation }) {
  const [code, setCode] = useState("");

  const handleCodeSubmit = () => {
    if (code.length !== 5) {
      Alert.alert("Error", "El código debe contener 5 caracteres.");
      return;
    }
    navigation.navigate("ScriptReading", { code });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ImageBackground
        source={require("../../assets/background.jpg")}
        style={styles.background}
        imageStyle={styles.image}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Image
            source={require("../../assets/RAFIX.png")}
            style={styles.logo}
          />
          <View style={{ width: 24 }} />
        </View>
        <ScrollView contentContainerStyle={styles.container}>
          <TouchableOpacity
            style={styles.button}
            onPress={() => navigation.navigate("PlayersScript")}
          >
            <Text style={styles.buttonText}>Crear nuevo libreto</Text>
          </TouchableOpacity>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Tengo un código</Text>
            <TextInput
              style={styles.input}
              value={code}
              onChangeText={setCode}
              maxLength={5}
              placeholder="Ingresa código"
              placeholderTextColor="#ccc"
            />
            <TouchableOpacity style={styles.button} onPress={handleCodeSubmit}>
              <Text style={styles.buttonText}>Buscar Guion</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </ImageBackground>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "black",
  },
  background: {
    flex: 1,
    resizeMode: "cover",
    backgroundColor: "black",
  },
  image: { opacity: 0.5, width: "100%", height: "100%" },
  header: {
    flexDirection: "row",
    width: "100%",
    justifyContent: "space-between",
    marginBottom: 10,
    paddingHorizontal: 20,
  },
  logo: {
    width: 150,
    height: 35,
    marginBottom: 10,
  },
  container: {
    flexGrow: 1,
    alignItems: "center",
    padding: 20,
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
  inputContainer: {
    width: "90%",
    backgroundColor: "rgba(96, 13, 81, 0.8)",
    padding: 20,
    borderRadius: 20,
    marginTop: 20,
    alignItems: "center",
  },
  label: {
    color: "#FFF",
    fontSize: 16,
    marginBottom: 10,
  },
  input: {
    width: "100%",
    backgroundColor: "#FFF",
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 10,
    fontSize: 16,
    color: "#000",
    marginBottom: 10,
  },
});

export default Script;
