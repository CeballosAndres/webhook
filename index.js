"use strict";

const express = require("express");
const bodyParser = require("body-parser");
const removeDiacritics = require('diacritics').remove;

const verbos = {
  Konnen : {
    ich : "musse",
    du : "musst"
  }  
}

const restService = express();

restService.use(
  bodyParser.urlencoded({
    extended: true
  })
);

restService.use(bodyParser.json());

restService.post("/webhook", function(req, res) {
  let speech = req.body.queryResult && 
               req.body.queryResult.parameters               
                ? selectAction(req)
                : "Existe un problema. Repite por favor.";



  return res.json({

  "fulfillmentText": speech,
  "fulfillmentMessages": [
    {
      "text": {
        "text": speech
      }
    }
  ],
  "source": "<webhookpn1>"


  });
});

function selectAction(req){
  const action = req.body.queryResult.parameters;
  if (action.verbosmodales){
    return verboModal(req);
  } 

  return "queonda";
}

function verboModal(req){
  const verbo = removeDiacritics(req.body.queryResult.parameters.verbosmodales);
  if (req.body.queryResult.parameters.sujeto){
    const sujeto = req.body.queryResult.parameters.sujeto;
    return [verbos[verbo][sujeto]];
  }
  return Object.values(verbos[verbo]);
}

restService.listen(process.env.PORT || 8000, function() {
  console.log("Server up and listening");
});
