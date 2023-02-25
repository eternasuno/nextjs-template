import { NextApiRequest, NextApiResponse } from "next";
import fetch from "node-fetch";

export const config = {
    api: {
        responseLimit: false,
    },
};

const get = async (url: string) => {
    const response = await fetch(url, {
        headers: {
            "User-Agent":
                "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.3 Safari/605.1.15",
        },
    });
    if (!response.ok) {
        throw new Error(response.statusText);
    }

    const { code, message, data } = (await response.json()) as any;
    if (code !== 0) {
        throw new Error(message);
    }

    return data;
};

const getAudioPath = async (sid: string) => {
    const url = new URL(
        "https://www.bilibili.com/audio/music-service-c/web/url",
    );
    url.searchParams.append("sid", sid);

    const { cdns } = await get(url.toString());

    return cdns[0] as string;
};

const handle = async (req: NextApiRequest, res: NextApiResponse) => {
    const { sid } = req.query;
    if (!sid) {
        return res.status(400).json({ message: "sid is empty!" });
    }

    try {
        const path = await getAudioPath(Array.isArray(sid) ? sid[0] : sid);

        const response = await fetch(path, {
            headers: {
                Referer: "https://www.bilibili.com",
            },
        });

        const contentLength = parseInt(
            response.headers.get("content-length") || "0",
        );

        res.setHeader("connection", "keep-alive");
        res.setHeader("keep-alive", "timeout=5, max=1000");
        res.setHeader("content-type", "audio/mpeg");
        res.setHeader("accept-ranges", "bytes");
        res.setHeader("content-length", contentLength);

        if (req.headers.range) {
            const [type, start, end] = req.headers.range.split(/=|-/);
            const rangeLength = end
                ? parseInt(end) - parseInt(start) + 1
                : contentLength + 1;

            res.setHeader(
                "content-range",
                `${type} ${start}-${end}/${rangeLength}`,
            );

            return res.status(206).send(response.body);
        } else {
            return res.status(200).send(response.body);
        }
    } catch (error: any) {
        return res.status(500).json({ message: error.message });
    }
};

export default handle;
