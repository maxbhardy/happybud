PRAGMA journal_mode=WAL;
PRAGMA foreign_keys=ON;

CREATE TABLE IF NOT EXISTS Plants (
    PlantID INTEGER PRIMARY KEY,
    PlantName TEXT UNIQUE,
    PlantLogoUri TEXT,
    PlantModelUri TEXT
);

CREATE TABLE IF NOT EXISTS PlantClasses (
    PlantClassID INTEGER PRIMARY KEY,
    PlantID INTEGER REFERENCES Plants,
    ClassCode TEXT,
    ClassName TEXT,
    ClassDescription TEXT,
    ClassIdentification TEXT
);

CREATE TABLE IF NOT EXISTS PlantSolutions (
    SolutionID INTEGER PRIMARY KEY,
    SolutionName TEXT,
    SolutionSummary TEXT,
    SolutionDescription TEXT,
    SecurityPrecautions TEXT
);

CREATE TABLE IF NOT EXISTS ClassSolutionRelationships (
    PlantClassID INTEGER REFERENCES PlantClasses,
    SolutionID INTEGER REFERENCES PlantSolutions,
    PRIMARY KEY (PlantClassID, SolutionID)
) WITHOUT ROWID;