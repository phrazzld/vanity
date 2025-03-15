-- CreateTable
CREATE TABLE "Reading" (
    "id" SERIAL NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "author" TEXT NOT NULL,
    "finishedDate" TIMESTAMP(3),
    "coverImageSrc" TEXT,
    "thoughts" TEXT NOT NULL DEFAULT '',
    "dropped" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Reading_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Quote" (
    "id" SERIAL NOT NULL,
    "text" TEXT NOT NULL,
    "author" TEXT,

    CONSTRAINT "Quote_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Reading_slug_key" ON "Reading"("slug");
