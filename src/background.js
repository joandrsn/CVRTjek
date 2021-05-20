import { tabs, cookies, menus, i18n } from "webextension-polyfill";
import { lookupCVR, BASE_URL, LICENSE_URL } from "./http";

let NUMBER_REGEX = /[^0-9]*/g;
let MINSEARCH_LENGTH = 4;
let DEBUG = false;

function searchCVR(info) {
  let selectedtext = info.selectionText;
  log(`Beginning search for the term: "${selectedtext}"`)
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
  let params = vat ? { 'vat': query } : { 'search': query };
  return lookupCVR(params);
};

function opencvrapi(data) {
  console.log(data);
  hasCookiePromise(data).then((islicensed) => openCVRwindow(islicensed))
}

function openCVRwindow(data) {
  let base = data['licensed'] === true ? LICENSE_URL : BASE_URL;
  let urlString = base + "/virksomhed/dk/" + data.slug + "/" + data.vat;
  Promise.resolve(tabs.create({ url: urlString }));

}

function hasCookiePromise(data) {
  return new Promise((resolve, _) => {
    cookies.get({ url: "https://app.cvrtjek.dk", name: "cvrtjek_app" }, (cookie) => {
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

menus.create({
  contexts: ["selection"],
  title: i18n.getMessage("searchDescription"),
  onclick: searchCVR
});