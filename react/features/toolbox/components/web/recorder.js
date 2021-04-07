const status = document.getElementById('status');

let recorder;
let recordingData = [];
let recorderStream;

let recorderStartAndStopFlag = false; //true : start, false : stop And save
let startSuccessFlag = Boolean;

let moderatorFlag = Boolean; //중재자 여부

export function flag() {
    recorderStartAndStopFlag = !recorderStartAndStopFlag;

    let flag = recorderStartAndStopFlag;
    //recording 활성화 여부
    //console.log(★★ flag ★★);
    return flag;
}

/**
 * Mixes multiple audio tracks and the first video track it finds
 * 여러 오디오 트랙과 찾은 첫 번째 비디오 트랙을 혼합
 * */
function mixer(stream1, stream2) {
    const ctx = new AudioContext();
    const dest = ctx.createMediaStreamDestination();

    if(stream1.getAudioTracks().length > 0)
        ctx.createMediaStreamSource(stream1).connect(dest);

    if(stream2.getAudioTracks().length > 0)
        ctx.createMediaStreamSource(stream2).connect(dest);

    let tracks = dest.stream.getTracks();
    tracks = tracks.concat(stream1.getVideoTracks()).concat(stream2.getVideoTracks());

    return new MediaStream(tracks)
}

/**
 * Returns a filename based ono the Jitsi room name in the URL and timestamp
 * URL 및 타임 스탬프에서 Jitsi 룸 이름을 기준으로 파일 이름 반환
 * */
function getFilename(){
    const now = new Date();
    const timestamp = now.toISOString();
    const room = new RegExp(/(^.+)\s\|/).exec(document.title);
    if(room && room[1]!=="")
        return `${room[1]}_${timestamp}`;
    else
        return `recording_${timestamp}`;
}

/**
 * Start a new recording
 * 새로운 녹음을 시작
 * */
export async function start() {
    let gumStream, gdmStream;
    recordingData = [];

    try {
        gumStream = await navigator.mediaDevices.getUserMedia({video: false, audio: true});
        gdmStream = await navigator.mediaDevices.getDisplayMedia({video: {displaySurface: "browser"}, audio: true});
    } catch (e) {
        console.error("capture failure", e);
        recorderStartAndStopFlag = !recorderStartAndStopFlag;

        startSuccessFlag = false;
        return startSuccessFlag;
    } 

    recorderStream = gumStream ? mixer(gumStream, gdmStream) : gdmStream;
    recorder = new MediaRecorder(recorderStream, {mimeType: 'video/webm'});

    recorder.ondataavailable = e => {
        if (e.data && e.data.size > 0) {
            recordingData.push(e.data);
        }
    };

    recorder.onStop = () => {
        recorderStream.getTracks().forEach(track => track.stop());
        gumStream.getTracks().forEach(track => track.stop());
        gdmStream.getTracks().forEach(track => track.stop());

    };

    recorderStream.addEventListener('inactive', () => {
        console.log('Capture stream inactive');
        stop();
    });

    recorder.start();
    // ★★ recording start
    //console.log("started recording");

    startSuccessFlag = true;
    return startSuccessFlag;
};

/**
 * Stop recording
 * 녹화 중지
 * */
export function stop() {
    //console.log("Stopping recording");
    recorder.stop();
};

/**
 * Save the recording
 * 녹음 저장
 * */
export function save() {
    const blob = new Blob(recordingData, {type: 'video/webm'});
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = `${getFilename()}.webm`;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        //console.log(`${a.download} save option shown`);
    }, 100);
};

/**
 * Stop recording and Save the recording
 * 녹화 중지/저장
 */
export function stopAndSave() {  
    recorder.stop();
    // ★★ recording stop
    //console.log("Stopping recording");

    const blob = new Blob(recordingData, {type: 'video/webm'});
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = `${getFilename()}.webm`;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
       //★★ console.log(`${a.download} save option shown`);
    }, 100);
} 

export function recordingStartCss(){
        document.getElementById("recStatus").style.display = 'block';
}
export function recordingStopCss(){
    document.getElementById("recStatus").style.display = 'none';
}

export function moderatorFlagInsert(flag){
    moderatorFlag = flag;
}

export function moderatorFlagSelect(){
    let flag = moderatorFlag;

    return flag;
}