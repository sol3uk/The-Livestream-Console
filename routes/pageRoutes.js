const path = require("path");
const router = require("express").Router();
const { authCheck } = require("../middleware/authCheck");
const youtube = require("../controllers/youtubeController");
const { streamStatus } = require("../models/constants");

/* Routing */
// Auth -------------
router.get("/auth/redirect", async (req, res) => {
  if (!req.query.code) return res.status(400);
  const { tokens } = await youtube.getGoogleAuthToken(req.query.code);
  res
    .cookie("google_tokens", tokens, {
      maxAge: 1000 * 60 * 60,
      httpOnly: true,
    })
    .redirect("/dashboard");
});

// Main Pages -------------
router.get("/dashboard", authCheck, async (req, res) => {
  res.render("dashboard", {
    model: {
      path: {
        dashboard: "dashboard",
      },
      loggedIn: true,
    },
  });
});

router.get("/streams", authCheck, async (req, res) => {
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

// Generic Routes -------------
router.get("/", (req, res) => {
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

router.get("/logout", (req, res) => {
  return res.clearCookie("google_tokens").redirect("/");
});

module.exports = router;
