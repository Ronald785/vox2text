export default function FooterSection() {
    return (
        <footer className="text-gray-400 text-sm py-6">
            <div className="container mx-auto px-4 text-center">
                <p>
                    &copy; 2025{" "}
                    <span className="text-white font-semibold">InshortAI</span>.
                    Todos os direitos reservados.
                </p>
                <p className="mt-1">
                    Feito com ❤️ por{" "}
                    <a
                        href="https://github.com/Ronald785"
                        className="text-blue-400 hover:underline"
                    >
                        Ronald Almeida
                    </a>
                </p>
            </div>
        </footer>
    );
}
