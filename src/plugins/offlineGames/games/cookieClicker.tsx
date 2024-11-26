/*
 * Vencord, a Discord client mod
 * Copyright (c) 2024 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import "./CookieClickerGame.css";

import { DataStore } from "@api/index";
import { ModalContent, ModalFooter, ModalProps, ModalRoot, openModal } from "@utils/modal";
import { useEffect, useState } from "@webpack/common";

import { defineOfflineGame } from "../index";

const cookieClickerStoreKey = "Vencord.offlineGames.cookieClicker";

const shopElements = [
    { id: 0, name: "Discord User", cost: 15, cps: 0.1, costIncrease: 1.15, img: "https://discord.com/assets/2c21aeda16de354ba5334551a883b481.png" },
    { id: 1, name: "Server Owner", cost: 100, cps: 1, costIncrease: 1.18, img: "https://cdn3.emoji.gg/emojis/owner.png" },
    { id: 2, name: "Nitro Classic", cost: 500, cps: 5, costIncrease: 1.2, img: "https://img.icons8.com/fluent/600/discord-nitro-badge.png" },
    { id: 3, name: "Nitro", cost: 2000, cps: 20, costIncrease: 1.25, img: "https://cdn.iconscout.com/icon/free/png-256/free-discord-nitro-logo-icon-download-in-svg-png-gif-file-formats--voice-premium-social-media-pack-logos-icons-5575180.png" },
    { id: 4, name: "Server Boost", cost: 7000, cps: 70, costIncrease: 1.3, img: "https://cdn.iconscout.com/icon/free/png-256/free-level-discord-boost-logo-icon-download-in-svg-png-gif-file-formats--social-media-pack-logos-icons-5575059.png" },
    { id: 5, name: "HypeSquad", cost: 50000, cps: 500, costIncrease: 1.35, img: "https://img.icons8.com/?size=512&id=h6eKoXSRNFgA&format=png" },
    { id: 6, name: "Partner Program", cost: 1000000, cps: 10000, costIncrease: 1.4, img: "https://upload.wikimedia.org/wikipedia/commons/5/52/Discord_Partnership_Badge.svg" },
    { id: 7, name: "Verified Server", cost: 100000000, cps: 1000000, costIncrease: 1.5, img: "https://cdn3.emoji.gg/emojis/3460-verified.png" },
    { id: 8, name: "Discord Employee", cost: 10000000000, cps: 100000000, costIncrease: 1.6, img: "https://img.icons8.com/fluent/600/discord-stuff-badge.png" },
    { id: 9, name: "Discord Developer", cost: 100000000000, cps: 1000000000, costIncrease: 1.7, img: "https://upload.wikimedia.org/wikipedia/commons/b/b5/Discord_Active_Developer_Badge.svg" },
];

const CookieClickerModalContent = ({ rootProps }: { rootProps: ModalProps; }) => {
    const [cookies, setCookies] = useState(0);
    const [buyedElements, setBuyedElements] = useState<{ amount: number; }[]>([]);

    useEffect(() => {
        // Load saved game state
        const loadGameState = async () => {
            const savedState = await DataStore.get(cookieClickerStoreKey);
            if (savedState) {
                const { cookies, buyedElements } = savedState;
                if (cookies) {
                    setCookies(cookies);
                }
                if (buyedElements) {
                    setBuyedElements(buyedElements);
                }
            }
        };
        loadGameState();
    }, []);


    function clickCookie() {
        setCookies(cookies + 1);
        saveGameState();
    }

    function formatNumber(num: number) {
        const units = ["", "K", "M", "B", "T", "Q", "S", "O"];
        let unitIndex = 0;
        while (num >= 1000 && unitIndex < units.length - 1) {
            num /= 1000;
            unitIndex++;
        }
        const formattedNum = num.toFixed(2);
        return formattedNum.endsWith(".00") ? formattedNum.slice(0, -3) + units[unitIndex] : formattedNum.endsWith("0") ? formattedNum.slice(0, -1) + units[unitIndex] : formattedNum + units[unitIndex];
    }

    function buyElement(id: number, amount: number = 1) {
        const element = shopElements[id];
        if (!buyedElements[id]) {
            buyedElements[id] = { amount: 0 };
        }
        if (cookies >= element.cost * Math.pow(element.costIncrease, buyedElements[id].amount)) {
            setCookies(cookies - element.cost * Math.pow(element.costIncrease, buyedElements[id].amount));
            buyedElements[id].amount += amount;
            saveGameState();
        }
    }

    function getAmount(id: number) {
        return buyedElements[id] ? buyedElements[id].amount : 0;
    }

    function calculateCps() {
        return shopElements.reduce((cps, element) => cps + element.cps * getAmount(element.id), 0);
    }

    useEffect(() => {
        const interval = setInterval(() => {
            setCookies(cookies + calculateCps() / 10);
        }, 100);
        return () => clearInterval(interval);
    });

    function saveGameState() {
        DataStore.set(cookieClickerStoreKey, { cookies, buyedElements });
    }

    return (
        <ModalRoot {...rootProps} className="cookie-clicker-root">
            <ModalContent>
                <div className="cookie-clicker">
                    <h2>Cookies: {formatNumber(cookies)}</h2>
                    <h3>Cookies per second: {formatNumber(calculateCps())}</h3>
                    <button className="cookie-button" onClick={clickCookie} onContextMenu={clickCookie}>
                        <img src="https://orteil.dashnet.org/cookieclicker/img/favicon.ico" alt="Cookie" />
                    </button>
                </div>
                <div className="visuals">
                    {/* Alle Elemente die min 1x gekauft wurden, werden hier angezeigt. */}
                    {shopElements.filter(({ id }) => getAmount(id) > 0).map(({ id, name, cps }) => (
                        <div key={id} className="visual-item">
                            <div className="visual-item-elements">
                                {[...Array(getAmount(id))].map((_, i) => (
                                    <img key={i} src={shopElements[id].img} alt={name} />
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
                <div className="shop">
                    <h2>Shop</h2>
                    {shopElements.map(({ id, name, cost, cps, costIncrease }) => (
                        <div key={id} className="shop-item">
                            <h3>{name}</h3>
                            <p>Amount: {getAmount(id)}</p>
                            <p>Cookies per second: {cps}</p>
                            <button onClick={() => buyElement(id)}>Buy 1 ({formatNumber(cost * Math.pow(costIncrease, getAmount(id)) + cps)})</button>
                            <button onClick={() => buyElement(id, 10)}>Buy 10 ({formatNumber(cost * Math.pow(costIncrease, getAmount(id)) + cps * 10)})</button>
                            <button onClick={() => buyElement(id, 100)}>Buy 100 ({formatNumber(cost * Math.pow(costIncrease, getAmount(id)) + cps * 100)})</button>
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
