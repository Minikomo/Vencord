/*
 * Vencord, a Discord client mod
 * Copyright (c) 2024 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import "./CookieClickerGame.css";

import { ModalContent, ModalFooter, ModalProps, ModalRoot, openModal } from "@utils/modal";
import { useState } from "@webpack/common";

import { defineOfflineGame } from "../index";

const shopElements = [
    { id: 0, name: "Discord User", cost: 15, cps: 0.1, costIncrease: 1.15 },
    { id: 1, name: "Nitro Basic", cost: 100, cps: 1, costIncrease: 1.18 },
    { id: 2, name: "Nitro Classic", cost: 500, cps: 5, costIncrease: 1.2 },
    { id: 3, name: "Nitro", cost: 2000, cps: 20, costIncrease: 1.25 },
    { id: 4, name: "Server Boost", cost: 7000, cps: 70, costIncrease: 1.3 },
    { id: 5, name: "HypeSquad", cost: 50000, cps: 500, costIncrease: 1.35 },
    { id: 6, name: "Partner Program", cost: 1000000, cps: 10000, costIncrease: 1.4 },
    { id: 7, name: "Verified Server", cost: 100000000, cps: 1000000, costIncrease: 1.5 },
    { id: 8, name: "Discord Employee", cost: 10000000000, cps: 100000000, costIncrease: 1.6 },
    { id: 9, name: "Discord Developer", cost: 100000000000, cps: 1000000000, costIncrease: 1.7 },
];

const CookieClickerModalContent = ({ rootProps }: { rootProps: ModalProps; }) => {
    const [cookies, setCookies] = useState(0);
    const [buyedElements, setBuyedElements] = useState([
        { id: 0, amount: 0 },
        { id: 1, amount: 0 },
        { id: 2, amount: 0 },
        { id: 3, amount: 0 },
        { id: 4, amount: 0 },
        { id: 5, amount: 0 },
        { id: 6, amount: 0 },
        { id: 7, amount: 0 },
        { id: 8, amount: 0 },
        { id: 9, amount: 0 },
    ]);

    function clickCookie() {
        setCookies(cookies + 1);
    }

    function formatNumber(num: number) {
        // auf 2 Nachkommastellen runden und Buchstaben hinzufügen
        if (num < 1000) return num.toFixed(2);
        if (num < 1000000) return (num / 1000).toFixed(2) + "K";
        if (num < 1000000000) return (num / 1000000).toFixed(2) + "M";
        if (num < 1000000000000) return (num / 1000000000).toFixed(2) + "B";
        if (num < 1000000000000000) return (num / 1000000000000).toFixed(2) + "T";
        if (num < 1000000000000000000) return (num / 1000000000000000).toFixed(2) + "Q";
        if (num < 1000000000000000000000) return (num / 1000000000000000000).toFixed(2) + "S";
        if (num < 1000000000000000000000000) return (num / 1000000000000000000000).toFixed(2) + "O";
        return num.toFixed(2);
    }

    function buyElement(id: number, amount: number = 1) {
        const element = shopElements[id];
        if (cookies >= element.cost * Math.pow(element.costIncrease, buyedElements[id].amount)) {
            setCookies(cookies - element.cost * Math.pow(element.costIncrease, buyedElements[id].amount));
            buyedElements[id].amount += amount;
        }
    }

    return (
        <ModalRoot {...rootProps} className="cookie-clicker-root">
            <ModalContent>
                <div className="cookie-clicker">
                    <h2>Cookies: {formatNumber(cookies)}</h2>
                    <h3>Cookies per second: 0</h3>
                    <button className="cookie-button" onClick={clickCookie} onContextMenu={clickCookie}>
                        <img src="https://orteil.dashnet.org/cookieclicker/img/favicon.ico" alt="Cookie" />
                    </button>
                </div>
                <div className="upgrades">
                    <h2>Upgrades</h2>
                </div>
                <div className="shop">
                    <h2>Shop</h2>
                    {shopElements.map(({ id, name, cost, cps, costIncrease }) => (
                        <div key={id} className="shop-item">
                            <h3>{name}</h3>
                            <p>Amount: {buyedElements[id].amount}</p>
                            <p>Cost: {formatNumber(cost * Math.pow(costIncrease, buyedElements[id].amount))}</p>
                            <p>Cookies per second: {cps}</p>
                            <button onClick={() => buyElement(id)}>Buy 1</button>
                            <button onClick={() => buyElement(id, 10)}>Buy 10</button>
                            <button onClick={() => buyElement(id, 100)}>Buy 100</button>
                        </div>
                    ))}
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
