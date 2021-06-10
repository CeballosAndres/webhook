"use strict";

const express = require("express");
const bodyParser = require("body-parser");
const removeDiacritics = require('diacritics').remove;

const verbos = {
  mussen : {
    ich : "muss",
    Ich : "muss",
    du  : "musst",
    er  : "muss",
    sie : "muss",
    es  : "muss",
    ihr : "müsst",
    wir : "müssen",
    Sie : "müssen"
  },  
  konnen : {
    ich : "kann",
    du  : "kannst",
    er  : "kann",
    sie : "kann",
    es  : "kann",
    ihr : "könnt",
    wir : "können",
    Sie : "können"
  },  
  wollen : {
    ich : "will",
    du  : "willst",
    er  : "will",
    sie : "will",
    es  : "will",
    ihr : "wollt",
    wir : "wollen",
    Sie : "wollen"
  },  
  durfen : {
    ich : "darf",
    du  : "darst",
    er  : "darf",
    sie : "darf",
    es  : "darf",
    ihr : "dürt",
    wir : "dürfen",
    Sie : "dürfen"
  },  
  sollen : {
    ich : "soll",
    du  : "sollst",
    er  : "soll",
    sie : "soll",
    es  : "soll",
    ihr : "sollt",
    wir : "sollen",
    Sie : "sollen"
  },  
  mochten : {
    ich : "möchte",
    du  : "möchtest",
    er  : "möchte",
    sie : "möchte",
    es  : "möchte",
    ihr : "möchtet",
    wir : "möchten",
    Sie : "möchten"
  },  
  mogen : {
    ich : "mag",
    du  : "magst",
    er  : "mag",
    sie : "mag",
    es  : "mag",
    ihr : "mögt",
    wir : "mögen",
    Sie : "mögen"
  }
}

const pronombres = {
  ich : {
    Nominativ   : "ich",
    Dativ       : "mir",
    Akkusativ   : "mich",
    Genitiv     : "meiner",
  },
  du : {
    Nominativ   : "du",
    Dativ       : "dir",
    Akkusativ   : "dich",
    Genitiv     : "deiner",
  },
  sie : {
    Nominativ   : "sie",
    Dativ       : "ihr",
    Akkusativ   : "sie",
    Genitiv     : "ihrer",
  },
  er : {
    Nominativ   : "er",
    Dativ       : "ihm",
    Akkusativ   : "ihn",
    Genitiv     : "seiner",
  },
  es : {
    Nominativ   : "es",
    Dativ       : "ihm",
    Akkusativ   : "es",
    Genitiv     : "seiner",
  },
  wir : {
    Nominativ   : "wir",
    Dativ       : "uns",
    Akkusativ   : "uns",
    Genitiv     : "unser",
  },
  ihr : {
    Nominativ   : "ihr",
    Dativ       : "euch",
    Akkusativ   : "euch",
    Genitiv     : "euer",
  },
  Sie : {
    Nominativ   : "Sie",
    Dativ       : "Ihr",
    Akkusativ   : "Sie",
    Genitiv     : "Ihrer",
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
        "text": [speech]
      }
    }
  ],
  "source": "<webhookpn1>"


  });
});


function selectAction(req){
  const action = req.body.queryResult.intent.displayName;
  if (action == "Saludar"){
    console.log("Se recibió saludo para prender motores!!");
  } else if (action == "ConjugarVerbosModales"){
    return conjugarVerbosModales(req);
  } else if (action == "ConjugarPronombresPersonales") {
    return conjugarPronombresPersonales(req);
  }
}


function conjugarVerbosModales(req){
  // obtener el verbo y normalizarlo
  const verbo = removeDiacritics(req.body.queryResult.parameters.verbosModales.toLowerCase());
  // caso de contar con el sujeto
  if (req.body.queryResult.parameters.sujeto){
    const sujeto = req.body.queryResult.parameters.sujeto;
    if (sujeto == "sie"){
      return `${req.body.queryResult.parameters.verbosModales} para ${sujeto} `+
      `se conjuga:\n2da persona: ${verbos[verbo]["sie"]}\n` +
      `3ra persona: ${verbos[verbo]["Sie"]}`;
    }
    return `${req.body.queryResult.parameters.verbosModales} para ${sujeto} se conjuga: ${verbos[verbo][sujeto]}`;
  }

  // caso de no contar con el sujeto enviar todos las conjugaciones
  let response = `El verbo ${req.body.queryResult.parameters.verbosModales} se conjuga:\n`;
  for (let elem in verbos[verbo]){
    response += `${elem} -> ${verbos[verbo][elem]} \n`
  }
  return response;
}

function conjugarPronombresPersonales(req){
  // obtener el sujeto
  const sujeto = req.body.queryResult.parameters.sujeto;
  // caso de especificar el modo verbal
  if (req.body.queryResult.parameters.modoVerbal){
    const modoVerbal = req.body.queryResult.parameters.modoVerbal;
    return `Es: ${pronombres[sujeto][modoVerbal]}`;
  }
  // caso de no especificar el modo verbal regresar todos
  let response = `Se conjuga:\n`;
  for (let elem in pronombres[sujeto]){
    response += `${elem} - ${pronombres[sujeto][elem]} \n`
  }
  return response;
}


restService.listen(process.env.PORT || 8000, function() {
  console.log("Server up and listening");
});
