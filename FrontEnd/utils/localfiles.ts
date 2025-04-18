import * as FileSystem from 'expo-file-system';
import { Asset } from 'expo-asset';

const directories: string[] = ['database', 'models', 'pictures', 'thumbnails'];

const assetFiles: { [key: string]: string} = {
  'database/database.db': require('../assets/database/database.db'),
  'models/encoder.ort': require('../assets/models/encoder.ort'),
  'models/plant_decoder.ort': require('../assets/models/plant_decoder.ort'),
  'models/tomato_decoder.ort': require('../assets/models/tomato_decoder.ort')
};

export async function setupLocalFiles (): Promise<string|null> {
  // Create directories
  for (let i = 0; i < directories.length; i++) {
    const path = FileSystem.documentDirectory + directories[i];
    const pathInfo = await FileSystem.getInfoAsync(path);
    
    try {
      if (!pathInfo.exists) {
        console.log(`Creating directory ${path}`);
        await FileSystem.makeDirectoryAsync(path, { intermediates: true });
      }
    }
    catch (error) {
      console.error('Error creating directory', error);
      throw error;
    }
  }

  // Copy files
  for (const [key, value] of Object.entries(assetFiles)) {
    const file = FileSystem.documentDirectory + key;

    try {
      const fileInfo = await FileSystem.getInfoAsync(file);
      if (!fileInfo.exists) {
        const asset = Asset.fromModule(value);
        await asset.downloadAsync();
        await FileSystem.copyAsync({from: asset.localUri || '', to: file});
        console.log(`File ${file} has been copied with success.`);
      }
    }
    catch (error) {
      console.error('Error copying file', error);
      throw error;
    }
  }
  
  // Return document directory
  return FileSystem.documentDirectory;
};

export async function replaceLocalFiles (): Promise<string|null> {
  // Create directories
  for (let i = 0; i < directories.length; i++) {
    const path = FileSystem.documentDirectory + directories[i];
    const pathInfo = await FileSystem.getInfoAsync(path);
    
    try {
      if (!pathInfo.exists) {
        console.log(`Creating directory ${path}`);
        await FileSystem.makeDirectoryAsync(path, { intermediates: true });
      }
    }
    catch (error) {
      console.error('Error creating directory', error);
      throw error;
    }
  }

  // Copy files
  for (const [key, value] of Object.entries(assetFiles)) {
    const file = FileSystem.documentDirectory + key;

    try {
      const fileInfo = await FileSystem.getInfoAsync(file);
      if (fileInfo.exists) {
        await FileSystem.deleteAsync(file);
      }

      const asset = Asset.fromModule(value);
      await asset.downloadAsync();
      await FileSystem.copyAsync({from: asset.localUri || '', to: file});
      console.log(`File ${file} has been replaced with success.`);
    }
    catch (error) {
      console.error('Error copying file', error);
      throw error;
    }
  }
  
  // Return document directory
  return FileSystem.documentDirectory;
};