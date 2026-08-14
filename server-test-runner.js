require("./dist/index.js").default.listen(Number(process.env.TEST_PORT || 1430), "127.0.0.1");
