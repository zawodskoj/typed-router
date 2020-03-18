// eslint-disable-next-line no-useless-escape
const pathRegex = /^\/([^\/\?&=]+|(?!\/))((?:\/[^\/\?&=]+)*(?:\?[^\/\?&=]+=[^\/\?&=]+(?:&[^\/\?&=]+=[^\/\?&=]+)*)?)$/;

export type ParsedPath = { segments: string[]; queryArgs: Record<string, string> };

export const parsePath = (path: string): ParsedPath => {
    let remaining = path;
    const segments: string[] = [];

    do {
        let match = pathRegex.exec(remaining);
        if (!match) throw new Error(`Failed to parse path ${path}`);

        const seg = match[1];
        if (seg.length)
            segments.push(seg);

        if (match[2]) {
            if (match[2][0] === "?") {
                const queryArgs = Object.fromEntries(
                    match[2].substring(1).split("&").map(x => x.split("="))
                );

                return { segments, queryArgs };
            } else {
                remaining = match[2];
                continue;
            }
        }

        return { segments, queryArgs: {} };

        // eslint-disable-next-line no-constant-condition
    } while (true);
};