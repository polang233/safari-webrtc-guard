const results = window.probeResults = {};
const labels = {
  top: "Top-level page",
  prototype: "Constructor via prototype",
  synchronousBlank: "Fresh about:blank iframe · synchronous access",
  blank: "Loaded about:blank iframe",
  srcdoc: "Loaded srcdoc iframe",
  httpFrame: "Same-origin HTTP iframe",
  crossOrigin: "Cross-origin HTTP iframe",
  ice: "ICE candidate gathering · no STUN",
  capture: "MediaStream API",
};
const edge = navigator.userAgent.match(/Edg\/([\d.]+)/);
const chrome = navigator.userAgent.match(/(?:HeadlessChrome|Chrome)\/([\d.]+)/);
const parameters = new URL(location.href).searchParams;
document.querySelector("#browser").textContent = `${parameters.get("browser") || (edge ? "Microsoft Edge" : "Chrome / Chromium")} ${parameters.get("version") || (edge || chrome)?.[1] || ""} · ${new Date().toISOString().slice(0, 10)}`;

function record(key, result) {
  results[key] = result;
  document.querySelector("#results").replaceChildren(...Object.keys(labels).filter(key => key in results).map(key => {
    const row = document.createElement("tr");
    const label = document.createElement("td");
    label.textContent = labels[key];
    const value = document.createElement("td");
    value.textContent = results[key];
    if (results[key] === "SecurityError") value.className = "blocked";
    row.append(label, value);
    return row;
  }));
  if (Object.keys(results).length === Object.keys(labels).length) {
    document.querySelector("#headline").textContent = results.top === "SecurityError" ? "WebRTC connection creation blocked" : "WebRTC connection creation available";
    document.querySelector("#note").textContent = results.synchronousBlank === "created" && results.top === "SecurityError"
      ? "Boundary observed: a freshly created iframe can expose its native constructor before the extension is injected."
      : "Disabling the extension and reloading restores the native WebRTC constructor.";
    window.probeDone = true;
  }
}
function check(realm, prototype = false) {
  try {
    const Constructor = prototype ? realm.RTCPeerConnection.prototype.constructor : realm.RTCPeerConnection;
    const connection = new Constructor({ iceServers: [] });
    connection.close();
    return "created";
  } catch (error) { return error.name; }
}
record("top", check(window));
record("prototype", check(window, true));
record("capture", typeof MediaStream);
addEventListener("message", event => {
  if (["httpFrame", "crossOrigin", "srcdoc"].includes(event.data?.probe)) record(event.data.probe, event.data.result);
});
const blank = document.createElement("iframe");
blank.addEventListener("load", () => record("blank", check(blank.contentWindow)));
document.body.append(blank);
record("synchronousBlank", check(blank.contentWindow));
const srcdoc = document.createElement("iframe");
srcdoc.srcdoc = '<script>let result;try{const p=new RTCPeerConnection({iceServers:[]});p.close();result="created"}catch(e){result=e.name}parent.postMessage({probe:"srcdoc",result},"*");<\/script>';
document.body.append(srcdoc);
for (const key of ["httpFrame", "crossOrigin"]) {
  const frame = document.createElement("iframe");
  const url = new URL(`chromium-frame.html?key=${key}`, location.href);
  if (key === "crossOrigin") url.hostname = "localhost";
  frame.src = url;
  document.body.append(frame);
}
try {
  const connection = new RTCPeerConnection({ iceServers: [] });
  let candidates = 0;
  const timer = setTimeout(() => { record("ice", "timed out"); connection.close(); }, 5000);
  connection.onicecandidate = event => {
    if (event.candidate) candidates++;
    else { clearTimeout(timer); record("ice", `completed · ${candidates} candidate(s)`); connection.close(); }
  };
  connection.createDataChannel("probe");
  connection.createOffer().then(offer => connection.setLocalDescription(offer)).catch(error => {
    clearTimeout(timer); record("ice", error.name); connection.close();
  });
} catch (error) { record("ice", error.name); }
