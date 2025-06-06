PRAGMA journal_mode = WAL;
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS Plants (
    PlantID INTEGER PRIMARY KEY,
    PlantOutputIndex INTEGER UNIQUE, -- Index of the model output tensor
    PlantName TEXT UNIQUE,
    PlantLogoUri TEXT,
    PlantModelUri TEXT
);

CREATE TABLE IF NOT EXISTS PlantClasses (
    PlantClassID INTEGER PRIMARY KEY,
    PlantID INTEGER,
    PlantClassOutputIndex INTEGER, -- Index of the model output tensor
    ClassCode TEXT,
    ClassName TEXT,
    ClassDescription TEXT,
    ClassIdentification TEXT,
    UNIQUE (PlantID, PlantClassOutputIndex),
    FOREIGN KEY (PlantID) REFERENCES Plants(PlantID)
);

CREATE TABLE IF NOT EXISTS PlantSolutions (
    SolutionID INTEGER PRIMARY KEY,
    SolutionName TEXT,
    SolutionSummary TEXT,
    SolutionDescription TEXT,
    SecurityPrecautions TEXT
);

CREATE TABLE IF NOT EXISTS ClassSolutionRelationships (
    PlantClassID INTEGER,
    SolutionID INTEGER,
    PRIMARY KEY (PlantClassID, SolutionID),
    FOREIGN KEY (PlantClassID) REFERENCES PlantClasses(PlantClassID),
    FOREIGN KEY (SolutionID) REFERENCES PlantSolutions(SolutionID)
) WITHOUT ROWID;

CREATE TABLE IF NOT EXISTS Produits (
    ProduitId INTEGER PRIMARY KEY,
    ProductName Text,
    Description Text,
    Fournisseur TEXT,
    Lieu TEXT,
    Prix REAL,
    SiteWeb TEXT
);

CREATE TABLE IF NOT EXISTS PlantSolutionRelationships (
    SolutionID INTEGER,
    ProduitId INTEGER,
    PRIMARY KEY (SolutionID, ProduitId),
    FOREIGN KEY (ProduitId) REFERENCES Produits(ProduitId),
    FOREIGN KEY (SolutionID) REFERENCES PlantSolutions(SolutionID)
) WITHOUT ROWID;


CREATE TABLE IF NOT EXISTS Historique (
    HistoriqueId INTEGER PRIMARY KEY,
    PlantID INTEGER,
    PlantClassID INTEGER,
    PictureURI TEXT,
    ThumbnailURI TEXT,
    Timestamp TEXT,
    FOREIGN KEY (PlantID) REFERENCES Plants(PlantID),
    FOREIGN KEY (PlantClassID) REFERENCES PlantClasses(PlantClassID)
);

CREATE TABLE IF NOT EXISTS HistoriqueResult (
    ResultId INTEGER PRIMARY KEY,
    HistoriqueId INTEGER,
    PlantClassID INTEGER,
    result REAL,
    FOREIGN KEY (HistoriqueId) REFERENCES Historique(HistoriqueId),
    FOREIGN KEY (PlantClassID) REFERENCES PlantClasses(PlantClassID)
);


