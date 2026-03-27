import fs from "node:fs/promises";
import path from "node:path";

const rootDir = process.cwd();
const configPath = path.join(rootDir, "figma.config.json");

const readJson = async (filePath) => {
  const raw = await fs.readFile(filePath, "utf8");
  return JSON.parse(raw);
};

const main = async () => {
  const config = await readJson(configPath);
  const tokenPath = path.join(rootDir, config.tokenExportPath);
  const tokenPayload = await readJson(tokenPath);

  if (!Array.isArray(tokenPayload.collections) || tokenPayload.collections.length === 0) {
    throw new Error(`${config.tokenExportPath} does not contain any Figma token collections`);
  }

  const variableCount = tokenPayload.collections.reduce(
    (sum, collection) => sum + (Array.isArray(collection.variables) ? collection.variables.length : 0),
    0
  );

  console.log(`Using Figma export: ${config.tokenExportPath}`);
  console.log(`lastModified: ${tokenPayload.lastModified ?? "unknown"}`);
  console.log(`collections: ${tokenPayload.collections.length}`);
  console.log(`variables: ${variableCount}`);
  console.log("Next step: rebuild generated token artifacts.");
};

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
