function modulus11check (cvrnumber) 
{
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

let regex = /[^0-9]*/g;

function searchCVR (info)
{
  let cvrnumber = info.selectionText.replace(regex, '');

  console.log("Input: " + cvrnumber);
  console.log("Input length: " + cvrnumber.length);

  if (cvrnumber.length < 8) {
    return writeError("Length less that 8");
  }
  else if (cvrnumber.length === 8) {
    if (!modulus11check(cvrnumber))
      return writeError("Failed modulus11check");
  }
  else {
    let max = cvrnumber.length - 8 + 1;
    let found = false;
    let i = 0;
    while(!found && i < max) {
      let currentcvr = cvrnumber.substring(i, i + 8);
      console.log("Currently checking: " + currentcvr);
      if (modulus11check(currentcvr)) {
        found = true;
        cvrnumber = currentcvr;
        console.log("CVRnumber " + cvrnumber +  " matches modulus11check!");
      }
      i++;
    }
    if (!found)
      return writeError("Failed modulus11check (search)");
  }
  
  let slug = getSlug(cvrnumber);
}

function getSlug (cvrnumber) {
  let request = new XMLHttpRequest();

  request.open('GET', 'https://cvrapi.dk/api?country=dk&slug=1&search=' + cvrnumber, true);
  request.onload = function() 
  {
    if (request.status >= 200 && request.status < 400) 
    {
      console.log("Got slug!");

      let data = JSON.parse(request.responseText);
      console.log(data);

      opencvrapi(data);
    } 
    else 
    {
      console.error("Wrong status code");
    }
  }
  request.onerror = function() {
    console.error("There was an error.");
  }
  request.send();
}

function opencvrapi (data) {
  let urlString = "https://cvrapi.dk/virksomhed/dk/" + data.slug + "/" + data.vat;
  window.open(urlString);
}

function writeError (errorString)
{
  console.error("Not valid CVR number! " + errorString);
}

chrome.contextMenus.create({
  contexts: ["selection"],
  title: "Søg efter '%s' på CVR API",
  onclick : searchCVR
});