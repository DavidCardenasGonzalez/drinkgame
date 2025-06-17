import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ImageBackground,
  Linking,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Purchases from "react-native-purchases";
import RevenueCatUI, { PAYWALL_RESULT } from "react-native-purchases-ui";

// Componente auxiliar para los items de la lista
const ListItem = ({ onPress, iconName, text }) => (
  <TouchableOpacity onPress={onPress} style={styles.listItem}>
    <Ionicons
      name={iconName}
      size={24}
      color="#FFF"
      style={styles.listItemIcon}
    />
    <Text style={styles.listItemText}>{text}</Text>
  </TouchableOpacity>
);

function Settings({ route, navigation }) {
  const [isPro, setIsPro] = useState(false);
  const [proInfo, setProInfo] = useState(null);
  const [proPackageInfo, setProPackageInfo] = useState({
    product: { priceString: "", currencyCode: "" },
    packageType: "",
  });
  const [availablePackages, setAvailablePackages] = useState([]);

  const openInstagram = () => {
    const instagramUrl = "https://www.instagram.com/rafix.app";
    Linking.canOpenURL(instagramUrl)
      .then((supported) => {
        if (supported) {
          Linking.openURL(instagramUrl);
        } else {
          Alert.alert("Error", "No se pudo abrir Instagram.");
        }
      })
      .catch((err) => console.error("Error al intentar abrir Instagram:", err));
  };

  useEffect(() => {
    async function fetchData() {
      try {
        // Obtener información del usuario
        const customerInfo = await Purchases.getCustomerInfo();
        const proEntitlement = customerInfo.entitlements.active["Pro"];
        setIsPro(!!proEntitlement);
        setProInfo(proEntitlement);
        console.log("Pro info:", proEntitlement);

        // Obtener offerings y packages disponibles
        const offerings = await Purchases.getOfferings();
        if (offerings.all && offerings.all["All acess"]) {
          setAvailablePackages(offerings.all["All acess"].availablePackages);
          console.log(
            "Available packages:",
            offerings.all["All acess"].availablePackages
          );
          if (proEntitlement) {
            const proPackage = offerings.all[
              "All acess"
            ].availablePackages.find(
              (pkg) =>
                pkg.product.identifier === proEntitlement.productIdentifier
            );
            if (proPackage) {
              setProPackageInfo(proPackage);
            }
          }
        }
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
          const proEntitlement = customerInfo.entitlements.active["Pro"];
          setIsPro(!!proEntitlement);
          setProInfo(proEntitlement);
          if (proEntitlement) {
            const proPackage = availablePackages.find(
              (pkg) =>
                pkg.product.identifier === proEntitlement.productIdentifier
            );
            if (proPackage) {
              setProPackageInfo(proPackage);
            }
          }
          break;
        }
        case PAYWALL_RESULT.RESTORED: {
          const customerInfo = await Purchases.getCustomerInfo();
          const proEntitlement = customerInfo.entitlements.active["Pro"];
          setIsPro(!!proEntitlement);
          setProInfo(proEntitlement);
          if (proEntitlement) {
            const proPackage = availablePackages.find(
              (pkg) =>
                pkg.product.identifier === proEntitlement.productIdentifier
            );
            if (proPackage) {
              setProPackageInfo(proPackage);
            }
          }
          break;
        }
        default:
          return false;
      }
    } catch (error) {
      console.log("Error mostrando el paywall:", error);
    }
  };

  // Función para restaurar compras
  const restorePurchases = async () => {
    try {
      const customerInfo = await Purchases.restorePurchases();
      const proEntitlement = customerInfo.entitlements.active["Pro"];
      setIsPro(!!proEntitlement);
      setProInfo(proEntitlement);
      if (proEntitlement) {
        const proPackage = availablePackages.find(
          (pkg) => pkg.product.identifier === proEntitlement.productIdentifier
        );
        if (proPackage) {
          setProPackageInfo(proPackage);
        }
      }
      Alert.alert(
        "Restaurar Compras",
        "Las compras se han restaurado exitosamente."
      );
    } catch (error) {
      console.log("Error restaurando compras:", error);
      Alert.alert(
        "Error",
        "No se pudieron restaurar las compras, inténtalo de nuevo."
      );
    }
  };

  const getProductPeriodSpanish = (packageType) => {
    if (!packageType) return "";
    switch (packageType) {
      case "ANNUAL":
        return "Anual";
      case "MONTHLY":
        return "Mensual";
      case "WEEKLY":
        return "Semanal";
      case "LIFETIME":
        return "Vitalicio";
      default:
        return "Desconocido";
    }
  };

  return (
    <ImageBackground
      source={require("../../assets/background.jpg")}
      style={styles.background}
      imageStyle={styles.image}
    >
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.title}>Ajustes</Text>
      </View>
      <ScrollView contentContainerStyle={styles.container}>
        {isPro ? (
          <Text
            style={{
              color: "#FFD700",
              fontSize: 30,
              fontWeight: "bold",
              textAlign: "center",
              marginBottom: 20,
            }}
          >
            Suscripción Premium
          </Text>
        ) : (
          <TouchableOpacity onPress={showPaywall}>
            <View style={styles.premiumBanner}>
              <Ionicons
                name="heart-circle-sharp"
                size={30}
                color="#FFD700"
                style={styles.premiumIcon}
              />
              <View style={styles.premiumTextContainer}>
                <Text style={styles.premiumBannerTitle}>
                  Accede a todas las funciones exclusivas
                </Text>
                <Text style={styles.premiumBannerSubtitle}>
                  Suscríbete a Premium
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        )}

        {/* Información detallada de la suscripción Pro */}
        {proInfo && (
          <View style={styles.subscriptionInfoContainer}>
            <Text style={styles.subscriptionTitle}>
              Información de Suscripción Pro
            </Text>
            <Text style={styles.subscriptionDetail}>
              Renovación Automática:{" "}
              {new Date(proInfo.expirationDate).toLocaleDateString()}
            </Text>
            <Text style={styles.subscriptionDetail}>
              Periodo: {getProductPeriodSpanish(proPackageInfo.packageType)}
            </Text>
            <Text style={styles.subscriptionDetail}>
              Precio: {proPackageInfo.product.priceString}{" "}
              {proPackageInfo.product.currencyCode}
            </Text>
          </View>
        )}

        <ListItem
          onPress={() =>
            Linking.openURL(
              "https://rafixapp.wordpress.com/terminos-y-condiciones/"
            )
          }
          iconName="document-text-outline"
          text="Términos de Uso"
        />
        <ListItem
          onPress={() =>
            Linking.openURL(
              "https://rafixapp.wordpress.com/politica-de-privacidad/"
            )
          }
          iconName="shield-checkmark-outline"
          text="Política de Privacidad"
        />
        <ListItem
          onPress={openInstagram}
          iconName="chatbubble-ellipses-outline"
          text="Contáctanos"
        />
        <ListItem
          onPress={() => navigation.navigate("Codes")}
          iconName="pricetags-outline"
          text="Tengo un código"
        />
        <ListItem
          onPress={restorePurchases}
          iconName="refresh"
          text="Restaurar Compras"
        />
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
  image: {
    opacity: 0.5,
    width: "100%",
    height: "100%",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 70,
    paddingHorizontal: 10,
  },
  backButton: {
    marginRight: 10,
  },
  title: {
    color: "#FFF",
    fontSize: 20,
    fontWeight: "bold",
  },
  container: {
    padding: 20,
    marginVertical: 20,
  },
  text: {
    color: "#FFF",
    fontSize: 16,
    textAlign: "center",
    marginBottom: 20,
  },
  premiumBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    padding: 20,
    borderRadius: 10,
    marginBottom: 20,
  },
  premiumIcon: {
    marginRight: 15,
  },
  premiumTextContainer: {
    flex: 1,
  },
  premiumBannerTitle: {
    color: "#000",
    fontSize: 18,
    fontWeight: "bold",
  },
  premiumBannerSubtitle: {
    color: "#000",
    fontSize: 16,
  },
  listItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.1)",
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
  },
  listItemIcon: {
    marginRight: 15,
  },
  listItemText: {
    color: "#FFF",
    fontSize: 16,
  },
  subscriptionInfoContainer: {
    backgroundColor: "rgba(255,255,255,0.2)",
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
  },
  subscriptionTitle: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  subscriptionDetail: {
    color: "#FFF",
    fontSize: 16,
    marginBottom: 5,
  },
  offeringsContainer: {
    backgroundColor: "rgba(255,255,255,0.2)",
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
  },
  offeringsTitle: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  offeringItem: {
    marginBottom: 10,
  },
  offeringTitle: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  offeringDetail: {
    color: "#FFF",
    fontSize: 14,
  },
});

export default Settings;
