// Generated using Gemini
import { useState, useEffect } from 'react';
import * as SQLite from 'expo-sqlite';
import { openDatabase } from '../utils/database';

function useDatabase(): SQLite.SQLiteDatabase | undefined {
  const [db, setDb] = useState<SQLite.SQLiteDatabase>();

  useEffect(() => {
    openDatabase()
      .then((database) => {
        setDb(database);
      })
      .catch((error) => {
        console.error('Failed to initialize database:', error);
      });
  }, []);

  return db;
}

export default useDatabase;