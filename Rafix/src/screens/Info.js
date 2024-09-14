import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ImageBackground } from "react-native";
import { Ionicons } from '@expo/vector-icons';
import info from "../util/info.json";

function Info({ route, navigation }) {
  const { type } = route.params;
  const [content, setContent] = useState("");

  useEffect(() => {
    if (type === "terms") {
      setContent(info.terms);
    } else if (type === "privacy") {
      setContent(info.privacy);
    }
  }, [type]);

  const getTitle = () => {
    if (type === "terms") {
      return "Términos de Servicio";
    } else if (type === "privacy") {
      return "Política de Privacidad";
    }
    return "";
  };

  return (
    <ImageBackground
      source={require("../../assets/background.jpg")}
      style={styles.background}
      imageStyle={styles.image}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.title}>{getTitle()}</Text>
      </View>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.text}>{content}</Text>
      </ScrollView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    resizeMode: "cover",
    backgroundColor: "black",
  },
  image: { opacity: 0.5, width: "100%", height: "100%" },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 70,
    paddingHorizontal: 10,
  },
  backButton: {
    marginRight: 10,
  },
  title: {
    color: "#FFF",
    fontSize: 20,
    fontWeight: 'bold',
  },
  container: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 20,
  },
  text: {
    color: "#FFF",
    fontSize: 16,
  },
});

export default Info;