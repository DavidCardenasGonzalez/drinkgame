import * as React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Platform } from "react-native";
import Purchases from "react-native-purchases";
import HomeScreen from "./src/screens/HomeScreen";
import Players from "./src/screens/Players";
import Categories from "./src/screens/Categories";
import Game from "./src/screens/Game";
import Info from "./src/screens/Info";
import { useEffect } from "react";

const Stack = createNativeStackNavigator();
const APIKeys = {
  apple: "appl_pDJihIGMYuzlJHUtmXocHZHQqyh",
  google: "goog_uxGuFubFANfNRBSQzOvXmHNTqqV",
};

function App() {
  useEffect(() => {
    // Configuración de RevenueCat
    Purchases.setLogLevel(Purchases.LOG_LEVEL.VERBOSE);
    if (Platform.OS === "ios") {
      Purchases.configure({ apiKey: APIKeys.apple });
    } else if (Platform.OS === "android") {
      console.log("Configurando para Android");
      Purchases.configure({ apiKey: APIKeys.google });
    }
    async function fetchData() {
      const customerInfo = await Purchases.getCustomerInfo();
      console.log("customerInfoooo", customerInfo);
      try {
        // const entitlements = await Purchases.getEntitlements();
        // console.log("entitlements", entitlements);
        const offerings = await Purchases.getOfferings();
        console.log("nuevo offerings", offerings);
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

  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Players"
          component={Players}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Categories"
          component={Categories}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Game"
          component={Game}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Info"
          component={Info}
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default App;
