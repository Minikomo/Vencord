/*
 * Vencord, a Discord client mod
 * Copyright (c) 2024 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import "./CookieClickerGame.css";

import { ModalContent, ModalFooter, ModalProps, ModalRoot, openModal } from "@utils/modal";

import { defineOfflineGame } from "../index";

const CookieClickerModalContent = ({ rootProps }: { rootProps: ModalProps; }) => {
    return (
        <ModalRoot {...rootProps} className="cookie-clicker-root">
            <ModalContent>
                <div className="cookie-clicker">
                    <h2>Cookies: 0</h2>
                    <h3>Cookies per second: 0</h3>
                    <button className="cookie-button">
                        <img src="https://orteil.dashnet.org/cookieclicker/img/favicon.ico" alt="Cookie" />
                    </button>
                </div>
                <div className="upgrades">
                    <h2>Upgrades</h2>
                    <div className="upgrade">
                        <h3>Cursor</h3>
                        <p>Cost: 15</p>
                        <button>Buy</button>
                    </div>
                    <div className="upgrade">
                        <h3>Grandma</h3>
                        <p>Cost: 100</p>
                        <button>Buy</button>
                    </div>
                    <div className="upgrade">
                        <h3>Factory</h3>
                        <p>Cost: 500</p>
                        <button>Buy</button>
                    </div>
                </div>
            </ModalContent>
            <ModalFooter>
                <h1 style={{ textAlign: "center", width: "100%", color: "white" }}>CookieClicker PRE-ALPHA</h1>
            </ModalFooter>
        </ModalRoot>
    );
};


export default defineOfflineGame({
    name: "Cookie Clicker",
    description: "Click the cookie!",
    image: "https://orteil.dashnet.org/cookieclicker/img/favicon.ico",
    action: () => {
        openModal(props => <CookieClickerModalContent rootProps={props} />);

    }
});
