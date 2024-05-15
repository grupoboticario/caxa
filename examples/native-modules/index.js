(async () => {
  const os = require("os");
  const path = require("path");
  const fs = require("fs-extra");
  const cryptoRandomString = require("crypto-random-string");

  const temporaryDirectory = path.join(
    os.tmpdir(),
    "caxa/examples/native-modules",
    cryptoRandomString({ length: 10, type: "alphanumeric" }).toLowerCase()
  );
  await fs.ensureDir(temporaryDirectory);

  const Database = require("better-sqlite3");
  const database = new Database(path.join(temporaryDirectory, "database.db"));
  database.prepare(`CREATE TABLE caxaExampleNativeModules (example TEXT);`).run();
  database.prepare(
    `INSERT INTO caxaExampleNativeModules (example) VALUES (?)`
  ).run("caxa native modules");
  console.log(
    "@leafac/sqlite:",
    JSON.stringify(
      database.prepare(`SELECT example FROM caxaExampleNativeModules`).get(),
      undefined,
      2
    )
  );

  const sharp = require("sharp");
  const imageFile = path.join(temporaryDirectory, "image.png");
  await fs.writeFile(
    imageFile,
    await sharp({
      create: {
        width: 48,
        height: 48,
        channels: 4,
        background: { r: 255, g: 0, b: 0, alpha: 0.5 },
      },
    })
      .png()
      .toBuffer()
  );
  console.log("sharp:", (await sharp(imageFile).metadata()).width);
})();
