import * as ort from 'onnxruntime-react-native';
import * as ImageManipulator from 'expo-image-manipulator';
import { Skia } from "@shopify/react-native-skia";


export async function crop_square (image_uri: string): Promise<ImageManipulator.ImageResult> {
  // Get context and dimensions of original image
  const context = ImageManipulator.ImageManipulator.manipulate(image_uri);
  const orig_image = await context.renderAsync();
  const width = orig_image.width;
  const height = orig_image.height;

  // Crop image
  const squareSize = Math.min(width, height) * 0.8; // 80% of the smaller dimension
  const crop = {
    originX: (width - squareSize) / 2,
    originY: (height - squareSize) / 2,
    width: squareSize,
    height: squareSize,
  };

  const cropped = await context.crop(crop).renderAsync();

  // Save image
  const result = await cropped.saveAsync(
    { compress: 1, format: ImageManipulator.SaveFormat.JPEG }
  );

  return result;
};


export async function image_to_tensor (pictureUri: string) {
  // Step 1: Apply transformations
  const context = ImageManipulator.ImageManipulator.manipulate(pictureUri);
  const resized = context.resize({ width: 224, height: 224 });
  
  // Step 2: Render the result
  const transformed = await resized.renderAsync();
  const result = await transformed.saveAsync({base64: true});

  if (!result?.base64) {
    console.log('Cannot read base64 values of the provided picture');
    return null;
  }

  // Step 3: Convert to Skia image
  const image = Skia.Image.MakeImageFromEncoded(Skia.Data.fromBase64(result.base64));

  if (!image) {
    console.log('Skia cannot read picture base64 encoding');
    return null;
  }

  // Step 4: Reading pixel values
  const pixelData = image.readPixels();

  if (!pixelData) {
    console.log('Skia cannot read the pixel data from the image');
    return null;
  }

  // Step 4: Convert pixel values to float32 and keep alpha channel
  const RGBAData = new Float32Array(224 * 224 * 4);
  for (let i = 0; i < pixelData.length; i++) {
    RGBAData[i] = pixelData[i];
  }

  // Step 5: Convert to tensor
  console.log('test1')
  const tensor = new ort.Tensor('float32', RGBAData, [224, 224, 4]);
  console.log('test2')

  return tensor
}