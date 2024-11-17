import React, { useState } from "react";
import Wheel from "./Wheel";
import { View, Text } from "react-native";

const Roulette = ({ players, text, cardId }) => {
  const [playersOptions, setPlayersOptions] = useState(
    players.map((player) => ({
      option: player.name,
    }))
  );
  const [responseText, setResponseText] = useState("");
  const wheelOptions = {
    rewards: players.map((player) => player.name),
    duration: 5000,
  };

  return (
    playersOptions.length > 0 && (
      <View>
        <Wheel
          options={wheelOptions}
          getWinner={(value, index) => {
            setResponseText(
              text.replace("{{player}}", value)
            );
            console.log("value", value);
            console.log("index", index);
          }}
          cardId={cardId}
        />
          <Text
            style={{
              fontSize: 35,
              fontWeight: "700",
              color: "white",
              textAlign: "center",
            }}
          >
            {responseText}
          </Text>
      </View>
    )
  );
};

export default Roulette;
