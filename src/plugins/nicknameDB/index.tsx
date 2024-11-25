/*
 * Vencord, a Discord client mod
 * Copyright (c) 2024 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { addContextMenuPatch, NavContextMenuPatchCallback } from "@api/ContextMenu";
import { Devs } from "@utils/constants";
import definePlugin from "@utils/types";
import { Menu } from "@webpack/common";
import { User } from "discord-types/general";

const OpenExternalIcon = () => {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
            <path d="M0 0h24v24H0z" fill="none" />
            <path d="M18 9v4H6V9H4v6h16V9h-2z" />
        </svg>

    );
};



const userContextPatch: NavContextMenuPatchCallback = (children, { user }: { user?: User, onClose(): void; }) => {
    if (!user) return;
    children.push(
        <Menu.MenuItem
            label="Open NicknamePanel"
            id="nicknameDB-user-nickname"
            icon={OpenExternalIcon}
            action={() => console.log(user.id, user.username)}
        />
    );
};




export default definePlugin({
    name: "NicknameDB",
    description: "Global Nickname Database",
    authors: [Devs.minikomo],



    patches: [{
        find: "\"Show scores in QS results\"",
        replacement: {
            match: / {12}treatments: \[\{ {17}id: 1, {17}label: "Show scores in QS results", {17}config: \{ {21}showScores: !0 {17}\} {13}\}\] {9}\}\); {9}t\.Z = i {5}\},     163889: function\(e, t, n\) \{         var i = n\(200651\)           , l = n\(192379\)           , r = n\(120356\)           , a = n\.n\(r\)           , o = n\(481060\)           , s = n\(822650\);         let c = l\.forwardRef\(function\(e, t\) \{             let \{className: n, focusProps: l, \.\.\.r\} = e;             return \(0,             i\.jsx\)\(o\.FocusRing, \{                 \.\.\.l,                 children: \(0,                 i\.jsx\)\("li", \{                     className: a\(\)\([^)]*\),                     \.\.\.r,                     ref: t                 \}\)             \}\)         \}\);         t\.Z = c     \},/,
            replace: "conslose.log('hello')"
        }
    }],

    start() {
        addContextMenuPatch("user-context", userContextPatch);


    },


});

