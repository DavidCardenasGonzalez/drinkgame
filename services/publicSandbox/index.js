import { createRouter, RouterType, Matcher, validatePathVariables } from "lambda-micro";
import { AWSClients, generateGame } from "../common";
import { Configuration, OpenAIApi } from "openai";

const s3 = AWSClients.s3();
const dynamoDB = AWSClients.dynamoDB();
const polly = AWSClients.polly();

const categoryTableName = process.env.CATEGORIES_DB_TABLE;
const cardsTableName = process.env.CARDS_DB_TABLE;
const scriptTableName = process.env.SCRIPTS_DB_TABLE;

const client = new Configuration({
  apiKey: process.env['OPENAI_API_KEY'],
});
const openai = new OpenAIApi(client);

const getSignedURL = async (picture) => {
  const urlExpirySeconds = 60 * 60 * 48; // Un día
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

const validateCode = async (request, response) => {
  try {
    const { code } = JSON.parse(request.event.body);
    const ADMIN_CODES = [
      "ADMIN123",
      "OTROADMINCODE"
      // Añade aquí los códigos de admin que desees
    ];
    const PROMO_CODES = [
      "PROMO50",
      "PROMO2025"
      // Añade aquí los códigos de promo
    ];

    let result;
    if (ADMIN_CODES.includes(code.toUpperCase())) {
      result = "admin";
    } else if (PROMO_CODES.includes(code.toUpperCase())) {
      result = "promo";
    } else {
      result = "error";
    }
    return response.output({ result }, 200);
  } catch (error) {
    console.error("Error retrieving categories:", error);
    return response.output({ error: "Error retrieving categories" }, 500);
  }
};


const checkVersion = async (request, response) => {
  try {
    const { version } = JSON.parse(request.event.body);
    const updateAvailable = 1;
    const requestUpdate = 1;
    let result;
    if (version < requestUpdate) {
      result = "updateAvailable";
    } else if (version < updateAvailable) {
      result = "requestUpdate";
    } else {
      result = "noUpdate";
    }
    return response.output({ result }, 200);
  } catch (error) {
    console.error("Error checking version:", error);
    return response.output({ error: "Error checking version" }, 500);
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
    const personajes = players
      .map((p, index) => {
        const notas =
          p.notes && p.notes.trim()
            ? p.notes
            : "usa características originales y creativas";
        return `Personaje ${index + 1}: ${p.name}. Notas: ${notas}.`;
      })
      .sort(() => Math.random() - 0.5)
      .join("\n");
    const trama =
      plot && plot.trim()
        ? plot
        : "Crea una trama original, emocionante y llena de giros inesperados.";
    const prompt = `
    Crea una historia narrativa en español que no supere los 2200 caracteres. La historia debe:
    - Dar un protagonismo equilibrado a todos los personajes.
    - Mencionar los nombres de los personajes frecuentemente.
    - Incluir a los siguientes personajes:
    ${personajes}
    
    Trama: ${trama}
    
    Si alguna información falta (notas o trama), utiliza tu creatividad para completarla, creando detalles originales y distribuyendo a los personajes en un orden aleatorio a lo largo de la narrativa. La historia debe tener buena coherencia, descripciones detalladas y un desarrollo adecuado.
    `;

    console.log("Prompt:", prompt);

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
      temperature: 0.9,
      max_tokens: 650,
    });

    const story = completion.data.choices[0].message.content;
    console.log("Historia generada:", story);

    // 2. Generar el audio en español con AWS Polly
    const pollyParams = {
      Text: story,
      OutputFormat: "mp3",
      VoiceId: "Lupe", // Cambia la voz a la que prefieras (ej. "Conchita", "Lucia", etc.)
      LanguageCode: "es-US",
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

const generateScript = async (request, response) => {
  try {
    const { players, plot, category } = JSON.parse(request.event.body);
    const personajes = players
      .map((p, index) => {
        const notas =
          p.notes && p.notes.trim() ? p.notes : "crea un personaje original";
        return `Personaje ${index + 1}: ${p.name}. Notas: ${notas}.`;
      })
      .join("\n");

    const trama =
      plot && plot.trim() ? plot : "Crea una trama para un guion de teatro.";

    const prompt = `
    Crea un guion de teatro corto en español.
    Que no requiera utilería ni escenografía compleja.
    Utiliza los siguientes personajes:
    ${personajes}
    
    Trama: ${trama}

    Categoría: ${category || "Aleatorio"}
    
    El guion debe incluir diálogos entre personajes, descripciones de escenas y acciones.
    `;

    console.log("Prompt para guion:", prompt);

    const completion = await openai.createChatCompletion({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "Eres un guionista creativo que escribe guiones de teatro en español.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.8,
      max_tokens: 1200,
    });

    const script = completion.data.choices[0].message.content;
    console.log("Guion generado:", script);
    const generateRandomCode = () => {
      const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
      let code = "";
      for (let i = 0; i < 5; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return code;
    };

    const id = generateRandomCode();
    const createdAt = new Date().toISOString();

    // Guardar el objeto en DynamoDB
    const params = {
      TableName: scriptTableName,
      Item: {
        PK: id,
        script: script,
        createdAt: createdAt,
      },
    };

    await dynamoDB.put(params).promise();

    return response.output(
      {
        PK: id,
        script: script,
        createdAt: createdAt,
      },
      200
    );
  } catch (error) {
    console.error("Error en generateScript:", error);
    return response.output({ error: error.message }, 500);
  }
};

const getScript = async (request, response) => {
  try {
    const id = request.pathVariables.id;
    console.log("Buscando guion con ID:", id);
    if (!id) {
      return response.output({ error: "Falta el código de guion" }, 400);
    }

    const params = {
      TableName: scriptTableName,
      Key: { PK: id ? id.toUpperCase() : "" },
    };

    const result = await dynamoDB.get(params).promise();

    if (!result.Item) {
      return response.output({ error: "Guion no encontrado" }, 405);
    }

    return response.output(result.Item, 200);
  } catch (error) {
    console.error("Error en getScript:", error);
    return response.output({ error: error.message }, 500);
  }
};

const router = createRouter(RouterType.HTTP_API_V2);
router.add(
  Matcher.HttpApiV2("GET", "/publicSandbox/categories/"),
  getAllCategories
);
router.add(
  Matcher.HttpApiV2("POST", "/publicSandbox/generateGame"),
  generateCategoryGame
);

router.add(
  Matcher.HttpApiV2("POST", "/publicSandbox/generateStoryGame"),
  generateStoryGame
);

router.add(
  Matcher.HttpApiV2("POST", "/publicSandbox/generateScript"),
  generateScript
);

router.add(
  Matcher.HttpApiV2("GET", "/publicSandbox/script(/:id)"),
  validatePathVariables({
    type: "object",
    properties: {
      id: {
        type: "string",
      },
    },
    additionalProperties: false,
  }),
  getScript
);

router.add(
  Matcher.HttpApiV2("POST", "/publicSandbox/validateCode"),
  validateCode
);

router.add(Matcher.HttpApiV2("POST", "/publicSandbox/version"), checkVersion);

// Lambda Handler
exports.handler = async (event, context) => {
  return router.run(event, context);
};
