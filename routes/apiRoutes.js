const router = require("express").Router();
const { authCheck } = require("../middleware/authCheck");
const youtube = require("../controllers/youtubeController");
const Stream = require("../models/Stream");

//#region CREATE
//#endregion

//#region READ
//#endregion

//#region UPDATE
router.post("/streams/stop/:id", authCheck, async (req, res) => {
  try {
    let stoppedStream = await youtube.stopStreamById(req.params.id);

    /* console.log('formattedStreams:', formattedStreams); */
    res.status(200).json({
      redirectUrl: "/streams",
    });
  } catch (e) {
    console.error("ERROR STOPPING:", e);
    res.status(500).json(e);
  }
});

router.post("/streams/edit/:id", authCheck, async (req, res) => {
  try {
    const apiStream = await youtube.getStreamById(req.body.id); //Get stream for other details we need to populate for API

    let streamForAPI = new Stream(req.body, apiStream.data.items[0]);
    let editedStream = await youtube.editStream(streamForAPI);

    res.status(200).json({
      redirectUrl: "/streams",
    });
  } catch (e) {
    console.error("ERROR STOPPING:", e);
    res.status(500).json(e);
  }
});
//#endregion

//#region DELETE
router.delete("/streams/delete/:id", authCheck, async (req, res) => {
  try {
    const response = await youtube.deleteStream(req.params.id); //Get stream for other details we need to populate for API

    res.status(200).json({
      redirectUrl: "/streams",
      message: response,
    });
  } catch (e) {
    console.error("ERROR STOPPING:", e);
    res.status(500).json(e);
  }
});
//#endregion

module.exports = router;
