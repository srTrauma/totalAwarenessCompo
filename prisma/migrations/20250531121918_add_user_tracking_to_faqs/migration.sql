-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Faq" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "question" TEXT NOT NULL,
    "answer" TEXT,
    "profile" TEXT,
    "createdByUserId" INTEGER,
    "createdByUserName" TEXT,
    "respondedByUserId" INTEGER,
    "respondedByUserName" TEXT,
    "respondedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Faq" ("answer", "createdAt", "id", "profile", "question", "updatedAt") SELECT "answer", "createdAt", "id", "profile", "question", "updatedAt" FROM "Faq";
DROP TABLE "Faq";
ALTER TABLE "new_Faq" RENAME TO "Faq";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
