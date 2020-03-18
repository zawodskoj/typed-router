import { Redirection, UnkRoute } from "./dsl";
import { matchPath } from "routing/matcher";
import { parsePath } from "routing/parsing";
import { AddressableRouteInfo } from "routing/addressable";

export const resolveRedirection = <C>(
    actualPath: string,
    redir: Redirection<never, never>,
    root: AddressableRouteInfo<never>,
    resolvedProps: unknown
): [UnkRoute, object, "redirected"] => {
    const routeWithSymbol = root.$allChildren.find(x => x.$route.symbol?.value === redir.target.value)?.$route;

    if (routeWithSymbol) {
        if (routeWithSymbol.definition === "component") {
            return [routeWithSymbol, redir.convert(resolvedProps as never) as never, "redirected"];
        } else
            return resolveRedirection(actualPath, routeWithSymbol.redirection, root, resolvedProps);
    } else {
        throw new Error(
            `Unresolved redirection to "${actualPath}" - could not find route with symbol (missing mark()?)`);
    }
};

export const resolveRouteFromHash = (
    hash: string, root: AddressableRouteInfo<never>
): [UnkRoute, object, "redirected" | "not-redirected"] | undefined => {
    const matchResult = matchPath(parsePath((hash || "#/").substring(1)), root.$route);
    if (!matchResult) return undefined;

    const [resolvedRoute, resolvedProps] = matchResult;

    if (resolvedRoute.definition === "component")
        return [resolvedRoute, resolvedProps, "not-redirected"];
    else
        return resolveRedirection(hash, resolvedRoute.redirection, root, resolvedProps);
};

export const buildFullPath = (
    route: UnkRoute, root: AddressableRouteInfo<never>, props: object
): string | undefined => {
    return root.$allChildren.find(x => x.$route === route)?.(props as never);
};