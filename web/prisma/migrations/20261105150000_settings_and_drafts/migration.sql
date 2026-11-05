-- CreateTable
CREATE TABLE "SiteSettings" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "companyName" TEXT NOT NULL,
    "legalName" TEXT NOT NULL,
    "tagline" TEXT NOT NULL DEFAULT '',
    "footerDescription" TEXT NOT NULL DEFAULT '',
    "phone" TEXT NOT NULL DEFAULT '',
    "secondaryPhone" TEXT NOT NULL DEFAULT '',
    "publicEmail" TEXT NOT NULL DEFAULT '',
    "notificationEmail" TEXT NOT NULL DEFAULT '',
    "whatsappNumber" TEXT NOT NULL DEFAULT '',
    "whatsappLabel" TEXT NOT NULL DEFAULT '',
    "responseNote" TEXT NOT NULL DEFAULT '',
    "addressStreet" TEXT NOT NULL DEFAULT '',
    "addressCity" TEXT NOT NULL DEFAULT '',
    "addressCountry" TEXT NOT NULL DEFAULT '',
    "addressCountryCode" TEXT NOT NULL DEFAULT '',
    "businessHours" JSONB NOT NULL DEFAULT '[]',
    "socials" JSONB NOT NULL DEFAULT '[]',
    "logoMediaId" TEXT,
    "logoLightMediaId" TEXT,
    "defaultOgMediaId" TEXT,
    "seoTitle" TEXT NOT NULL DEFAULT '',
    "seoDescription" TEXT NOT NULL DEFAULT '',
    "titleTemplate" TEXT NOT NULL DEFAULT '%s | SAGEC Ltd',
    "googleSiteVerification" TEXT NOT NULL DEFAULT '',
    "googleAnalyticsId" TEXT NOT NULL DEFAULT '',
    "headingFont" TEXT NOT NULL DEFAULT 'plus-jakarta-sans',
    "bodyFont" TEXT NOT NULL DEFAULT 'inter',
    "smoothScroll" BOOLEAN NOT NULL DEFAULT true,
    "parallax" BOOLEAN NOT NULL DEFAULT true,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SiteSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GlobalSection" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "draft" JSONB NOT NULL DEFAULT '{}',
    "published" JSONB,
    "publishedAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GlobalSection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContentVersion" (
    "id" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityKey" TEXT NOT NULL,
    "snapshot" JSONB NOT NULL,
    "note" TEXT,
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ContentVersion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "GlobalSection_key_key" ON "GlobalSection"("key");

-- CreateIndex
CREATE INDEX "ContentVersion_entityType_entityKey_createdAt_idx" ON "ContentVersion"("entityType", "entityKey", "createdAt");
