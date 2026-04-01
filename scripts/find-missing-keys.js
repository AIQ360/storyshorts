const path = require("path");
const en = require(path.join(__dirname, "..", "messages", "en.json"));
const locales = ["de", "es", "fr", "it"];

function findMissingKeys(enObj, localeObj, prefix) {
  prefix = prefix || "";
  const missing = [];
  for (const key of Object.keys(enObj)) {
    const fullPath = prefix ? prefix + "." + key : key;
    if (typeof enObj[key] === "object" && enObj[key] !== null) {
      if (localeObj[key] === undefined || typeof localeObj[key] !== "object") {
        missing.push(fullPath + " (entire section)");
      } else {
        missing.push(...findMissingKeys(enObj[key], localeObj[key], fullPath));
      }
    } else {
      if (localeObj[key] === undefined) {
        missing.push(fullPath);
      }
    }
  }
  return missing;
}

for (const locale of locales) {
  const data = require(
    path.join(__dirname, "..", "messages", locale + ".json"),
  );
  const missing = findMissingKeys(en, data);
  console.log(`\n=== ${locale}.json: ${missing.length} missing keys ===`);
  missing.forEach((k) => console.log("  " + k));
}
