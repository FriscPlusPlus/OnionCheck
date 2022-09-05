const axios = require("axios");
const { SocksProxyAgent } = require("socks-proxy-agent");

const cleanLinks = (aLinks) => {
  let cleanUrls = [],
    i,
    lengthCount = aLinks.length > 10 ? 10 : aLinks.length,
    link;
  for (i = 0; i < lengthCount; i++) {
    link = addProtocl(aLinks[i].replace("\r", ""));
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
    return Boolean(new URL(urlString.replace(" ", "")));
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

const getMessage = (data) => {
  let msg,
    countInvalid = 0,
    countOnline = 0;
  for (let i = 0; i < data.length; i++) {
    if (data[i].online) {
      countOnline += 1;
    }
    if (!data[i].valid) {
      countInvalid += 1;
    }
  }
  if (countOnline === data.length) {
    msg = "It seems like all of them are online!";
  } else if (countInvalid === data.length) {
    msg = "It seems like all the given link are invalid!";
  } else if (countInvalid === 0 && countOnline === 0) {
    msg = "It seems like all the given link are offline!";
  } else if (countInvalid > 0 && countOnline > 0) {
    msg = "It seems like some of them are online!";
  }
  return msg;
};

exports.main = function (req, res) {
  res.render("main.html");
};

exports.check = async function (req, res) {
  let aLinks = cleanLinks(req.body.links.split("\n"));
  let data = await check(aLinks);
  let results = {
    data,
    message: getMessage(data),
  };
  console.log(results);
  res.render("results.html", { results });
};
