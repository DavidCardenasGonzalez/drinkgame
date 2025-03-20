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
  Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import Purchases from "react-native-purchases";
import RevenueCatUI, { PAYWALL_RESULT } from "react-native-purchases-ui";

const StoryConfig = ({ navigation, route }) => {
  const { height } = useWindowDimensions();
  const { playerList } = route.params;

  const [plot, setPlot] = useState("");
  const [playerDetails, setPlayerDetails] = useState([]);
  const [isPro, setIsPro] = useState(true);
  const [tokens, setTokens] = useState(0);

  const showPaywall = async () => {
    try {
      const paywallResult = await RevenueCatUI.presentPaywall();
      switch (paywallResult) {
        case PAYWALL_RESULT.NOT_PRESENTED:
        case PAYWALL_RESULT.ERROR:
        case PAYWALL_RESULT.CANCELLED:
          return false;
        case PAYWALL_RESULT.PURCHASED: {
          const customerInfo = await Purchases.getCustomerInfo();
          setIsPro(!!customerInfo.entitlements.active["Pro"]);
          break;
        }
        case PAYWALL_RESULT.RESTORED: {
          const customerInfo = await Purchases.getCustomerInfo();
          setIsPro(!!customerInfo.entitlements.active["Pro"]);
          break;
        }
        default:
          return false;
      }
    } catch (error) {
      console.log("Error mostrando el paywall:", error);
    }
  };

  // Inicializar el estado de los detalles de cada jugador
  useEffect(() => {
    if (playerList) {
      setPlayerDetails(Array(playerList.length).fill(""));
    }
  }, [playerList]);

  useEffect(() => {
    async function fetchData() {
      try {
        const customerInfo = await Purchases.getCustomerInfo();
        setIsPro(!!customerInfo.entitlements.active["Pro"]);
      } catch (e) {
        console.log(
          "error",
          e.code,
          e.message,
          e.userCancelled,
          e.backendCode,
          e.details
        );
      }
    }
    fetchData();
  }, []);

  // Función para actualizar el contador de tokens (vidas)
  const updateTokenCount = async () => {
    // Recuperar el historial de generaciones almacenado en AsyncStorage
    const historyRaw = await AsyncStorage.getItem("generationHistory");
    let generationHistory = historyRaw ? JSON.parse(historyRaw) : [];
    const now = new Date();
    const twentyFourHours = 24 * 60 * 60 * 1000;

    // Filtrar las generaciones que sean de las últimas 24 horas
    generationHistory = generationHistory.filter((timestamp) => {
      return now - new Date(timestamp) < twentyFourHours;
    });

    // Actualizar AsyncStorage con el historial filtrado
    await AsyncStorage.setItem(
      "generationHistory",
      JSON.stringify(generationHistory)
    );

    // Definir el máximo de tokens según si es Pro o no
    const maxTokens = isPro ? 10 : 3;
    const usedTokens = generationHistory.length;
    const availableTokens = Math.max(maxTokens - usedTokens, 0);
    setTokens(availableTokens);
  };

  useEffect(() => {
    const init = async () => {
      await updateTokenCount();
    };
    init();
  }, [isPro]);

  const handleContinue = async () => {
    if (tokens <= 0) {
      if (!isPro) {
        showPaywall();
        return;
      }
      Alert.alert(
        "Sin vidas",
        "No tienes vidas disponibles. Espera a que se regeneren en 24 horas."
      );
      return;
    }

    // Registrar la fecha/hora actual de la generación
    const now = new Date().toISOString();
    const historyRaw = await AsyncStorage.getItem("generationHistory");
    let generationHistory = historyRaw ? JSON.parse(historyRaw) : [];
    generationHistory.push(now);
    await AsyncStorage.setItem(
      "generationHistory",
      JSON.stringify(generationHistory)
    );

    // Actualizar el contador de tokens y navegar a la siguiente pantalla
    await updateTokenCount();
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
              <View style={styles.tokenContainer}>
                <Text style={styles.tokenText}>{tokens}</Text>
                <Ionicons name="heart-sharp" size={24} color="red" />
              </View>
            </View>

            <View style={styles.formWrapper}>
              <ImageBackground
                source={require("../../assets/wall.jpg")}
                style={styles.formContainer}
                imageStyle={styles.formBackground}
              >
                <View style={{ padding: 20, flex: 1 }}>
                  <FlatList
                    ListHeaderComponent={
                      <TextInput
                        style={[
                          styles.input,
                          { marginBottom: 20, minHeight: 100, minWidth: "100%" },
                        ]}
                        placeholder="Puedes sugerir alguna trama. Si dejas este campo vacío, se asignará una trama random."
                        placeholderTextColor="#737373"
                        value={plot}
                        onChangeText={setPlot}
                        multiline
                      />
                    }
                    data={playerList}
                    renderItem={({ item, index }) => (
                      <View style={styles.playerDetail}>
                        <Text style={styles.playerName}>{item.name}</Text>
                        <TextInput
                          style={styles.detailInput}
                          placeholder={`Puedes agregar algunos detalles para enriquecer la historia de ${item.name}, puedes dejar este campo vacío si prefieres.`}
                          placeholderTextColor="#737373"
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
                    contentContainerStyle={{ paddingBottom: 20 }}
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
  tokenContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  tokenText: {
    color: "white",
    fontSize: 18,
    marginRight: 5,
    fontWeight: "bold",
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
