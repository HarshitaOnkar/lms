require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

prisma
  .$queryRawUnsafe("SELECT 1 AS ok")
  .then((r) => {
    console.log("DB_OK", r);
  })
  .catch((e) => {
    console.error("DB_ERR", e.message);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
