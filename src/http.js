import { get } from "axios";

export function lookupCVR(inputparams) {
  return new Promise((resolve, reject) => {
    let parameters = {
      country: 'dk',
      slug: 1,
      ...inputparams
    };
    get(API_URL, { params: parameters }).then(
      res => {
        if (res.status != 200) {
          reject(res.data);
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