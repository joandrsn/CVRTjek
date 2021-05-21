import get from "axios";
import { ResultOption, SearchQuery, SearchResult, VATQuery } from "./types";
import { log } from "./util";

export function lookupCVR(inputparams: VATQuery | SearchQuery): Promise<SearchResult> {
  return new Promise((resolve, _) => {
    let parameters = {
      country: 'dk',
      slug: 1,
      ...inputparams
    };
    get(API_URL, { params: parameters })
      .then(
        res => {
          if (res.status !== 200) {
            resolve({ data: res.data, result: ResultOption.NOT_FOUND });
          }
          if (res.data.error === "QUOTA_EXCEEDED") {
            resolve({ data: res.data, result: ResultOption.QUOTA_EXCEEDED });
          } else {
            resolve({ data: res.data, result: ResultOption.MATCH });
          }
        }
      ).catch(err => {
        if (err.status === 404) {
          resolve({ data: err.data, result: ResultOption.NOT_FOUND });
        } else {
          log(err);
        }
      });
  });
}

export const BASE_URL = "https://cvrapi.dk";
const API_URL = `${BASE_URL}/api`;
export const LICENSE_URL = "https://app.cvrtjek.dk";