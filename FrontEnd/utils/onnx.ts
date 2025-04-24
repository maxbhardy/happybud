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

export async function diagnose_picture (dir: string, image_uri: string, db: SQLite.SQLiteDatabase, plant: string|null): Promise<number|null> {
  // Get timestamp for history ('now')
  const date = new Date();
  
  // Check if model is loaded, and load it if not
  const encoder = await load_model(dir + 'models/encoder.ort');

  // Load image into a tensor
  const inputTensor = await picture.image_to_tensor(image_uri);

  if (!inputTensor) {
    console.log('Cannot convert picture to pixel data');
    return null;
  }

  console.log('Image pixels are loaded into a tensor');

  // Encode image
  const encoded = await run_model(encoder, inputTensor);
  
  // Select plant
  let plantID;
  let plantName;
  let plantModel;
  let row;

  if (plant) {
    plantID = Number(plant);
    
    // Get plant name and model uri
    row = await db.getFirstAsync<{PlantName: string, PlantModelUri: string}>(
      'SELECT PlantName, PlantModelUri FROM Plants WHERE PlantID = ?',
      [plant]
    );

    plantName = row?.PlantName;
    plantModel = dir + 'models/' + row?.PlantModelUri;
  }
  else {
    const plant_decoder = await load_model(dir + 'models/plant_decoder.ort');
    const decoded = await run_model(plant_decoder, encoded);
    console.log(`Plant results: ${decoded.data}`);
    const plantIndex = mathlib.argmax(decoded.data);
    
    row = await db.getFirstAsync<{
      PlantID: number,
      PlantName: string,
      PlantModelUri: string
    }>(
      'SELECT PlantID, PlantName, PlantModelUri FROM Plants WHERE PlantOutputIndex = ?',
      [plantIndex]
    );
    plantID = row?.PlantID;
    plantName = row?.PlantName;
    plantModel = dir + 'models/' + row?.PlantModelUri;

    if (!plantID) {
      console.log('Cannot find the plant ID');
      return null;
    }
  }

  // Diagnose plant
  let plantClass;
  let plantClassCode;

  const disease_decoder = await load_model(plantModel);
  const decoded = await run_model(disease_decoder, encoded);
  const plantClassIndex = mathlib.argmax(decoded.data);
  console.log(decoded.data);

  row = await db.getFirstAsync<{PlantClassID: number, ClassCode: string}>(
    `SELECT PlantClassID, ClassCode FROM PlantClasses
    WHERE PlantID = ? AND PlantClassOutputIndex = ?`,
    [plantID, plantClassIndex]
  );
  plantClass = row?.PlantClassID;
  plantClassCode = row?.ClassCode;

  if (!plantClass) {
    console.log('Cannot find the plant class');
    return null;
  }

  console.log(`Plant ${plantName} (${plantID}) with class ${plantClassCode} (${plantClass})`);

  // Copy picture and thumbnail to local directory
  const filename = `IMG_${date.toISOString()}.jpg`;
  const pictureURI = dir + 'pictures/' + filename;
  await FileSystem.copyAsync({ from: image_uri, to: pictureURI });

  const thumbnail = await picture.create_thumbnail(image_uri);
  const thumbnailURI = dir + 'thumbnails/' + filename;
  await FileSystem.copyAsync({ from: thumbnail.uri, to: thumbnailURI });

  // Insert into Historique
  let historiqueId;
  row = await db.getFirstAsync<{HistoriqueId: number}>(
    `INSERT INTO Historique (PlantID, PlantClassID, Timestamp, PictureURI, ThumbnailURI)
    VALUES (?, ?, DateTime(?), ?, ?)
    RETURNING HistoriqueId`,
    [plantID, plantClass, date.toISOString(), pictureURI, thumbnailURI]
  );
  historiqueId = row?.HistoriqueId;

  if (!historiqueId) {
    console.log('Cannot fetch HistoriqueId');
    return null;
  }

  // Insert into HistoriqueResult
  let statement = await db.prepareAsync(
    `INSERT INTO HistoriqueResult (HistoriqueId, PlantClassID, result)
    VALUES (?1, (SELECT PlantClassID FROM PlantClasses WHERE PlantID = ?2 and PlantClassOutputIndex = ?3), ?4)`
  );
  try {
    for (let i = 0; i < decoded.data.length; i++) {
      const result = await statement.executeAsync(
        [historiqueId, plantID, i, decoded.data[i]]
      );
    }
  }
  finally {
    await statement.finalizeAsync();
  }

  // Display Historique to the console
  const result = await db.getAllAsync<{
    HistoriqueId: number,
    PlantID: number,
    PlantClassID: number,
    Timestamp: string,
    PictureURI: string
  }>(
    'SELECT HistoriqueId, PlantID, PlantClassID, Timestamp, PictureURI FROM Historique'
  );

  for (const row of result) {
    console.log(`${row.HistoriqueId}, ${row.PlantID}, ${row.PlantClassID}, ${row.Timestamp}, ${row.PictureURI}`);
  }

  // Return historiqueid
  return historiqueId;
};