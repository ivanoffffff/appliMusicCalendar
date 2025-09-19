-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_releases" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "spotifyId" TEXT,
    "name" TEXT NOT NULL,
    "releaseType" TEXT NOT NULL,
    "releaseDate" DATETIME NOT NULL,
    "imageUrl" TEXT,
    "spotifyUrl" TEXT,
    "trackCount" INTEGER,
    "duration" INTEGER,
    "isExplicit" BOOLEAN NOT NULL DEFAULT false,
    "popularity" INTEGER,
    "artistId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "releases_artistId_fkey" FOREIGN KEY ("artistId") REFERENCES "artists" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_releases" ("artistId", "createdAt", "id", "imageUrl", "name", "releaseDate", "releaseType", "spotifyId", "spotifyUrl", "updatedAt") SELECT "artistId", "createdAt", "id", "imageUrl", "name", "releaseDate", "releaseType", "spotifyId", "spotifyUrl", "updatedAt" FROM "releases";
DROP TABLE "releases";
ALTER TABLE "new_releases" RENAME TO "releases";
CREATE UNIQUE INDEX "releases_spotifyId_key" ON "releases"("spotifyId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
