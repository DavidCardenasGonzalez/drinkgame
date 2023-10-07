export const generateGame = (cards, members) => {
  // Elegir aleatoriamente 20 cartas
  const selectedCards = getRandomCards(cards, 20);
  const alternativeCards = [];
  // Mapear las cartas seleccionadas y aplicar las transformaciones necesarias
  const gameCards = selectedCards.map((card, index) => {
    let displayText = card.text;

    if (card.text.includes('{{men}}')) {
      // Reemplazar {{men}} con el nombre de un jugador de género masculino aleatorio
      displayText = replacePlaceholderWithMaleName(card.text, members);
    }

    if (card.text.includes('{{female}}')) {
      // Reemplazar {{female}} con el nombre de un jugador de género femenino aleatorio
      displayText = replacePlaceholderWithFemaleName(card.text, members);
    }

    if (card.type === 'question' || card.type === 'virus') {
      // Agregar una segunda carta si es de tipo "question" o "virus"
      const secondCard = {
        ...card,
        text: card.text2,
        displayText: card.text2,
        order: index + card.duration - 0.1,
      };
      alternativeCards.push(secondCard);
      // selectedCards.splice(selectedCards.indexOf(card) + card.duration, 0, secondCard);
    }

    return { ...card, displayText, order: index };
  });

  return gameCards
  .concat(alternativeCards)
  .sort((a, b) => a.order - b.order);
};

// Función para obtener cartas aleatorias
function getRandomCards(cards, count) {
  const shuffled = cards.sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

// Función para reemplazar {{men}} con un nombre masculino aleatorio
function replacePlaceholderWithMaleName(text, members) {
  const maleMembers = members.filter(member => member.gender === 'male');
  const randomMaleName = maleMembers[Math.floor(Math.random() * maleMembers.length)].name;
  return text.replace('{{men}}', randomMaleName);
}

// Función para reemplazar {{female}} con un nombre femenino aleatorio
function replacePlaceholderWithFemaleName(text, members) {
  const femaleMembers = members.filter(member => member.gender === 'female');
  const randomFemaleName = femaleMembers[Math.floor(Math.random() * femaleMembers.length)].name;
  return text.replace('{{female}}', randomFemaleName);
}
