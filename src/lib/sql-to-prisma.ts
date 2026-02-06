export const SAMPLE_SQL = `CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  email VARCHAR(255) NOT NULL,
  name VARCHAR(100),
  is_active BOOLEAN NOT NULL,
  created_at TIMESTAMP NOT NULL,
  updated_at TIMESTAMP
);

CREATE TABLE posts (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  body TEXT,
  published_at DATETIME,
  is_published TINYINT(1) NOT NULL
);`;

type Column = {
  name: string;
  rawType: string;
  prismaType: string;
  isNullable: boolean;
  isPrimaryKey: boolean;
};

type Table = {
  name: string;
  columns: Column[];
};

const TYPE_MAP: { pattern: RegExp; prisma: string }[] = [
  { pattern: /^(int|integer)\b/i, prisma: "Int" },
  { pattern: /^(varchar|text|char)/i, prisma: "String" },
  { pattern: /^(boolean|bool)/i, prisma: "Boolean" },
  { pattern: /^tinyint\(1\)/i, prisma: "Boolean" },
  { pattern: /^(timestamp|datetime)/i, prisma: "DateTime" }
];

function mapSqlTypeToPrisma(sqlType: string): string {
  const normalized = sqlType.trim().toLowerCase();
  for (const { pattern, prisma } of TYPE_MAP) {
    if (pattern.test(normalized)) return prisma;
  }
  // Fallback: keep as String for safety
  return "String";
}

function parseTables(sql: string): Table[] {
  const tables: Table[] = [];

  const createTableRegex =
    /create\s+table\s+([a-zA-Z0-9_]+)\s*\(([\s\S]*?)\)\s*;/gi;

  let match: RegExpExecArray | null;
  while ((match = createTableRegex.exec(sql)) !== null) {
    const [, tableName, body] = match;

    const rawLines = body
      .split(/,(?![^(]*\))/)
      .map((l) => l.trim())
      .filter(Boolean);

    const columns: Column[] = [];
    const tableLevelPrimaryKeys: string[] = [];

    for (const line of rawLines) {
      const upper = line.toUpperCase();

      // Table-level PRIMARY KEY (id, ...)
      if (upper.startsWith("PRIMARY KEY")) {
        const pkMatch = /\(([^)]+)\)/.exec(line);
        if (pkMatch) {
          const cols = pkMatch[1]
            .split(",")
            .map((s) => s.trim().replace(/`/g, ""))
            .filter(Boolean);
          tableLevelPrimaryKeys.push(...cols);
        }
        continue;
      }

      // Column definition
      const colMatch =
        /^`?([a-zA-Z0-9_]+)`?\s+([a-zA-Z0-9_]+(?:\([0-9, ]+\))?)([\s\S]*)$/i.exec(
          line
        );
      if (!colMatch) continue;

      const [, colName, colType, rest] = colMatch;
      const isInlinePrimary = /\bPRIMARY\s+KEY\b/i.test(rest);
      const isNullable = !/\bNOT\s+NULL\b/i.test(rest);

      const prismaType = mapSqlTypeToPrisma(colType);

      columns.push({
        name: colName,
        rawType: colType,
        prismaType,
        isNullable,
        isPrimaryKey: isInlinePrimary
      });
    }

    // Apply table-level PK info
    if (tableLevelPrimaryKeys.length) {
      for (const col of columns) {
        if (tableLevelPrimaryKeys.includes(col.name)) {
          col.isPrimaryKey = true;
        }
      }
    }

    tables.push({ name: tableName, columns });
  }

  return tables;
}

function buildPrismaModel(table: Table): string {
  const { name, columns } = table;

  const lines: string[] = [];
  lines.push(`model ${name} {`);

  for (const col of columns) {
    const isId = col.isPrimaryKey;
    const mappedType = col.prismaType;
    const isOptional = !isId && col.isNullable;

    let field = `  ${col.name} ${mappedType}${isOptional ? "?" : ""}`;

    if (isId) {
      const baseType = mappedType.toLowerCase();
      if (baseType === "int") {
        field += " @id @default(autoincrement())";
      } else if (baseType === "string") {
        field += " @id @default(cuid())";
      } else {
        field += " @id";
      }
    }

    lines.push(field);
  }

  lines.push("}");
  return lines.join("\n");
}

export function sqlToPrismaSchema(input: string): string {
  const trimmed = input.trim();
  if (!trimmed) return "";

  const tables = parseTables(trimmed);
  if (!tables.length) {
    return "// No CREATE TABLE statements found.\n";
  }

  const models = tables.map((t) => buildPrismaModel(t)).join("\n\n");

  const header = `/// Generated from SQL CREATE TABLE statements
/// Adjust datasource and generator according to your environment.

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql" // or \"mysql\" | \"sqlite\" etc.
  url      = env("DATABASE_URL")
}
`;

  return `${header}\n${models}\n`;
}

