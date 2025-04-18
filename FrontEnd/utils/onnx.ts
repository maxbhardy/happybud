import { Asset } from 'expo-asset';
import * as ort from 'onnxruntime-react-native';

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