-- AlterEnum
BEGIN;
CREATE TYPE "Role_new" AS ENUM ('MEMBER', 'ADMIN');
ALTER TABLE "public"."User" ALTER COLUMN "role" DROP DEFAULT;
ALTER TABLE "User" ALTER COLUMN "role" TYPE "Role_new" USING ("role"::text::"Role_new");
ALTER TYPE "Role" RENAME TO "Role_old";
ALTER TYPE "Role_new" RENAME TO "Role";
DROP TYPE "public"."Role_old";
ALTER TABLE "User" ALTER COLUMN "role" SET DEFAULT 'MEMBER';
COMMIT;

-- DropIndex
DROP INDEX "Collection_visibility_idx";

-- DropIndex
DROP INDEX "Design_visibility_idx";

-- DropIndex
DROP INDEX "Product_visibility_idx";

-- AlterTable
ALTER TABLE "Collection" DROP COLUMN "visibility";

-- AlterTable
ALTER TABLE "Design" DROP COLUMN "visibility";

-- AlterTable
ALTER TABLE "Product" DROP COLUMN "visibility",
ADD COLUMN     "dropQuantityLimit" INTEGER,
ADD COLUMN     "dropQuantityRemaining" INTEGER,
ADD COLUMN     "isPreOrder" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "preOrderClosesAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "role" SET DEFAULT 'MEMBER';

-- DropEnum
DROP TYPE "Visibility";
