-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_user_favorites" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "artistId" TEXT NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'default',
    "addedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "user_favorites_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "user_favorites_artistId_fkey" FOREIGN KEY ("artistId") REFERENCES "artists" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_user_favorites" ("addedAt", "artistId", "id", "userId") SELECT "addedAt", "artistId", "id", "userId" FROM "user_favorites";
DROP TABLE "user_favorites";
ALTER TABLE "new_user_favorites" RENAME TO "user_favorites";
CREATE UNIQUE INDEX "user_favorites_userId_artistId_key" ON "user_favorites"("userId", "artistId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
