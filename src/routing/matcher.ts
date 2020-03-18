import { Path, UnkRoute } from "./dsl";
import { ParsedPath } from "routing/parsing";
import { PropType } from "routing/serialization";

type RouteMatchResult =
    | { type: "no" }
    | { type: "child"; rest: ParsedPath; matchedProps: Record<string, string> }
    | { type: "yes"; matchedProps: Record<string, string> };

const matchRoutePath = <T extends object>(path: ParsedPath, routePath: Path<T>): RouteMatchResult => {
    if (path.segments.length < routePath.length) return { type: "no" };

    const matchedProps: Record<string, string> = {};

    for (let i = 0; i < routePath.length; i++) {
        const seg = routePath[i];
        if (typeof seg === "string" && seg !== path.segments[i])
            return { type: "no" };
        if (typeof seg !== "string") {
            matchedProps[seg.name as string] = path.segments[i];
        }
    }

    const resultProps = { ...path.queryArgs, ...matchedProps };

    return path.segments.length > routePath.length
        ? {
            type: "child",
            rest: { segments: path.segments.slice(routePath.length), queryArgs: path.queryArgs },
            matchedProps: resultProps
        }
        : { type: "yes", matchedProps: resultProps };
};

const deserializeProps = (props: Record<string, string>, root: UnkRoute, parentChain: UnkRoute[]): object => {
    return Object.fromEntries([
        ...(parentChain[0] ? Object.entries(deserializeProps(props, parentChain[0], parentChain.slice(1))) : []),
        ...Object.entries<PropType<unknown>>(root.propTypes)
            .map(([name, type]) => [name, type.deserialize(props[name])]),
        ...(root.kind === "defined-with-query"
            ? Object.entries<PropType<unknown>>(root.queryPropTypes)
                .map(([name, type]) => [name, type.deserialize(props[name])])
            : [])
    ]);
};

const matchPathInner = (
    path: ParsedPath,
    route: UnkRoute,
    parentChain: UnkRoute[],
    keepProps: object
): [UnkRoute, object] | undefined => {
    const routeMatchResult = matchRoutePath(path, route.path);

    switch (routeMatchResult.type) {
        case "no": return undefined;
        case "yes": return [route as UnkRoute, deserializeProps({
            ...keepProps,
            ...routeMatchResult.matchedProps
        }, route, parentChain)];
        case "child": {
            if (route.kind !== "defined-with-children") return undefined;

            for (const child of Object.values(route.children)) {
                const matchResult = matchPathInner(routeMatchResult.rest, child as never, [route, ...parentChain], {
                    ...keepProps, ...routeMatchResult.matchedProps
                });
                if (matchResult)
                    return matchResult;
            }

            return undefined;
        }
    }
};

export const matchPath = (
    path: ParsedPath,
    root: UnkRoute
): [UnkRoute, object] | undefined => {
    return matchPathInner(path, root, [], {});
};