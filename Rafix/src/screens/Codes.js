import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Switch,
  ImageBackground,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Purchases from "react-native-purchases";
import RevenueCatUI, { PAYWALL_RESULT } from "react-native-purchases-ui";
import {
  validateCode,
  setSandboxMode,
  isSandboxMode,
  deleteCache,
} from "../../src/services";
export default function Codigos({ navigation }) {
  const [codigo, setCodigo] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [showPromoBanner, setShowPromoBanner] = useState(false);
  const [isAdminSectionVisible, setIsAdminSectionVisible] = useState(false);
  const [sandboxEnabled, setSandboxEnabled] = useState(false);

  // Función para mostrar el paywall con RevenueCatUI
  const showPaywall = async () => {
    try {
      const paywallResult = await RevenueCatUI.presentPaywall();
      switch (paywallResult) {
        case PAYWALL_RESULT.PURCHASED: {
          const customerInfo = await Purchases.getCustomerInfo();
          const proEntitlement = customerInfo.entitlements.active["Pro"];
          // Actualiza estados u otros manejos si es necesario
          if (proEntitlement) {
            Alert.alert("Éxito", "Suscripción adquirida correctamente.");
          }
          break;
        }
        case PAYWALL_RESULT.RESTORED: {
          const customerInfo = await Purchases.getCustomerInfo();
          const proEntitlement = customerInfo.entitlements.active["Pro"];
          if (proEntitlement) {
            Alert.alert("Éxito", "Suscripción restaurada correctamente.");
          }
          break;
        }
        case PAYWALL_RESULT.CANCELLED:
        case PAYWALL_RESULT.ERROR:
        case PAYWALL_RESULT.NOT_PRESENTED:
        default:
          // No hacer nada o avisar al usuario
          break;
      }
    } catch (error) {
      console.error("Error mostrando el paywall:", error);
      Alert.alert("Error", "No se pudo mostrar el paywall. Intenta de nuevo.");
    }
  };

  const handleEnviar = async () => {
    // Limpia estados previos
    setErrorMsg("");
    setShowPromoBanner(false);
    setIsAdminSectionVisible(false);
    if (!codigo.trim()) {
      setErrorMsg("Por favor ingresa un código.");
      return;
    }
    setLoading(true);
    try {
      // Llama a tu servicio: ajusta validateCode según tu implementación.
      // Por ejemplo, podría hacer fetch a tu API y devolver { result: "promo" } o solo un string.
      const result = await validateCode(codigo.trim());
      // Si tu servicio devuelve un objeto, ajústalo aquí.
      // Supongamos que validateCode devuelve directamente el string.
      if (result === "error") {
        setErrorMsg("Código no encontrado.");
      } else if (result === "promo") {
        // Mostrar banner y disparar paywall opcionalmente al presionar un botón
        setShowPromoBanner(true);
      } else if (result === "admin") {
        setIsAdminSectionVisible(true);
      } else {
        // Caso inesperado
        console.warn("Respuesta inesperada de validateCode:", result);
        setErrorMsg("Ocurrió un error inesperado. Intenta de nuevo.");
      }
    } catch (e) {
      console.error("Error en validateCode:", e);
      Alert.alert("Error", "No se pudo validar el código. Intenta más tarde.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Verifica si el modo sandbox está habilitado al cargar el componente
    const checkSandboxMode = async () => {
      const isSandbox = await isSandboxMode();
      setSandboxEnabled(isSandbox);
    };
    checkSandboxMode();
  }, []);

  useEffect(() => {
    // Si se activa el modo sandbox, actualiza la configuración de RevenueCat
    const updateSandboxMode = async () => {
      try {
        await setSandboxMode(sandboxEnabled);
        console.log("Modo sandbox actualizado:", sandboxEnabled);
      } catch (error) {
        console.error("Error al actualizar el modo sandbox:", error);
      }
    };
    updateSandboxMode();
  }, [sandboxEnabled]);

  // Render del banner de promo
  const PromoBanner = () => (
    <View style={styles.promoBannerContainer}>
      <Ionicons
        name="pricetag-outline"
        size={28}
        color="#FFF"
        style={styles.promoIcon}
      />
      <View style={styles.promoTextContainer}>
        <Text style={styles.promoTitle}>
          Accede a todas las funciones exclusivas
        </Text>
        <Text style={styles.promoSubtitle}>Obtén pase anual al 50%</Text>
      </View>
      <TouchableOpacity style={styles.promoButton} onPress={showPaywall}>
        <Text style={styles.promoButtonText}>Suscribirme</Text>
      </TouchableOpacity>
    </View>
  );

  // Render de la sección admin con switch
  const AdminSection = () => (
    <View style={styles.adminContainer}>
      <Text style={styles.adminTitle}>Modo Admin</Text>
      <View style={styles.adminRow}>
        <Text style={styles.adminLabel}>Activar modo sandbox:</Text>
        <Switch
          value={sandboxEnabled}
          onValueChange={(value) => setSandboxEnabled(value)}
        />
      </View>
      {sandboxEnabled && (
        <Text style={styles.adminInfoText}>
          El modo sandbox está activado. Aquí podrías habilitar funciones de
          prueba.
        </Text>
      )}
      <TouchableOpacity
        style={styles.sendButton}
        onPress={async () => {
          setLoading(true);
          try {
            await deleteCache();
            Alert.alert("Éxito", "Caché eliminada correctamente.");
          } catch (error) {
            console.error("Error al eliminar caché:", error);
            Alert.alert(
              "Error",
              "No se pudo eliminar la caché. Intenta más tarde."
            );
          } finally {
            setLoading(false);
          }
        }}
        disabled={loading}
      >
        <Text style={styles.sendButtonText}>Eliminar caché</Text>
      </TouchableOpacity>
    </View>
  );

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
        <Text style={styles.title}>Códigos</Text>
      </View>
      <View style={styles.container}>
        <Text style={styles.label}>Ingresa tu código:</Text>
        <TextInput
          style={styles.input}
          placeholder="Código"
          placeholderTextColor="rgba(255,255,255,0.6)"
          value={codigo}
          onChangeText={setCodigo}
          autoCapitalize="none"
          autoCorrect={false}
        />
        {errorMsg ? <Text style={styles.errorText}>{errorMsg}</Text> : null}
        <TouchableOpacity
          style={styles.sendButton}
          onPress={handleEnviar}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.sendButtonText}>Enviar</Text>
          )}
        </TouchableOpacity>

        {/* Mostrar banner promo si aplica */}
        {showPromoBanner && <PromoBanner />}

        {/* Mostrar sección admin si aplica */}
        {isAdminSectionVisible && <AdminSection />}
      </View>
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
    flex: 1,
    padding: 20,
  },
  label: {
    color: "#FFF",
    fontSize: 16,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.6)",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    color: "#FFF",
    marginBottom: 12,
  },
  errorText: {
    color: "#FF6B6B",
    marginBottom: 12,
  },
  sendButton: {
    backgroundColor: "#FFD700",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 20,
  },
  sendButtonText: {
    color: "#000",
    fontSize: 16,
    fontWeight: "bold",
  },
  promoBannerContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFD700",
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
  },
  promoIcon: {
    marginRight: 10,
  },
  promoTextContainer: {
    flex: 1,
  },
  promoTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#000",
  },
  promoSubtitle: {
    fontSize: 14,
    color: "#000",
  },
  promoButton: {
    backgroundColor: "#000",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
  },
  promoButtonText: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "bold",
  },
  adminContainer: {
    backgroundColor: "rgba(255,255,255,0.2)",
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
  },
  adminTitle: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  adminRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  adminLabel: {
    color: "#FFF",
    fontSize: 16,
  },
  adminInfoText: {
    color: "#FFF",
    fontSize: 14,
    marginTop: 10,
    marginBottom: 10,
  },
});
