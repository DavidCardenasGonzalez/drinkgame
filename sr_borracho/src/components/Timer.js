import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";

const Timer = ({ timeout, cardId }) => {
  const [timeLeft, setTimeLeft] = useState(timeout);
  const [isRunning, setIsRunning] = useState(false);
  const [prevCardId, setPrevCardId] = useState(cardId);

  useEffect(() => {
    if (cardId !== prevCardId) {
      setTimeLeft(timeout);
      setIsRunning(false);
      setPrevCardId(cardId);
    }
  }, [cardId, prevCardId, timeout]);

  useEffect(() => {
    let timer;
    if (isRunning && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsRunning(false);
    }
    return () => clearInterval(timer);
  }, [isRunning, timeLeft]);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return seconds < 60
      ? `${seconds}`
      : `${minutes}:${remainingSeconds < 10 ? "0" : ""}${remainingSeconds}`;
  };

  const handleReset = () => {
    setIsRunning(false);
    setTimeLeft(timeout);
  };

  return (
    <View style={styles.timerContainer}>
      <Text style={styles.timerText}>{formatTime(timeLeft)}</Text>
      <View style={styles.buttonContainer}>
        {timeLeft > 0 ? (
          <TouchableOpacity
            style={styles.button}
            onPress={() => setIsRunning(!isRunning)}
          >
            <Text style={styles.buttonText}>
              {isRunning ? "Pausa" : "Empezar"}
            </Text>
          </TouchableOpacity>
        ) : null}
        {timeLeft != timeout || isRunning ? (
          <TouchableOpacity
            style={[styles.button, styles.resetButton]}
            onPress={handleReset}
          >
            <Text style={styles.buttonText}>Reiniciar</Text>
          </TouchableOpacity>
        ) : null}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  timerContainer: {
    alignItems: "center",
    margin: 20,
  },
  timerText: {
    fontSize: 48,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#f4b92b",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
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

export default Timer;
