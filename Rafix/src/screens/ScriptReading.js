import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  ImageBackground,
  Alert,
  Clipboard,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { generateScript, getScript } from "../services";
import Loading from "../components/Loading";

const ScriptReading = ({ navigation, route }) => {
  const { plot, playerDetails, playerList, category, code } = route.params;
  const [loading, setLoading] = useState(false);
  const [script, setScript] = useState("");
  const [scriptCode, setScriptCode] = useState("");

  useEffect(() => {
    if (code) {
      fetchScriptByCode();
    } else {
      generateScriptFromParams();
    }
  }, []);

  const fetchScriptByCode = async () => {
    setLoading(true);
    try {
      const response = await getScript({ code });
      if (response && response.script) {
        setScript(response.script);
        setScriptCode(code);
      } else {
        Alert.alert("Error", "Guion no encontrado.");
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Error al obtener el guion.");
    } finally {
      setLoading(false);
    }
  };

  const generateScriptFromParams = async () => {
    setLoading(true);
    try {
      // Se mapea playerList y playerDetails para formar el arreglo players
      const players = playerList.map((player, index) => ({
        name: player.name,
        notes: playerDetails[index] || "",
      }));
      const data = { players, plot, category };
      const response = await generateScript(data);
      // Se espera que la respuesta contenga { PK, script, createdAt }
      if (response && response.script) {
        setScript(response.script);
        setScriptCode(response.PK);
      } else {
        Alert.alert("Error", "No se obtuvo el guion generado.");
      }
    } catch (error) {
      console.error("Error al generar el guion:", error);
      Alert.alert("Error", "Error al generar el guion.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopyCode = () => {
    if (scriptCode) {
      Clipboard.setString(scriptCode);
      Alert.alert("Código copiado", "El código ha sido copiado al portapapeles.");
    }
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
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Ionicons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>
            <Image
              source={require("../../assets/RAFIX.png")}
              style={styles.logo}
            />
            <View style={{ width: 24 }} />
          </View>
          {scriptCode ? (
            <View style={styles.codeContainer}>
              <Text style={styles.codeText}>Código: {scriptCode}</Text>
              <TouchableOpacity onPress={handleCopyCode}>
                <Ionicons name="copy-outline" size={24} color="white" />
              </TouchableOpacity>
            </View>
          ) : null}
          {loading ? (
            <Loading />
          ) : (
            <ScrollView style={styles.scriptContainer}>
              <Text style={styles.scriptText}>{script}</Text>
            </ScrollView>
          )}
          <View style={styles.footer}>
            <TouchableOpacity
              style={styles.button}
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.buttonText}>Volver</Text>
            </TouchableOpacity>
          </View>
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
  header: {
    flexDirection: "row",
    width: "100%",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  logo: {
    width: 150,
    height: 35,
    marginBottom: 10,
  },
  scriptContainer: {
    flex: 1,
    width: "100%",
    backgroundColor: "rgba(96, 13, 81, 0.8)",
    padding: 20,
    borderRadius: 20,
    marginBottom: 40,
  },
  codeContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "rgba(96, 13, 81, 0.8)",
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
    width: "100%",
  },
  codeText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  scriptText: {
    color: "white",
    fontSize: 18,
    lineHeight: 24,
  },
  footer: {
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

export default ScriptReading;
