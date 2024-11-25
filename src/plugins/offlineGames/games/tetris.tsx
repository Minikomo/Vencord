/*
 * Vencord, a Discord client mod
 * Copyright (c) 2024 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import "./TetrisGame.css";

import { ModalContent, ModalProps, ModalRoot, openModal } from "@utils/modal";
import { useEffect, useState } from "@webpack/common";

import { defineOfflineGame } from "../index";

const ROWS = 20;
const COLS = 10;
const BLOCK_SIZE = 30;

const TETROMINOS = {
    I: { shape: [[1, 1, 1, 1]], color: "iBlock" },
    O: { shape: [[1, 1], [1, 1]], color: "oBlock" },
    T: { shape: [[0, 1, 0], [1, 1, 1]], color: "tBlock" },
    S: { shape: [[0, 1, 1], [1, 1, 0]], color: "sBlock" },
    Z: { shape: [[1, 1, 0], [0, 1, 1]], color: "zBlock" },
    J: { shape: [[1, 0, 0], [1, 1, 1]], color: "jBlock" },
    L: { shape: [[0, 0, 1], [1, 1, 1]], color: "lBlock" },
};

const randomTetromino = () => {
    const keys = Object.keys(TETROMINOS);
    const randIndex = Math.floor(Math.random() * keys.length);
    const key = keys[randIndex];
    return { ...TETROMINOS[key], type: key };
};

const TetrisModalContent = ({ rootProps }: { rootProps: ModalProps; }) => {
    const [board, setBoard] = useState(
        Array.from({ length: ROWS }, () => Array(COLS).fill({ value: 0, color: "" }))
    );
    const [tetromino, setTetromino] = useState(randomTetromino());
    const [tetrominoPos, setTetrominoPos] = useState({ x: Math.floor(COLS / 2) - 1, y: 0 });
    const [keyPressed, setKeyPressed] = useState<string | null>(null);

    const drawBoard = () => {
        const newBoard = board.map(row => row.map(cell => ({ ...cell })));
        tetromino.shape.forEach((row, y) => {
            row.forEach((cell, x) => {
                if (cell) {
                    const newY = y + tetrominoPos.y;
                    const newX = x + tetrominoPos.x;
                    if (newY >= 0 && newY < ROWS && newX >= 0 && newX < COLS) {
                        newBoard[newY][newX] = { value: 1, color: tetromino.color };
                    }
                }
            });
        });
        return newBoard;
    };

    const checkCollision = (newX: number, newY: number) => {
        return tetromino.shape.some((row, y) =>
            row.some((cell, x) => {
                if (cell) {
                    const boardX = newX + x;
                    const boardY = newY + y;
                    return (
                        boardX < 0 || // Out of bounds (left)
                        boardX >= COLS || // Out of bounds (right)
                        boardY >= ROWS || // Out of bounds (bottom)
                        (boardY >= 0 && board[boardY][boardX].value) // Colliding with placed blocks
                    );
                }
                return false;
            })
        );
    };

    const removeFullLines = (board: any[][]) => {
        const newBoard = board.filter(row => row.some(cell => cell.value === 0));
        const linesRemoved = ROWS - newBoard.length;
        const emptyRows = Array.from({ length: linesRemoved }, () => Array(COLS).fill({ value: 0, color: "" }));
        return [...emptyRows, ...newBoard];
    };

    const placeTetromino = () => {
        const newBoard = board.map(row => row.map(cell => ({ ...cell })));
        tetromino.shape.forEach((row, y) => {
            row.forEach((cell, x) => {
                if (cell) {
                    const newX = x + tetrominoPos.x;
                    const newY = y + tetrominoPos.y;
                    if (newY >= 0) {
                        newBoard[newY][newX] = { value: 1, color: tetromino.color };
                    }
                }
            });
        });

        const updatedBoard = removeFullLines(newBoard);
        setBoard(updatedBoard);

        setTetromino(randomTetromino());
        setTetrominoPos({ x: Math.floor(COLS / 2) - 1, y: 0 });
    };

    const moveTetromino = (x: number, y: number) => {
        const newX = tetrominoPos.x + x;
        const newY = tetrominoPos.y + y;

        console.log(newX, newY);

        if (!checkCollision(newX, newY)) {
            setTetrominoPos({ x: newX, y: newY });
        } else if (y > 0) {
            placeTetromino();
        }
    };

    const rotateTetromino = () => {
        const newTetromino = tetromino.shape[0].map((_: number, i: number) =>
            tetromino.shape.map((row: number[]) => row[i])
        ).reverse();
        const newPos = { x: tetrominoPos.x, y: tetrominoPos.y };
        if (!checkCollision(newPos.x, newPos.y)) {
            setTetromino({ ...tetromino, shape: newTetromino });
        }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
        if (keyPressed === e.key) return;

        setKeyPressed(e.key);

        switch (e.key) {
            case "ArrowLeft":
            case "a":
                moveTetromino(-1, 0);
                break;
            case "ArrowRight":
            case "d":
                moveTetromino(1, 0);
                break;
            case "ArrowDown":
            case "s":
                moveTetromino(0, 1);
                break;
            case "ArrowUp":
            case "w":
                rotateTetromino();
                break;
        }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
        setKeyPressed(null);
    };

    useEffect(() => {
        document.addEventListener("keydown", handleKeyDown);
        document.addEventListener("keyup", handleKeyUp);

        return () => {
            document.removeEventListener("keydown", handleKeyDown);
            document.removeEventListener("keyup", handleKeyUp);
        };
    }, [keyPressed]);

    return (
        <ModalRoot {...rootProps}>
            <ModalContent>
                <h1 style={{ textAlign: "center", width: "100%", color: "white" }}>Tetris PRE-ALPHA</h1>
                <div className="tetris-board">
                    {drawBoard().map((row, y) =>
                        row.map((cell, x) => (
                            <div
                                key={`${y}-${x}`}
                                className={`tetris-cell ${cell.value ? `filled ${cell.color}` : ""}`}
                                style={{ width: BLOCK_SIZE, height: BLOCK_SIZE }}
                            />
                        ))
                    )}
                </div>
            </ModalContent>
        </ModalRoot>
    );
};

export default defineOfflineGame({
    name: "Tetris",
    description: "Play Tetris!",
    image: "https://upload.wikimedia.org/wikipedia/commons/7/7c/Emacs_Tetris_vector_based_detail.svg",
    action: () => {
        openModal(props => <TetrisModalContent rootProps={props} />);
        console.log("Starting Tetris");
    }
});
