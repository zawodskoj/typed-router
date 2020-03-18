import React, { createContext, FC, useContext, useEffect, useState } from "react";
import { buildFullPath, resolveRouteFromHash } from "./resolver";
import { UnkRoute } from "./dsl";
import { AddressableRouteInfo, FullPath } from "./addressable";

type NavContext = {
    root: AddressableRouteInfo<never>
    href: string
    path: string
    resolved?: [UnkRoute, object, "redirected" | "not-redirected"]
    go(route: FullPath, replace?: boolean): void
    goBack(): void
};

const NavigatorContext = createContext<NavContext | null>(null);

export const useNav = (): NavContext => {
    const n = useContext(NavigatorContext);

    if (!n) {
        throw new Error("Attempt to navigate outside NavigatorContext");
    }

    return n;
};

export const Navigator: FC<{ root: AddressableRouteInfo<never> }> = x => {
    const [currentHash, setCurrentHash] = useState(location.hash);

    useEffect(() => {
        const updateState = (): void => {
            const resolved = resolveRouteFromHash(location.hash, x.root);

            if (!resolved) {
                setCurrentHash(location.hash);
                return;
            }

            const [route, props, redirState] = resolved;

            if (redirState === "redirected") {
                const newPath = buildFullPath(route, x.root, props);
                history.replaceState(undefined, "", "#" + newPath);
            }

            setCurrentHash(location.hash);
        };

        window.addEventListener("popstate", updateState);

        updateState();

        return () => {
            window.removeEventListener("popstate", updateState);
        };
    });

    const context: NavContext = {
        root: x.root,
        href: location.pathname,
        path: currentHash.substring(1),
        resolved: resolveRouteFromHash(currentHash, x.root),
        go(route, replace) {
            if (replace)
                history.replaceState(undefined, "", "#" + route);
            else
                history.pushState(undefined, "", "#" + route);
            setCurrentHash(location.hash);
        },
        goBack() {
            history.back();
        }
    };

    return <NavigatorContext.Provider value={context}>{ x.children }</NavigatorContext.Provider>;
};

export const NavigatorView: FC = () => {
    const n = useContext(NavigatorContext);

    if (!n) return <>NavigatorView outside Navigator</>;

    if (!n.resolved) {
        return <>
            Unresolved component on location { n.path }
        </>;
    } else if (n.resolved[0].definition !== "component") {
        return <>
            Got redirection instead of component on location { n.path }
        </>; // should never happen
    } else {
        const [{ component: ResolvedComponent }, props] = n.resolved;

        return <>
            <ResolvedComponent {...props as never} />
        </>;
    }
};