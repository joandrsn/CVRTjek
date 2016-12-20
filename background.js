function modulus11check (cvrnumber) 
{
  var weight = [2, 7, 6, 5, 4, 3, 2];
  var number = 0;
  for (var i = weight.length - 1; i >= 0; i--) 
  {
    number += parseInt(cvrnumber[i]) * weight[i];
  }
  return (11 - number % 11) === parseInt(cvrnumber[7]);
}

var regex = /[^0-9]*/g;

function searchCVR (info)
{
  var cvrnumber = info.selectionText.replace(regex, '');

  console.log(cvrnumber);

  if(cvrnumber.length != 8)
    return writeError("Legth less that 8");

  if(!modulus11check(cvrnumber))
    return writeError("Failed modulus11check");

  var request = new XMLHttpRequest();

  request.open('GET', 'https://cvrapi.dk/api?country=dk&slug=1&search=' + cvrnumber, true);
  request.onload = function() 
  {
    if (request.status >= 200 && request.status < 400) 
    {
      console.log("Success!");

      var data = JSON.parse(request.responseText);
      console.log(data);

      var urlString = "https://cvrapi.dk/virksomhed/dk/" + data.slug + "/" + data.vat;
      window.open(urlString);
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

function writeError (errorString)
{
  console.error("Not valid CVR number! " + errorString);
}



chrome.contextMenus.create({
  contexts: ["selection"],
  title: "Søg efter '%s' på CVR API",
  onclick : searchCVR
});