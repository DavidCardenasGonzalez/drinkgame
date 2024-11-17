import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableWithoutFeedback,
  TouchableOpacity,
} from "react-native";

const Passcode = ({ passcode, cardId }) => {
  const [inputValues, setInputValues] = useState(
    Array(passcode.length).fill("")
  );
  const [time, setTime] = useState(0);
  const [correct, setCorrect] = useState(false);
  console.log(correct);
  const [timeout, setTimeoutReached] = useState(false);
  const inputsRef = useRef([]);

  // Efecto para incrementar el tiempo cada segundo y detenerse al llegar a 10
  useEffect(() => {
    if (!correct && !timeout) {
      const timer = setInterval(() => {
        setTime((prev) => {
          if (prev + 1 >= 10) {
            clearInterval(timer);
            setTimeoutReached(true);
            // Auto-rellenar las casillas con la respuesta correcta
            setInputValues(passcode.split(""));
          }
          return prev + 1;
        });
      }, 1500);

      return () => clearInterval(timer);
    }
  }, [correct, timeout, passcode]);

  useEffect(() => {
    setTime(0);
    setCorrect(false);
    setTimeoutReached(false);
    setInputValues(Array(passcode.length).fill("")); 
  }, [cardId]);

  // Efecto para verificar si el passcode es correcto
  useEffect(() => {
    if (
      inputValues.join("").toLowerCase() === passcode.toLowerCase() &&
      !timeout
    ) {
      setCorrect(true);
    }
    if (correct || timeout) {
      // Hacer que todas las casillas pierdan el foco
      inputsRef.current.forEach((input) => input && input.blur());
    }
  }, [inputValues, passcode, correct, timeout]);

  const handleChangeText = (value, index) => {
    const updatedInputs = [...inputValues];
    updatedInputs[index] = value;
    setInputValues(updatedInputs);

    if (value && index < passcode.length - 1) {
      inputsRef.current[index + 1].focus();
    }
  };

  const handleTouch = (event) => {
    event.stopPropagation(); // Detener la propagación del toque
  };

  const handleReset = () => {
    setTime(0);
    setCorrect(false);
    setTimeoutReached(false);
  };

  const handleResetForm = () => {
    setInputValues(Array(passcode.length).fill(""));
    setCorrect(false);
    setTimeoutReached(false);
  };

  return (
    <TouchableWithoutFeedback onPress={handleTouch}>
      <View style={styles.container}>
        <Text
          style={{
            ...styles.message,
            color: time % 2 == 0 ? "#cf4b54" : "white",
          }}
        >
          Todos beben {time} segundos
        </Text>
        <View style={styles.passcodeContainer}>
          {passcode.split("").map((char, index) => (
            <TextInput
              key={index}
              ref={(ref) => (inputsRef.current[index] = ref)}
              style={[
                styles.input,
                correct &&
                inputValues[index] &&
                inputValues[index].toLowerCase() === char.toLowerCase()
                  ? styles.correct
                  : timeout
                  ? styles.incorrect
                  : null,
              ]}
              maxLength={1}
              onChangeText={(value) => handleChangeText(value, index)}
              onFocus={() => inputsRef.current[index].clear()}
              value={inputValues[index]}
              editable={!correct && !timeout}
              selectTextOnFocus={!correct && !timeout} // Evitar seleccionar texto si es correcto o si llegó a 10 segundos
            />
          ))}
        </View>
        {correct && !timeout ? (
          <Text style={{ ...styles.message, color: "#4eb85d", marginTop: 20 }}>
            ¡Correcto!
          </Text>
        ) : !timeout ? (
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.button} onPress={handleReset}>
              <Text style={styles.buttonText}>Reiniciar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.resetButton]}
              onPress={handleResetForm}
            >
              <Text style={styles.buttonText}>Borrar todo</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <Text style={{ ...styles.message, color: "#cf4b54", marginTop: 20 }}>
            ¡Se acabó el tiempo!
          </Text>
        )}
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    marginTop: 0,
    marginBottom: 30,
  },
  message: {
    fontSize: 25,
    fontWeight: "700",
    color: "white",
    textAlign: "center",
    marginBottom: 15,
  },
  passcodeContainer: {
    flexDirection: "row",
    justifyContent: "center",
  },
  input: {
    borderWidth: 2,
    borderColor: "white",
    width: 40,
    height: 50,
    textAlign: "center",
    marginHorizontal: 5,
    fontSize: 24,
    borderRadius: 5,
    color: "white",
  },
  correct: {
    borderColor: "#4eb85d",
    backgroundColor: "#4eb85d",
  },
  incorrect: {
    borderColor: "#cf4b54",
    backgroundColor: "#cf4b54",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
  button: {
    backgroundColor: "#0F3F81",
    padding: 10,
    borderRadius: 30,
    alignItems: "center",
    width: 150,
    borderWidth: 2,
    borderColor: "#FFF",
    marginHorizontal: 5,
  },
  buttonText: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "bold",
  },
  resetButton: {
    backgroundColor: "#ca7c68",
  },
});

export default Passcode;
