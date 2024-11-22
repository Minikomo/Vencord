/*
 * Vencord, a Discord client mod
 * Copyright (c) 2024 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { addChatBarButton, ChatBarButton, removeChatBarButton } from "@api/ChatButtons";
import { addPreSendListener, removePreSendListener, SendListener } from "@api/MessageEvents";
import { definePluginSettings } from "@api/Settings";
import { Devs } from "@utils/constants";
import definePlugin, { OptionType } from "@utils/types";
import { React, useEffect, useState } from "@webpack/common";

let enable = false;

function getCursedstring(input: string): string {
    let tempstring = "";
    for (let i = 0; i < input.length; i++) {
        console.log(input[i]);
        console.log(input.length);
        console.log(i);
        if (i === 0) {
            tempstring += input[i];

        }
        else if (i === input.length - 1) {

            tempstring += input[i];

        }
        else {
            tempstring += "\\" + settings.store.cencorletter;
        }
    }
    return tempstring;
}
function onCurseIconOFF() {

    return <svg
        className="untis-button"
        viewBox="0 0 24 24"
        version="1.1"
        id="svg1"
    >
        <defs
            id="defs1" />

        <rect

            id="rect1"
            width="23.754396"
            height="7.0692382"
            x="0.087816626"
            y="8.1230383" />
        <path
            d="M 2.4628451,9.9205681 V 10.571638 L 2.0024379,10.111231 1.3665345,10.747135 1.8269417,11.207542 H 1.1747885 v 0.899148 h 0.6532364 l -0.4614904,0.461491 0.6359034,0.635903 0.4604072,-0.460407 v 0.65107 h 0.8991483 v -0.652153 l 0.4614904,0.46149 0.635904,-0.635903 L 3.9978969,12.10669 H 4.6500506 V 11.207542 H 3.9989801 l 0.4604077,-0.460407 -0.635904,-0.635904 -0.4614904,0.46149 V 9.9205681 Z"

            id="path5" />
        <path
            d="M 6.9647856,9.9205679 V 10.571638 L 6.5043784,10.111231 5.868475,10.747135 6.3288822,11.207542 H 5.676729 v 0.899148 h 0.6532364 l -0.4614904,0.461491 0.6359034,0.635903 0.4604072,-0.460407 v 0.65107 h 0.8991483 v -0.652153 l 0.4614904,0.46149 0.635904,-0.635903 L 8.4998374,12.10669 H 9.1519911 V 11.207542 H 8.5009206 l 0.4604077,-0.460407 -0.635904,-0.635904 -0.4614904,0.46149 V 9.9205679 Z"

            id="path6" />
        <path
            d="m 11.466726,9.9205678 v 0.6510702 l -0.460407,-0.460407 -0.635903,0.635904 0.460407,0.460407 H 10.17867 v 0.899148 h 0.653236 l -0.46149,0.461491 0.635903,0.635903 0.460407,-0.460407 v 0.65107 h 0.899149 v -0.652153 l 0.46149,0.46149 0.635904,-0.635903 -0.461491,-0.461491 h 0.652154 v -0.899148 h -0.651071 l 0.460408,-0.460407 -0.635904,-0.635904 -0.46149,0.46149 V 9.9205678 Z"

            id="path7" />
        <path
            d="m 15.968667,9.9205678 v 0.6510702 l -0.460407,-0.460407 -0.635903,0.635904 0.460407,0.460407 h -0.652153 v 0.899148 h 0.653236 l -0.46149,0.461491 0.635903,0.635903 0.460407,-0.460407 v 0.65107 h 0.899149 v -0.652153 l 0.46149,0.46149 0.635904,-0.635903 -0.461491,-0.461491 h 0.652154 v -0.899148 h -0.651071 l 0.460408,-0.460407 -0.635904,-0.635904 -0.46149,0.46149 V 9.9205678 Z"

            id="path8" />
        <path
            d="m 20.470608,9.9205678 v 0.6510702 l -0.460407,-0.460407 -0.635903,0.635904 0.460407,0.460407 h -0.652153 v 0.899148 h 0.653236 l -0.46149,0.461491 0.635903,0.635903 0.460407,-0.460407 v 0.65107 h 0.899149 v -0.652153 l 0.46149,0.46149 0.635904,-0.635903 -0.461491,-0.461491 h 0.652154 v -0.899148 h -0.651071 l 0.460408,-0.460407 -0.635904,-0.635904 -0.46149,0.46149 V 9.9205678 Z"

            id="path9" />
    </svg>;



}

function onCurseIcon() {

    return <svg
        className="untis-button"
        viewBox="0 0 24 24"
        fill="currentColor"
        version="1.1"
        id="svg1"
    >
        <defs
            id="defs1" />
        <style
            id="style1">


        </style>
        <path
            id="rect1"

            fill="#000000"

            d="M 0.087890625 8.1230469 L 0.087890625 15.191406 L 5.9160156 15.191406 L 12.628906 8.1230469 L 0.087890625 8.1230469 z M 18.576172 8.1230469 L 11.861328 15.191406 L 23.841797 15.191406 L 23.841797 8.1230469 L 18.576172 8.1230469 z " />
        <path
            d="M 2.4628451,9.9205681 V 10.571638 L 2.0024379,10.111231 1.3665345,10.747135 1.8269417,11.207542 H 1.1747885 v 0.899148 h 0.6532364 l -0.4614904,0.461491 0.6359034,0.635903 0.4604072,-0.460407 v 0.65107 h 0.8991483 v -0.652153 l 0.4614904,0.46149 0.635904,-0.635903 L 3.9978969,12.10669 H 4.6500506 V 11.207542 H 3.9989801 l 0.4604077,-0.460407 -0.635904,-0.635904 -0.4614904,0.46149 V 9.9205681 Z"

            id="path5" />
        <path
            id="path6"

            d="M 6.9648438 9.9199219 L 6.9648438 10.572266 L 6.5039062 10.111328 L 5.8691406 10.748047 L 6.328125 11.207031 L 5.6757812 11.207031 L 5.6757812 12.107422 L 6.3300781 12.107422 L 5.8691406 12.568359 L 6.5039062 13.203125 L 6.9648438 12.744141 L 6.9648438 13.394531 L 7.6503906 13.394531 L 7.8632812 13.171875 L 7.8632812 12.742188 L 8.0722656 12.951172 L 8.6914062 12.298828 L 8.5 12.107422 L 8.8730469 12.107422 L 9.1523438 11.814453 L 9.1523438 11.207031 L 8.5 11.207031 L 8.9609375 10.748047 L 8.3261719 10.111328 L 7.8632812 10.572266 L 7.8632812 9.9199219 L 6.9648438 9.9199219 z " />
        <path
            id="path8"

            d="M 16.853516 9.9199219 L 14.775391 12.107422 L 15.333984 12.107422 L 14.873047 12.568359 L 15.507812 13.203125 L 15.96875 12.744141 L 15.96875 13.394531 L 16.867188 13.394531 L 16.867188 12.742188 L 17.330078 13.203125 L 17.964844 12.568359 L 17.503906 12.107422 L 18.15625 12.107422 L 18.15625 11.207031 L 17.503906 11.207031 L 17.964844 10.748047 L 17.330078 10.111328 L 16.867188 10.572266 L 16.867188 9.9199219 L 16.853516 9.9199219 z " />
        <path
            d="m 20.470608,9.9205678 v 0.6510702 l -0.460407,-0.460407 -0.635903,0.635904 0.460407,0.460407 h -0.652153 v 0.899148 h 0.653236 l -0.46149,0.461491 0.635903,0.635903 0.460407,-0.460407 v 0.65107 h 0.899149 v -0.652153 l 0.46149,0.46149 0.635904,-0.635903 -0.461491,-0.461491 h 0.652154 v -0.899148 h -0.651071 l 0.460408,-0.460407 -0.635904,-0.635904 -0.46149,0.46149 V 9.9205678 Z"

            id="path9" />
        <rect

            id="rect10"
            width="2.1325626"
            height="24.747578"
            x="15.948865"
            y="-12.900936"
            ry="1.3075533"
            transform="rotate(45)" />
    </svg >;

}






function cursefyString(input: string): string {
    var temp = input.split(" ");
    var newwords = "";
    temp.forEach(word => {
        if (Math.random() < 0.5) {
            newwords += " " + getCursedstring(word);
        }
        else {
            newwords += " " + word;
        }
    });
    return newwords;






    return newwords;
}

const settings = definePluginSettings({


    cencorletter: {
        type: OptionType.STRING,
        description: "Custom cencor letter",
        default: "*",

    },




});

const lastState = false;

const curseSpeech: ChatBarButton = ({ isMainChat }) => {
    const [enabled, setEnabled] = useState(lastState);


    function setEnabledValue() {

        if (enable) {
            enable = false;


        }
        else {
            enable = true;

        }
    }


    useEffect(() => {
        const listener: SendListener = (_, message) => {
            console.log(message.content);
            message.content = cursefyString(message.content);

            console.log(cursefyString(message.content));


        };

        addPreSendListener(listener);
        return () => void removePreSendListener(listener);
    }, [enabled]);

    if (!isMainChat) return null;

    return (
        <ChatBarButton
            tooltip={enabled ? "Disable " : "Enable "}
            onClick={() => setEnabledValue()}

        >
            {onCurseIcon()}
        </ChatBarButton>
    );
};

export default definePlugin({
    name: "curseSpeech",
    description: "Makes your messages cursed :>",
    authors: [Devs.minikomo],
    settings,
    dependencies: ["MessageEventsAPI", "ChatInputButtonAPI"],

    start() {
        addChatBarButton("curseSpeech", curseSpeech);
    },

    stop() {
        removeChatBarButton("curseSpeech");
    }
});
