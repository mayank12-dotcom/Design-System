import fs from "node:fs/promises";
import path from "node:path";

const rootDir = process.cwd();
const sourcePath = path.join(rootDir, "eden-ui-tokens.json");
const outputPath = path.join(rootDir, "docs", "site", "token-data.js");

const raw = await fs.readFile(sourcePath, "utf8");
const tokenFile = JSON.parse(raw);

const variableIndex = new Map();
for (const collection of tokenFile.collections ?? []) {
  for (const variable of collection.variables ?? []) {
    variableIndex.set(variable.id, variable);
  }
}

const toCssColor = (value) => {
  const r = Math.round(value.r * 255);
  const g = Math.round(value.g * 255);
  const b = Math.round(value.b * 255);
  const a = value.a ?? 1;

  if (a === 1) {
    return `#${r.toString(16).padStart(2, "0").toUpperCase()}${g
      .toString(16)
      .padStart(2, "0")
      .toUpperCase()}${b.toString(16).padStart(2, "0").toUpperCase()}`;
  }

  return `rgba(${r}, ${g}, ${b}, ${Number(a.toFixed(2))})`;
};

const resolveValue = (variable, visited = new Set()) => {
  if (visited.has(variable.id)) {
    return "CYCLE";
  }

  visited.add(variable.id);
  const value = Object.values(variable.valuesByMode ?? {})[0];

  if (value?.type === "VARIABLE_ALIAS") {
    const target = variableIndex.get(value.id);
    if (!target) {
      return "UNRESOLVED_ALIAS";
    }
    return resolveValue(target, visited);
  }

  if ((variable.resolvedType ?? variable.type) === "COLOR") {
    return toCssColor(value);
  }

  return value;
};

const getGroupName = (tokenName) => {
  const parts = tokenName.split("/");
  if (parts.length <= 1) {
    return "Base";
  }
  return parts.slice(0, -1).join(" / ");
};

const collections = (tokenFile.collections ?? []).map((collection) => ({
  name: collection.name,
  items: (collection.variables ?? []).map((variable) => ({
    name: variable.name,
    type: variable.resolvedType ?? variable.type,
    group: getGroupName(variable.name),
    value: resolveValue(variable)
  }))
}));

const output = `window.EDEN_TOKEN_DATA = ${JSON.stringify(
  {
    schemaVersion: tokenFile.schemaVersion,
    lastModified: tokenFile.lastModified,
    fileName: tokenFile.fileName,
    collections
  },
  null,
  2
)};\n`;

await fs.writeFile(outputPath, output, "utf8");
console.log(`Generated ${path.relative(rootDir, outputPath)} from ${path.basename(sourcePath)}`);
