const { streamStatus } = require("../models/constants");
const { google } = require("googleapis");
const { googleAuth } = require("../googleAuth");
const youtube = google.youtube({
  version: "v3",
  auth: googleAuth,
});

module.exports = {
  async getGoogleAuthToken(code) {
    return googleAuth.getToken(code);
  },

  genConsentUrl() {
    return googleAuth.generateAuthUrl({
      access_type: "offline",
      scope: ["https://www.googleapis.com/auth/youtube"],
    });
  },

  async getStreams(status = streamStatus.UPCOMING, limit = 10) {
    const livestreams = await youtube.liveBroadcasts.list({
      part: "snippet,contentDetails",
      broadcastStatus: status,
      maxResults: limit,
    });
    /* console.log(livestreams.data.items[0]); */

    let formattedStreams = formatStreams(livestreams);
    return formattedStreams;
  },

  async getStreamById(streamId) {
    const livestreams = await youtube.liveBroadcasts.list({
      id: streamId,
      part: "snippet,contentDetails",
    });

    let formattedStreams = formatStreams(livestreams);
    return formattedStreams;
  },

  async stopStream(id) {
    let response = await youtube.liveBroadcasts.transition({
      broadcastStatus: "complete",
      id: id,
      part: "snippet, status",
    });
    console.log(
      "STOPPED STREAM ----------------- :",
      response.data.id,
      response.data.snippet?.title
    );
    return response;
  },
};

//Private methods -----
function formatStreams(livestreams) {
  return livestreams.data.items.map((o) => ({
    id: o.id,
    title: o.snippet.title,
    description: o.snippet.description,
    startTime: o.snippet.scheduledStartTime,
    thumbnail: o.snippet.thumbnails.standard,
    videoLink: "https://www.youtube.com/watch?v=" + o.id,
    //This link with "livestreaming" on the end redirects to the YT studio with broken homepage
    studioLink:
      "https://studio.youtube.com/video/" + o.id /* +'/livestreaming' */,
    enableAutoStart: o.contentDetails.enableAutoStart,
    enableAutoStop: o.contentDetails.enableAutoStop,
  }));
}
