import { browser, Menus } from "webextension-polyfill-ts";
import { searchByString, searchByCVRNo, searchByAllNumbers } from "./cvr";
import { log } from "./util";

const NUMBER_REGEX = /[^0-9]*/g;


async function searchCVR(info: Menus.OnClickData) {
  let selectedtext = info.selectionText;
  log(`Beginning search for the term: "${selectedtext}"`)
  const numbersearchText = selectedtext.replace(NUMBER_REGEX, '');

  searchByCVRNo(numbersearchText)
    .then(_ => searchByString(selectedtext))
    .then(_ => searchByAllNumbers(numbersearchText))
    .then(_ => log("Unable to find a result..."))
    .catch(_ => {
      //ignore
    });
}


browser.menus.create({
  contexts: ["selection"],
  title: browser.i18n.getMessage("searchDescription"),
  onclick: searchCVR,
});