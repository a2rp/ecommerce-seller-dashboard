const formulaInitials = new Set(["=", "+", "-", "@"]);

const startsWithFormula = (text) => {
  const firstMeaningfulCharacter = [...text].find(
    (character) => character.codePointAt(0) > 0x20 && character !== "\uFEFF",
  );
  return formulaInitials.has(firstMeaningfulCharacter);
};

export const escapeCsvCell = (value) => {
  let text = String(value ?? "");
  if (startsWithFormula(text)) text = "'" + text;
  return '"' + text.replaceAll('"', '""') + '"';
};

export const serializeCsv = (rows) =>
  rows.map((row) => row.map(escapeCsvCell).join(",")).join("\r\n");
