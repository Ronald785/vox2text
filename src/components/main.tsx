"use client";
import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { getFFmpeg } from "@/lib/ffmpeg";
import { fetchFile } from "@ffmpeg/util";
import axios from "axios";

type Status = "optimize" | "waiting" | "optimizing" | "generating" | "success";

export default function Main() {
    const [file, setFile] = useState<File | null>(null);
    const [fileType, setFileType] = useState<"video" | "audio" | null>(null);
    const [status, setStatus] = useState<Status>("optimize");
    const [previewURL, setPreviewURL] = useState<string | null>(null);
    const [progress, setProgress] = useState(0);
    const [audioTranscription, setAudioTranscription] = useState("");

    function handleFile(event: ChangeEvent<HTMLInputElement>) {
        const { files } = event.currentTarget;

        if (!files || files.length === 0) return;

        const selectedFile = files[0];
        setFile(selectedFile);

        setStatus("optimize");

        if (selectedFile.type.startsWith("video")) {
            setFileType("video");
        } else if (selectedFile.type.startsWith("audio")) {
            setFileType("audio");
        } else {
            setFileType(null);
        }
    }

    async function optimizeAudio(file: File, type: "video" | "audio") {
        const ffmpeg = await getFFmpeg();

        const inputFileName = type === "video" ? "input.mp4" : "input.mp3";
        const outputFileName = "audio.mp3";

        await ffmpeg.writeFile(inputFileName, await fetchFile(file));

        ffmpeg.on("progress", (progress) => {
            if (
                typeof progress.progress !== "number" ||
                isNaN(progress.progress)
            )
                return;

            let percentage = parseFloat((progress.progress * 100).toFixed(2));
            if (percentage > 100) percentage = 100;
            setProgress(percentage);
            console.log("Convert progress: " + percentage + "%");
        });

        const args =
            type === "video"
                ? [
                      "-i",
                      inputFileName,
                      "-map",
                      "0:a",
                      "-b:a",
                      "16k",
                      "-ar",
                      "16000",
                      "-ac",
                      "1",
                      "-acodec",
                      "libmp3lame",
                      outputFileName,
                  ]
                : [
                      "-i",
                      inputFileName,
                      "-b:a",
                      "16k",
                      "-ar",
                      "16000",
                      "-ac",
                      "1",
                      "-acodec",
                      "libmp3lame",
                      outputFileName,
                  ];

        await ffmpeg.exec(args);

        const data = await ffmpeg.readFile(outputFileName);
        const audioFileBlob = new Blob([data], { type: "audio/mpeg" });

        return new File([audioFileBlob], "audio.mp3", {
            type: "audio/mpeg",
        });
    }

    async function handleUploadVideo(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        if (!file || !fileType) return;

        setStatus("optimizing");
        setProgress(0);
        setStatus("optimizing");
        console.log("Iniciando conversão...");
        setAudioTranscription("");

        const audioFile = await optimizeAudio(file, fileType);

        setProgress(100);
        console.log("Conversão finalizada!");

        // Atualiza o preview com o novo áudio
        setFile(audioFile);
        setFileType("audio");
        setStatus("generating");
        const transcription = await requestTranscription(audioFile);

        console.log("transcription: ", transcription);

        if (transcription) {
            setAudioTranscription(transcription);

            setStatus("success");
        } else {
            setStatus("waiting");
        }
    }

    async function requestTranscription(file: File) {
        const formData = new FormData();
        formData.append("file", file);

        try {
            const response = await axios.post("/api/transcription", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });

            return response.data.text;
        } catch (error: any) {
            console.error(
                "Erro na transcrição:",
                error.response?.data || error.message
            );
            return null;
        }
    }

    useEffect(() => {
        if (!file) return;

        const url = URL.createObjectURL(file);
        setPreviewURL(url);

        return () => {
            URL.revokeObjectURL(url);
        };
    }, [file]);

    return (
        <main className="max-w-7xl m-auto flex flex-auto gap-4 p-4">
            <section className="flex flex-1 flex-col gap-4">
                <textarea
                    name="transcription"
                    id="transcription"
                    className="resize-none border border-zinc-700 rounded flex-1 min-h-64 p-4"
                    placeholder="Transcrição do áudio..."
                    value={audioTranscription}
                    onChange={(e) => {
                        setAudioTranscription(e.target.value);
                    }}
                ></textarea>
                <textarea
                    name="resume"
                    id="resume"
                    className="resize-none border border-zinc-700 rounded flex-1 min-h-64 p-4"
                    placeholder="Resumo criado pela IA..."
                ></textarea>
            </section>
            <aside className="w-40 sm:w-80">
                <form action="" onSubmit={handleUploadVideo}>
                    <label
                        htmlFor="file"
                        className={`h-40 border border-zinc-700 rounded flex justify-center items-center text-center cursor-pointer hover:bg-slate-600 brightness-75 ${
                            !previewURL
                                ? "border-dashed p-4"
                                : fileType === "audio"
                                ? "p-4"
                                : ""
                        }`}
                    >
                        {previewURL ? (
                            fileType === "video" ? (
                                <video
                                    src={previewURL}
                                    controls={false}
                                    className="pointer-events-none w-full h-full object-cover rounded"
                                />
                            ) : fileType === "audio" ? (
                                <audio
                                    src={previewURL}
                                    controls
                                    className="w-full"
                                />
                            ) : null
                        ) : (
                            "Selecione um vídeo ou um áudio"
                        )}
                    </label>
                    <input
                        type="file"
                        name="file"
                        id="file"
                        className="hidden"
                        accept=".mp4, .mp3"
                        onChange={handleFile}
                    />
                    <hr className="mt-6 text-zinc-700" />
                    <button
                        type="submit"
                        disabled={status !== "optimize"}
                        className="relative mt-4 w-full p-2 rounded border overflow-hidden disabled:opacity-50 cursor-pointer group"
                    >
                        <div
                            className="absolute inset-0 bg-green-600 transition-all duration-200"
                            style={{
                                width: `${
                                    status === "optimizing" ? progress : 0
                                }%`,
                            }}
                        ></div>
                        <span className="relative z-10 text-white">
                            {status === "optimize" && <p>Otimizar</p>}
                            {status === "optimizing" && (
                                <p>Otimizando - {progress}%</p>
                            )}
                            {status === "waiting" && <p>Transcrever</p>}
                            {status === "generating" && <p>Transcrevendo...</p>}
                            {status === "success" && <p>Finalizado!</p>}
                        </span>
                    </button>
                </form>
            </aside>
        </main>
    );
}
