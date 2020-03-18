import { WellFormedChildren, WellFormedRoute, MergeProps, UnkRoute } from "routing/dsl";
import { PropType } from "routing/serialization";

declare const fullPathSym: unique symbol;
export type FullPath = string & { [fullPathSym]: typeof fullPathSym };

type o = object;
type WFC<T> = WellFormedChildren<T>;

export type AddressableRouteInfo<Props> = {
    (props: Props): FullPath

    readonly $route: UnkRoute
    readonly $parent: UnkRoute | undefined
    readonly $parentChain: UnkRoute[]
    readonly $allChildren: AddressableRouteInfo<never>[]
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any,max-len
export type AddressableRoute<IP extends o, P extends o, QP extends o, C extends WFC<C>, RP extends o> =
    {
        // eslint-disable-next-line max-len
        readonly [key in keyof C]: [C[key]] extends [WellFormedRoute<infer NIP, infer NP, infer NQP, infer NC, infer NRP>]
            ? AddressableRoute<NIP, NP, NQP, NC, NRP>
            : never
    } & AddressableRouteInfo<MergeProps<IP, MergeProps<P, QP>>>;

type UnkAddressable = AddressableRoute<never, never, never, never, never>;

export const buildAddressable = <IP extends o, P extends o, QP extends o, C extends WFC<C>, RP extends o>(
    route: WellFormedRoute<IP, P, QP, C, RP>,
    parents: UnkRoute[] = []
): [AddressableRoute<IP, P, QP, C, RP>, UnkAddressable[]] => {
    const children = route.kind === "defined-with-children" ? Object.entries(route.children) : [];
    const fn = (function (props): FullPath  {
        let path = "";

        for (const parent of [...parents, route as unknown as UnkRoute]) {
            const r = parent.path.length
                ? "/" + parent.path.map(x => typeof x === "string"
                    ? x
                    : x.type.serialize(props[x.name as never])).join("/")
                : "";

            const q = parent.kind === "defined-with-query"
                ? "?" + Object.entries<PropType<unknown>>(parent.queryPropTypes)
                    .map(([k, t]) => `${k}=${t.serialize(props[k as never] as never)}`).join("&")
                : "";

            path += r + q;
        }

        return path as FullPath;
    }) as AddressableRoute<IP, P, QP, C, RP>;

    const newChildren = children.map(([k, child]) =>
        [k, ...buildAddressable(child as UnkRoute, [...parents, route as unknown as UnkRoute])] as
            [string, UnkAddressable, UnkAddressable[]]);

    const allChildren = newChildren.flatMap(([, child, childChildren]) => [child, ...childChildren]);

    Object.assign(fn, Object.fromEntries(newChildren), {
        $route: route,
        $parent: parents[parents.length - 1],
        $parentChain: parents,
        $allChildren: allChildren
    });


    return [fn, allChildren];
};