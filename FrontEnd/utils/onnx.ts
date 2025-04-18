import { Asset } from 'expo-asset';
import * as SQLite from 'expo-sqlite';
import * as FileSystem from 'expo-file-system';
import * as ort from 'onnxruntime-react-native';

import * as picture from './picture'
import * as mathlib from './mathlib'

export async function load_model (model_asset: any) {
  try {
    const assets = await Asset.loadAsync([model_asset]);
    const modelUri = assets[0]?.localUri;

    let model = await ort.InferenceSession.create(modelUri);
    console.log('Model is loaded');
    return model;
  }
  catch (e) {
    console.log('Cannot load the model', `${e}`);
    throw e;
  }
};

export async function run_model (model: any, inputTensor: any) {
  try {
    // Prepare model input
    const feeds = { x: inputTensor };

    // Fetch model output
    const fetches = await model.run(feeds);
    const output = fetches[model.outputNames[0]];

    console.log('Model inference has succeeded');
    
    return output
  }
  catch (e) {
    console.log('Model inference has failed', `${e}`);
    throw e;
  }
};

export async function diagnose_picture (dir: string, image_uri: string, db: SQLite.SQLiteDatabase, plant: string|null) {
  // Get timestamp for history ('now')
  const date = new Date();
  
  // Check if model is loaded, and load it if not
  const encoder = await load_model(dir + 'models/encoder.ort');

  // Load image into a tensor
  const inputTensor = await picture.image_to_tensor(image_uri);

  if (!inputTensor) {
    console.log('Cannot convert picture to pixel data');
    return;
  }

  console.log('Image pixels are loaded into a tensor');

  // Encode image
  const encoded = await run_model(encoder, inputTensor);
  
  // Select plant
  let plantID;
  let plantName;
  let plantModel;
  let statement;

  if (plant) {
    plantID = Number(plant);
    
    statement = await db.prepareAsync(
      'SELECT PlantName, PlantModelUri FROM Plants WHERE PlantID = ?'
    );
    try {
      const result = await statement.executeAsync<{PlantName: string, PlantModelUri: string}>([plant]);
      const row = await result.getFirstAsync();
      plantName = row?.PlantName;
      plantModel = dir + 'models/' + row?.PlantModelUri;
    }
    finally {
      await statement.finalizeAsync();
    }
  }
  else {
    const plant_decoder = await load_model(dir + 'models/plant_decoder.ort');
    const decoded = await run_model(plant_decoder, encoded);
    console.log(`Plant results: ${decoded.data}`);
    const plantIndex = mathlib.argmax(decoded.data);
    
    statement = await db.prepareAsync(
      'SELECT PlantID, PlantName, PlantModelUri FROM Plants WHERE PlantOutputIndex = ?'
    );
    try {
      const result = await statement.executeAsync<{PlantID: number, PlantName: string, PlantModelUri: string}>([plantIndex]);
      const row = await result.getFirstAsync();
      plantID = row?.PlantID;
      plantName = row?.PlantName;
      plantModel = dir + 'models/' + row?.PlantModelUri;
    }
    finally {
      await statement.finalizeAsync();
    }

    if (!plantID) {
      console.log('Cannot find the plant ID');
      return;
    }
  }

  // Diagnose plant
  let plantClass;
  let plantClassCode;
  const disease_decoder = await load_model(plantModel);
  const decoded = await run_model(disease_decoder, encoded);
  const plantClassIndex = mathlib.argmax(decoded.data);
  console.log(decoded.data);

  statement = await db.prepareAsync(
    `SELECT PlantClassID, ClassCode FROM PlantClasses
    WHERE PlantID = ? AND PlantClassOutputIndex = ?`
  );
  
  try {
    const result = await statement.executeAsync<{PlantClassID: number, ClassCode: string}>([plantID, plantClassIndex]);
    const row = await result.getFirstAsync();
    plantClass = row?.PlantClassID;
    plantClassCode = row?.ClassCode;
    console.log(plantClass, plantClassCode, plantID, plantClassIndex);
  }
  finally {
    await statement.finalizeAsync();
  }

  if (!plantClass) {
    console.log('Cannot find the plant class');
    return;
  }

  console.log(`Plant ${plantName} with class ${plantClassCode}`);

  // Copy picture and thumbnail to local directory
  const filename = `IMG_${date.toISOString()}.jpg`;
  const pictureURI = dir + 'pictures/' + filename;
  await FileSystem.copyAsync({ from: image_uri, to: pictureURI });

  const thumbnail = await picture.create_thumbnail(image_uri);
  const thumbnailURI = dir + 'thumbnails/' + filename;
  await FileSystem.copyAsync({ from: thumbnail.uri, to: thumbnailURI });

  // Insert into Historique
  let historiqueId;
  statement = await db.prepareAsync(
    `INSERT INTO Historique (PlantID, PlantClassID, Timestamp, PictureURI, ThumbnailURI)
    VALUES (?, ?, DateTime(?), ?, ?)
    RETURNING HistoriqueId`
  );
  try {
    const result = await statement.executeAsync<{HistoriqueId: number}>(
      [plantID, plantClass, date.toISOString(), pictureURI, thumbnailURI]
    );
    historiqueId = result.lastInsertRowId;
  }
  finally {
    await statement.finalizeAsync();
  }

  // Insert into HistoriqueResult
  statement = await db.prepareAsync(
    `INSERT INTO HistoriqueResult (HistoriqueId, PlantClassID, result)
    VALUES (?, ?, ?)`
  );
  try {
    for (let i = 0; i < decoded.data.length; i++) {
      const result = await statement.executeAsync(
        [historiqueId, plantClass, decoded.data[i]]
      );
    }
  }
  finally {
    await statement.finalizeAsync();
  }

  // Display Historique to the console
  statement = await db.prepareAsync(
    'SELECT HistoriqueId, PlantID, PlantClassID, Timestamp, PictureURI FROM Historique'
  );
  try {
    const result = await statement.executeAsync<{HistoriqueId: number, PlantID: Number, PlantClassID: number, Timestamp: string, PictureURI: string}>();
    for await (const row of result) {
      console.log(`${row.HistoriqueId}, ${row.PlantID}, ${row.PlantClassID}, ${row.Timestamp}, ${row.PictureURI}`);
    }
  }
  finally {
    await statement.finalizeAsync();
  }
};