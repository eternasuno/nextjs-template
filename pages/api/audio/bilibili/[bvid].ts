import { type NextRequest } from "next/server";

export const config = {
    runtime: "edge",
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

const getInfo = async (bvid: string) => {
    const url = new URL("https://api.bilibili.com/x/web-interface/view");
    url.searchParams.append("bvid", bvid);

    return await get(url.toString());
};

const getAudioPath = async (bvid: string, cid: string) => {
    const url = new URL("https://api.bilibili.com/x/player/playurl");
    url.searchParams.append("bvid", bvid);
    url.searchParams.append("cid", cid);
    url.searchParams.append("fnval", "16");

    const {
        dash: { audio },
    } = await get(url.toString());

    return audio[0].baseUrl as string;
};

const handle = async (request: NextRequest) => {
    const { searchParams } = new URL(request.url);
    const bvid = searchParams.get("bvid")!;

    try {
        const { cid } = await getInfo(bvid);
        const path = await getAudioPath(bvid, cid);
        return fetch(path, {
            headers: {
                Referer: "https://www.bilibili.com",
                Accept: "audio/x-m4s",
            },
        });
    } catch (error: any) {
        const message = error.message;
        return new Response(JSON.stringify({ message }), {
            status: 500,
            statusText: "Internal Server Error",
        });
    }
};

export default handle;
