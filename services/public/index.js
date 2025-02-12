import {
  createRouter,
  RouterType,
  Matcher,
} from "lambda-micro";
import { AWSClients, generateGame } from "../common";
import { Configuration, OpenAIApi } from "openai";

const s3 = AWSClients.s3();
const dynamoDB = AWSClients.dynamoDB();
const polly = AWSClients.polly();

const categoryTableName = process.env.CATEGORIES_DB_TABLE;
const cardsTableName = process.env.CARDS_DB_TABLE;

const client = new Configuration({
  apiKey: process.env['OPENAI_API_KEY'],
});
const openai = new OpenAIApi(client);

const getSignedURL = async (picture) => {
  const urlExpirySeconds = 60 * 60 * 24; // One day
  const params = {
    Bucket: process.env.ASSET_BUCKET,
    Key: picture,
    Expires: urlExpirySeconds,
  };
  const signedURL = await s3.getSignedUrlPromise("getObject", params);
  return signedURL;
};

//------------------------------------------------------------------------
// SERVICE FUNCTIONS
//------------------------------------------------------------------------

const getAllCategories = async (request, response) => {
  console.log("getAllCategories");
  const params = {
    TableName: categoryTableName,
    FilterExpression: "#category_status = :status",
    ExpressionAttributeValues: {
      ":status": "active",
    },
    ExpressionAttributeNames: {
      "#category_status": "status",
    },
  };

  try {
    const results = await dynamoDB.scan(params).promise();

    const mappedCategories = await Promise.all(
      results.Items.map(async (category) => {
        const updates = [];
        if (category.avatar) {
          updates.push(
            getSignedURL(category.avatar).then(
              (url) => (category.avatarURL = url)
            )
          );
        }
        if (category.background) {
          updates.push(
            getSignedURL(category.background).then(
              (url) => (category.backgroundURL = url)
            )
          );
        }
        await Promise.all(updates);
        return category;
      })
    );

    return response.output(mappedCategories, 200);
  } catch (error) {
    console.error("Error retrieving categories:", error);
    return response.output({ error: "Error retrieving categories" }, 500);
  }
};

const generateCategoryGame = async (request, response) => {
  const { categoriesIds, members } = JSON.parse(request.event.body);
  let categoriesQuestionsArray = [];

  await Promise.all(
    categoriesIds.map(async (categoryId) => {
      const params = {
        TableName: cardsTableName,
        IndexName: "GSI1",
        KeyConditionExpression: "categoryId = :category_id",
        ExpressionAttributeValues: {
          ":category_id": categoryId,
        },
      };
      console.log(params);
      const results = await dynamoDB.query(params).promise();
      console.log(results);
      console.log("results", results.Items);
      categoriesQuestionsArray.push(results.Items);
      console.log("categoriesQuestionsArray", categoriesQuestionsArray.length);
    })
  );

  console.log("categoriesQuestionsArray end", categoriesQuestionsArray.length);

  const game = generateGame(categoriesQuestionsArray, members);
  const mappedCards = await Promise.all(
    game.map(async (category) => {
      if (category.image1) {
        category.imageURL = await getSignedURL(category.image1);
      }
      return category;
    })
  );

  return response.output(mappedCards, 200);
};

/**
 * generateStoryGame:
 * 1. Lee players y plot del body
 * 2. Llama a ChatGPT (modelo 4.0) para que genere un texto de 10-15min aprox.
 * 3. Convierte el texto a audio en español usando AWS Polly
 * 4. Guarda el .mp3 en un S3 bucket
 * 5. Devuelve la URL firmada para reproducir el audio.
 */
const generateStoryGame = async (request, response) => {
  try {
    const { players, plot } = JSON.parse(request.event.body);

    // 1. Generar la historia con ChatGPT
    // Puedes ajustar el prompt a tu gusto, indicando que quieres
    // una historia de ~10-15 min y que incluya los personajes y la trama.
    const prompt = `
      Crea una historia narrativa en español, que no sobrepase los 2500 caracteres. Incluye a estos personajes con sus notas:
      ${players.map((p, index) => `Personaje ${index + 1}: ${p.name}. Notas: ${p.notes}`).join("\n")}
      Trama: ${plot}

      Asegúrate de que la historia tenga buena coherencia, descripciones y se extienda lo suficiente.
    `;
    console.log("Prompt:", prompt);

    // Llamada a la API de OpenAI para generar el texto (con ChatCompletion)
    // Nota: Ajusta el modelo y los parámetros según tu cuenta y disponibilidad.
    const completion = await openai.createChatCompletion({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "Eres un hábil narrador de historias en español.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 750,
    });

    const story = completion.data.choices[0].message.content;
    console.log("Historia generada:", story);

    // 2. Generar el audio en español con AWS Polly
    const pollyParams = {
      Text: story,
      OutputFormat: "mp3",
      VoiceId: "Lucia", // Cambia la voz a la que prefieras (ej. "Conchita", "Lucia", etc.)
      LanguageCode: "es-ES",
    };

    const pollyResult = await polly.synthesizeSpeech(pollyParams).promise();

    if (!pollyResult.AudioStream) {
      throw new Error("No se obtuvo el AudioStream de Polly");
    }

    // 3. Guardar el audio en S3
    const audioKey = `history-audios/history-${Date.now()}.mp3`;
    await s3
      .putObject({
        Bucket: process.env.ASSET_BUCKET,
        Key: audioKey,
        Body: pollyResult.AudioStream,
        ContentType: "audio/mpeg",
      })
      .promise();

    // 4. Generar un link firmado para reproducir el audio
    const signedURL = await s3.getSignedUrlPromise("getObject", {
      Bucket: process.env.ASSET_BUCKET,
      Key: audioKey,
      Expires: 60 * 60 * 24, // 1 día
    });

    // 5. Responder con la URL
    return response.output(
      {
        message: "Historia generada con éxito",
        audioUrl: signedURL,
      },
      200
    );
  } catch (error) {
    console.error("Error en generateStoryGame:", error);
    return response.output({ error: error.message }, 500);
  }
};

const router = createRouter(RouterType.HTTP_API_V2);
router.add(Matcher.HttpApiV2("GET", "/public/categories/"), getAllCategories);
router.add(Matcher.HttpApiV2("POST", "/public/generateGame"), generateCategoryGame);

// Aquí agregamos la nueva ruta para generar la historia
router.add(
  Matcher.HttpApiV2("POST", "/public/generateStoryGame"),
  generateStoryGame
);

// Lambda Handler
exports.handler = async (event, context) => {
  return router.run(event, context);
};
