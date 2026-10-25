// For the GitHub Pages preview, the site lives under a sub-path
// (/<repo>). Next adds that prefix to its own links and scripts, but not
// to the plain /images, /videos, /fonts paths used in markup, CSS and
// product data, so this rewrites them in the exported files.
import { readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const base = process.env.PAGES_BASE_PATH;
const outDir = process.argv[2] ?? "out";
if (!base) throw new Error("PAGES_BASE_PATH is not set");

const ASSET = /(["'(]|&quot;|\\")\/(images|videos|fonts|favicon\.ico)/g;

async function* files(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) yield* files(full);
    else if (/\.(html|js|css|txt)$/.test(entry.name)) yield full;
  }
}

let changed = 0;
for await (const file of files(outDir)) {
  const text = await readFile(file, "utf8");
  const next = text.replace(ASSET, (_, quote, dir) => `${quote}${base}/${dir}`);
  if (next !== text) {
    await writeFile(file, next);
    changed++;
  }
}
console.log(`prefixed asset paths in ${changed} files`);
