let BASE_URL = "https://cvrapi.dk";
let regex = /[^0-9]*/g;

function searchCVR(info) {
  let selectedtext = info.selectionText;
  let numbersearchText = selectedtext.replace(regex, '');
  if (numbersearchText.length === 8 && modulus11check(numbersearchText)) {
    getSlugPromise(numbersearchText, true)
      .then(data => opencvrapi(data))
      .catch(err => {
        console.log(err);
        trySearchString(selectedtext)
      });
  } else {
    trySearchString(selectedtext);
  }
}

function trySearchString(searchterm) {
  console.log("searchString. Length: " + searchterm.length + " Text: " + searchterm);
  if (searchterm.length > 5) {
    getSlugPromise(searchterm, false)
      .then(data => opencvrapi(data))
      .catch(err => {
        console.log(err)
        tryModulus11(searchterm)
      });
  } else {
    tryModulus11(searchterm)
  }
}

function tryModulus11(searchterm) {

  let numbersearchText = searchterm.replace(regex, '');
  let candidates = searchForModulus11Number(numbersearchText);
  console.log("Found " + candidates.length + " candidates:" + candidates);
  tryNextMod11(candidates);
}

function tryNextMod11(candidates) {
  if (candidates.length === 0) {
    return;
  }
  let currentcandidate = candidates.shift();
  getSlugPromise(currentcandidate, true)
    .then(opencvrapi)
    .catch(err => {
      console.log(err);
      tryNextMod11(candidates)
    });
}

function searchForModulus11Number(allnumbers) {
  let candidates = [];
  let max = allnumbers.length - 8 + 1;
  let found = false;
  let i = 0;
  while (!found && i < max) {
    let currentcvr = allnumbers.substring(i, i + 8);
    console.log("Currently checking: " + currentcvr);
    if (modulus11check(currentcvr)) {
      candidates.push(currentcvr);
    }
    i++;
  }
  console.log("Modolus11-matching numbers:" + candidates);
  return candidates;
}

function modulus11check(cvrnumber) {
  let sum = 0;

  sum += cvrnumber[0] * 2;
  sum += cvrnumber[1] * 7;
  sum += cvrnumber[2] * 6;
  sum += cvrnumber[3] * 5;
  sum += cvrnumber[4] * 4;
  sum += cvrnumber[5] * 3;
  sum += cvrnumber[6] * 2;

  let remainder = sum % 11;
  let last = remainder != 0 ? 11 - remainder : 0;
  return last == cvrnumber[7];
}

function getSlugPromise(cvrnumber, vat) {
  return new Promise((resolve, reject) => {
    console.log("IsVAT: " + vat + " Query: " + cvrnumber);
    let term = vat ? 'vat' : 'search';
    let url = BASE_URL + '/api?country=dk&slug=1&' + term + '=' + cvrnumber;
    console.log("url:" + url);

    let request = new XMLHttpRequest();
    request.open('GET', url, true);
    request.onload = () => {
      if (request.status >= 200 && request.status < 400) {
        let data = JSON.parse(request.responseText);
        if (data && data.slug && data.vat) {
          resolve({ "slug": data.slug, "vat": data.vat });
        } else {
          reject("Invalid data.");
        }
      } else {
        reject("Wrong status code.");
      }
    }
    request.onerror = () => { reject("wtf") };
    request.send();
  }
  );
};

function opencvrapi(data) {
  let urlString = BASE_URL + "/virksomhed/dk/" + data.slug + "/" + data.vat;
  window.open(urlString);
}

function writeError(errorString) {
  console.error("Not valid CVR number! " + errorString);
}

chrome.contextMenus.create({
  contexts: ["selection"],
  title: "Søg efter '%s' på CVR API",
  onclick: searchCVR
});