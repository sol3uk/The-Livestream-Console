const path = require("path");
const router = require("express").Router();
const { authCheck, isLoggedIn } = require("../middleware/authCheck");
const youtube = require("../controllers/youtubeController");
const { streamStatus } = require("../models/constants");

/* Routing */
// Auth -------------
router.get("/auth/redirect", async (req, res) => {
  if (!req.query.code) return res.status(400);
  const { tokens } = await youtube.getGoogleAuthToken(req.query.code);
  res
    .cookie("google_tokens", tokens, {
      maxAge: 1000 * 60 * 60 * 24, //1 day token
      httpOnly: true,
    })
    .redirect("/dashboard");
});

// Main Pages -------------
router.get("/dashboard", authCheck, isLoggedIn, async (req, res) => {
  res.render("dashboard", {
    model: {
      path: {
        dashboard: "dashboard",
      },
      loggedIn: req.isLoggedIn,
    },
  });
});

router.get("/streams", authCheck, isLoggedIn, async (req, res) => {
  try {
    let upcomingStreams = await youtube.getStreams(streamStatus.UPCOMING);
    let activeStream = await youtube.getStreams(streamStatus.ACTIVE, 1);
    let lastStream = await youtube.getStreams(streamStatus.COMPLETED, 1);
    /* console.log('formattedStreams:', formattedStreams); */
    res.render("streams", {
      model: {
        streams: {
          active: activeStream,
          upcoming: upcomingStreams,
          last: lastStream,
        },
        path: {
          streams: "streams",
        },
        loggedIn: req.isLoggedIn,
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
          loggedIn: req.isLoggedIn,
        },
      });
    } else {
      res.redirect("/");
    }
  }
});

router.get("/about", isLoggedIn, async (req, res) => {
  res.render("about", {
    model: {
      path: {
        about: "about",
      },
      loggedIn: req.isLoggedIn,
    },
  });
});

router.get("/TOS", isLoggedIn, async (req, res) => {
  res.render("TOS", {
    model: {
      path: {
        TOS: "TOS",
      },
      loggedIn: req.isLoggedIn,
    },
  });
});

router.get("/privacy", isLoggedIn, async (req, res) => {
  res.render("privacy", {
    model: {
      path: {
        privacy: "privacy",
      },
      loggedIn: req.isLoggedIn,
    },
  });
});
// Generic Routes -------------
router.get("/", isLoggedIn, (req, res) => {
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
      loggedIn: req.isLoggedIn,
    },
  });
});

router.get("/logout", (req, res) => {
  return res.clearCookie("google_tokens").redirect("/");
});

module.exports = router;
