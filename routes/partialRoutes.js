const path = require("path");
const router = require("express").Router();
const { authCheck, isLoggedIn } = require("../middleware/authCheck");
const youtube = require("../controllers/youtubeController");
const { formatStreams } = require("../utils/main");

/* Routing */

// Partials -------------
router.get("/editStream/:id", authCheck, isLoggedIn, async (req, res) => {
  const stream = await youtube.getStreamById(req.params.id);
  const [formattedStream] = formatStreams(stream);

  res.render("partials/editStream", {
    model: {
      stream: formattedStream,
    },
    layout: false, //Need this so we just render the partial on its own
  });
});

router.get("/deleteStream/:id", authCheck, isLoggedIn, async (req, res) => {
  const stream = await youtube.getStreamById(req.params.id);
  const [formattedStream] = formatStreams(stream);

  res.render("partials/deleteStream", {
    model: {
      stream: formattedStream,
    },
    layout: false, //Need this so we just render the partial on its own
  });
});

module.exports = router;
