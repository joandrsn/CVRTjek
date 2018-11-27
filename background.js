let BASE_URL = "https://cvrapi.dk";
let LICENSE_URL = "https://app.cvrtjek.dk"
let NUMBER_REGEX = /[^0-9]*/g;
let MINSEARCH_LENGTH = 4;
let DEBUG = false;

function searchCVR(info) {
  let selectedtext = info.selectionText;
  log(`Begging search for the term: "${selectedtext}"`)
  let numbersearchText = selectedtext.replace(NUMBER_REGEX, '');
  if (numbersearchText.length === 8 && modulus11check(numbersearchText)) {
    getSlugPromise(numbersearchText, true)
      .then(data => opencvrapi(data))
      .catch(err => {
        log(err);
        trySearchString(selectedtext)
      });
  } else {
    trySearchString(selectedtext);
  }
}

function trySearchString(searchterm) {
  log(`searchString. Length: ${searchterm.length} Text: ${searchterm}`);
  if (searchterm.length > MINSEARCH_LENGTH) {
    getSlugPromise(searchterm, false)
      .then(data => opencvrapi(data))
      .catch(err => {
        log(err)
        tryModulus11(searchterm)
      });
  } else {
    tryModulus11(searchterm)
  }
}

function tryModulus11(searchterm) {

  let numbersearchText = searchterm.replace(NUMBER_REGEX, '');
  let candidates = searchForModulus11Number(numbersearchText);
  log(`Found ${candidates.length} candidates: ${candidates}`);
  tryNextMod11(candidates);
}

function tryNextMod11(candidates) {
  if (candidates.length === 0) {
    log("Nothing found.");
    return;
  }
  let currentcandidate = candidates.shift();
  getSlugPromise(currentcandidate, true)
    .then(opencvrapi)
    .catch(err => {
      log(err);
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
    log(`Currently checking: ${currentcvr}`);
    if (modulus11check(currentcvr)) {
      candidates.push(currentcvr);
    }
    i++;
  }
  log(`Modolus11-matching numbers: ${candidates}`);
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

function getSlugPromise(query, vat) {
  log("IsVAT: " + vat + " Query: " + query);
  let term = vat ? 'vat' : 'search';
  let url = `${BASE_URL}/api?country=dk&slug=1&${term}=${query}`;
  return makeAJAXPromise(url);
};

function makeAJAXPromise(url) {
  return new Promise((resolve, reject) => {
    let request = new XMLHttpRequest();
    request.open('GET', url, true);
    request.onload = () => {
      if (request.status >= 200 && request.status < 400) {
        let data = JSON.parse(request.responseText);
        if (data) {
          resolve(data);
        } else {
          reject("Invalid data.");
        }
      } else {
        reject("Wrong status code.");
      }
    }
    request.onerror = () => { reject("wtf") };
    request.send();
  });
}

function opencvrapi(data) {
  hasCookiePromise(data).then((islicensed) => openCVRwindow(islicensed))
}

function openCVRwindow(data){
  let base = data['licensed'] === true ? LICENSE_URL : BASE_URL;
  let urlString = base + "/virksomhed/dk/" + data.slug + "/" + data.vat;
  window.open(urlString); 
}

function hasCookiePromise(data) {
  return new Promise((resolve, reject) => {
    chrome.cookies.get({url: "https://app.cvrtjek.dk", name: "cvrtjek_app"}, (cookie) => {
      data['licensed'] = cookie != null;
      resolve(data);
    })    
  });
}

function log(logmsg) {
  if (DEBUG) {
    console.log(logmsg);
  }
}

chrome.contextMenus.create({
  contexts: ["selection"],
  title: "Søg efter '%s' på CVR API",
  onclick: searchCVR
});