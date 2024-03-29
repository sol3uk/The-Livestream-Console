/**
 * Calls multiple promises in parallel
 * Returns object of resolved promises
 * by Steeeeee
 */
const parallelAsync = async (parallelRequests) => {
  const resolvedRequests = await Promise.all(Object.values(parallelRequests));
  const requestKeys = Object.keys(parallelRequests);
  return resolvedRequests.reduce((acc, hR, index) => {
    acc[requestKeys[index]] = hR;
    return acc;
  }, {});
};

function formatStreams(livestreams) {
  return livestreams.data.items.map((o) => ({
    id: o.id,

    title: o.snippet.title,
    description: o.snippet.description,
    startTime: o.snippet.scheduledStartTime,
    actualStartTime: o.snippet.actualStartTime,
    actualEndTime: o.snippet.actualEndTime,
    thumbnail: o.snippet.thumbnails.standard,
    enableAutoStart: o.contentDetails.enableAutoStart,
    enableAutoStop: o.contentDetails.enableAutoStop,

    status: o.status.lifeCycleStatus,
    isLive: o.status.lifeCycleStatus === "live",
    isComplete: o.status.lifeCycleStatus === "complete",
    privacyStatus: o.status.privacyStatus,

    videoLink: `https://www.youtube.com/watch?v=${o.id}`,
    controlRoomLink: `https://studio.youtube.com/video/${o.id}/livestreaming`,
  }));
}

module.exports = { parallelAsync, formatStreams };
