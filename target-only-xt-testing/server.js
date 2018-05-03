/***************************************************************************************
 * (c) 2017 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 ****************************************************************************************/

const fs = require("fs");
const express = require("express");
const cookieParser = require("cookie-parser");
const MarketingCloudClient = require("@adobe/target-node-client");
const CONFIG = {
  client: "adobedemogreg",
  organizationId: "D439123F524454E10A490D45@AdobeOrg",
  timeout: 10000
};
const logger = getLogger();
const app = express();
var TEMPLATE = fs.readFileSync(__dirname + "/templates/seaside.tpl").toString();

app.use(cookieParser());

function getLogger() {
  return {
    log: function(...arr) {
      console.log(...arr);
    }
  };
}

function createMarketingCloudClient(logger, config) {
  const options = Object.assign({logger}, {config});

  return MarketingCloudClient.create(options);
}

function saveCookie(res, cookie) {
  if (!cookie) {
    return;
  }

  res.cookie(cookie.name, cookie.value, {maxAge: cookie.maxAge * 1000});
}

function sendHtml(res, offer) {
    if (offer.content != undefined && offer.content == 'seaside')
        {
            TEMPLATE = fs.readFileSync(__dirname + "/templates/seaside.tpl").toString();   
        }
    else if (offer.content != undefined && offer.content == 'mountain') {
        TEMPLATE = fs.readFileSync(__dirname + "/templates/mountain.tpl").toString();
}
        const result = TEMPLATE;
        console.log(offer.content);

  res.status(200).send(result);
}

function sendResponse(res, offer) {
  res.set({"Content-Type": "text/html"});

  saveCookie(res, offer.targetCookie);
  sendHtml(res, offer);
}

app.get("/", function (req, res) {
  const targetCookieName = encodeURIComponent(MarketingCloudClient.getTargetCookieName());
  const targetCookie = req.cookies[targetCookieName];
  const payload = {"mbox" : "a1-serverside-xt-testing",
                    "thirdPartyId" : "01-2018"
                  };
  const request = Object.assign({payload}, {targetCookie});

  console.log("Request", request);

  const marketingCloudClient = createMarketingCloudClient(logger, CONFIG);

  marketingCloudClient.getOffer(request)
  .then(offer => {
    sendResponse(res, offer);
  })
  .catch(error => {
    sendResponse(res, error);
  });
});

app.listen(3000, function () {
  console.log("Listening on port 3000 and watching!");
});
