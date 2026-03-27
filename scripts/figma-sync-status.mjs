import fs from "node:fs/promises";
import path from "node:path";

const rootDir = process.cwd();
const configPath = path.join(rootDir, "figma.config.json");

const readJson = async (filePath) => {
  const raw = await fs.readFile(filePath, "utf8");
  return JSON.parse(raw);
};

const exists = async (filePath) => {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
};

const main = async () => {
  const config = await readJson(configPath);
  const tokenPath = path.join(rootDir, config.tokenExportPath);
  const tokenPayload = await readJson(tokenPath);
  const generatedDir = path.join(rootDir, "src", "tokens", "generated");
  const generatedFiles = [
    "tokens.raw.json",
    "tokens.css",
    "theme-light.css",
    "theme-dark.css",
    "tokens.ts"
  ];

  const generatedStatuses = await Promise.all(
    generatedFiles.map(async (name) => ({
      name,
      present: await exists(path.join(generatedDir, name))
    }))
  );

  const collections = Array.isArray(tokenPayload.collections)
    ? tokenPayload.collections.length
    : 0;
  const variables = Array.isArray(tokenPayload.collections)
    ? tokenPayload.collections.reduce(
        (sum, collection) => sum + (Array.isArray(collection.variables) ? collection.variables.length : 0),
        0
      )
    : 0;

  console.log(`Figma file key: ${config.fileKey}`);
  console.log(`Primary canvas node: ${config.primaryCanvasNodeId}`);
  console.log(`Token export: ${config.tokenExportPath}`);
  console.log(`Token lastModified: ${tokenPayload.lastModified ?? "unknown"}`);
  console.log(`Collections: ${collections}`);
  console.log(`Variables: ${variables}`);
  console.log(`Linked components: ${config.components.length}`);
  console.log("Generated token artifacts:");

  for (const file of generatedStatuses) {
    console.log(`- ${file.present ? "ok" : "missing"} ${file.name}`);
  }
};

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
