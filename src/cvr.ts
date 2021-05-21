import { ResultOption, SearchResult } from "./types";
import { log, modulus11check, searchByName, searchByVATNo } from "./util";

const MINSEARCH_LENGTH = 4;

export function searchByCVRNo(input: string): Promise<SearchResult> {
  log("Inside searchByCVRNo");
  return new Promise((resolve, _) => {
    if (input.length !== 8 || !modulus11check(input)) {
      resolve({ result: ResultOption.NO_MATCH, data: undefined });
      return;
    }
    searchByVATNo(input)
      .then(data => {
        resolve(data);
      });
  });
}

export function searchByString(searchterm: string): Promise<SearchResult> {
  log("Inside trySearchString");
  return new Promise((resolve, _) => {
    log(`searchString. Length: ${searchterm.length} Text: ${searchterm}`);
    if (searchterm.length < MINSEARCH_LENGTH) {
      resolve({ result: ResultOption.NO_MATCH, data: undefined });
      return;
    }
    searchByName(searchterm)
      .then(data => {
        resolve(data);
      });
  });
}

export function searchByAllNumbers(allnumbers: string): Promise<SearchResult> {
  log("Inside tryModulus11");
  return new Promise(async (resolve, _) => {
    while (allnumbers.length >= 8) {
      let currentcandidate = allnumbers.substring(0, 8);
      if (modulus11check(currentcandidate)) {
        //Try the candidate since it passed the mod11 check.
        let res = await searchByVATNo(currentcandidate);
        if (res.result in [ResultOption.MATCH, ResultOption.QUOTA_EXCEEDED]) {
          resolve(res);
        }
      }
      allnumbers = allnumbers.substring(1);
    }
    //No more candidates
    resolve({ data: undefined, result: ResultOption.NO_MATCH });
  });
}