import get from "axios";
import { SearchQuery, VATQuery } from "./types";

export function lookupCVR(inputparams: VATQuery | SearchQuery) {
  return new Promise((resolve, reject) => {
    let parameters = {
      country: 'dk',
      slug: 1,
      ...inputparams
    };
    get(API_URL, { params: parameters }).then(
      res => {
        console.log(res);
        if (res.status != 200) {
          reject("not found");
        }
        if (res.data.error === "QUOTA_EXCEEDED") {
          reject("QUOTA_EXCEEDED");
        } else {
          resolve(res.data);
        }
      }
    ).catch(err => reject(err));
  });
}

export const BASE_URL = "https://cvrapi.dk";
const API_URL = `${BASE_URL}/api`
export const LICENSE_URL = "https://app.cvrtjek.dk";