const express = require("express");
const { config } = require("./config");
const cookieParser = require("cookie-parser");
const hbs = require("express-handlebars");
const helpers = require("./helpers/helpers");
const { authCheck } = require("./middleware/authCheck");
const youtube = require("./controllers/youtubeController");

const app = express();
app.use(express.static("public"));
app.use(cookieParser());

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

//Routing -------------
app.get("/auth/redirect", async (req, res) => {
  if (!req.query.code) return res.status(400);
  const { tokens } = await youtube.getGoogleAuthToken(req.query.code);
  res.cookie("google_tokens", tokens, {
      maxAge: 1000 * 60 * 60,
      httpOnly: true,
    })
    .redirect("/dashboard");
});

app.get("/dashboard", authCheck, async (req, res) => {
  res.render("dashboard", {
    model: {
      path: {
        dashboard: "dashboard",
      },
      loggedIn: true,
    },
  });
});

app.get("/streams", authCheck, async (req, res) => {
  try {
    let formattedStreams = await youtube.getFormattedStreams();
    /* console.log('formattedStreams:', formattedStreams); */
    res.render("streams", {
      model: {
        streams: formattedStreams,
        path: {
          streams: "streams",
        },
        loggedIn: true,
      },
    });
  } catch (e) {
    console.error("ERROR - /streams:", e);
    if (e.errors) {
      res.render("streams", {
        model: {
          error: {
            errorMessage: e.errors[0].message,
            helpLink: e.errors[0].extendedHelp,
            code: e.code,
          },
          path: {
            streams: "streams",
          },
          loggedIn: true,
        },
      });
    } else {
      res.redirect("/");
    }
  }
});

app.get("/", (req, res) => {
  if (req.cookies.google_tokens) {
    return res.redirect("/dashboard");
  }
  const url = youtube.genConsentUrl();
  return res.render("home", {
    model: {
      url,
      path: {
        home: "home",
      },
      loggedIn: false,
    },
  });
});

app.get("/logout", (req, res) => {
  return res.clearCookie("google_tokens").redirect("/");
});

app.listen(config.port || 8080);
console.log("Listening on port", config.port || 8080);
