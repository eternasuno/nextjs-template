import { NextResponse, type NextRequest } from "next/server";

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

const getAudioPath = async (sid: string) => {
    const url = new URL(
        "https://www.bilibili.com/audio/music-service-c/web/url",
    );
    url.searchParams.append("sid", sid);

    const { cdns } = await get(url.toString());

    return cdns[0] as string;
};

const handle = async (request: NextRequest) => {
    const { searchParams } = new URL(request.url);
    const sid = searchParams.get("sid")!;

    try {
        const path = await getAudioPath(sid);

        const requestHeaders = new Headers();
        requestHeaders.set("referer", "https://www.bilibili.com");
        request.headers.has("range") &&
            requestHeaders.set("range", request.headers.get("range")!);

        const response = await fetch(path, { headers: requestHeaders });

        const contentLength = response.headers.has("content-length")
            ? parseInt(response.headers.get("content-length")!)
            : 0;

        const responseHeaders = new Headers();
        responseHeaders.set(
            "content-range",
            `bytes 0-${contentLength}/${contentLength + 1}`,
        );
        response.headers.forEach((value, key) => {
            responseHeaders.set(key, value);
        });
        responseHeaders.set("connection", "keep-alive");
        responseHeaders.set("keep-alive", "timeout=5, max=1000");
        responseHeaders.set("content-type", "audio/mpeg");

        return new NextResponse(response.body, {
            status: response.status,
            statusText: response.statusText,
            headers: responseHeaders,
        });
    } catch (error: any) {
        const message = error.message;
        return new NextResponse(JSON.stringify({ message }), {
            status: 500,
            statusText: "Internal Server Error",
        });
    }
};

export default handle;
