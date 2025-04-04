import { NextApiRequest, NextApiResponse } from "next";
import { OpenAI } from "openai";
import formidable, { IncomingForm, Fields, Files } from "formidable";
import fs from "fs";

export const config = {
    api: {
        bodyParser: false,
    },
};

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY!,
});

function parseForm(
    req: NextApiRequest
): Promise<{ fields: Fields; files: Files }> {
    return new Promise((resolve, reject) => {
        const form = new IncomingForm({
            keepExtensions: true,
            uploadDir: "./tmp",
        });

        form.parse(req, (err, fields, files) => {
            if (err) {
                reject(err);
                return;
            }
            resolve({ fields, files });
        });
    });
}

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method Not Allowed" });
    }

    try {
        const { files } = await parseForm(req);

        if (!files.file) {
            return res.status(400).json({ error: "No file uploaded" });
        }

        const file = Array.isArray(files.file)
            ? (files.file[0] as formidable.File)
            : (files.file as formidable.File);

        if (!file.filepath) {
            return res.status(500).json({ error: "Filepath is undefined" });
        }

        const transcription = await openai.audio.transcriptions.create({
            file: fs.createReadStream(file.filepath) as any,
            model: "whisper-1",
            response_format: "json",
            language: "pt",
        });

        res.status(200).json({ text: transcription.text });

        fs.unlinkSync(file.filepath);
    } catch (error: any) {
        console.error("Transcription error:", error);
        res.status(500).json({ error: "Failed to process the audio." });
    }
}
