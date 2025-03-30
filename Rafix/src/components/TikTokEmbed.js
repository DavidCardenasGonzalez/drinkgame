import React from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  Linking,
  TouchableWithoutFeedback,
} from "react-native";
import { WebView } from "react-native-webview";

const TikTokEmbed = ({ url }) => {
  const videoId = url.split("/").pop();
  const htmlContent = `
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body, html {
            margin: 0;
            padding: 0;
            background-color: black;
          }
        </style>
      </head>
      <body>
        <iframe
          width="100%"
          height="100%"
          src="https://www.tiktok.com/player/v1/${videoId}?&music_info=1&description=1&rel=0"
          allow="fullscreen"
          title="TikTok"
          style="background-color: black; border: none;"
        ></iframe>
      </body>
    </html>
  `;

  const openTikTok = () => {
    Linking.openURL(url);
  };

  const handleTouch = (event) => {
    event.stopPropagation();
  };

  return (
    <TouchableWithoutFeedback onPress={handleTouch}>
      <View style={styles.container}>
        <View style={styles.webviewContainer}>
          <WebView
            originWhitelist={["*"]}
            source={{ html: htmlContent }}
            style={styles.webview}
          />
        </View>
        <TouchableOpacity style={styles.button} onPress={openTikTok}>
          <Text style={styles.buttonText}>Abrir en TikTok</Text>
        </TouchableOpacity>
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    // backgroundColor: "black",
  },
  webviewContainer: {
    height: 415,
    width: "100%",
  },
  webview: {
    flex: 1,
  },
  button: {
    backgroundColor: "#000",
    padding: 10,
    marginTop: 10,
    alignItems: "center",
    borderRadius: 8,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    marginTop: 5,
    fontWeight: "bold",
  },
});

export default TikTokEmbed;
