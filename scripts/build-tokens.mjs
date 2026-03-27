import fs from "node:fs/promises";
import path from "node:path";

const rootDir = process.cwd();
const sourcePath = path.join(rootDir, "eden-ui-tokens.json");
const outputDir = path.join(rootDir, "src", "tokens", "generated");

const toKebabCase = (value) =>
  value
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/--+/g, "-")
    .toLowerCase();

const readTokens = async () => {
  const raw = await fs.readFile(sourcePath, "utf8");
  return JSON.parse(raw);
};

const flattenCollectionModes = (collections) =>
  collections.flatMap((collection) =>
    collection.modes.map((mode) => ({
      collectionId: collection.id,
      collectionName: collection.name,
      modeId: mode.modeId,
      modeName: mode.name
    }))
  );

const buildVariableIndex = (collections) => {
  const index = new Map();

  for (const collection of collections) {
    for (const variable of collection.variables) {
      index.set(variable.id, {
        collectionName: collection.name,
        name: variable.name,
        resolvedType: variable.resolvedType ?? variable.type,
        scopes: variable.scopes ?? [],
        valuesByMode: variable.valuesByMode ?? {}
      });
    }
  }

  return index;
};

const normalizeValue = (value, variableIndex) => {
  if (value?.type === "VARIABLE_ALIAS") {
    const aliasTarget = variableIndex.get(value.id);

    if (!aliasTarget) {
      throw new Error(`Missing alias target for ${value.id}`);
    }

    return {
      kind: "alias",
      targetId: value.id,
      targetCollection: aliasTarget.collectionName,
      targetName: aliasTarget.name,
      cssVar: `--${toKebabCase(aliasTarget.name)}`,
      tokenPath: aliasTarget.name.split("/")
    };
  }

  return {
    kind: "literal",
    value
  };
};

const normalizeCollections = (collections) => {
  const modes = flattenCollectionModes(collections);
  const modeById = new Map(modes.map((mode) => [mode.modeId, mode]));
  const variableIndex = buildVariableIndex(collections);

  const normalizedCollections = collections.map((collection) => ({
    id: collection.id,
    name: collection.name,
    modes: collection.modes.map((mode) => ({
      id: mode.modeId,
      name: mode.name
    })),
    variables: collection.variables.map((variable) => {
      const normalizedModes = Object.entries(variable.valuesByMode ?? {}).reduce(
        (accumulator, [modeId, value]) => {
          const mode = modeById.get(modeId);

          if (!mode) {
            throw new Error(`Unknown mode ${modeId} on variable ${variable.name}`);
          }

          accumulator[mode.modeName] = normalizeValue(value, variableIndex);
          return accumulator;
        },
        {}
      );

      const cssVar = `--${toKebabCase(variable.name)}`;

      return {
        id: variable.id,
        name: variable.name,
        tokenPath: variable.name.split("/"),
        cssVar,
        resolvedType: variable.resolvedType ?? variable.type,
        scopes: variable.scopes ?? [],
        valuesByMode: normalizedModes
      };
    })
  }));

  return {
    source: path.basename(sourcePath),
    generatedAt: new Date().toISOString(),
    collections: normalizedCollections
  };
};

const cssColor = (color) => {
  if (
    typeof color !== "object" ||
    color === null ||
    typeof color.r !== "number" ||
    typeof color.g !== "number" ||
    typeof color.b !== "number"
  ) {
    throw new Error(`Invalid color payload: ${JSON.stringify(color)}`);
  }

  const r = Math.round(color.r * 255);
  const g = Math.round(color.g * 255);
  const b = Math.round(color.b * 255);
  const a = typeof color.a === "number" ? Number(color.a.toFixed(3)) : 1;

  return a === 1 ? `rgb(${r} ${g} ${b})` : `rgb(${r} ${g} ${b} / ${a})`;
};

const cssLength = (value) => {
  if (typeof value === "number") {
    return `${value}px`;
  }

  return `"${String(value)}"`;
};

const cssFloatValue = (variable, value) => {
  const lowerName = variable.name.toLowerCase();

  if (lowerName.includes("font/weight")) {
    return String(value);
  }

  return cssLength(value);
};

const cssTextValue = (variable, normalizedValue) => {
  if (normalizedValue.kind === "alias") {
    return `var(${normalizedValue.cssVar})`;
  }

  const value = normalizedValue.value;

  switch (variable.resolvedType) {
    case "COLOR":
      return cssColor(value);
    case "FLOAT":
      return cssFloatValue(variable, value);
    case "STRING":
      return `"${String(value)}"`;
    default:
      return String(value);
  }
};

const writeCssBlock = (selector, declarations) => {
  const lines = declarations.map(
    ([name, value]) => `  ${name}: ${value};`
  );

  return `${selector} {\n${lines.join("\n")}\n}\n`;
};

const buildCssOutputs = (normalized) => {
  const baseDeclarations = [];
  const themeDeclarations = {
    light: [],
    dark: []
  };

  for (const collection of normalized.collections) {
    for (const variable of collection.variables) {
      const modeEntries = Object.entries(variable.valuesByMode);

      if (collection.name === "Theme") {
        for (const [modeName, normalizedValue] of modeEntries) {
          const modeKey = modeName.toLowerCase();
          const bucket = themeDeclarations[modeKey];

          if (!bucket) {
            throw new Error(`Unexpected theme mode ${modeName}`);
          }

          bucket.push([variable.cssVar, cssTextValue(variable, normalizedValue)]);
        }

        continue;
      }

      if (modeEntries.length !== 1) {
        throw new Error(
          `Collection ${collection.name} expected single mode for ${variable.name}`
        );
      }

      const [, normalizedValue] = modeEntries[0];
      baseDeclarations.push([variable.cssVar, cssTextValue(variable, normalizedValue)]);
    }
  }

  return {
    tokensCss:
      ":root {\n" +
      baseDeclarations.map(([name, value]) => `  ${name}: ${value};`).join("\n") +
      "\n}\n",
    lightCss: writeCssBlock(".eden-theme-light", themeDeclarations.light),
    darkCss: writeCssBlock(".eden-theme-dark", themeDeclarations.dark)
  };
};

const buildTsOutput = (normalized) => {
  const collectionsObject = normalized.collections.reduce((accumulator, collection) => {
    accumulator[collection.name] = collection.variables.reduce((variableAccumulator, variable) => {
      variableAccumulator[variable.name] = {
        id: variable.id,
        cssVar: variable.cssVar,
        resolvedType: variable.resolvedType,
        valuesByMode: variable.valuesByMode
      };
      return variableAccumulator;
    }, {});
    return accumulator;
  }, {});

  return `export const tokenCollections = ${JSON.stringify(
    collectionsObject,
    null,
    2
  )} as const;

export const themeModes = ["light", "dark"] as const;
export type ThemeMode = (typeof themeModes)[number];

export const themeClassNames: Record<ThemeMode, string> = {
  light: "eden-theme-light",
  dark: "eden-theme-dark"
};

export const semanticTokens = tokenCollections["Theme"];
`;
};

const ensureDirectories = async () => {
  await fs.mkdir(outputDir, { recursive: true });
};

const main = async () => {
  const source = await readTokens();
  const normalized = normalizeCollections(source.collections);
  const cssOutputs = buildCssOutputs(normalized);
  const tsOutput = buildTsOutput(normalized);

  await ensureDirectories();

  await fs.writeFile(
    path.join(outputDir, "tokens.raw.json"),
    JSON.stringify(normalized, null, 2) + "\n"
  );
  await fs.writeFile(path.join(outputDir, "tokens.css"), cssOutputs.tokensCss);
  await fs.writeFile(path.join(outputDir, "theme-light.css"), cssOutputs.lightCss);
  await fs.writeFile(path.join(outputDir, "theme-dark.css"), cssOutputs.darkCss);
  await fs.writeFile(path.join(outputDir, "tokens.ts"), tsOutput);
};

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
