-- CreateTable
CREATE TABLE "PvpRoom" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "roomCode" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'waiting',
    "p1Id" TEXT,
    "p2Id" TEXT,
    "p1Score" INTEGER NOT NULL DEFAULT 0,
    "p2Score" INTEGER NOT NULL DEFAULT 0,
    "currentTurn" INTEGER NOT NULL DEFAULT 0,
    "winnerId" TEXT,
    "p1Elo" INTEGER NOT NULL DEFAULT 0,
    "p2Elo" INTEGER NOT NULL DEFAULT 0,
    "p1EloChange" INTEGER NOT NULL DEFAULT 0,
    "p2EloChange" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "PvpRoom_roomCode_key" ON "PvpRoom"("roomCode");
