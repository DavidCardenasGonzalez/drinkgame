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

const { width } = Dimensions.get("window");

const CategoryList = ({ route, navigation }) => {
  const [categoryList, setCategoryList] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState({});
  useEffect(() => {
    getAllCategories().then(function (res) {
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
          </View>
          <Image
            source={require("../../assets/RAFIX.png")}
            style={styles.logo}
          />
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
            data={categoryList}
            renderItem={renderCategory}
            keyExtractor={(item) => item.name}
            numColumns={2}
            columnWrapperStyle={styles.row}
            contentContainerStyle={styles.contentContainer}
            ListFooterComponent={() => (
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
            )}
          />
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
    justifyContent: "flex-start",
    marginBottom: 10,
  },
  logo: {
    width: 250,
    height: 65,
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFF",
    marginBottom: 20,
    textAlign: "center",
  },
  categoriesContainer: {
    width: "100%",
  },
  contentContainer: {
    // paddingHorizontal: 10,
    // backgroundColor: 'red',
  },
  row: {
    flex: 1,
    justifyContent: "space-between",
    marginBottom: 25,
  },
  category: {
    // flex: 1,
    backgroundColor: "#3b3939",
    borderRadius: 15,
    padding: 0,
    marginHorizontal: 10,
    alignItems: "center",
    justifyContent: "center",
    borderColor: "#2b2626",
    borderWidth: 5,
    // width: '45%',
    // height: 100,
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
    minWidth: width > 400 ? 150: 140,
  },
  categoryImage: {
    height: 140,
    marginTop: -30,
  },
  categoryImageLock: {
    // opacity: 0.5,
  },
  lockIconContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
  },
  lockIcon: {
    width: 40,
    height: 40,
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
