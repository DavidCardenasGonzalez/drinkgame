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
import RevenueCatUI, { PAYWALL_RESULT } from "react-native-purchases-ui";

const { width } = Dimensions.get("window");

const CategoryList = ({ route, navigation }) => {
  const [categoryList, setCategoryList] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState({});
  const [isDrinkingFilterActive, setDrinkingFilterActive] = useState(false);
  const [isTalkingFilterActive, setTalkingFilterActive] = useState(false);

  const showPaywall = async () => {
    try {
      await RevenueCatUI.presentPaywall();
    } catch (error) {
      console.log("Error mostrando el paywall:", error);
    }
  };

  useEffect(() => {
    getAllCategories().then(function (res) {
      console.log(res);
      setCategoryList(res.sort((a, b) => a.order - b.order));
    });
  }, [route.params.playerList]);

  const handleCategoryPress = (category) => {
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

  // Filtro de categorías
  const filteredCategoryList = categoryList.filter((category) => {
    if (!isDrinkingFilterActive && !isTalkingFilterActive) return true;
    if (isDrinkingFilterActive && isTalkingFilterActive) return true;
    if (isDrinkingFilterActive) return category.haveAlcohol;
    if (isTalkingFilterActive) return !category.haveAlcohol;
    return false;
  });

  const toggleDrinkingFilter = () => {
    setDrinkingFilterActive((prevState) => !prevState);
  };

  const toggleTalkingFilter = () => {
    setTalkingFilterActive((prevState) => !prevState);
  };

  const renderCategory = ({ item }) => {
    const isSelected = selectedCategories[item.name];
    return (
      <TouchableOpacity
        style={[styles.category, isSelected && styles.categorySelected]}
        onPress={() => handleCategoryPress(item)}
      >
        <View style={styles.categoryImageContainer}>
          <Image
            source={{ uri: item.avatarURL }}
            style={[
              styles.categoryImage,
              item.isPremium && styles.categoryImageLock,
            ]}
          />
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
            <TouchableOpacity
              onPress={() => {
                showPaywall();
              }}
            >
              <Ionicons name="cart-outline" size={24} color="white" />
            </TouchableOpacity>
          </View>
          <View style={styles.filtersContainer}>
            <TouchableOpacity
              style={[
                styles.filterButton,
                isDrinkingFilterActive && styles.filterButtonSelected,
              ]}
              onPress={toggleDrinkingFilter}
            >
              <Ionicons name="beer-outline" size={24} color="white" />
              <Text
                style={[
                  styles.filterButtonText,
                  isDrinkingFilterActive && styles.filterButtonTextSelected,
                ]}
              >
                Beber
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.filterButton,
                isTalkingFilterActive && styles.filterButtonSelected,
              ]}
              onPress={toggleTalkingFilter}
            >
              <Ionicons name="happy-outline" size={24} color="white" />
              <Text
                style={[
                  styles.filterButtonText,
                  isTalkingFilterActive && styles.filterButtonTextSelected,
                ]}
              >
                Platicadito
              </Text>
            </TouchableOpacity>
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
  categoryImageLock: {},
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
  // Estilos para los filtros
  filtersContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginBottom: 20,
  },
  filterButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#3b3939",
    padding: 10,
    borderRadius: 20,
    width: "45%",
    borderColor: "#2b2626",
    borderWidth: 2,
  },
  filterButtonSelected: {
    backgroundColor: "#ccb5af",
    borderColor: "#a8553b",
  },
  filterButtonText: {
    color: "#FFF",
    fontSize: 16,
    marginLeft: 10,
  },
  filterButtonTextSelected: {
    color: "#a8553b",
  },
});

export default CategoryList;
