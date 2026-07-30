import { readFile, writeFile } from "node:fs/promises";

const nextVersion = process.argv[2];
if (!/^\d+\.\d+\.\d+$/.test(nextVersion ?? "")) {
  throw new Error("Usage: npm run bump-version -- 0.1.1");
}

const readJson = async (path) => JSON.parse(await readFile(path, "utf8"));
const writeJson = async (path, value) => writeFile(path, `${JSON.stringify(value, null, 2)}\n`);

const packageJson = await readJson("package.json");
const packageLock = await readJson("package-lock.json");
const manifest = await readJson("manifest.json");
const versions = await readJson("versions.json");

packageJson.version = nextVersion;
packageLock.version = nextVersion;
if (packageLock.packages?.[""]) packageLock.packages[""].version = nextVersion;
manifest.version = nextVersion;
versions[nextVersion] = manifest.minAppVersion;

await Promise.all([
  writeJson("package.json", packageJson),
  writeJson("package-lock.json", packageLock),
  writeJson("manifest.json", manifest),
  writeJson("versions.json", versions)
]);

console.log(`Updated Calendar of Notes to ${nextVersion}.`);
