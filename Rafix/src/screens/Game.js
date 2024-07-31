import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ImageBackground,
  Image,
  Button,
} from "react-native";
import { generateGame } from "../../src/services";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import Timer from "../components/Timer"; // Import the Timer component
import Loading from "../components/Loading"; // Import the Loading component

const Game = ({ route, navigation }) => {
  const [cards, setCards] = useState([]);
  const [categories, setCategories] = useState([]);
  const [playerList, setPlayerList] = useState([]);
  const [backgroundDictionary, setBackgroundDictionary] = useState({});
  const [currentCard, setCurrentCard] = useState(0);
  const [endGame, setEndGame] = useState(false);
  const [loading, setLoading] = useState(true); // New state for loading

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
        const res = await generateGame({
          members: route.params.playerList,
          categoriesIds: route.params.selectedCategories.map(
            (category) => category.PK
          ),
        });
        setCards(res);
        await AsyncStorage.setItem(
          "playerList",
          JSON.stringify(route.params.playerList)
        );
        await AsyncStorage.setItem("lastGame", JSON.stringify(res));
        await AsyncStorage.setItem(
          "selectedCategories",
          JSON.stringify(route.params.selectedCategories)
        );
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
      }
      setLoading(false);
    };

    fetchData();
  }, [route.params]);

  const prefetchBackgroundImages = (dictionary) => {
    console.log(dictionary);
    Object.values(dictionary).forEach((url) => {
      console.log(dictionary);
      Image.prefetch(url);
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

  // if (loading) {
  //   return <Loading />; // Show loading component when loading
  // }

  return (
    <ImageBackground
      source={
        cards.length > 0 && backgroundDictionary
          ? {
              uri: backgroundDictionary[cards[currentCard].categoryId],
            }
          : require("../../assets/background.jpg")
      }
      style={styles.container}
    >
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() =>
            navigation.navigate("Categories", {
              playerList,
            })
          }
        >
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        {cards[currentCard]?.info && (
          <Ionicons name="information-circle" size={24} color="white" />
        )}
      </View>

      <TouchableOpacity style={styles.overlay} onPress={handleNextCard}>
        <Image source={require("../../assets/RAFIX.png")} style={styles.logo} />
        {loading ? (
          <Loading />
        ) : (
          <View style={styles.contentContainer}>
            {cards[currentCard]?.type === "virus" && (
              <Image
                source={require("../../assets/new-rule.png")}
                style={styles.newRule}
              />
            )}
            {cards[currentCard] && !endGame ? (
              <>
                <Text style={styles.cardText}>
                  {cards[currentCard].displayText}
                </Text>
                {cards[currentCard].imageURL && (
                  <Image
                    style={{ width: "90%", height: 500, margin: 25 }}
                    source={{ uri: cards[currentCard].imageURL }}
                  />
                )}
                {cards[currentCard].timeout && (
                  <Timer
                    timeout={cards[currentCard].timeout}
                    cardId={cards[currentCard].displayText}
                  />
                )}
              </>
            ) : (
              <Loading></Loading>
            )}

            {endGame && (
              <View>
                <Text style={styles.cardText}>¡Juego terminado!</Text>
                <Button
                  title="Volver al inicio"
                  onPress={() => {
                    AsyncStorage.removeItem("lastGame");
                    AsyncStorage.removeItem("categories");
                    AsyncStorage.removeItem("currentCard");
                    navigation.navigate("Home");
                  }}
                ></Button>
              </View>
            )}
          </View>
        )}
      </TouchableOpacity>
    </ImageBackground>
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
    height: 65,
    marginBottom: 20,
  },
});

export default Game;
