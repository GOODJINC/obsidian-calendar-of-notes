import { readFile } from "node:fs/promises";

const css = await readFile("styles.css", "utf8");
const forbidden = [
  ["!important", /!important\b/],
  ["CSS imports", /@import\b/i],
  ["remote assets", /url\(\s*["']?https?:/i],
  [":has() selectors", /:has\s*\(/i]
];

const problems = forbidden.filter(([, pattern]) => pattern.test(css)).map(([label]) => label);
if (problems.length > 0) throw new Error(`styles.css contains forbidden patterns: ${problems.join(", ")}`);

console.log("styles.css passed Obsidian compatibility checks.");
