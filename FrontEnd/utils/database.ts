import * as SQLite from 'expo-sqlite';
import * as FileSystem from 'expo-file-system';

export async function openDatabase(): Promise<SQLite.SQLiteDatabase> {
  const dbFile = FileSystem.documentDirectory + 'database/database.db';

  try {
    const db = await SQLite.openDatabaseAsync(dbFile, { useNewConnection: true });
    console.log('Database has been opened with success!')
    return db;
  } catch (error) {
    console.error('Error opening database:', error);
    throw error;
  }
};