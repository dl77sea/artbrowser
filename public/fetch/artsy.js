var strArtsyApiBaseUrl = "https://api.artsy.net/api/";

var partnersSEA = [
  "53d26e7b776f723ccc140100", //Mariane Ibrahim Gallery
  "545102d5776f72231efe0000", //Greg Kucera Gallery *
  "52b78578139b2159b5000adf", //Koplin Del Rio
  "52a8f1ec139b21fc440001c8", //Winston Wachter Fine Artsy--
  "52cef4b4b202a321ae0000e0", //G.Gibson Gallery--
  "537cb20d9c18dbb4f90003c1", //Traver Gallery
  "52276818ebad644079000123", //Bau Xi Gallery ???
  "52cf2bdf139b21e49f00045a", //Linda Hodges Gallery
  "559da25a72616970f2000249", //Abmeyer + Wood Fine Artsy ???
  "54bfed927261692b4db20100" //Foster/White Gallery
]

var strToken;

let partners = partnersSEA;

function authenticate() {
  $auth = $.post("https://api.artsy.net/api/tokens/xapp_token?client_id=4abaf180f92e4b617234&client_secret=4a7d07d8560a37d08c8683be00e3bc4a");
  $auth.done(function(responseData) {
    if ($auth.status !== 201) {
      console.log("$auth exit status: ", $auth.status);
      return;
    }
    strToken = responseData.token;
    console.log("auth: ", responseData.token); //_embedded.shows
    getVenues(partners).then(console.log("Done: ", shows))
  });
}

var shows = [];

function getVenues(partners) {
  return new Promise(function(resolve, reject) {
    //que up calls to artsy.net to filter for shows that have a current running show w/ press release or description
    for (let i = 0; i < partners.length; i++) {
      let $xhr = $.ajax({
        url: "https://api.artsy.net/api/shows?partner_id=" + partners[i] + "&status=running",
        url: strArtsyApiBaseUrl + "shows?partner_id=" + partners[i] + "&status=running",
        type: "GET",
        beforeSend: function(xhr) {
          xhr.setRequestHeader('X-Xapp-Token', strToken);
        },
      });
      $xhr.done(function(responseData) {
        if ($xhr.status === 200) {
          console.log(responseData._embedded.shows.length)
          if (responseData._embedded.shows.length > 0) {


            for (let i = 0; i < responseData._embedded.shows.length; i++) {
              // console.log(responseData._embedded.shows[i])
              shows.push({
                name: responseData._embedded.shows[i].name,
                description: responseData._embedded.shows[i].description,
                pressRelease: responseData._embedded.shows[i].press_release,
                venueNameHref: responseData._embedded.shows[i]._links.partner.href //figure out better way to store this
              })
            }

          }
          // checkForNames(responseData);
        } else {
          console.log("artsy api current shows exit status: ", $xhr.status);
          return;
        }
      });
    }
  })
}
