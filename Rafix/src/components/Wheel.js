import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  Dimensions,
  Animated,
  TouchableOpacity,
  Text,
  Easing,
} from "react-native";
import Svg, { G, Path, Text as SvgText } from "react-native-svg";
import * as d3Shape from "d3-shape"; // Generar la rueda

const { width } = Dimensions.get("screen");

const WheelOfFortune = ({ options, getWinner, cardId }) => {
  const [winner, setWinner] = useState(null);
  const [wheelPaths, setWheelPaths] = useState([]);
  const [angle, setAngle] = useState(new Animated.Value(0));
  const numberOfSegments = options.rewards.length;
  const angleBySegment = 360 / numberOfSegments;
  const angleOffset = angleBySegment / 2;
  const oneTurn = 360;

  const makeWheel = () => {
    const data = Array.from({ length: numberOfSegments }).fill(1);
    const arcs = d3Shape.pie()(data);
    const colors = options.colors || [
      "#1E90FF", // DodgerBlue
      "#FF4500", // OrangeRed
      "#32CD32", // LimeGreen
      "#8A2BE2", // BlueViolet
      "#FF1493", // DeepPink
      "#FFD700", // Gold
      "#00CED1", // DarkTurquoise
      "#DC143C", // Crimson
      "#FF8C00", // DarkOrange
      "#483D8B", // DarkSlateBlue
    ];
    return arcs.map((arc, index) => {
      const instance = d3Shape
        .arc()
        .padAngle(0.01)
        .outerRadius(width / 2 - 20)
        .innerRadius(50);
      return {
        path: instance(arc),
        color: colors[index % colors.length],
        value: options.rewards[index],
        centroid: instance.centroid(arc),
      };
    });
  };

  useEffect(() => {
    setWheelPaths(makeWheel());
    return () => {
      setWheelPaths([]);
    }
  }, [cardId]);

  const getWinnerIndex = () => {
    const deg = Math.abs(Math.round(angle._value % oneTurn));
    return (
      (numberOfSegments - Math.floor(deg / angleBySegment)) % numberOfSegments
    );
  };

  const spinWheel = () => {
    const duration = options.duration || 5000;
    const winnerIndex = Math.floor(Math.random() * numberOfSegments);
    console.log("winnerIndex", winnerIndex);
    const finalAngle =
      360 * 4 - winnerIndex * angleBySegment - Math.random() * angleBySegment; // 3 vueltas completas + ángulo del ganador
    console.log("finalAngle", finalAngle);
    angle.setValue(0);
    Animated.timing(angle, {
      toValue: finalAngle,
      // toValue: 360,
      duration: duration,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }).start(() => {
      const winnerValue = options.rewards[winnerIndex];
      setWinner(winnerValue);
      if (getWinner) getWinner(winnerValue, winnerIndex);
      // setAngle(new Animated.Value(finalAngle));
    });
  };

  const renderText = (x, y, text, i) => (
    <SvgText
      x={x}
      y={y}
      fill="#fff"
      fontSize={30}
      textAnchor="middle"
      transform={`rotate(${
        (i * oneTurn) / numberOfSegments + angleOffset - 90
      }, ${x}, ${y})`}
    >
      {text}
    </SvgText>
  );

  const renderIndicator = () => (
    <View style={styles.indicatorContainer}>
      <View style={styles.indicatorTriangle} />
    </View>
  );

  return (
    <View style={styles.container}>
      {renderIndicator()}
      <TouchableOpacity onPress={spinWheel} style={styles.spinButton}>
        <Text style={styles.buttonText}>Girar</Text>
      </TouchableOpacity>
      <View style={styles.wheelContainer}>
        <Animated.View
          style={{
            transform: [
              {
                rotate: angle.interpolate({
                  inputRange: [0, oneTurn],
                  outputRange: ["0deg", "360deg"],
                }),
              },
            ],
          }}
        >
          <Svg
            width={width - 40}
            height={width - 40}
            viewBox={`0 0 ${width} ${width}`}
          >
            <G x={width / 2} y={width / 2}>
              {wheelPaths.map((arc, i) => (
                <G key={i}>
                  <Path
                    d={arc.path}
                    fill={winner === arc.value ? "gold" : arc.color} // Destacar ganador
                  />
                  {renderText(...arc.centroid, arc.value, i)}
                </G>
              ))}
            </G>
          </Svg>
        </Animated.View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    alignItems: "center",
  },
  wheelContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  spinButton: {
    backgroundColor: "#4CAF50",
    padding: 15,
    borderRadius: 5,
    marginBottom: 10,
    marginTop: 10,
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  winnerText: {
    marginTop: 20,
    fontSize: 24,
    fontWeight: "bold",
  },
  indicatorContainer: {
    position: "absolute",
    top: 85,
    zIndex: 2,
  },
  indicatorTriangle: {
    width: 0,
    height: 0,
    borderLeftWidth: 10,
    borderRightWidth: 10,
    borderTopWidth: 20,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderTopColor: "black",
  },
});

export default WheelOfFortune;
