import { PropType, PropTypes } from "routing/serialization";

const pathSegmentRegex = /^(:?[a-zA-Z0-9-_]+)(?:\/(:?[a-zA-Z0-9-_]+(?:\/:?[a-zA-Z0-9-_]+)*))?$/;

type Token = { kind: "string" | "param"; value: string };

export type PropPathSegment<P> = { name: keyof P; type: PropType<P[keyof P]> };
export type PathTemplateSegment<P> = PropPathSegment<P> | string;
export type PathTemplate<P> = PathTemplateSegment<P>[];

const tokenize = (path: string): Token[] => {
    let remaining = path;
    const result: Token[] = [];

    do {
        let match = pathSegmentRegex.exec(remaining);
        if (!match)
            throw new Error(`Failed to parse path template ${path}`);

        const seg = match[1];
        if (seg[0] === ":") {
            result.push({ kind: "param", value: seg.substring(1) });
        } else {
            result.push({ kind: "string", value: seg });
        }

        if (match[2]) {
            remaining = match[2];
            continue;
        }

        return result;

        // eslint-disable-next-line no-constant-condition
    } while (true);
};

export const parsePathTemplate = <P>(path: string, props: PropTypes<P>): PathTemplate<P> => {
    const tokens = tokenize(path);
    const result: PathTemplate<P> = [];
    const used = new Set<string>();

    for (const token of tokens) {
        if (token.kind === "string") {
            result.push(token.value);
        } else {
            if (Object.prototype.hasOwnProperty.call(props, token.value)) {
                if (used.has(token.value))
                    throw new Error(`Invalid path template "${path}" - duplicate prop ${token.value}`);

                const propV = props[token.value as keyof P];
                result.push({ name: token.value as keyof P, type: propV });
                used.add(token.value);
            } else {
                throw new Error(`Invalid path template "${path}" - undeclared prop ${token.value}`);
            }
        }
    }

    if (!Object.keys(props).every(v => used.has(v)))
        throw new Error(`Invalid path template "${path}" - path does not contain all of declared props`);

    return result;
};