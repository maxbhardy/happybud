import * as SQLite from 'expo-sqlite';
import * as FileSystem from 'expo-file-system';
import * as Expo from 'expo-asset'; // Import Expo for Asset API

const DATABASE_FILE_NAME = 'database.db';

async function openDatabase(): Promise<SQLite.SQLiteDatabase> {
  //const dbPath = `<span class="math-inline">\{FileSystem\.documentDirectory\}database/</span>{DATABASE_FILE_NAME}`;
  const dbFile = `${FileSystem.documentDirectory}database/${DATABASE_FILE_NAME}`
  const dbPath = `${FileSystem.documentDirectory}database`

  try {
    const dbInfo = await FileSystem.getInfoAsync(dbFile);
    if (!dbInfo.exists) {
      console.log('Database not found, copying from assets...');
      await FileSystem.makeDirectoryAsync(dbPath, { intermediates: true });
      const asset = Expo.Asset.fromModule(require('../assets/database/database.db'));
      await asset.downloadAsync();
      await FileSystem.copyAsync({from: asset.localUri || '', to: dbFile});
      console.log('Database copied successfully!');
    }

    const db = await SQLite.openDatabaseAsync(DATABASE_FILE_NAME, undefined, dbPath);
    console.log('Database has been opened with success!')
    return db;
  } catch (error) {
    console.error('Error opening database:', error);
    throw error;
  }
}

export { openDatabase, DATABASE_FILE_NAME };
