import { NowRequest, NowResponse } from "@now/node";
import { Asana } from "../../services";

export default async (req: NowRequest, res: NowResponse) => {
  if (req.body && req.body.events && req.body.events.length) await Asana.handleHook(req.body);
  const secret = req.headers["x-hook-secret"];
  if (secret) {
    res.setHeader("X-Hook-Secret", secret);
  }
  res.json({ message: "Ok" });
};
