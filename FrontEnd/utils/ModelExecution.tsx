import ort from 'onnxruntime-react-native';
import pixelPng from 'react-native-pixel-png';
import pixelUtil from 'react-native-pixel-util';


export async function load_and_resize_png(img_path:string) {

    var images = await pixelPng.parse(img_path);
        
    var imageData= images[0]
    console.log(imageData.data)

    const newImageData = pixelUtil.resizeImageDatas(
        imageData,
        224,
        224,
        'nearest-neighbor',
    );
    console.log(newImageData.data);
    var floatArray = new Float32Array(newImageData.data);
    return floatArray;

}

export async function modelPredict(array: any): Promise<any> {
    // 1. Convert image to tensor
    const imageTensor = await arrayToTensor(array, [224, 224, 3]);
    // 2. Run model
    const predictions = await runModel(imageTensor);
    // 3. Find class with highest probability
    var result = argmax(predictions);

    return result;
}

export async function arrayToTensor(float32Data: any, dims: any): Promise<ort.Tensor> {
    const inputTensor = new ort.Tensor("float32", float32Data, dims);
    
    return inputTensor
}

export async function runModel(imageTensor: any): Promise<any> {
    // Create session and set options. See the docs here for more options: 
    //https://onnxruntime.ai/docs/api/js/interfaces/InferenceSession.SessionOptions.html#graphOptimizationLevel
    const session = await ort.InferenceSession.create("../assets/models/tomato_model_2025_02_28_v2.onnx");
    
    console.log('Inference session created');
    // Run inference and get results.
    var results =  await runInference(session, imageTensor);

    return results;
}

// From https://www.webdevtutor.net/blog/typescript-argmax
function argmax(arr: number[]): number {
    if (arr.length === 0) {
        throw new Error("Array is empty");
    }

    const maxIndex = arr.reduce((maxIndex, currentValue, currentIndex, array) => 
        currentValue > array[maxIndex] ? currentIndex : maxIndex, 0);

    if (arr.filter(num => num === arr[maxIndex]).length > 1) {
        throw new Error("Multiple maximum values found");
    }

    return maxIndex;
}


async function runInference(session: ort.InferenceSession, imageTensor: any): Promise<any> {
    // create feeds with the input name from model export and the preprocessed data.
    const feeds: Record<string, ort.Tensor> = {};
    feeds[session.inputNames[0]] = imageTensor;

    // Run the session inference.
    const outputData = await session.run(feeds);

    // Get output results with the output name from the model export.
    const output = outputData[session.outputNames[0]];
    
    return output;
}
  