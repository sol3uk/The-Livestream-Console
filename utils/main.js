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

module.exports = parallelAsync;
