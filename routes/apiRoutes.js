const router = require("express").Router();
const { authCheck } = require("../middleware/authCheck");
const youtube = require("../controllers/youtubeController");

router.post("/streams/stop/:id", authCheck, async (req, res) => {
  try {
    let stoppedStream = await youtube.stopStream(req.params.id);

    /* console.log('formattedStreams:', formattedStreams); */
    res.status(200).json({
      redirectUrl: "/streams",
    });
  } catch (e) {
    console.error("ERROR STOPPING:", e);
    res.status(500).json(err);
  }
});

module.exports = router;
