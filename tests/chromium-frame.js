let result;
try {
  const connection = new RTCPeerConnection({ iceServers: [] });
  connection.close();
  result = "created";
} catch (error) {
  result = error.name;
}
parent.postMessage({ probe: new URL(location.href).searchParams.get("key"), result }, "*");
