class Stream {
  constructor(request, ytStream) {
    (this.id = request.id),
      (this.snippet = {
        title: request.title ?? ytStream.snippet.title,
        description: request.description ?? ytStream.snippet.description,
        scheduledStartTime:
          request.startTime ?? ytStream.snippet.scheduledStartTime,
      }),
      (this.status = {
        privacyStatus: request.privacyStatus ?? ytStream.status.privacyStatus,
      }),
      (this.contentDetails = {
        //What I want to change
        enableAutoStart:
          request.autoStart || ytStream.contentDetails.enableAutoStart,
        enableAutoStop:
          request.autoStop || ytStream.contentDetails.enableAutoStop,
        //Stuff we need to include by default
        enableClosedCaptions: ytStream.contentDetails.enableClosedCaptions,
        enableContentEncryption:
          ytStream.contentDetails.enableContentEncryption,
        enableDvr: ytStream.contentDetails.enableDvr,
        enableEmbed: ytStream.contentDetails.enableEmbed,
        recordFromStart: ytStream.contentDetails.recordFromStart,
        startWithSlate: ytStream.contentDetails.startWithSlate,
        monitorStream: {
          enableMonitorStream:
            ytStream.contentDetails.monitorStream.enableMonitorStream,
          broadcastStreamDelayMs:
            ytStream.contentDetails.monitorStream.broadcastStreamDelayMs,
        },
      });
  }
}

module.exports = Stream;
