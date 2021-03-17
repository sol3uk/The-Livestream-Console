// Generic JSON parsing & network error catching fetch, from https://github.com/github/fetch/issues/203#issuecomment-266034180
/**
 * Parses the JSON returned by a network request
 *
 * @param  {object} response A response from a network request
 *
 * @return {object}          The parsed JSON, status from the response
 */
function parseJSON(response) {
  return new Promise((resolve) =>
    response.json().then((json) =>
      resolve({
        status: response.status,
        ok: response.ok,
        json,
      })
    )
  );
}

/**
 * Requests a URL, returning a promise
 *
 * @param  {string} url       The URL we want to request
 * @param  {object} [options] The options we want to pass to "fetch"
 *
 * @return {Promise}           The request promise
 */
function request(url, options) {
  return new Promise((resolve, reject) => {
    fetch(url, options)
      .then(parseJSON)
      .then((response) => {
        if (response.ok) {
          return resolve(response.json);
        }
        // extract the error from the server's json
        return reject(response.json);
      })
      .catch((error) =>
        reject({
          networkError: error,
        })
      );
  });
}

// ----------------------

/// Utilities ----------------------
function startSpinner(element, disable = false) {
  let spinnerEle = `<span class="isLoading spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>`;

  if (element?.classList?.contains("btn")) {
    //do button spinner
    element.disabled = disable;
    element.innerHTML = spinnerEle + element.innerHTML;
  } else {
    //TO DO: do site wide spinner
  }
}

function removeSpinners() {
  let elements = document.getElementsByClassName("isLoading");
  while (elements.length > 0) {
    elements[0].parentNode.removeChild(elements[0]);
  }
}

function hideAndResetModal(modalId) {
  let modalElement = document.getElementById(modalId);
  let modal = bootstrap.Modal.getInstance(modalElement);
  let elements = modalElement.getElementsByClassName("btn");
  for (i = 0; i < elements.length; i++) {
    elements[i].disabled = false;
  }
  modal.hide();
}

function addError(error, link, noDismiss) {
  const closeButton = `<button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>`;
  let helpfulLinkElement = link
    ? ` <a href="${model.error.helpLink}" class="alert-link">more information</a>`
    : "";
  let errorElement = `<div class="alert alert-danger alert-dismissible fade show" role="alert">There was an error: <i>${error}</i>${helpfulLinkElement}. ${
    noDismiss ?? closeButton
  }</div>`;

  document.getElementById("errorContainer").innerHTML = errorElement;
}
/// ----------------------

/// Actions ----------------------
function stopStream(id, element) {
  //Get Bootstrap modal so we can manipulate it later

  startSpinner(element, true);

  let url = `/streams/stop/${id}`;
  const response = request(url, {
    method: "POST", // *GET, POST, PUT, DELETE, etc.
    cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
    headers: {
      "Content-Type": "application/json",
      // 'Content-Type': 'application/x-www-form-urlencoded',
    },
    referrerPolicy: "no-referrer", // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
  })
    .then(function (data) {
      window.location.href = data.redirectUrl; //redirect after successful stop
    })
    .catch(function (error) {
      removeSpinners();
      hideAndResetModal("stopStreamsModal");

      addError(error);
      console.log("Request failed: ", error);
    });
}
/// ----------------------
