import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  ImageBackground,
  SafeAreaView,
  Dimensions,
} from "react-native";
import { getAllCategories } from "../../src/services";
import { Ionicons } from "@expo/vector-icons";
import Purchases from "react-native-purchases";
import RevenueCatUI, { PAYWALL_RESULT } from "react-native-purchases-ui";

const { width } = Dimensions.get("window");

const CategoryList = ({ route, navigation }) => {
  const [categoryList, setCategoryList] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState({});
  const [isPremiumUser, setIsPremiumUser] = useState(false);

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
          setIsPremiumUser(!!customerInfo.entitlements.active["Pro"]);
        }
        case PAYWALL_RESULT.RESTORED: {
          const customerInfo = await Purchases.getCustomerInfo();
          setIsPremiumUser(!!customerInfo.entitlements.active["Pro"]);
        }
        default:
          return false;
      }
    } catch (error) {
      console.log("Error mostrando el paywall:", error);
    }
  };

  useEffect(() => {
    getAllCategories().then(function (res) {
      setCategoryList(res.sort((a, b) => a.order - b.order));
    });
  }, [route.params.playerList]);

  useEffect(() => {
    async function fetchData() {
      try {
        const customerInfo = await Purchases.getCustomerInfo();
        setIsPremiumUser(!!customerInfo.entitlements.active["Pro"]);
        // setIsPremiumUser(true);
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

  const handleCategoryPress = async (category) => {
    if (category.isPremium && !isPremiumUser) {
      await showPaywall();
      return;
    }
    setSelectedCategories((prevSelectedCategories) => {
      const newSelectedCategories = { ...prevSelectedCategories };
      if (newSelectedCategories[category.name]) {
        delete newSelectedCategories[category.name];
      } else {
        newSelectedCategories[category.name] = category;
      }
      return newSelectedCategories;
    });
  };

  const filteredCategoryList = categoryList.filter((category) => {
    return true;
  });

  const renderCategory = ({ item }) => {
    const isSelected = selectedCategories[item.name];
    return (
      <TouchableOpacity
        style={[styles.category, isSelected && styles.categorySelected]}
        onPress={() => handleCategoryPress(item)}
      >
        <View
          style={[
            styles.categoryImageContainer,
            // item.isPremium && !isPremiumUser && styles.categoryImageLock,
          ]}
        >
          <Image
            source={{ uri: item.avatarURL }}
            style={[
              styles.categoryImage,
              item.isPremium && !isPremiumUser && styles.categoryImageLock,
            ]}
          />
          {item.isPremium && !isPremiumUser && (
            <Image
              source={require("../../assets/lock.png")}
              style={styles.lockImage}
            />
          )}
        </View>
        <Text
          style={[
            styles.categoryName,
            isSelected && styles.categoryNameSelected,
          ]}
        >
          {item.name}
        </Text>
      </TouchableOpacity>
    );
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
            <TouchableOpacity onPress={() => navigation.navigate("Players")}>
              <Ionicons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>
            <Image
              source={require("../../assets/RAFIX.png")}
              style={styles.logo}
            />
            <TouchableOpacity></TouchableOpacity>
          </View>
          <FlatList
            ListHeaderComponent={() => (
              <View>
                {Object.keys(selectedCategories).length === 0 ? (
                  <Text style={styles.title}>Selecciona tus categorías</Text>
                ) : (
                  <Text style={styles.title}>
                    {Object.keys(selectedCategories).length} categorías
                    seleccionadas
                  </Text>
                )}
              </View>
            )}
            data={filteredCategoryList}
            renderItem={renderCategory}
            keyExtractor={(item) => item.name}
            numColumns={2}
            columnWrapperStyle={styles.row}
            contentContainerStyle={styles.contentContainer}
          />
          <TouchableOpacity
            style={[
              styles.button,
              Object.keys(selectedCategories).length === 0 &&
                styles.buttonDisabled,
            ]}
            onPress={() => {
              navigation.navigate("Game", {
                playerList: route.params.playerList,
                selectedCategories: Object.values(selectedCategories),
              });
            }}
            disabled={Object.keys(selectedCategories).length === 0}
          >
            <Text style={styles.buttonText}>JUGAR</Text>
          </TouchableOpacity>
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
  },
  image: {
    opacity: 0.5,
    width: "100%",
    height: "100%",
  },
  container: {
    flex: 1,
    alignItems: "center",
    padding: 20,
    paddingTop: 30,
    paddingBottom: 0,
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
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#FFF",
    marginBottom: 20,
    marginTop: 10,
    textAlign: "center",
  },
  categoriesContainer: {
    width: "100%",
  },
  contentContainer: {},
  row: {
    flex: 1,
    justifyContent: "space-between",
    marginBottom: 25,
  },
  category: {
    backgroundColor: "#3b3939",
    borderRadius: 15,
    padding: 0,
    marginHorizontal: 10,
    alignItems: "center",
    justifyContent: "center",
    borderColor: "#2b2626",
    borderWidth: 5,
  },
  categorySelected: {
    backgroundColor: "#ccb5af",
    borderColor: "#a8553b",
  },
  categoryNameSelected: {
    color: "#a8553b",
  },
  categoryImageContainer: {
    width: "100%",
    minWidth: width > 400 ? 150 : 140,
  },
  categoryImage: {
    height: 140,
    marginTop: -30,
  },
  categoryImageLock: {
    opacity: 0.3,
  },
  lockImage: {
    position: "absolute",
    top: 60,
    right: 5,
    width: 50,
    height: 50,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FFF",
    marginTop: 10,
    textAlign: "center",
  },
  button: {
    backgroundColor: "#0F3F81",
    padding: 15,
    borderRadius: 30,
    alignItems: "center",
    width: "80%",
    marginTop: 20,
    marginBottom: 20,
    borderWidth: 3,
    borderColor: "#FFF",
    alignSelf: "center",
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

export default CategoryList;
