const axios = require("axios");
const { SocksProxyAgent } = require("socks-proxy-agent");

const cleanLinks = (aLinks) => {
  let cleanUrls = [],
    i,
    lengthCount = aLinks.length > 10 ? 10 : aLinks.length,
    link;
  for (i = 0; i < lengthCount; i++) {
    link = aLinks[i].replace("\r", "");
    cleanUrls.push({
      url: link,
      valid: isValidUrl(aLinks[i].replace("\r", "")),
      online: "",
    });
  }
  return cleanUrls;
};

const isValidUrl = (urlString) => {
  try {
    return Boolean(new URL(urlString));
  } catch (e) {
    return false;
  }
};

const check = async (aLinks) => {
  const agent = new SocksProxyAgent(`socks://127.0.0.1:9150`);
  const inst = axios.create({
    httpAgent: agent,
    httpsAgent: agent,
  });
  for (let i = 0; i < aLinks.length; i++) {
    try {
      const data = await inst.get(aLinks[i].url);
      aLinks[i].online = true;
    } catch (error) {
      aLinks[i].online = false;
    }
  }
  return aLinks;
};

exports.main = function (req, res) {
  res.render("main.html");
};

exports.check = async function (req, res) {
  let aLinks = cleanLinks(req.body.links.split("\n"));
  let results = await check(aLinks);
  res.render("results.html", { results });
};
