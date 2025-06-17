import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ImageBackground,
  Image,
  Button,
  Modal,
  KeyboardAvoidingView,
  useWindowDimensions,
  Alert,
} from "react-native";
import { generateGame } from "../services";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import Timer from "../components/Timer";
import Passcode from "../components/Passcode";
import Roulette from "../components/Roulette";
import Loading from "../components/Loading";
import TikTokEmbed from "../components/TikTokEmbed";
import cardsInfo from "../util/cardsInfo.json";

const Game = ({ route, navigation }) => {
  const [cards, setCards] = useState([]);
  const [categories, setCategories] = useState([]);
  const [playerList, setPlayerList] = useState([]);
  const [error, setError] = useState(false);
  const [backgroundDictionary, setBackgroundDictionary] = useState({});
  const [currentCard, setCurrentCard] = useState(0);
  const [endGame, setEndGame] = useState(false);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const { height, width } = useWindowDimensions();
  useEffect(() => {
    const fetchData = async () => {
      if (route.params && route.params.selectedCategories) {
        setCategories(route.params.selectedCategories);
        const dictionary = route.params.selectedCategories.reduce(
          (acc, category) => {
            acc[category.PK] = category.backgroundURL;
            return acc;
          },
          {}
        );
        setBackgroundDictionary(dictionary);
        prefetchBackgroundImages(dictionary);
        setPlayerList(route.params.playerList);
        generateGame({
          members: route.params.playerList,
          categoriesIds: route.params.selectedCategories.map(
            (category) => category.PK
          ),
        })
          .then(async (res) => {
            console.log(res);
            setCards(res);
            prefetchCardsImages(res);
            await AsyncStorage.setItem(
              "playerList",
              JSON.stringify(route.params.playerList)
            );
            await AsyncStorage.setItem("lastGame", JSON.stringify(res));
            await AsyncStorage.setItem("currentCard", JSON.stringify(1));
            await AsyncStorage.setItem(
              "selectedCategories",
              JSON.stringify(route.params.selectedCategories)
            );
            setLoading(false);
          })
          .catch((error) => {
            setError("Error al generar el juego");
            console.error("Error fetching game:", error);
          });
      } else {
        const playerListRes = await AsyncStorage.getItem("playerList");
        const lastGameRes = await AsyncStorage.getItem("lastGame");
        const categoriesRes = await AsyncStorage.getItem("selectedCategories");
        const currentCardRes = await AsyncStorage.getItem("currentCard");

        setPlayerList(JSON.parse(playerListRes));
        setCards(JSON.parse(lastGameRes));
        const categoriesData = JSON.parse(categoriesRes);
        setCategories(categoriesData);
        const dictionary = categoriesData.reduce((acc, category) => {
          acc[category.PK] = category.backgroundURL;
          return acc;
        }, {});
        setBackgroundDictionary(dictionary);
        prefetchBackgroundImages(dictionary);
        setCurrentCard(JSON.parse(currentCardRes - 1));
        setLoading(false);
      }
    };

    fetchData();

    return () => {
      setCards([]);
      setCategories([]);
      setPlayerList([]);
      setError(false);
      setBackgroundDictionary({});
      setCurrentCard(0);
      setEndGame(false);
      setLoading(true);
      setModalVisible(false);
    };
  }, [route.params]);

  const handleBackPress = useCallback(() => {
    Alert.alert(
      "Confirmación",
      "¿Seguro que quieres abandonar el juego?",
      [
        {
          text: "Cancelar",
          style: "cancel",
          // No hace nada, se cierra la alerta
        },
        {
          text: "Sí, salir",
          style: "destructive",
          onPress: () => {
            // Navegar solo si confirma
            navigation.navigate("Categories", { playerList });
            // O si prefieres ir a la pantalla anterior en vez de Categories:
            // navigation.goBack();
          },
        },
      ],
      {
        cancelable: true, // Permite cerrar alert tocando fuera en Android
      }
    );
  }, [navigation, playerList]);

  const prefetchBackgroundImages = (dictionary) => {
    Object.values(dictionary).forEach((url) => {
      Image.prefetch(url);
    });
  };

  const prefetchCardsImages = (cards) => {
    cards.forEach((card) => {
      if (card.imageURL) {
        Image.prefetch(card.imageURL);
      }
    });
  };

  const handleNextCard = async () => {
    if (endGame || cards.length === 0) {
      return;
    }
    if (currentCard < cards.length - 1) {
      setCurrentCard(currentCard + 1);
      await AsyncStorage.setItem(
        "currentCard",
        JSON.stringify(currentCard + 1)
      );
    } else {
      setEndGame(true);
    }
  };

  const handlePreviousCard = async () => {
    if (currentCard > 0) {
      setCurrentCard(currentCard - 1);
      await AsyncStorage.setItem(
        "currentCard",
        JSON.stringify(currentCard - 1)
      );
    }
  };

  const renderModalContent = () => {
    console.log("cards[currentCard]", cards[currentCard]);
    const info =
      cardsInfo[cards[currentCard]?.info] ||
      cards[currentCard]?.info ||
      "No hay información disponible";
    return (
      <View style={styles.modalContent}>
        <Text style={styles.modalText}>{info}</Text>
        <Button
          title="Cerrar"
          onPress={() => setModalVisible(false)}
          color="#FF6F61"
        />
      </View>
    );
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding">
      <ImageBackground
        source={
          cards.length > 0 &&
          cards[currentCard] &&
          backgroundDictionary &&
          backgroundDictionary[cards[currentCard].categoryId]
            ? {
                uri: backgroundDictionary[cards[currentCard].categoryId],
              }
            : require("../../assets/background.jpg")
        }
        style={styles.container}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBackPress}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          {cards[currentCard]?.info ? (
            <TouchableOpacity onPress={() => setModalVisible(true)}>
              <Ionicons name="information-circle" size={24} color="white" />
            </TouchableOpacity>
          ) : null}
        </View>

        <TouchableOpacity style={styles.overlay} onPress={handleNextCard}>
          {height > 800 && (
            <Image
              source={require("../../assets/RAFIX.png")}
              style={styles.logo}
            />
          )}
          {error ? (
            <Text style={styles.cardText}>{error}</Text>
          ) : (
            <View style={styles.contentContainer}>
              {cards[currentCard] && !endGame ? (
                <>
                  {cards[currentCard]?.type === "virus" && (
                    <Image
                      source={require("../../assets/newrule.png")}
                      style={styles.newRule}
                    />
                  )}
                  {cards[currentCard]?.type === "virusEnd" && (
                    <Image
                      source={require("../../assets/newruleend.png")}
                      style={styles.newRule}
                    />
                  )}
                  {cards[currentCard]?.type === "passcode" && (
                    <Image
                      source={require("../../assets/passcode.png")}
                      style={styles.passcodeImage}
                    />
                  )}
                  <Text
                    style={{
                      ...styles.cardText,
                      fontSize:
                        !cards[currentCard].tiktokURL &&
                        !cards[currentCard].imageURL &&
                        cards[currentCard].displayText &&
                        cards[currentCard].displayText.length < 200
                          ? 35
                          : 25,
                    }}
                  >
                    {cards[currentCard].displayText}
                  </Text>
                  {cards[currentCard].imageURL && (
                    <Image
                      style={{
                        width: width > 700 ? 350 : "90%",
                        height: height > 700 ? 350 : 250,
                        margin: 25,
                        marginBottom: 0,
                      }}
                      source={{ uri: cards[currentCard].imageURL }}
                    />
                  )}
                  {cards[currentCard].type === "timeout" && (
                    <Timer
                      timeout={cards[currentCard].timeout}
                      cardId={cards[currentCard].displayText}
                    />
                  )}
                  {cards[currentCard].type === "tiktok" && (
                    <TikTokEmbed url={cards[currentCard].tiktokURL} />
                  )}
                  {cards[currentCard].type === "passcode" && (
                    <Passcode
                      passcode={cards[currentCard].passcode}
                      cardId={cards[currentCard].displayText}
                    />
                  )}
                  {cards[currentCard]?.type === "roulette" && (
                    <Roulette
                      players={playerList}
                      cardId={cards[currentCard].displayText}
                      text={cards[currentCard].secondaryText}
                    />
                  )}
                </>
              ) : loading ? (
                <Loading></Loading>
              ) : null}

              {endGame && (
                <View>
                  <Image
                    source={require("../../assets/octamigos.png")}
                    style={{
                      height: 250,
                      width: "100%",
                    }}
                  />
                  <Text style={styles.cardText}>¡Juego terminado!</Text>
                  <TouchableOpacity
                    style={{
                      backgroundColor: "#FF6F61",
                      marginTop: 20,
                      paddingVertical: 10,
                      paddingHorizontal: 20,
                      borderRadius: 5,
                    }}
                    disabled={playerList.length < 1}
                    onPress={async () => {
                      try {
                        await AsyncStorage.removeItem("lastGame");
                        await AsyncStorage.removeItem("categories");
                        await AsyncStorage.removeItem("currentCard");

                        navigation.navigate("Home", {
                          endGame: true,
                        });
                      } catch (e) {
                        console.error(e);
                      }
                    }}
                  >
                    <Text
                      style={{
                        color: "white",
                        fontSize: 18,
                        textAlign: "center",
                      }}
                    >
                      Volver al inicio
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          )}
          <TouchableOpacity
            style={{
              position: "absolute",
              bottom: 20,
              left: 20,
              backgroundColor: "rgba(0, 0, 0, 0.5)",
              padding: 10,
              borderRadius: 5,
            }}
            onPress={handlePreviousCard}
            disabled={currentCard === 0}
          >
            <Ionicons name="play-skip-back" size={24} color="white" />
          </TouchableOpacity>
        </TouchableOpacity>

        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalBackground}>{renderModalContent()}</View>
        </Modal>
      </ImageBackground>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    resizeMode: "cover",
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    padding: 20,
    position: "absolute",
    top: 30,
    zIndex: 1,
  },
  overlay: {
    flex: 1,
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  contentContainer: {
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    padding: 20,
    borderRadius: 10,
    alignItems: "center",
    width: "90%",
  },
  cardText: {
    fontSize: 35,
    fontWeight: "700",
    color: "white",
    textAlign: "center",
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginTop: 20,
  },
  logo: {
    width: 250,
    height: 65,
    marginBottom: 15,
  },
  newRule: {
    width: 300,
    height: 100,
    marginBottom: 20,
  },
  passcodeImage: {
    width: 300,
    height: 140,
    marginBottom: 20,
  },
  modalBackground: {
    flex: 1,
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.8)",
  },
  modalContent: {
    backgroundColor: "black",
    padding: 20,
    borderRadius: 10,
    width: "100%",
    alignItems: "center",
  },
  modalText: {
    color: "white",
    fontSize: 18,
    textAlign: "center",
    marginBottom: 20,
  },
});

export default Game;
