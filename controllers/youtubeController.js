const { streamStatus } = require("../models/constants");
const { google } = require("googleapis");
const { googleAuth } = require("../googleAuth");
const youtube = google.youtube({
  version: "v3",
  auth: googleAuth,
});
const part = "snippet,contentDetails, status";
const Stream = require("../models/Stream");

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

  //#region CREATE
  async createStream(streamData) {
    let response = await youtube.liveBroadcasts.insert({
      part,
      // Request body metadata
      requestBody: streamData,
    });
    console.log(
      "ADDED STREAM ----------------- :",
      response.data.id,
      response.data.snippet?.title
    );
    return response;
  },
  //#endregion

  //#region READ
  async getStreams(status = streamStatus.UPCOMING, limit = 10) {
    const livestreams = await youtube.liveBroadcasts.list({
      part,
      broadcastStatus: status,
      maxResults: limit,
    });
    /* console.log(livestreams.data.items[0]); */

    return livestreams;
  },

  async getStreamById(streamId) {
    const livestreams = await youtube.liveBroadcasts.list({
      id: streamId,
      part,
    });

    return livestreams;
  },
  //#endregion

  //#region UPDATE
  async stopStreamById(id) {
    let response = await youtube.liveBroadcasts.transition({
      broadcastStatus: "complete",
      id: id,
      part,
    });
    console.log("STOPPED STREAM ----------------- :", response);
    return response;
  },

  async editStream(streamData) {
    let response = await youtube.liveBroadcasts.update({
      part,
      // Request body metadata
      requestBody: streamData,
    });
    console.log(
      "UPDATED STREAM ----------------- :",
      response.data.id,
      response.data.snippet?.title
    );
    return response;
  },
  //#endregion

  //#region DELETE
  async deleteStream(streamId) {
    let response = await youtube.liveBroadcasts.delete({
      id: streamId,
    });
    console.log("DELETED STREAM ----------------- :", streamId);
    return response;
  },
  //#endregion
};
