const path = require("path");
const router = require("express").Router();
const { authCheck, isLoggedIn } = require("../middleware/authCheck");
const youtube = require("../controllers/youtubeController");

/* Routing */

// Partials -------------
router.get("/editStreams/:id", authCheck, isLoggedIn, async (req, res) => {
  const stream = await youtube.getStreamById(req.params.id);
  console.log(stream);

  res.render("partials/editStream", {
    model: {
      stream,
    },
    layout: false, //Need this so we just render the partial on its own
  });
});

module.exports = router;
