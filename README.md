<h1 align="center">caxa</h1>
<h3 align="center">Package Node.js applications into executable binaries</h3>
<p align="center">
<a href="https://github.com/leafac/caxa"><img src="https://img.shields.io/badge/Source---" alt="Source"></a>
<a href="https://www.npmjs.com/package/caxa"><img alt="Package" src="https://badge.fury.io/js/caxa.svg"></a>
<a href="https://github.com/leafac/caxa/actions"><img src="https://github.com/leafac/caxa/workflows/.github/workflows/main.yml/badge.svg" alt="Continuous Integration"></a>
</p>

<!--

```console
$ caxa "examples/echo-command-line-parameters" 'node "{{ caxa }}/index.js"' "/tmp/Echo Command-Line Parameters.app"
$ caxa "examples/echo-command-line-parameters" 'node "{{ caxa }}/index.js"' "/tmp/echo-command-line-parameters"
```

// TODO: Extensions:
// No-extension (self-extracting binary) (macOS / Linux)
// .app / .app.zip / .app.tar.gz / .app.tgz (Bundle) (option to show the terminal or not) (macOS)
// .exe / .exe.zip / .exe.tar.gz / .exe.tgz (self-extracting binary) (option to show the terminal or not) (Windows)
// .zip / .tar.gz / .tgz (Binary bundle) (macOS / Linux / Windows)

- `__dirname` vs `process.cwd()`.
- `CAXA` environment variable.

- Programmatic API

- Requirements on machine that’ll run the executable:
  - /usr/bin/env
  - sh
  - if, [, and stuff
  - mkdir
  - tail
  - tar
  - env
  - exit

```json
{
  "scripts": {
    "boxednode": "boxednode -s index.js -t packaged-by-boxed-node",
    "js2bin": "js2bin --build --platform=darwin --node=14.15.3 --app=$PWD/index.js --name=packaged-by-js2bin && chmod +x packaged-by-js2bin-darwin-x64",
    "nar": "nar create -e"
  },
  "dependencies": {
    "@leafac/sqlite": "^1.1.2",
    "sharp": "^0.27.1"
  },
  "devDependencies": {
    "boxednode": "^1.9.0",
    "js2bin": "^1.0.6",
    "nar": "^0.3.40",
    "nexe": "^4.0.0-beta.17"
  }
}
```

### https://github.com/vercel/pkg

- **Maintained:** ❌
- **Support all Node.js APIs (for example, `fs/promises`, which was problematic with `pkg`):** ✅ At least it supports `fs/promises` since I added it; other APIs may break in the future
- **Support native modules:** ❌ There’s the approach in this pull request, but it doesn’t seem to work for all packages (for example, sharp)
- **Support multiple files:** ✅
- **Support latest Node version (at least latest LTS):** ❌
- **Fast to package:** ✅
- **Cross-compile (good to have):** ❌ Not with native modules

### https://github.com/mongodb-js/boxednode

- **Maintained:** ✅
- **Support all Node.js APIs (for example, `fs/promises`, which was problematic with `pkg`):** ✅
- **Support native modules:** ✅
- **Support multiple files:** ❌
- **Support latest Node version (at least latest LTS):** ✅
- **Fast to package:** ❌ Compiles Node **every time**, which takes hours the first time, and is faster after that, but still kinda slow (674.23s user 59.80s system 243% cpu 5:01.06 total)
- **Cross-compile (good to have):** ❌

### https://github.com/criblio/js2bin

- **Maintained:**
- **Support all Node.js APIs (for example, `fs/promises`, which was problematic with `pkg`):**
- **Support native modules:**
- **Support multiple files:**
- **Support latest Node version (at least latest LTS):**
- **Fast to package:** ✅
- **Cross-compile (good to have):**

(You have to `chmod +x` the resulting binary)
(Doesn’t seem to work at all)

### https://github.com/h2non/nar

- **Maintained:**
- **Support all Node.js APIs (for example, `fs/promises`, which was problematic with `pkg`):**
- **Support native modules:**
- **Support multiple files:**
- **Support latest Node version (at least latest LTS):**
- **Fast to package:**
- **Cross-compile (good to have):**

### https://github.com/pmq20/node-packer

- **Maintained:**
- **Support all Node.js APIs (for example, `fs/promises`, which was problematic with `pkg`):**
- **Support native modules:**
- **Support multiple files:**
- **Support latest Node version (at least latest LTS):**
- **Fast to package:**
- **Cross-compile (good to have):**

### https://github.com/nexe/nexe / https://github.com/nmarus/nexe-natives

- **Maintained:**
- **Support all Node.js APIs (for example, `fs/promises`, which was problematic with `pkg`):**
- **Support native modules:**
- **Support multiple files:**
- **Support latest Node version (at least latest LTS):**
- **Fast to package:**
- **Cross-compile (good to have):**

### http://enclosejs.com

- Closed source
- Abandoned in favor of pkg

### Notes

- No cross-compiling & no other versions of node, because of native modules (also because it’s simpler).
- Self-extracting binary is naturally smaller (you could compress the result of pkg, but then users have to extract themselves)
- Self-extracting is better because you need files anyway (for `.node` files, which node apparently insists on loading from the filesystem)
- nar hasn’t been updated in years, yet it worked with the latest node version, it was fast, and it supported native modules just fine!
- Your sources will be visible (maybe obfuscate them…)
- No special semantics: No `process.pkg`, because it’s annoying to use with TypeScript, and fragile to maintain. If you need, have a different entrypoint; or we can have an environment variable.
- Just package all the contents of the folder; no need to declare `assets` and `scripts`; no need to bundle; no need to traverse the `require`.
- `http://nodejs.org/dist/v0.8.2/node.exe`.
- https://github.com/megastep/makeself
- https://documentation.help/WinRAR/HELPArcSFX.htm
- Node modules related to 7zip
  - https://www.npmjs.com/package/node-7z-archive
  - https://www.npmjs.com/package/7zip-bin
  - https://www.npmjs.com/package/7zip-bin-wrapper
  - https://www.npmjs.com/package/p7zip
  - https://www.npmjs.com/package/7zip
  - https://www.npmjs.com/package/node-7z
- **How it’ll work:**
  - Copy project into temporary directory (except for .git) (not `npm pack` because we want the `node_modules` in there) (deterministic name, but different for every release (a hash of the material in the directory))
  - `npm prune --production`
  - Copy node executable: `shell.cp(process.argv[0], <temporary-directory>/node_modules/.bin/node)`
  - Compress
  - Create a shell preamble
    - Add `<temporary-directory>/node_modules/.bin/node` to `PATH`, so things like `ts-node` just work.
- Interesting project: https://www.npmjs.com/package/node
- https://netbeansscribbles.wordpress.com/2015/01/30/creating-a-self-extracting-7zip-archive-multi-platform/
- **Alternatives:**
  - Bash/.bat files
    - https://peter-west.uk/blog/2019/making-node-script-binaries.html
    - https://sysplay.in/blog/linux/2019/12/self-extracting-shell-script/
    - https://gist.github.com/gregjhogan/bfcffe88ac9d6865efc5
    - iexpress
  - 7z
  - SFX
- https://www.npmjs.com/package/7zip-min

### Installation

```console
$ npm install caxa
```

Use caxa with [Prettier](https://prettier.io) (automatic formatting), and the Visual Studio Code extensions [Prettier - Code formatter](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode) (Prettier support) and [es6-string-html](https://marketplace.visualstudio.com/items?itemName=Tobermory.es6-string-html) (syntax highlighting).

### Features, Usage, and Examples

- **Use tagged template literals as an HTML template engine.** For example:

  ```typescript
  import html from "caxa";

  console.log(html`<p>${"Leandro Facchinetti"}</p>`); // => <p>Leandro Facchinetti</p>
  ```

- **Safe by default.** For example:

  ```typescript
  console.log(html`<p>${`<script>alert(1);</script>`}</p>`); // => <p>&#x3C;script&#x3E;alert(1);&#x3C;/script&#x3E;</p>
  ```

- **Unsafely interpolate trusted HTML with `$${...}`.** For example:

  ```typescript
  console.log(html`<p>$${`<span>Leandro Facchinetti</span>`}</p>`); // => <p><span>Leandro Facchinetti</span></p>
  ```

- **Join interpolated arrays.** For example:

  ```typescript
  console.log(html`<p>${["Leandro", " ", "Facchinetti"]}</p>`); // => <p>Leandro Facchinetti</p>
  ```

  Array interpolations are safe by default; if you wish to unsafely interpolate an array of trusted HTML use `$${[...]}`.

- **caxa doesn’t encode HTML itself.** It relies on [he](https://npm.im/he), which is much more robust than any bespoke encoding.

- **caxa doesn’t try to format the output.** If you need pretty HTML, you may call Prettier programmatically on the output.

- **caxa generates strings.** No kind of virtual DOM here.

### Related Projects

- <https://npm.im/@leafac/sqlite>: [better-sqlite3](https://npm.im/better-sqlite3) with tagged template literals.
- <https://npm.im/@leafac/sqlite-migration>: A lightweight migration system for @leafac/sqlite.

### Prior Art

- <https://npm.im/html-template-tag>:
  - Was a major inspiration for this. Its design is simple and great. In particular, I love (and stole) the idea of using `$${...}` to mark safe interpolation.
  - [Doesn’t encode arrays by default](https://github.com/AntonioVdlC/html-template-tag/issues/10).
  - [Uses a bespoke encoding](https://github.com/AntonioVdlC/html-template-tag/blob/b6a5eee92a4625c93de5cc9c3446cd3ca79e9b3c/src/index.js#L3).
  - [Has awkward types that require substitutions to be `string`s, as opposed to `any`s](https://github.com/AntonioVdlC/html-template-tag/blob/b6a5eee92a4625c93de5cc9c3446cd3ca79e9b3c/index.d.ts#L3).
- <https://npm.im/common-tags>:
  - Doesn’t encode interpolated values by default.
  - Uses the `safeHtml` tag, which isn’t recognized by Prettier & the es6-string-html Visual Studio Code extension.
- <https://npm.im/escape-html-template-tag>:
  - Awkward API with `escapeHtml.safe()` and `escapeHtml.join()` instead of the `$${}` trick.
  - [Uses a bespoke encoding](https://github.com/Janpot/escape-html-template-tag/blob/14ab388646b9b930ea68a46b0a9c8314d65b388a/index.mjs#L1-L10).
- <https://npm.im/lit-html>, <https://npm.im/nanohtml>, <https://npm.im/htm>, and <https://npm.im/viperhtml>:
  - Have the notion of virtual DOM instead of simple strings.

-->