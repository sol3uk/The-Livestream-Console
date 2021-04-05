//#region FETCH METHODS
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
    response
      .json()
      .then((json) =>
        resolve({
          status: response.status,
          ok: response.ok,
          json,
        })
      )
      .catch((error) => {
        console.log(error);
      })
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
/**
 * Requests a partial from a URL, returning a promise
 *
 * @param  {string} url       The URL we want to request
 * @param  {object} [options] The options we want to pass to "fetch"
 *
 * @return {Promise}           The request promise
 */
function partialRequest(url, options) {
  return new Promise((resolve, reject) => {
    fetch(url, options)
      .then((response) => {
        if (response.ok) {
          return resolve(response.text()); //parse raw text for HTML partials
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
//#endregion

//#region Utilities ----------------------

/**
 * @example
 * //Get Form
 * let form = document.querySelector('#post');
 * //Get all field data from the form
 * let data = new FormData(form);
 * //Convert to an object
 * let formObj = serializeFormData(data);
 *
 * @param  {object} data The FormData you need serializing
 *
 * @return {object} The parsed JSON, status from the FormData
 */
function serializeFormData(data) {
  let obj = {};
  for (let [key, value] of data) {
    if (obj[key] !== undefined) {
      if (!Array.isArray(obj[key])) {
        obj[key] = [obj[key]];
      }
      obj[key].push(value);
    } else {
      obj[key] = value;
    }
  }
  return obj;
}

function startSpinnerAndDisable(element, disable = false) {
  let spinnerEle = `<span class="isLoading spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>`;

  //Want to, but can't use optional chaining as it's not fully cross browser capable yet
  //https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Optional_chaining
  if (element && element.classList.contains("btn")) {
    //do button spinner
    element.disabled = disable;
    element.innerHTML = spinnerEle + element.innerHTML;
  } else if (element instanceof HTMLFormElement) {
    console.log("it's a form!");
    disableFormElements(element);
    //TO DO: check if element is form and set spinner on form element
  } else {
    //TO DO: do site wide spinner
  }
}

function removeSpinners(element) {
  let elements = document.getElementsByClassName("isLoading");
  while (elements.length > 0) {
    elements[0].parentNode.removeChild(elements[0]);
  }
  if (element && element.classList.contains("btn")) {
    //re-enable button that was disabled
    element.disabled = false;
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

// $0.innerHTML = HTML; // does *NOT* run <script> tags in HTML
// setInnerHTML($0, HTML); // does run <script> tags in HTML
// From https://stackoverflow.com/a/47614491
function setInnerHTML(elm, html) {
  elm.innerHTML = html;
  Array.from(elm.querySelectorAll("script")).forEach((oldScript) => {
    const newScript = document.createElement("script");
    Array.from(oldScript.attributes).forEach((attr) =>
      newScript.setAttribute(attr.name, attr.value)
    );
    newScript.appendChild(document.createTextNode(oldScript.innerHTML));
    oldScript.parentNode.replaceChild(newScript, oldScript);
  });
}

function disableFormElements(form) {
  var allElements = form.elements;
  for (var i = 0, l = allElements.length; i < l; ++i) {
    // allElements[i].readOnly = true;
    allElements[i].disabled = true;
  }
}

//#endregion

/// Actions ----------------------
function stopStream(id, element) {
  startSpinnerAndDisable(element, true);

  let url = `/api/streams/stop/${id}`;
  const response = request(url, {
    method: "POST",
    cache: "no-cache",
    headers: {
      "Content-Type": "application/json",
    },
    referrerPolicy: "no-referrer",
    body: JSON.stringify(data),
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

function editStreamModal(id, element) {
  //Get Bootstrap modal so we can manipulate it later

  startSpinnerAndDisable(element, true);

  let url = `/modal/editStreams/${id}`;
  const response = partialRequest(url, {
    method: "GET",
    cache: "no-cache",
    referrerPolicy: "no-referrer",
  })
    .then(function (data) {
      removeSpinners(element);
      let modalElement = document.getElementById("editStreamsModal");
      setInnerHTML(modalElement, data);
      let modal = new bootstrap.Modal(modalElement);
      modal.show();
      //TODO: dispose of old modals after they are closed
    })
    .catch(function (error) {
      removeSpinners();
      /* hideAndResetModal("stopStreamsModal"); */

      addError(error);
      console.log("Request failed: ", error);
    });
}

function editStream(e) {
  e.preventDefault();
  let formData = new FormData(e.target);
  let formObj = serializeFormData(formData);
  if (formObj.autoStart) {
    formObj.autoStart = formObj.autoStart === "on" ? true : false;
  }
  if (formObj.autoStop) {
    formObj.autoStop = formObj.autoStop === "on" ? true : false;
  }
  startSpinnerAndDisable(e.target, true);

  let url = `/api/streams/edit/${formObj.id}`;
  const response = request(url, {
    method: "POST",
    cache: "no-cache",
    headers: {
      "Content-Type": "application/json",
    },
    referrerPolicy: "no-referrer",
    body: JSON.stringify(formObj),
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
