import { type NextRequest } from "next/server";

export const config = {
    runtime: "edge",
};

const getInfo = async (bvid: string) => {
    const url = new URL("https://api.bilibili.com/x/web-interface/view");
    url.searchParams.append("bvid", bvid);

    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(response.statusText);
    }

    const { code, message, data } = await response.json();
    if (code !== 0) {
        throw new Error(message);
    }

    return data;
};

const getAudioPath = async (bvid: string, cid: string) => {
    const url = new URL("https://api.bilibili.com/x/player/playurl");
    url.searchParams.append("bvid", bvid);
    url.searchParams.append("cid", cid);
    url.searchParams.append("fnval", "16");

    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(response.statusText);
    }

    const {
        code,
        message,
        data: {
            dash: { audio },
        },
    } = await response.json();
    if (code !== 0) {
        throw new Error(message);
    }

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
                referer: "https://www.bilibili.com",
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
