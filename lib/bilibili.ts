import fetch from "node-fetch";

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

export const getUserInfo = async (mid: string) => {
    const url = new URL("https://api.bilibili.com/x/space/acc/info");
    url.searchParams.append("mid", mid);

    return await get(url.toString());
};

export const getUserVideoList = async (mid: string) => {
    const url = new URL("https://api.bilibili.com/x/space/wbi/arc/search");
    url.searchParams.append("mid", mid);
    url.searchParams.append("ps", "5");

    const {
        list: { vlist },
    } = await get(url.toString());

    return vlist as any[];
};
