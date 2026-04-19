import handler from "../dist/server/index.js";

export default async function (req, res) {
  return handler(req, res);
}