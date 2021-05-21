import { browser } from "webextension-polyfill-ts";
import { lookupCVR, BASE_URL, LICENSE_URL } from "./http";

const DEBUG = true;

export function modulus11check(cvrnumber: string) {
  let sum = 0;

  sum += parseInt(cvrnumber[0]) * 2;
  sum += parseInt(cvrnumber[1]) * 7;
  sum += parseInt(cvrnumber[2]) * 6;
  sum += parseInt(cvrnumber[3]) * 5;
  sum += parseInt(cvrnumber[4]) * 4;
  sum += parseInt(cvrnumber[5]) * 3;
  sum += parseInt(cvrnumber[6]) * 2;

  let remainder = sum % 11;
  let last = remainder != 0 ? 11 - remainder : 0;
  return last === parseInt(cvrnumber[7]);
}

export function getSlugPromise(query: string, vat: boolean) {
  log("IsVAT: " + vat + " Query: " + query);
  let params = vat ? { 'vat': query } : { 'search': query };
  return lookupCVR(params);
};

export async function openCVRwindow(data: any) {
  if (data.error === "QUOTA_EXCEEDED") {
    log("Quota exceeded. Aborting.");
    return;
  }
  let licensed = await hasCookiePromise();
  let base = licensed ? LICENSE_URL : BASE_URL;
  let urlString = `${base}/virksomhed/dk/${data.slug}/${data.vat}`;
  browser.tabs.create({ url: urlString })

}

export function hasCookiePromise() {
  return new Promise((resolve, _) => {
    browser.cookies.get({ url: LICENSE_URL, name: "cvrtjek_app" })
      .then((cookie) => {
        resolve(cookie != null);
      })
  });
}

export function log(logmsg: any) {
  if (DEBUG) {
    console.log(logmsg);
  }
}