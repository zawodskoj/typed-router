import { PropTypes } from "routing/serialization";
import { Path, UndefinedRoute, RouteSymbol } from "./types";
import { parsePathTemplate } from "routing/parsing";

export * from "./types";

const staticAssert = <T>(v: T): T => v;

const exactRoute = <IP extends object, P extends object>(
    path: Path<P>, props?: PropTypes<P>
): UndefinedRoute<IP, P> => {
    return {
        path: path,
        kind: "undefined",
        propTypes: (props ?? {}) as PropTypes<P>,
        __variance_IP() { throw "Do not call this"; },
        inherits() {
            return this as never;
        },
        withQuery(props) {
            return {
                ...this,
                queryPropTypes: props,
                kind: "undefined-with-query",
                symbol: undefined,
                as(component) {
                    return {
                        ...this,
                        kind: "defined-with-query",
                        definition: "component",
                        component: component,
                        symbol: undefined,
                        mark(symbol) {
                            return {
                                ...this,
                                symbol: symbol
                            };
                        }
                    };
                },
                redirect(to, convert) {
                    return {
                        ...this,
                        kind: "defined-with-query",
                        definition: "redirect",
                        redirection: {
                            convert: convert,
                            target: to
                        },
                        symbol: undefined,
                        mark(symbol) {
                            return {
                                ...this,
                                symbol: symbol
                            };
                        }
                    };
                }
            };
        },
        as(component) {
            return {
                ...this,
                kind: "defined",
                definition: "component",
                component: component,
                symbol: undefined,
                mark(symbol) {
                    return {
                        ...this,
                        symbol: symbol
                    } as never;
                },
                with(children) {
                    return {
                        ...this,
                        kind: staticAssert<"defined-with-children">("defined-with-children"),
                        children: children
                    };
                }
            };
        },
        redirect(to, convert) {
            return {
                ...this,
                kind: "defined",
                definition: "redirect",
                redirection: {
                    convert: convert,
                    target: to
                },
                symbol: undefined,
                mark(symbol) {
                    return {
                        ...this,
                        symbol: symbol
                    } as never;
                },
                with(children) {
                    return {
                        ...this,
                        kind: staticAssert<"defined-with-children">("defined-with-children"),
                        children: children
                    };
                }
            };
        }
    };
};

export const routeSymbol = <P extends object = {}>(): RouteSymbol<P> => ({
    value: Symbol(),
    $_infer_props: undefined!
});

type HasAnyProp<O extends object> =
    keyof O extends "test" ? (keyof O | "test") extends keyof O ? true : false : true;

type RouteArg<P extends object> = true extends HasAnyProp<P> ? [PropTypes<P>] : [PropTypes<P>?];

export const route = <P extends object = {}>(path: string, ...props: RouteArg<P>): UndefinedRoute<{}, P> =>
    exactRoute(parsePathTemplate(path, props[0] ?? {} as PropTypes<P>), props[0]);

export const flatRoute = (): UndefinedRoute<{}, {}> => exactRoute([], undefined);