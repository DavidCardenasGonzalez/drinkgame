import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
} from "react-native";
import { getAllCategories } from "../../src/services";

const CategoryList = ({ route, navigation }) => {
  const [categoryList, setCategoryList] = useState([]);

  useEffect(() => {
    // Función que hace la llamada al API y actualiza el estado de categoryList
    // const fetchCategories = async () => {
    //   try {
    //     const response = await fetch("https://api.example.com/categories", {
    //       method: "POST",
    //       body: JSON.stringify(route.params.players),
    //       headers: {
    //         "Content-Type": "application/json",
    //       },
    //     });
    //     const categories = await response.json();
    //     setCategoryList(categories);
    //   } catch (error) {
    //     console.error(error);
    //   }
    // };
    // fetchCategories();
    getAllCategories().then(function (res) {
      setCategoryList(res);
    });
    // setCategoryList([
    //   {
    //     name: "Categoria",
    //     description: "Descripcion",
    //     image: "https://picsum.photos/200/300",
    //     isPremium: false,
    //   },
    //   {
    //     name: "Categoria 2",
    //     description: "Descripcion Premium",
    //     image: "https://picsum.photos/200/300",
    //     isPremium: true,
    //   },
    // ]);
  }, [route.params.players]);

  const handleCategoryPress = (category) => {
    navigation.navigate("Play", {
      playersList: route.params.players,
      selectedCategory: category,
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Selecciona la categoria</Text>
      <FlatList
        data={categoryList}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.category}
            onPress={() => handleCategoryPress(item)}
          >
            <View style={styles.categoryImage}>
              {item.isPremium && (
                <View style={styles.lockIconContainer}>
                  <Image
                    source={require("../../assets/lock.png")}
                    style={styles.lockIcon}
                  />
                </View>
              )}
              <Image
                source={{ uri: item.avatarURL }}
                style={
                  item.isPremium
                    ? styles.categoryImageLock
                    : styles.categoryImage
                }
              />
            </View>
            <View style={styles.categoryInfo}>
              <Text style={styles.categoryName}>{item.name}</Text>
              <Text style={styles.categoryDescription}>{item.description}</Text>
            </View>
          </TouchableOpacity>
        )}
        keyExtractor={(item) => item.name}
      />
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
  category: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 10,
    marginHorizontal: 20,
    backgroundColor: "#3b3939",
    borderRadius: 25,
    padding: 10,
  },
  categoryImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  categoryImageLock: {
    width: 100,
    height: 100,
    borderRadius: 50,
    opacity: "0.5",
  },
  lockIconContainer: {
    position: "absolute",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    width: 100,
    height: 100,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 50,
    // opacity: '0.5',
  },
  lockIcon: {
    width: 50,
    height: 50,
    // tintColor: "white",
    zIndex: 10,
  },
  categoryInfo: {
    flex: 1,
    marginLeft: 20,
  },
  categoryName: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#FFF",
  },
  categoryDescription: {
    fontSize: 16,
    color: "#FFF",
  },
});

export default CategoryList;
