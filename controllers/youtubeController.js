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

  async getFormattedStreams() {
    const livestreams = await youtube.liveBroadcasts.list({
      part: "snippet,contentDetails",
      broadcastStatus: "upcoming",
    });
    console.log(livestreams.data.items);

    let formattedStreams = livestreams.data.items.map((o) => ({
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
    }));
    return formattedStreams;
  },
};
