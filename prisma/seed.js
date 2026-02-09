process.env.TS_NODE_CACHE = "false";

require("ts-node").register({
  transpileOnly: true,
  compilerOptions: {
    module: "CommonJS",
    moduleResolution: "node",
    target: "ES2020",
    moduleDetection: "force",
    verbatimModuleSyntax: false,
  },
});

require("./seed.ts");
