import { useState, useRef } from "react";
const AudioRecorder = ({ onAudioRecordingComplete }) => {
    const [permission, setPermission] = useState(false);
    const mediaRecorder = useRef(null);
    const [recordingStatus, setRecordingStatus] = useState("inactive");
    const [stream, setStream] = useState(null);
    const [audioChunks, setAudioChunks] = useState([]);
    const [audio, setAudio] = useState(null);
    const [base64Display, setBase64Display] = useState(null);

    const mimeType = "audio/webm";

    const getMicrophonePermission = async () => {
        if ("MediaRecorder" in window) {
            try {
                const streamData = await navigator.mediaDevices.getUserMedia({
                    audio: true,
                    video: false,
                });
                setPermission(true);
                setStream(streamData);
            } catch (err) {
                alert(err.message);
            }
        } else {
            alert("The MediaRecorder API is not supported in your browser.");
        }
    };

    const startRecording = async () => {
        setRecordingStatus("recording");
        //create new Media recorder instance using the stream
        const media = new MediaRecorder(stream, { type: mimeType });
        //set the MediaRecorder instance to the mediaRecorder ref
        mediaRecorder.current = media;
        //invokes the start method to start the recording process
        mediaRecorder.current.start();
        let localAudioChunks = [];
        mediaRecorder.current.ondataavailable = (event) => {
            if (typeof event.data === "undefined") return;
            if (event.data.size === 0) return;
            localAudioChunks.push(event.data);
        };
        setAudioChunks(localAudioChunks);
    };

    const stopRecording = () => {
        setRecordingStatus("inactive");
        //stops the recording instance
        mediaRecorder.current.stop();
        mediaRecorder.current.onstop = () => {
            //creates a blob file from the audiochunks data
            const audioBlob = new Blob(audioChunks, { type: mimeType });
            // console.log(audioBlob);
            //creates a playable URL from the blob file.
            const audioUrl = URL.createObjectURL(audioBlob);
            setAudio(audioUrl);
            setAudioChunks([]);
            
            // Create a FileReader to read the blob data
            const reader = new FileReader();
            reader.readAsDataURL(audioBlob);

            // When the FileReader has finished, set the Base64 data and log it
            reader.onloadend = () => {
                const audioBase64 = reader.result;
                setAudio(audioBase64);
                setBase64Display(audioBase64);
                setAudioChunks([]);

                // Call the callback function in the parent component
                onAudioRecordingComplete(audioBase64);
            };
        };
    };


    return (
        <div>
            <h2>Audio Recorder: </h2>
            <main>
                <div className="audio-controls">
                    {!permission ? (
                        <button className="bg-green-300 w-1/2 py-2 rounded-lg text-green-900" onClick={getMicrophonePermission} type="button">
                            Get Microphone
                        </button>
                    ) : null}
                    {permission && recordingStatus === "inactive" ? (
                        <button  className="bg-blue-300 w-1/2 py-2 rounded-lg text-blue-900" onClick={startRecording} type="button">
                            Start Recording
                        </button>
                    ) : null}
                    {recordingStatus === "recording" ? (
                        <button className="bg-red-300 w-1/2 py-2 rounded-lg text-red-900" onClick={stopRecording} type="button">
                            Stop Recording
                        </button>
                    ) : null}
                </div>
                {audio ? (
                    <div className="audio-container">
                        <audio src={audio} controls></audio>
                        <a download href={audio}>
                            Download Recording
                        </a>
                    </div>
                ) : null}
            </main>
        </div>
    );
};
export default AudioRecorder;