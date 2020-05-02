const chalk = require("chalk");
const glob = require("glob");
const fs = require("fs-extra");
const path = require("path");
const sleep = require("./sleep");

const args = {
  sourceGlob: "",
  sourceFiles: [],
  delay: 0,
  lines: 0,
};

const colors = {
  black: "black",
  red: "red",
  green: "green",
  yellow: "yellow",
  blue: "blue",
  magenta: "magenta",
  cyan: "cyan",
  white: "white",
  grey: "grey",
  redBright: "redBright",
  greenBright: "greenBright",
  yellowBright: "yellowBright",
  blueBright: "blueBright",
  magentaBright: "magentaBright",
  cyanBright: "cyanBright",
  whiteBright: "whiteBright",
};

const reservedWords = {
  break: "break",
  case: "case",
  catch: "catch",
  class: "class",
  const: "const",
  continue: "continue",
  debugger: "debugger",
  default: "default",
  delete: "delete",
  do: "do",
  else: "else",
  enum: "enum",
  export: "export",
  extends: "extends",
  false: "false",
  finally: "finally",
  for: "for",
  function: "function",
  if: "if",
  import: "import",
  in: "in",
  instanceof: "instanceof",
  new: "new",
  null: "null",
  return: "return",
  super: "super",
  switch: "switch",
  this: "this",
  throw: "throw",
  true: "true",
  try: "try",
  typeof: "typeof",
  var: "var",
  void: "void",
  while: "while",
  with: "with",
  as: "as",
  implements: "implements",
  interface: "interface",
  let: "let",
  package: "package",
  private: "private",
  protected: "protected",
  public: "public",
  static: "static",
  yield: "yield",
  any: "any",
  boolean: "boolean",
  constructor: "constructor",
  declare: "declare",
  get: "get",
  module: "module",
  require: "require",
  number: "number",
  set: "set",
  string: "string",
  symbol: "symbol",
  type: "type",
  from: "from",
  of: "of",
};

async function run() {
  try {
    await parseArgs();
    for (;;) {
      for (let sourceFile of args.sourceFiles) {
        await animate(sourceFile);
      }
    }
  } catch (err) {
    console.log();
    console.log("Usage:");
    console.log(
      "  node index.js source-glob-pattern temp-directory delay-ms lines-per-file"
    );
    console.log();
    console.error(err.stack.toString());

    await sleep(100);
    process.exit(1);
  }
}

async function parseArgs() {
  const cargs = process.argv.slice(2);
  if (cargs.length !== 3) {
    throw new Error(
      `Invalid argument length. Expected 4 but received ${
        cargs.length
      }:\n${JSON.stringify(cargs, undefined, 2)}`
    );
  }

  args.sourceGlob = cargs[0];
  args.delay = parseInt(cargs[1]);
  args.lines = parseInt(cargs[2]);

  const errors = [];

  args.sourceFiles = glob.sync(args.sourceGlob);
  if (args.sourceFiles.length === 0) {
    errors.push(`Source glob did not match any files: ${args.sourceGlob}`);
  }

  if (isNaN(args.delay) || args.delay < 0) {
    errors.push(
      `Delay must be an integer greater than zero, Received '${cargs[1]}`
    );
  }

  if (isNaN(args.lines) || args.lines < 0) {
    errors.push(
      `Lines must be an integer greater than zero, Received '${cargs[2]}`
    );
  }

  if (errors.length) {
    throw new Error(`Invalid arguments.\n\n${errors.join("\n")}\n`);
  }
}

async function animate(sourceFile) {
  const content = await fs.readFile(sourceFile, "utf8");

  const lines = content.split(/\r?\n/);
  if (lines.length > args.lines) {
    lines.length = [args.lines];
  }

  lines.push("--EOF");

  for (let line of lines) {
    const words = line.split(/\b/);
    for (let word of words) {
      let color;

      if (reservedWords[word]) {
        color = colors.blue;
      } else if (/[^\w]+/.test(word)) {
        color = colors.red;
      } else {
        color = colors.white;
      }
      const outWord = chalk[color](word);

      for (let char of outWord) {
        process.stdout.write(char);
        await sleep(args.delay);
      }
    }
    console.log();
  }
}

run();
