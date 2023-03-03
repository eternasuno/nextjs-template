import { getVideoPath } from "@/lib/bilibili";
import { NextApiRequest, NextApiResponse } from "next";
import fetch from "node-fetch";

export const config = {
    api: {
        responseLimit: false,
    },
};

const handler = async (request: NextApiRequest, response: NextApiResponse) => {
    const bvid = request.query.bvid as string;

    try {
        const path = await getVideoPath(bvid);

        const requestHeaders = new Headers();
        requestHeaders.set("referer", "https://www.bilibili.com");
        request.headers.range &&
            requestHeaders.set("range", request.headers.range);
        const res = await fetch(path, { headers: requestHeaders });

        res.headers.forEach((value, key) => {
            response.setHeader(key, value);
        });
        response.setHeader("Content-Type", "audio/mpeg");

        return response.status(200).send(res.body);
    } catch (error) {}
};

export default handler;
