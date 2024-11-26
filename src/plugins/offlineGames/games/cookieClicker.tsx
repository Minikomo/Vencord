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
    {
        id: 0, name: "Discord User", cost: 15, cps: 0.1, secondCost: 18,
        formula: (a: number, b: number, i: number) => b + (b - a) + 1,
        img: "https://discord.com/assets/2c21aeda16de354ba5334551a883b481.png"
    },
    {
        id: 1, name: "Server Owner", cost: 100, cps: 1, secondCost: 115,
        formula: (a: number, b: number, i: number) => b + (b - a) + 2 * (i - 1),
        img: "https://cdn3.emoji.gg/emojis/owner.png"
    },
    {
        id: 2, name: "Nitro Classic", cost: 1100, cps: 8, secondCost: 1265,
        formula: (a: number, b: number, i: number) => b + (b - a) + 3 * (i - 1),
        img: "https://img.icons8.com/fluent/600/discord-nitro-badge.png"
    },
    {
        id: 3, name: "Nitro", cost: 12000, cps: 47, secondCost: 13800,
        formula: (a: number, b: number, i: number) => b + (b - a) + 4 * (i - 1),
        img: "https://cdn.iconscout.com/icon/free/png-256/free-discord-nitro-logo-icon-download-in-svg-png-gif-file-formats--voice-premium-social-media-pack-logos-icons-5575180.png"
    },
    {
        id: 4, name: "Server Boost", cost: 130000, cps: 260, secondCost: 149500,
        formula: (a: number, b: number, i: number) => b + (b - a) + 5 * (i - 1),
        img: "https://cdn.iconscout.com/icon/free/png-256/free-level-discord-boost-logo-icon-download-in-svg-png-gif-file-formats--social-media-pack-logos-icons-5575059.png"
    },
    {
        id: 5, name: "HypeSquad", cost: 1400000, cps: 1400, secondCost: 1610000,
        formula: (a: number, b: number, i: number) => b + (b - a) + 6 * (i - 1),
        img: "https://img.icons8.com/?size=512&id=h6eKoXSRNFgA&format=png"
    },
    {
        id: 6, name: "Partner Program", cost: 20000000, cps: 7800, secondCost: 23000000,
        formula: (a: number, b: number, i: number) => b + (b - a) + 7 * (i - 1),
        img: "https://upload.wikimedia.org/wikipedia/commons/5/52/Discord_Partnership_Badge.svg"
    },
    {
        id: 7, name: "Verified Server", cost: 330000000, cps: 44000, secondCost: 380000000,
        formula: (a: number, b: number, i: number) => b + (b - a) + 8 * (i - 1),
        img: "https://cdn3.emoji.gg/emojis/3460-verified.png"
    },
    {
        id: 8, name: "Discord Employee", cost: 5100000000, cps: 260000, secondCost: 5900000000,
        formula: (a: number, b: number, i: number) => b + (b - a) + 9 * (i - 1),
        img: "https://img.icons8.com/fluent/600/discord-stuff-badge.png"
    },
    {
        id: 9, name: "Discord Developer", cost: 75000000000, cps: 1600000, secondCost: 86000000000,
        formula: (a: number, b: number, i: number) => b + (b - a) + 10 * (i - 1),
        img: "https://upload.wikimedia.org/wikipedia/commons/b/b5/Discord_Active_Developer_Badge.svg"
    },
    {
        id: 10, name: "Discord Admin", cost: 1000000000000, cps: 10000000, secondCost: 1150000000000,
        formula: (a: number, b: number, i: number) => b + (b - a) + 11 * (i - 1),
        img: "https://cdn-icons-png.flaticon.com/512/2206/2206368.png"
    },
    {
        id: 11, name: "Discord CEO", cost: 14000000000000, cps: 65000000, secondCost: 16100000000000,
        formula: (a: number, b: number, i: number) => b + (b - a) + 12 * (i - 1),
        img: "https://cdn-icons-png.flaticon.com/512/4961/4961733.png"
    },
    {
        id: 12, name: "Discord Hacker", cost: 200000000000000, cps: 430000000, secondCost: 230000000000000,
        formula: (a: number, b: number, i: number) => b + (b - a) + 13 * (i - 1),
        img: "https://img.icons8.com/fluent/600/hacker.png"
    },
];

const upgradeElements = [
    {
        id: 0, name: "Server beitreten", description: "Die Maus und die " + shopElements[0].name + " sind 2x so effektiv.",
        cost: 100,
        img: "https://orteil.dashnet.org/cookieclicker/img/icons.png",
        requiredElements: [{ id: 0, amount: 1 }],
        upgrades: [{ id: 0, multiplier: 2 }, { id: -1, multiplier: 2 }]
    },
    {
        id: 1, name: "Höheren Discord Server Rang", description: "Die Maus und die " + shopElements[0].name + " sind 2x so effektiv.",
        cost: 500,
        img: "https://orteil.dashnet.org/cookieclicker/img/icons.png",
        requiredElements: [{ id: 0, amount: 1 }],
        upgrades: [{ id: 0, multiplier: 2 }, { id: -1, multiplier: 2 }]
    },
    {
        id: 2, name: "Server Mitglieder", description: "Die " + shopElements[1].name + " sind 2x so effektiv.",
        cost: 1000,
        img: "https://orteil.dashnet.org/cookieclicker/img/icons.png",
        requiredElements: [{ id: 1, amount: 1 }],
        upgrades: [{ id: 1, multiplier: 2 }]
    },
    {
        id: 3, name: "Aktiver Server", description: "Die " + shopElements[1].name + " sind 2x so effektiv.",
        cost: 5000,
        img: "https://orteil.dashnet.org/cookieclicker/img/icons.png",
        requiredElements: [{ id: 1, amount: 5 }],
        upgrades: [{ id: 1, multiplier: 2 }]
    },
    {
        id: 4, name: "Nitro Boost", description: "Die " + shopElements[2].name + " sind 2x so effektiv.",
        cost: 11000,
        img: "https://orteil.dashnet.org/cookieclicker/img/icons.png",
        requiredElements: [{ id: 2, amount: 1 }],
        upgrades: [{ id: 2, multiplier: 2 }]
    },
    {
        id: 5, name: "Discord Server Mod", description: "Die Maus und die " + shopElements[0].name + " sind 2x so effektiv.",
        cost: 10000,
        img: "https://orteil.dashnet.org/cookieclicker/img/icons.png",
        requiredElements: [{ id: 0, amount: 10 }],
        upgrades: [{ id: 0, multiplier: 2 }, { id: -1, multiplier: 2 }]
    }
];

const CookieClickerModalContent = ({ rootProps }: { rootProps: ModalProps; }) => {
    const [cookies, setCookies] = useState(0);
    const [buyedElements, setBuyedElements] = useState<{ amount: number; }[]>([]);
    const [buyedUpgrades, setBuyedUpgrades] = useState<{ buyed: boolean; }[]>([]);
    const [floatingNumbers, setFloatingNumbers] = useState<
        { id: number; value: number; x: number; y: number; }[]
    >([]);

    useEffect(() => {
        // Load saved game state
        const loadGameState = async () => {
            const savedState = await DataStore.get(cookieClickerStoreKey);
            if (savedState) {
                const { cookies, buyedElements, buyedUpgrades } = savedState;
                if (cookies) {
                    setCookies(cookies);
                }
                if (buyedElements) {
                    setBuyedElements(buyedElements);
                }
                if (buyedUpgrades) {
                    setBuyedUpgrades(buyedUpgrades);
                }
            }
        };
        loadGameState();
    }, []);


    const clickCookie = (e: React.MouseEvent) => {
        let clickValue = 1;
        upgradeElements.forEach(upgrade => {
            if (isUpgradeBuyed(upgrade.id)) {
                upgrade.upgrades.forEach(upgradeEffect => {
                    if (upgradeEffect.id === -1) {
                        clickValue *= upgradeEffect.multiplier;
                    }
                });
            }
        });

        setCookies(cookies + clickValue);
        saveGameState();

        // Add a new floating number
        const rect = e.currentTarget.getBoundingClientRect();
        const id = Date.now(); // Unique ID for each floating number
        setFloatingNumbers(prev => [
            ...prev,
            {
                id,
                value: clickValue,
                x: e.clientX - rect.left + Math.random() * 60 - 30,
                y: e.clientY - rect.top + Math.random() * 60 - 30,
            },
        ]);

        // Remove the floating number after animation
        setTimeout(() => {
            setFloatingNumbers(prev => prev.filter(num => num.id !== id));
        }, 1000); // Match animation duration
    };

    function formatNumber(num: number) {
        const units = ["", "K", "M", "B", "T", "Q", "S"];
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
        if (cookies >= calculateSequence(getAmount(id), id)) {
            setCookies(cookies - calculateSequence(getAmount(id), id));
            buyedElements[id].amount += amount;
            saveGameState();
        }
    }

    function buyUpgrade(id: number) {
        const upgrade = upgradeElements[id];
        if (!buyedUpgrades[id]) {
            buyedUpgrades[id] = { buyed: false };
        }
        if (cookies >= upgrade.cost) {
            setCookies(cookies - upgrade.cost);
            buyedUpgrades[id].buyed = true;
            saveGameState();
        }
    }

    function getAmount(id: number) {
        return buyedElements[id] ? buyedElements[id].amount : 0;
    }

    function isUpgradeBuyed(id: number) {
        return buyedUpgrades[id] ? buyedUpgrades[id].buyed : false;
    }

    function calculateCps() {
        return shopElements.reduce((cps, element) => {
            return cps + calculateCpsForElement(element.id);
        }, 0);
    }

    function calculateCpsForElement(id: number, single: boolean = false) {
        let elementCps = shopElements[id].cps * (single ? 1 : getAmount(id));
        upgradeElements.forEach(upgrade => {
            if (isUpgradeBuyed(upgrade.id)) {
                upgrade.upgrades.forEach(upgradeEffect => {
                    if (upgradeEffect.id === id) {
                        elementCps *= upgradeEffect.multiplier;
                    }
                });
            }
        });
        return elementCps;
    }

    function calculateSequence(n: number, id: number = 0): number {
        if (n === 0) return shopElements[id].cost;
        if (n === 1) return shopElements[id].secondCost;
        let a = shopElements[id].cost;
        let b = shopElements[id].secondCost;
        for (let i = 2; i <= n; i++) {
            const next = shopElements[id].formula(a, b, i);
            a = b;
            b = next;
        }
        return b;
    }

    useEffect(() => {
        const interval = setInterval(() => {
            setCookies(cookies + calculateCps() / 10);
            saveGameState();
        }, 100);
        return () => clearInterval(interval);
    });

    function saveGameState() {
        DataStore.set(cookieClickerStoreKey, { cookies, buyedElements, buyedUpgrades });
    }

    return (
        <ModalRoot {...rootProps} className="cookie-clicker-root">
            <ModalContent>
                <div className="cookie-clicker">
                    <div className="cookie-info">
                        <h2>{formatNumber(cookies)} Cookies</h2>
                        <h3>per second: {formatNumber(calculateCps())}</h3>
                    </div>
                    <button className="cookie-button" onClick={clickCookie} onContextMenu={clickCookie}>
                        <img src="https://static.wikia.nocookie.net/cookieclicker/images/5/5a/PerfectCookie.png" alt="Cookie" />
                        {floatingNumbers.map(number => (
                            <div
                                key={number.id}
                                className="floating-number"
                                style={{
                                    left: number.x,
                                    top: number.y,
                                }}
                            >
                                +{number.value}
                            </div>
                        ))}
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
                    <h2>Upgrades</h2>
                    {upgradeElements.sort((a, b) => a.cost - b.cost).map(({ id, name, description, cost, requiredElements }) => (
                        <div key={id} className={`upgrade-item ${cookies >= cost ? "buyable" : ""} ${isUpgradeBuyed(id) ? "buyed" : ""} ${requiredElements.every(({ id, amount }) => getAmount(id) >= amount) ? "" : "disabled"}
                        `} onClick={() => buyUpgrade(id)}>
                            <img src={upgradeElements[id].img} alt={name} />
                            <div>
                                <h3>{name}</h3>
                                <p>{description}</p>
                                <p className="cost"><img src="https://orteil.dashnet.org/cookieclicker/img/favicon.ico" alt="Cookie" /> {cost}</p>
                            </div>
                        </div>
                    ))}

                    <h2>Shop</h2>
                    {shopElements.filter(({ id }) => getAmount(id) > 0 || id === 0 || (id > 0 && getAmount(id - 1) > 0) || (id > 1 && getAmount(id - 2) > 0)).map(({ id, name, cost, cps }) => (
                        <div key={id} className={`shop-item ${cookies >= calculateSequence(getAmount(id), id) ? "buyable" : ""} ${getAmount(id) < 1 ? "unknown" : ""}`} onClick={() => buyElement(id)}>
                            <img src={shopElements[id].img} alt={name} />
                            <div>
                                <h3>{getAmount(id) > 0 ? name : "???"}</h3>
                                <p className="cost" ><img src="https://orteil.dashnet.org/cookieclicker/img/favicon.ico" alt="Cookie" /> {calculateSequence(getAmount(id), id)}</p>
                                {getAmount(id) > 0 ? <p>{formatNumber(calculateCpsForElement(id, true))} Cookies per second</p> : null}
                            </div>
                            <p>{getAmount(id)}</p>
                        </div>
                    ))}
                </div>
            </ModalContent>
            <ModalFooter>
                <h1 style={{ textAlign: "center", width: "100%", color: "white" }}>CookieClicker PRE-ALPHA</h1>
                <button onClick={() => {
                    setCookies(0);
                    setBuyedElements([]);
                    setBuyedUpgrades([]);
                    saveGameState();
                }} style={{ backgroundColor: "red" }}>
                    Reset?
                </button>
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
