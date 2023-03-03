import { getAudioPath } from "@/lib/bilibili";
import { NextApiRequest, NextApiResponse } from "next";
import fetch from "node-fetch";

export const config = {
    api: {
        responseLimit: false,
    },
};

const handler = async (request: NextApiRequest, response: NextApiResponse) => {
    const sid = request.query.sid as string;

    try {
        const path = await getAudioPath(sid);

        const requestHeaders = new Headers();
        requestHeaders.set("referer", "https://www.bilibili.com");
        request.headers.range &&
            requestHeaders.set("range", request.headers.range);
        const res = await fetch(path, { headers: requestHeaders });

        res.headers.forEach((value, key) => {
            response.setHeader(key, value);
        });
        response.setHeader("Content-Type", "audio/mpeg");

        return response.status(res.status).send(res.body);
    } catch (error: any) {
        const message = error.message;
        return response.status(500).json({
            message,
        });
    }
};

export default handler;
