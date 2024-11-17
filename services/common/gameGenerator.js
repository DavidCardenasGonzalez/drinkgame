export const generateGame = (cardsArray, members) => {
  const selectedCards = distributeObjects(cardsArray, 100);
  const alternativeCards = [];
  const gameCards = selectedCards.map((card, index) => {
    let displayText = card.text;
    let alternativeCardDisplayText = card.text2;
    if (card.text.includes("{{player}}")) {
      let replaceResponse = replacePlaceholderWithPlayerName(
        displayText,
        members,
        "{{player}}"
      );
      displayText = replaceResponse.text;
      if (alternativeCardDisplayText) {
        alternativeCardDisplayText = alternativeCardDisplayText.replace(
          "{{player}}",
          replaceResponse.playerName
        );
      }
    }

    if (card.text.includes("{{player2}}")) {
      // Reemplazar {{player}} con el nombre de un jugador de género femenino aleatorio
      let replaceResponse = replacePlaceholderWithPlayerName(
        displayText,
        members,
        "{{player2}}"
      );
      displayText = replaceResponse.text;
      if (alternativeCardDisplayText) {
        alternativeCardDisplayText = alternativeCardDisplayText.replace(
          "{{player2}}",
          replaceResponse.playerName
        );
      }
    }

    if (card.type === "question" || card.type === "virus") {
      const secondCard = {
        ...card,
        type: card.type === "virus" ? "virusEnd" : card.type,
        text: card.text2,
        displayText: alternativeCardDisplayText,
        image1: card.image2,
        order: index + card.duration - 0.1,
      };
      alternativeCards.push(secondCard);
    }

    return { ...card, displayText, order: index };
  });

  return gameCards.concat(alternativeCards).sort((a, b) => a.order - b.order);
};

function getRandomCards(cards, count) {
  for (let i = cards.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [cards[i], cards[j]] = [cards[j], cards[i]];
  }
  for (let i = cards.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [cards[i], cards[j]] = [cards[j], cards[i]];
  }
  // Devolver el número especificado de cartas
  return cards.slice(0, count);
}

function replacePlaceholderWithPlayerName(text, members, placeholder) {
  const availableMembers = members.filter(
    (member) => !text.includes(member.name)
  );
  const randomName =
    availableMembers[Math.floor(Math.random() * availableMembers.length)].name;

  while (text.includes(placeholder)) {
    text = text.replace(placeholder, randomName);
  }

  return {
    text,
    playerName: randomName,
  };
}

const distributeObjects = (arrayOfArrays, targetLength) => {
  const avgObjectsPerArray = Math.ceil(targetLength / arrayOfArrays.length);
  let result = [];
  for (let array of arrayOfArrays) {
    result = [...result, ...getRandomCards(array, avgObjectsPerArray)];
  }

  return getRandomCards(result, result.length);
};
