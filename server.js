const express = require("express");
const apiRoutes = require("./routes/apiRoutes");
const pageRoutes = require("./routes/pageRoutes");
const partialRoutes = require("./routes/partialRoutes");
const { config } = require("./config");
const cookieParser = require("cookie-parser");
const hbs = require("express-handlebars");
const helpers = require("./helpers/helpers");

const PORT = config.port || 8080;
const app = express();
app.use(express.static("public"));
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.engine(
  "handlebars",
  hbs({
    extname: "handlebars",
    defaultLayout: "main",
    helpers: helpers,
    layoutsDir: __dirname + "/views/layouts/",
    partialsDir: __dirname + "/views/partials/",
  })
);
app.set("view engine", "handlebars");

app.use("/api", apiRoutes);
app.use("/modal", partialRoutes);
app.use("/", pageRoutes);

app.listen(PORT);
console.log(`Listening on http://localhost:${PORT}`);
