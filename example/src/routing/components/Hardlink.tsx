import React, { FC } from "react";
import { useNav } from "routing/abstractions";
import { FullPath } from "routing/addressable";

export const Hardlink: FC<{ to: FullPath }> = x => {
    const nav = useNav();
    if (!nav) return <a>{ x.children }</a>;

    return <a href={nav.href + "#" + x.to} onClick={e => {
        e.preventDefault();
        nav.go(x.to);
    }}>
        { x.children }
    </a>;
};