import { browser, Menus } from "webextension-polyfill-ts";

import { searchByString, searchByCVRNo, searchByAllNumbers } from "./cvr";
import { cvrapiResponse, ResultOption, SearchResult } from "./types";
import { log, openCVRwindow } from "./util";

const NUMBER_REGEX = /[^0-9]*/g;


async function searchCVR(info: Menus.OnClickData) {
  let selectedtext = info.selectionText.replace(/\r/g, '').replace(/\n/g, ' ');
  log(`Beginning search for the term: "${selectedtext}"`)
  const numbersearchText = selectedtext.replace(NUMBER_REGEX, '');

  let res = await searchByCVRNo(numbersearchText);
  if (handleResult(res)) {
    return;
  }
  res = await searchByString(selectedtext);
  if (handleResult(res)) {
    return;
  }
  res = await searchByAllNumbers(numbersearchText);
  if (handleResult(res)) {
    return;
  }
  log("Unable to find a result...");
}

function handleResult(input: SearchResult): boolean {
  let result = false;
  switch (input.result) {
    case ResultOption.MATCH:
      log("Opening the result.")
      openCVRwindow(input.data as cvrapiResponse);
      result = true;
      break;
    case ResultOption.QUOTA_EXCEEDED:
      result = true;
      break;
    default:
      break;
  }
  return result;
}


browser.contextMenus.create({
  contexts: ["selection"],
  title: browser.i18n.getMessage("searchDescription"),
  onclick: searchCVR,
});