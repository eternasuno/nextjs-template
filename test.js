const fetch = (...args) =>
    import("node-fetch").then(({ default: fetch }) => fetch(...args));

const main = async () => {
    const response = await fetch(
        "https://api.bilibili.com/x/player/playurl?bvid=BV1y7411Q7Eq&cid=171776208&qn=112&fnval=0&fnver=0&fourk=1",
    );
    const result = await response.json();

    console.debug(result);
};

main();
