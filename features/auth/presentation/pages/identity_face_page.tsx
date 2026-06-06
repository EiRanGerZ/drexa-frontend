"use client"

import { useEffect, useRef, useState } from "react"
import { ArrowLeft, VideoOff } from "lucide-react"
import { useRouter } from "next/navigation"

type ScanState = "idle" | "analyzing" | "done"

export function IdentityFacePage() {
    const router = useRouter()
    const videoRef = useRef<HTMLVideoElement>(null)
    const streamRef = useRef<MediaStream | null>(null)
    const [scanState, setScanState] = useState<ScanState>("idle")
    const [cameraError, setCameraError] = useState(false)

    useEffect(() => {
        navigator.mediaDevices
            .getUserMedia({ video: { facingMode: "user" } })
            .then((stream) => {
                streamRef.current = stream
                if (videoRef.current) videoRef.current.srcObject = stream
            })
            .catch(() => setCameraError(true))

        return () => {
            streamRef.current?.getTracks().forEach((t) => t.stop())
        }
    }, [])

    const stopCamera = () => {
        streamRef.current?.getTracks().forEach((t) => t.stop())
        streamRef.current = null
    }

    const onCapture = () => {
        if (scanState !== "idle") return

        // Draw current video frame to canvas and save as JPEG
        const video = videoRef.current
        if (video) {
            const canvas = document.createElement("canvas")
            canvas.width = video.videoWidth
            canvas.height = video.videoHeight
            canvas.getContext("2d")?.drawImage(video, 0, 0)
            localStorage.setItem("kyc_face", canvas.toDataURL("image/jpeg", 0.8))
        }

        setScanState("analyzing")

        // Mock: simulate face analysis delay then navigate
        setTimeout(() => {
            stopCamera()
            setScanState("done")
            router.push("/register/pin")
        }, 2500)
    }

    const buttonLabel = {
        idle: "Capture Photo",
        analyzing: "Analyzing your face…",
        done: "Redirecting…",
    }[scanState]

    return (
        <div>
            <main className="bg-background min-h-screen flex flex-col items-center justify-center overflow-hidden relative">

                <div className="absolute w-[10000px] h-[400px] bg-[#3B82F6] opacity-10 blur-[120px] rounded-full top-[-300px] z-0"></div>
                <div className="absolute w-[10000px] h-[400px] bg-[#3B82F6] opacity-10 blur-[120px] rounded-full bottom-[-300px] z-0"></div>

                <div className="w-full max-w-sm p-[1px] rounded-[30px] bg-gradient-to-b from-gray-700 from-[10%] via-slate-800 via-[45%] to-slate-700 to-[100%]">
                    <form
                        onSubmit={(e) => e.preventDefault()}
                        className="bg-linear-to-b from-[#15182B] to-[#1C2140] flex flex-col p-6 rounded-[30px] shadow-2xl"
                    >
                        <div className="flex gap-4">
                            <ArrowLeft
                                size={40}
                                color="white"
                                className="opacity-100 hover:opacity-90 transition-all duration-300 cursor-pointer"
                                onClick={() => { stopCamera(); router.back() }}
                            />
                            <h1 className="text-3xl text-white font-sans font-bold">Verify Your Identity</h1>
                        </div>

                        <p className="text-center text-gray-500 font-bold text-sm my-6">
                            Please position your face within the frame to verify your identity
                        </p>

                        {/* Camera frame */}
                        <div className="w-full h-64 rounded-lg bg-background border-2 border-dashed border-gray-500 overflow-hidden flex items-center justify-center relative">
                            {cameraError ? (
                                <div className="flex flex-col items-center gap-2 text-gray-500">
                                    <VideoOff size={36} />
                                    <p className="text-sm font-semibold">Camera not available</p>
                                </div>
                            ) : (
                                <video
                                    ref={videoRef}
                                    autoPlay
                                    muted
                                    playsInline
                                    className="w-full h-full object-cover"
                                />
                            )}

                            {/* Oval face guide overlay */}
                            {!cameraError && (
                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                    <div className="w-32 h-44 rounded-full border-2 border-white/60 border-dashed" />
                                </div>
                            )}

                            {/* Analyzing overlay */}
                            {scanState === "analyzing" && (
                                <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center gap-3">
                                    <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    <p className="text-white font-semibold text-sm">Analyzing your face…</p>
                                </div>
                            )}
                        </div>

                        <p className="text-center text-gray-500 font-bold text-sm my-6">
                            Ensure your face is clearly visible and well-lit for accurate verification
                        </p>

                        <button
                            type="button"
                            onClick={onCapture}
                            disabled={scanState !== "idle" || cameraError}
                            className="bg-gradient-to-r from-[#00FFA3] to-[#3B82F6] opacity-100 hover:opacity-90 transition-all duration-300 cursor-pointer py-4 px-8 rounded-lg text-white font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {buttonLabel}
                        </button>
                    </form>
                </div>
            </main>
        </div>
    )
}
