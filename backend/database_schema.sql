PRAGMA journal_mode=WAL;

CREATE TABLE Plants IF NOT EXISTS (
    PlantID INTEGER PRIMARY KEY,
    PlantName TEXT,
)