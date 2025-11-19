// src/index.ts
var VKYCErrorCode = /* @__PURE__ */ ((VKYCErrorCode2) => {
  VKYCErrorCode2["PERMISSION_DENIED"] = "PERMISSION_DENIED";
  VKYCErrorCode2["DEVICE_NOT_FOUND"] = "DEVICE_NOT_FOUND";
  VKYCErrorCode2["NOT_SUPPORTED"] = "NOT_SUPPORTED";
  VKYCErrorCode2["TIMEOUT"] = "TIMEOUT";
  VKYCErrorCode2["NETWORK_ERROR"] = "NETWORK_ERROR";
  VKYCErrorCode2["UNKNOWN_ERROR"] = "UNKNOWN_ERROR";
  return VKYCErrorCode2;
})(VKYCErrorCode || {});
var VKYCPermissionStatus = /* @__PURE__ */ ((VKYCPermissionStatus2) => {
  VKYCPermissionStatus2["ALLOWED"] = "ALLOWED";
  VKYCPermissionStatus2["NOT_ALLOWED"] = "NOT_ALLOWED";
  VKYCPermissionStatus2["BLOCKED"] = "BLOCKED";
  return VKYCPermissionStatus2;
})(VKYCPermissionStatus || {});
async function requestCameraAccess() {
  return requestMedia({ video: true, audio: false }, "camera");
}
async function requestMicrophoneAccess() {
  return requestMedia({ video: false, audio: true }, "microphone");
}
async function requestVideoAndMicAccess() {
  return requestMedia({ video: true, audio: true }, "camera-microphone");
}
async function requestLocationAccess() {
  if (!navigator.geolocation) {
    return {
      IS_PERMISSION_ALLOWED: "NOT_ALLOWED" /* NOT_ALLOWED */,
      LATITUDE: "",
      LONGITUDE: "",
      ERROR_MESSAGE: "Geolocation not supported in this browser",
      ERROR_CODE: "NOT_SUPPORTED" /* NOT_SUPPORTED */
    };
  }
  return new Promise(async (resolve) => {
    let isPermissionBlocked = false;
    if (navigator.permissions) {
      try {
        const permission = await navigator.permissions.query({ name: "geolocation" });
        if (permission.state === "denied") {
          isPermissionBlocked = true;
          resolve({
            IS_PERMISSION_ALLOWED: "BLOCKED" /* BLOCKED */,
            LATITUDE: "",
            LONGITUDE: "",
            ERROR_MESSAGE: "Location permission is permanently blocked",
            ERROR_CODE: "PERMISSION_DENIED" /* PERMISSION_DENIED */
          });
          return;
        }
      } catch (error) {
        console.warn("Permissions API not available:", error);
      }
    }
    const timeout = setTimeout(() => {
      resolve({
        IS_PERMISSION_ALLOWED: "NOT_ALLOWED" /* NOT_ALLOWED */,
        LATITUDE: "",
        LONGITUDE: "",
        ERROR_MESSAGE: "Location request timed out",
        ERROR_CODE: "TIMEOUT" /* TIMEOUT */
      });
    }, 15e3);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        clearTimeout(timeout);
        resolve({
          IS_PERMISSION_ALLOWED: "ALLOWED" /* ALLOWED */,
          LATITUDE: pos.coords.latitude.toFixed(6),
          LONGITUDE: pos.coords.longitude.toFixed(6)
        });
      },
      async (err) => {
        clearTimeout(timeout);
        let permissionStatus;
        let errorCode = "UNKNOWN_ERROR" /* UNKNOWN_ERROR */;
        let errorMessage = err.message || "Location access denied";
        if (err.code === 1) {
          errorCode = "PERMISSION_DENIED" /* PERMISSION_DENIED */;
          if (navigator.permissions) {
            try {
              const permission = await navigator.permissions.query({ name: "geolocation" });
              if (permission.state === "denied") {
                permissionStatus = "BLOCKED" /* BLOCKED */;
                errorMessage = "Location permission is permanently blocked";
              } else {
                permissionStatus = "NOT_ALLOWED" /* NOT_ALLOWED */;
                errorMessage = "Location permission was denied or dismissed";
              }
            } catch {
              permissionStatus = "NOT_ALLOWED" /* NOT_ALLOWED */;
            }
          } else {
            permissionStatus = "NOT_ALLOWED" /* NOT_ALLOWED */;
          }
        } else if (err.code === 2) {
          errorCode = "DEVICE_NOT_FOUND" /* DEVICE_NOT_FOUND */;
          permissionStatus = "NOT_ALLOWED" /* NOT_ALLOWED */;
        } else if (err.code === 3) {
          errorCode = "TIMEOUT" /* TIMEOUT */;
          permissionStatus = "NOT_ALLOWED" /* NOT_ALLOWED */;
        } else {
          permissionStatus = "NOT_ALLOWED" /* NOT_ALLOWED */;
        }
        resolve({
          IS_PERMISSION_ALLOWED: permissionStatus,
          LATITUDE: "",
          LONGITUDE: "",
          ERROR_MESSAGE: errorMessage,
          ERROR_CODE: errorCode
        });
      },
      { enableHighAccuracy: true, timeout: 15e3, maximumAge: 6e4 }
    );
  });
}
async function checkNetworkStatus(options = {}) {
  const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  const result = {
    IS_PERMISSION_ALLOWED: "ALLOWED" /* ALLOWED */,
    // Network check doesn't require permission
    IS_ONLINE: navigator.onLine,
    DOWNLINK_MBPS: connection?.downlink ?? void 0,
    CONNECTION_TYPE: connection?.effectiveType ?? void 0,
    RTT_MS: connection?.rtt ?? void 0
  };
  if (options.testDownloadSpeed) {
    const speed = await measureDownloadSpeed();
    result.DOWNLOAD_SPEED_MBPS = speed ?? void 0;
    if (!speed) {
      result.ERROR_MESSAGE = "Download speed test failed";
      result.ERROR_CODE = "NETWORK_ERROR" /* NETWORK_ERROR */;
    }
  }
  return result;
}
async function requestMedia(constraints, permissionType) {
  if (!navigator.mediaDevices?.getUserMedia) {
    return {
      IS_PERMISSION_ALLOWED: "NOT_ALLOWED" /* NOT_ALLOWED */,
      HAS_CAMERA: false,
      HAS_MICROPHONE: false,
      ERROR_MESSAGE: "getUserMedia not supported (use HTTPS)",
      ERROR_CODE: "NOT_SUPPORTED" /* NOT_SUPPORTED */
    };
  }
  let isPermissionBlocked = false;
  if (navigator.permissions) {
    try {
      if (permissionType === "camera") {
        const permission = await navigator.permissions.query({ name: "camera" });
        if (permission.state === "denied") {
          isPermissionBlocked = true;
        }
      } else if (permissionType === "microphone") {
        const permission = await navigator.permissions.query({ name: "microphone" });
        if (permission.state === "denied") {
          isPermissionBlocked = true;
        }
      } else if (permissionType === "camera-microphone") {
        const [cameraPerm, micPerm] = await Promise.all([
          navigator.permissions.query({ name: "camera" }),
          navigator.permissions.query({ name: "microphone" })
        ]);
        if (cameraPerm.state === "denied" || micPerm.state === "denied") {
          isPermissionBlocked = true;
        }
      }
      if (isPermissionBlocked) {
        return {
          IS_PERMISSION_ALLOWED: "BLOCKED" /* BLOCKED */,
          HAS_CAMERA: false,
          HAS_MICROPHONE: false,
          ERROR_MESSAGE: "Media permissions are permanently blocked",
          ERROR_CODE: "PERMISSION_DENIED" /* PERMISSION_DENIED */
        };
      }
    } catch (error) {
      console.warn("Permissions API not available:", error);
    }
  }
  try {
    const stream = await navigator.mediaDevices.getUserMedia(constraints);
    const videoTrack = stream.getVideoTracks()[0];
    const audioTrack = stream.getAudioTracks()[0];
    const settings = videoTrack?.getSettings();
    const result = {
      IS_PERMISSION_ALLOWED: "ALLOWED" /* ALLOWED */,
      HAS_CAMERA: !!videoTrack,
      HAS_MICROPHONE: !!audioTrack
    };
    if (videoTrack) {
      result.RESOLUTION_WIDTH = settings?.width;
      result.RESOLUTION_HEIGHT = settings?.height;
    }
    stream.getTracks().forEach((t) => t.stop());
    return result;
  } catch (err) {
    let permissionStatus;
    let errorCode = "UNKNOWN_ERROR" /* UNKNOWN_ERROR */;
    let errorMessage = err.message || "Media access failed";
    if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
      errorCode = "PERMISSION_DENIED" /* PERMISSION_DENIED */;
      if (navigator.permissions) {
        try {
          let isNowBlocked = false;
          if (permissionType === "camera") {
            const permission = await navigator.permissions.query({ name: "camera" });
            isNowBlocked = permission.state === "denied";
          } else if (permissionType === "microphone") {
            const permission = await navigator.permissions.query({ name: "microphone" });
            isNowBlocked = permission.state === "denied";
          } else if (permissionType === "camera-microphone") {
            const [cameraPerm, micPerm] = await Promise.all([
              navigator.permissions.query({ name: "camera" }),
              navigator.permissions.query({ name: "microphone" })
            ]);
            isNowBlocked = cameraPerm.state === "denied" || micPerm.state === "denied";
          }
          if (isNowBlocked) {
            permissionStatus = "BLOCKED" /* BLOCKED */;
            errorMessage = "Media permission is permanently blocked";
          } else {
            permissionStatus = "NOT_ALLOWED" /* NOT_ALLOWED */;
            errorMessage = "Permission prompt was dismissed";
          }
        } catch {
          permissionStatus = "NOT_ALLOWED" /* NOT_ALLOWED */;
          errorMessage = "Permission was denied";
        }
      } else {
        permissionStatus = "NOT_ALLOWED" /* NOT_ALLOWED */;
        errorMessage = "Permission was denied";
      }
    } else if (err.name === "NotFoundError") {
      errorCode = "DEVICE_NOT_FOUND" /* DEVICE_NOT_FOUND */;
      permissionStatus = "NOT_ALLOWED" /* NOT_ALLOWED */;
    } else {
      permissionStatus = "NOT_ALLOWED" /* NOT_ALLOWED */;
    }
    return {
      IS_PERMISSION_ALLOWED: permissionStatus,
      HAS_CAMERA: false,
      HAS_MICROPHONE: false,
      ERROR_MESSAGE: errorMessage,
      ERROR_CODE: errorCode
    };
  }
}
async function measureDownloadSpeed() {
  const testUrl = `https://speed.cloudflare.com/__down?bytes=${10 * 1024 * 1024}`;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 2e4);
  try {
    const start = performance.now();
    const res = await fetch(testUrl, { signal: controller.signal, cache: "no-store" });
    if (!res.ok || !res.body) throw new Error("No body");
    await res.body.pipeTo(new WritableStream());
    const duration = (performance.now() - start) / 1e3;
    clearTimeout(timeout);
    return Number((10 * 8 / duration).toFixed(2));
  } catch {
    clearTimeout(timeout);
    return null;
  }
}
async function verifyAllPermissions(testSpeed = false) {
  const [camera, mic, location, network] = await Promise.all([
    requestCameraAccess(),
    requestMicrophoneAccess(),
    requestLocationAccess(),
    checkNetworkStatus({ testDownloadSpeed: testSpeed })
  ]);
  return {
    camera,
    mic,
    location,
    network,
    videoAndMic: await requestVideoAndMicAccess(),
    IS_ALL_GRANTED: camera.IS_PERMISSION_ALLOWED === "ALLOWED" /* ALLOWED */ && mic.IS_PERMISSION_ALLOWED === "ALLOWED" /* ALLOWED */ && location.IS_PERMISSION_ALLOWED === "ALLOWED" /* ALLOWED */ && network.IS_ONLINE
  };
}
function getPermissionStatusDescription(status) {
  switch (status) {
    case "ALLOWED" /* ALLOWED */:
      return "Permission granted by user";
    case "NOT_ALLOWED" /* NOT_ALLOWED */:
      return "Permission not granted (user dismissed or cancelled the prompt)";
    case "BLOCKED" /* BLOCKED */:
      return "Permission permanently blocked by user";
    default:
      return "Unknown permission status";
  }
}
export {
  VKYCErrorCode,
  VKYCPermissionStatus,
  checkNetworkStatus,
  getPermissionStatusDescription,
  requestCameraAccess,
  requestLocationAccess,
  requestMicrophoneAccess,
  requestVideoAndMicAccess,
  verifyAllPermissions
};
//# sourceMappingURL=index.mjs.map