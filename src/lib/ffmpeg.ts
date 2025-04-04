import { FFmpeg } from "@ffmpeg/ffmpeg";
import { toBlobURL } from "@ffmpeg/util";

let ffmpegInstance: FFmpeg | null = null;

export async function getFFmpeg() {
    if (!ffmpegInstance) {
        ffmpegInstance = new FFmpeg();
        await ffmpegInstance.load({
            coreURL: await toBlobURL(
                "/ffmpeg/ffmpeg-core.js",
                "text/javascript"
            ),
            wasmURL: await toBlobURL(
                "/ffmpeg/ffmpeg-core.wasm",
                "application/wasm"
            ),
        });
    }

    return ffmpegInstance;
}
