import { PropType, PropTypes } from "routing/serialization";
import { FC } from "react";

type o = object;

export type PropPathSegment<P extends o> = { name: keyof P; type: PropType<P[keyof P]> };

export type PathSegment<P extends o> = PropPathSegment<P> | string;
export type Path<P extends o> = PathSegment<P>[];

export type RouteSymbol<P extends o> = { value: symbol; $_infer_props: P };

type HasAnyKey<A extends string | number | symbol, B extends string | number | symbol> =
    "ye" extends (
        { "#empty": "no" } & { [key in A]: key extends B ? "ye" : "no" } extends { [key: string]: infer R }
            ? R
            : never)
        ? true
        : false;

export type MergeProps<P extends o, QP extends o> =
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    P extends any
        ? P & QP
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        : QP extends any
            ? P & QP
            : Pick<P, Exclude<keyof P, keyof QP>> &
            Pick<QP, Exclude<keyof QP, keyof P>> &
            (true extends (HasAnyKey<keyof P, keyof QP> | HasAnyKey<keyof QP, keyof P>)
                ? { typeError: "overlapping props"; never: never }
                : {});

type RouteKind = "undefined" | "undefined-with-query" | "defined" | "defined-with-query" | "defined-with-children";

interface CommonRouteProps<IP, P extends o, QP extends o> {
    readonly kind: RouteKind

    readonly path: Path<P>
    readonly propTypes: PropTypes<P>

    readonly symbol?: RouteSymbol<MergeProps<P, QP>>

    readonly __variance_IP: () => IP
}

export interface UndefinedRoute<IP extends o, P extends o> extends CommonRouteProps<IP, P, {}> {
    readonly kind: "undefined"

    readonly inherits: <NewIP extends o = {}>() => UndefinedRoute<NewIP, P>
    readonly withQuery: <QP extends o>(props: PropTypes<QP>) => UndefinedRouteWithQP<IP, P, QP>
    readonly as: (component: Component<IP, P, {}>) => DefinedRoute<IP, P, {}>
    readonly redirect: <RP extends o>(
        to: RouteSymbol<RP>,
        // keep this noop-merge (idk why there is type error)
        convert: (props: MergeProps<IP, MergeProps<P, {}>>) => RP
    ) => DefinedRoute<IP, P, RP>
}

interface UndefinedRouteWithQP<IP extends o, P extends o, QP extends o> extends CommonRouteProps<IP, P, QP> {
    readonly kind: "undefined-with-query"
    readonly queryPropTypes: PropTypes<QP>

    readonly as: (component: Component<IP, P, QP>) => DefinedRouteWithQuery<IP, P, QP, {}>
    readonly redirect: <RP extends o>(
        to: RouteSymbol<RP>,
        convert: (props: MergeProps<IP, MergeProps<P, QP>>) => RP
    ) => DefinedRouteWithQuery<IP, P, QP, RP>
}

type Component<IP extends o, P extends o, QP extends o> = FC<MergeProps<IP, MergeProps<P, QP>>>;

export interface Redirection<InP, OutP extends o> {
    readonly target: RouteSymbol<OutP>
    readonly convert: (props: InP) => OutP
}

interface RouteWithComponent<IP extends o, P extends o, QP extends o> extends CommonRouteProps<IP, P, QP> {
    readonly component: Component<IP, P, QP>
    readonly definition: "component"
}

interface RouteWithRedirection<
    IP extends o,
    P extends o,
    QP extends o,
    RP extends o> extends CommonRouteProps<IP, P, QP> {
    readonly redirection: Redirection<MergeProps<IP, MergeProps<P, QP>>, RP>
    readonly definition: "redirect"
}

type DefinedRoute<IP extends o, P extends o, RP extends o> =
    (RouteWithComponent<IP, P, {}> | RouteWithRedirection<IP, P, {}, RP>) & {
        readonly kind: "defined"

        mark(symbol: RouteSymbol<MergeProps<IP, P>>): DefinedRoute<IP, P, RP>
        with<Children extends WellFormedChildrenWithIP<Children, MergeProps<IP, P>>>(
            children: Children
        ): DefinedRouteWithChildren<IP, P, Children, RP>
    };

type DefinedRouteWithQuery<IP extends o, P extends o, QP extends o, RP extends o> =
    (RouteWithComponent<IP, P, QP> | RouteWithRedirection<IP, P, QP, RP>) & {
        readonly kind: "defined-with-query"
        readonly queryPropTypes: PropTypes<QP>

        mark(symbol: RouteSymbol<MergeProps<P, QP>>): DefinedRouteWithQuery<IP, P, QP, RP>
    };

type DefinedRouteWithChildren<
    IP extends o,
    P extends o,
    C extends WellFormedChildrenWithIP<C, MergeProps<IP, P>>,
    RP extends o> =
    (RouteWithComponent<IP, P, {}> | RouteWithRedirection<IP, P, {}, RP>) & {
        readonly kind: "defined-with-children"
        readonly children: C
    };

export type WellFormedChildrenWithIP<T, IP extends object> = { [key in keyof T]: AnyRouteWithIP<IP> };
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type WellFormedChildren<T> = WellFormedChildrenWithIP<T, any>;

// eslint-disable-next-line max-len
export type WellFormedRoute<
    IP extends o,
    P extends o,
    QP extends o,
    C extends WellFormedChildrenWithIP<C, MergeProps<IP, P>>,
    RP extends o> =
    | DefinedRoute<IP, P, RP>
    | DefinedRouteWithQuery<IP, P, QP, RP>
    | DefinedRouteWithChildren<IP, P, C, RP>;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyRouteWithIP<IP extends object> = WellFormedRoute<IP, any, any, any, any>;
export type UnkRoute = WellFormedRoute<never, never, never, never, never>;

export {};