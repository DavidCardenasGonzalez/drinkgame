import React from "react";
import { View, StyleSheet, Image } from "react-native";

const Loading = () => {
  return (
    <View style={styles.container}>
      <Image
        source={require("../../assets/loading.gif")}
        style={styles.image}
      />
      </View>
  );
};

const styles = StyleSheet.create({
  container: {
    // flex: 1,
    justifyContent: "center",
    alignItems: "center",
    maxHeight: 200,
  },
  image: {
    width: 170, // Ajusta el tamaño según tus necesidades
    height: 170, // Ajusta el tamaño según tus necesidades
  },
  loader: {
    width: 250, // Ajusta el ancho según tus necesidades
    height: 250, // Ajusta la altura según tus necesidades
  },
});

export default Loading;
