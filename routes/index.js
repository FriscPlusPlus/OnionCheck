const axios = require("axios");
const { SocksProxyAgent } = require("socks-proxy-agent");

const cleanLinks = (aLinks) => {
  let cleanUrls = [],
    i,
    lengthCount = aLinks.length > 10 ? 10 : aLinks.length,
    link;
  for (i = 0; i < lengthCount; i++) {
    link = addProtocl(aLinks[i].replace("\r", "").replace(" ", ""));
    cleanUrls.push({
      url: link,
      valid: isValidUrl(link),
      online: "",
    });
  }
  return cleanUrls;
};

const addProtocl = (link) => {
  let pattern = /^((http|https|ftp):\/\/)/;
  if (!pattern.test(link)) {
    link = "http://" + link;
  }
  return link;
};

const isValidUrl = (urlString) => {
  try {
    if (urlString.split(".")[1] !== "onion") {
      urlString = false;
    }
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
    if (aLinks[i].valid) {
      try {
        const data = await inst.get(aLinks[i].url);
        aLinks[i].online = true;
      } catch (error) {
        aLinks[i].online = false;
      }
    }
  }
  return aLinks;
};

exports.main = function (req, res) {
  res.render("main.html");
};

exports.check = async function (req, res) {
  let aLinks = cleanLinks(req.body.links.split("\n"));
  console.log(aLinks);
  let results = await check(aLinks);
  res.render("results.html", { results });
};
