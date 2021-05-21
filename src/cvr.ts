import { openCVRwindow, log, modulus11check, getSlugPromise } from "./util";

const MINSEARCH_LENGTH = 4;

export function searchByCVRNo(input: string) {
  log("Inside searchByCVRNo");
  return new Promise((resolve, reject) => {
    if (input.length !== 8 || !modulus11check(input)) {
      resolve(true);
      return;
    }
    getSlugPromise(input, true)
      .then(data => {
        openCVRwindow(data)
        reject(true);
      })
      .catch(err => {
        if (err === "QUOTA_EXCEEDED")
          reject("quota");
        else
          resolve(true);
      });
  });
}

export function searchByString(searchterm: string) {
  log("Inside trySearchString");
  return new Promise((resolve, reject) => {
    log(`searchString. Length: ${searchterm.length} Text: ${searchterm}`);
    if (searchterm.length < MINSEARCH_LENGTH) {
      resolve(true);
      return;
    }
    getSlugPromise(searchterm, false)
      .then(data => {
        openCVRwindow(data)
        reject(true);
      })
      .catch(err => {
        if (err === "QUOTA_EXCEEDED")
          reject("quota");
        else
          resolve(true);
      });
  });
}

export function searchByAllNumbers(allnumbers: string) {
  log("Inside tryModulus11");
  return new Promise((resolve, reject) => {
    while (allnumbers.length >= 8) {
      let currentcandidate = allnumbers.substring(0, 8);
      if (modulus11check(currentcandidate)) {
        //Try the candidate since it passed the mod11 check.
        getSlugPromise(currentcandidate, true)
          .then(data => {
            reject(true);
            openCVRwindow(data);
            return;
          })
          .catch(err => {
            if (err === "QUOTA_EXCEEDED") {
              reject("quota");
              return;
            } else {
              resolve(true);
            }
          });
      }
      allnumbers = allnumbers.substring(1);
    }
    //No more candidates
    resolve(true);
  });
}