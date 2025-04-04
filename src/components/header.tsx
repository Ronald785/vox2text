"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { FaSun, FaMoon } from "react-icons/fa";
import { FiGithub } from "react-icons/fi";

export default function Header() {
    const [dark, setDark] = useState(false);
    const [mounted, setMounted] = useState(false); // 👈 controla se já pode renderizar

    useEffect(() => {
        const savedTheme = localStorage.getItem("theme");

        if (savedTheme === "dark") {
            setDark(true);
            document.documentElement.classList.add("dark");
        } else if (savedTheme === "light") {
            setDark(false);
            document.documentElement.classList.remove("dark");
        } else {
            const prefersDark = window.matchMedia(
                "(prefers-color-scheme: dark)"
            ).matches;
            setDark(prefersDark);
            document.documentElement.classList.toggle("dark", prefersDark);
        }

        setMounted(true);
    }, []);

    useEffect(() => {
        if (!mounted) return;

        if (dark) {
            document.documentElement.classList.add("dark");
            localStorage.setItem("theme", "dark");
        } else {
            document.documentElement.classList.remove("dark");
            localStorage.setItem("theme", "light");
        }
    }, [dark, mounted]);

    if (!mounted) return null;

    return (
        <header className="max-w-7xl m-auto flex items-center px-4">
            <nav className="w-full flex items-center justify-between py-4 pt-4">
                <ul>
                    <li>
                        <Link href={"/"}>
                            <h1 className="text-2xl">InshortAI</h1>
                        </Link>
                    </li>
                </ul>
                <ul className="flex items-center gap-4">
                    <li className="flex items-center gap-2 border py-1 px-4 rounded border-zinc-600 hover:bg-slate-600 brightness-75 h-9 text-md">
                        <Link
                            href={"https://github.com/Ronald785"}
                            target="_blank"
                            className="flex items-center gap-2"
                        >
                            <FiGithub size={15} />
                            GitHub
                        </Link>
                    </li>
                    <li
                        className="flex items-center gap-2 border py-1 px-4 rounded border-zinc-600 hover:bg-slate-600 brightness-75 cursor-pointer h-9 text-md"
                        onClick={() => setDark(!dark)}
                    >
                        {dark ? <FaSun size={15} /> : <FaMoon size={15} />}
                    </li>
                </ul>
            </nav>
        </header>
    );
}
