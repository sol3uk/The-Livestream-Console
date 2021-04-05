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
    thumbnail: o.snippet.thumbnails.standard,
    enableAutoStart: o.contentDetails.enableAutoStart,
    enableAutoStop: o.contentDetails.enableAutoStop,

    videoLink: "https://www.youtube.com/watch?v=" + o.id,
    //This link with "livestreaming" on the end redirects to the YT studio with broken homepage
    studioLink:
      "https://studio.youtube.com/video/" + o.id /* +'/livestreaming' */,
  }));
}

module.exports = { parallelAsync, formatStreams };
