// export enum VKYCErrorCode {
//   PERMISSION_DENIED = "PERMISSION_DENIED",
//   DEVICE_NOT_FOUND = "DEVICE_NOT_FOUND",
//   NOT_SUPPORTED = "NOT_SUPPORTED",
//   TIMEOUT = "TIMEOUT",
//   NETWORK_ERROR = "NETWORK_ERROR",
//   UNKNOWN_ERROR = "UNKNOWN_ERROR",
// }

// export enum VKYCPermissionStatus {
//   ALLOWED = "ALLOWED",
//   NOT_ALLOWED = "NOT_ALLOWED",
//   BLOCKED = "BLOCKED"
// }

// export interface BaseVKYCResult {
//   IS_PERMISSION_ALLOWED: VKYCPermissionStatus;
//   ERROR_MESSAGE?: string;
//   ERROR_CODE?: VKYCErrorCode;
// }

// // Camera + Video + Resolution
// export interface VKYCCameraResult extends BaseVKYCResult {
//   HAS_CAMERA: boolean;
//   RESOLUTION_WIDTH?: number;
//   RESOLUTION_HEIGHT?: number;
// }

// // Microphone
// export interface VKYCMicResult extends BaseVKYCResult {
//   HAS_MICROPHONE: boolean;
// }

// // Geolocation
// export interface VKYCLocationResult extends BaseVKYCResult {
//   LATITUDE: string;
//   LONGITUDE: string;
// }

// // Network + Speed
// export interface VKYCNetworkResult extends BaseVKYCResult {
//   IS_ONLINE: boolean;
//   DOWNLINK_MBPS?: number;          
//   CONNECTION_TYPE?: string;
//   RTT_MS?: number;
//   DOWNLOAD_SPEED_MBPS?: number;    
// }

// export async function requestCameraAccess(): Promise<VKYCCameraResult> {
//   return requestMedia({ video: true, audio: false });
// }

// export async function requestMicrophoneAccess(): Promise<VKYCMicResult> {
//   return requestMedia({ video: false, audio: true });
// }

// export async function requestVideoAndMicAccess(): Promise<VKYCCameraResult & VKYCMicResult> {
//   return requestMedia({ video: true, audio: true });
// }

// export async function requestLocationAccess(): Promise<VKYCLocationResult> {
//   if (!navigator.geolocation) {
//     return {
//       IS_PERMISSION_ALLOWED: false,
//       LATITUDE: "",
//       LONGITUDE: "",
//       ERROR_MESSAGE: "Geolocation not supported in this browser",
//       ERROR_CODE: VKYCErrorCode.NOT_SUPPORTED,
//     };
//   }

//   return new Promise((resolve) => {
//     const timeout = setTimeout(() => {
//       resolve({
//         IS_PERMISSION_ALLOWED: false,
//         LATITUDE: "",
//         LONGITUDE: "",
//         ERROR_MESSAGE: "Location request timed out",
//         ERROR_CODE: VKYCErrorCode.TIMEOUT,
//       });
//     }, 15000);

//     navigator.geolocation.getCurrentPosition(
//       (pos) => {
//         clearTimeout(timeout);
//         resolve({
//           IS_PERMISSION_ALLOWED: true,
//           LATITUDE: pos.coords.latitude.toFixed(6),
//           LONGITUDE: pos.coords.longitude.toFixed(6),
//         });
//       },
//       (err) => {
//         clearTimeout(timeout);
//         let code = VKYCErrorCode.UNKNOWN_ERROR;
//         if (err.code === 1) code = VKYCErrorCode.PERMISSION_DENIED;
//         if (err.code === 2) code = VKYCErrorCode.DEVICE_NOT_FOUND;
//         if (err.code === 3) code = VKYCErrorCode.TIMEOUT;

//         resolve({
//           IS_PERMISSION_ALLOWED: false,
//           LATITUDE: "",
//           LONGITUDE: "",
//           ERROR_MESSAGE: err.message || "Location access denied",
//           ERROR_CODE: code,
//         });
//       },
//       { enableHighAccuracy: true, timeout: 15000, maximumAge: 60000 }
//     );
//   });
// }

// export async function checkNetworkStatus(options: { testDownloadSpeed?: boolean } = {}): Promise<VKYCNetworkResult> {
//   const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;

//   const result: VKYCNetworkResult = {
//     IS_PERMISSION_ALLOWED: true,
//     IS_ONLINE: navigator.onLine,
//     DOWNLINK_MBPS: connection?.downlink ?? undefined,
//     CONNECTION_TYPE: connection?.effectiveType ?? undefined,
//     RTT_MS: connection?.rtt ?? undefined,
//   };

//   if (options.testDownloadSpeed) {
//     const speed = await measureDownloadSpeed();
//     result.DOWNLOAD_SPEED_MBPS = speed ?? undefined;
//     if (!speed) {
//       result.ERROR_MESSAGE = "Download speed test failed";
//     }
//   }

//   return result;
// }


// async function requestMedia(constraints: MediaStreamConstraints): Promise<any> {
//   if (!navigator.mediaDevices?.getUserMedia) {
//     return {
//       IS_PERMISSION_ALLOWED: false,
//       HAS_CAMERA: false,
//       HAS_MICROPHONE: false,
//       ERROR_MESSAGE: "getUserMedia not supported (use HTTPS)",
//       ERROR_CODE: VKYCErrorCode.NOT_SUPPORTED,
//     };
//   }

//   try {
//     const stream = await navigator.mediaDevices.getUserMedia(constraints);
//     const videoTrack = stream.getVideoTracks()[0];
//     const audioTrack = stream.getAudioTracks()[0];
//     const settings = videoTrack?.getSettings();

//     const result: any = {
//       IS_PERMISSION_ALLOWED: true,
//       HAS_CAMERA: !!videoTrack,
//       HAS_MICROPHONE: !!audioTrack,
//     };

//     if (videoTrack) {
//       result.RESOLUTION_WIDTH = settings?.width;
//       result.RESOLUTION_HEIGHT = settings?.height;
//     }

//     // Stop tracks immediately (we only needed permission + info)
//     stream.getTracks().forEach((t) => t.stop());

//     return result;
//   } catch (err: any) {
//     let code = VKYCErrorCode.UNKNOWN_ERROR;
//     if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
//       code = VKYCErrorCode.PERMISSION_DENIED;
//     } else if (err.name === "NotFoundError") {
//       code = VKYCErrorCode.DEVICE_NOT_FOUND;
//     }

//     return {
//       IS_PERMISSION_ALLOWED: false,
//       HAS_CAMERA: false,
//       HAS_MICROPHONE: false,
//       ERROR_MESSAGE: err.message || "Media access failed",
//       ERROR_CODE: code,
//     };
//   }
// }

// async function measureDownloadSpeed(): Promise<number | null> {
//   const testUrl = `https://speed.cloudflare.com/__down?bytes=${10 * 1024 * 1024}`; // 10 MB
//   const controller = new AbortController();
//   const timeout = setTimeout(() => controller.abort(), 20000);

//   try {
//     const start = performance.now();
//     const res = await fetch(testUrl, { signal: controller.signal, cache: "no-store" });
//     if (!res.ok || !res.body) throw new Error("No body");

//     await res.body.pipeTo(new WritableStream()); 
//     const duration = (performance.now() - start) / 1000;
//     clearTimeout(timeout);
//     return Number(((10 * 8) / duration).toFixed(2)); 
//   } catch {
//     clearTimeout(timeout);
//     return null;
//   }
// }


// export async function verifyAllPermissions(testSpeed = false) {
//   const [camera, mic, location, network] = await Promise.all([
//     requestCameraAccess(),
//     requestMicrophoneAccess(),
//     requestLocationAccess(),
//     checkNetworkStatus({ testDownloadSpeed: testSpeed }),
//   ]);

//   return {
//     camera,
//     mic,
//     location,
//     network,
//     videoAndMic: await requestVideoAndMicAccess(), // optional combined
//     IS_ALL_GRANTED:
//       camera.IS_PERMISSION_ALLOWED &&
//       mic.IS_PERMISSION_ALLOWED &&
//       location.IS_PERMISSION_ALLOWED &&
//       network.IS_ONLINE,
//   };
// }

export enum VKYCErrorCode {
  PERMISSION_DENIED = "PERMISSION_DENIED",
  DEVICE_NOT_FOUND = "DEVICE_NOT_FOUND",
  NOT_SUPPORTED = "NOT_SUPPORTED",
  TIMEOUT = "TIMEOUT",
  NETWORK_ERROR = "NETWORK_ERROR",
  UNKNOWN_ERROR = "UNKNOWN_ERROR",
}

export enum VKYCPermissionStatus {
  ALLOWED = "ALLOWED",
  NOT_ALLOWED = "NOT_ALLOWED",  // User dismissed/cancelled the prompt
  BLOCKED = "BLOCKED"           // User explicitly blocked the permission
}

export interface BaseVKYCResult {
  IS_PERMISSION_ALLOWED: VKYCPermissionStatus;
  ERROR_MESSAGE?: string;
  ERROR_CODE?: VKYCErrorCode;
}

// Camera + Video + Resolution
export interface VKYCCameraResult extends BaseVKYCResult {
  HAS_CAMERA: boolean;
  RESOLUTION_WIDTH?: number;
  RESOLUTION_HEIGHT?: number;
}

// Microphone
export interface VKYCMicResult extends BaseVKYCResult {
  HAS_MICROPHONE: boolean;
}

// Geolocation
export interface VKYCLocationResult extends BaseVKYCResult {
  LATITUDE: string;
  LONGITUDE: string;
}

// Network + Speed
export interface VKYCNetworkResult extends BaseVKYCResult {
  IS_ONLINE: boolean;
  DOWNLINK_MBPS?: number;          
  CONNECTION_TYPE?: string;
  RTT_MS?: number;
  DOWNLOAD_SPEED_MBPS?: number;    
}

export async function requestCameraAccess(): Promise<VKYCCameraResult> {
  return requestMedia({ video: true, audio: false }, 'camera');
}

export async function requestMicrophoneAccess(): Promise<VKYCMicResult> {
  return requestMedia({ video: false, audio: true }, 'microphone');
}

export async function requestVideoAndMicAccess(): Promise<VKYCCameraResult & VKYCMicResult> {
  return requestMedia({ video: true, audio: true }, 'camera-microphone');
}

export async function requestLocationAccess(): Promise<VKYCLocationResult> {
  if (!navigator.geolocation) {
    return {
      IS_PERMISSION_ALLOWED: VKYCPermissionStatus.NOT_ALLOWED,
      LATITUDE: "",
      LONGITUDE: "",
      ERROR_MESSAGE: "Geolocation not supported in this browser",
      ERROR_CODE: VKYCErrorCode.NOT_SUPPORTED,
    };
  }

  return new Promise(async (resolve) => {
    // Check permission state first using Permissions API if available
    let isPermissionBlocked = false;
    
    if (navigator.permissions) {
      try {
        const permission = await navigator.permissions.query({ name: 'geolocation' as PermissionName });
        if (permission.state === 'denied') {
          isPermissionBlocked = true;
          resolve({
            IS_PERMISSION_ALLOWED: VKYCPermissionStatus.BLOCKED,
            LATITUDE: "",
            LONGITUDE: "",
            ERROR_MESSAGE: "Location permission is permanently blocked",
            ERROR_CODE: VKYCErrorCode.PERMISSION_DENIED,
          });
          return;
        }
      } catch (error) {
        // Permissions API failed, continue with regular flow
        console.warn('Permissions API not available:', error);
      }
    }

    const timeout = setTimeout(() => {
      resolve({
        IS_PERMISSION_ALLOWED: VKYCPermissionStatus.NOT_ALLOWED,
        LATITUDE: "",
        LONGITUDE: "",
        ERROR_MESSAGE: "Location request timed out",
        ERROR_CODE: VKYCErrorCode.TIMEOUT,
      });
    }, 15000);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        clearTimeout(timeout);
        resolve({
          IS_PERMISSION_ALLOWED: VKYCPermissionStatus.ALLOWED,
          LATITUDE: pos.coords.latitude.toFixed(6),
          LONGITUDE: pos.coords.longitude.toFixed(6),
        });
      },
      async (err) => {
        clearTimeout(timeout);
        
        let permissionStatus: VKYCPermissionStatus;
        let errorCode = VKYCErrorCode.UNKNOWN_ERROR;
        let errorMessage = err.message || "Location access denied";

        if (err.code === 1) {
          errorCode = VKYCErrorCode.PERMISSION_DENIED;
          
          // Check if permission is blocked using Permissions API
          if (navigator.permissions) {
            try {
              const permission = await navigator.permissions.query({ name: 'geolocation' as PermissionName });
              if (permission.state === 'denied') {
                permissionStatus = VKYCPermissionStatus.BLOCKED;
                errorMessage = "Location permission is permanently blocked";
              } else {
                permissionStatus = VKYCPermissionStatus.NOT_ALLOWED;
                errorMessage = "Location permission was denied or dismissed";
              }
            } catch {
              // If Permissions API fails, we can't determine if it's blocked
              permissionStatus = VKYCPermissionStatus.NOT_ALLOWED;
            }
          } else {
            // No Permissions API, we can't distinguish between blocked and dismissed
            permissionStatus = VKYCPermissionStatus.NOT_ALLOWED;
          }
        } else if (err.code === 2) {
          errorCode = VKYCErrorCode.DEVICE_NOT_FOUND;
          permissionStatus = VKYCPermissionStatus.NOT_ALLOWED;
        } else if (err.code === 3) {
          errorCode = VKYCErrorCode.TIMEOUT;
          permissionStatus = VKYCPermissionStatus.NOT_ALLOWED;
        } else {
          permissionStatus = VKYCPermissionStatus.NOT_ALLOWED;
        }

        resolve({
          IS_PERMISSION_ALLOWED: permissionStatus!,
          LATITUDE: "",
          LONGITUDE: "",
          ERROR_MESSAGE: errorMessage,
          ERROR_CODE: errorCode,
        });
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 60000 }
    );
  });
}

export async function checkNetworkStatus(options: { testDownloadSpeed?: boolean } = {}): Promise<VKYCNetworkResult> {
  const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;

  const result: VKYCNetworkResult = {
    IS_PERMISSION_ALLOWED: VKYCPermissionStatus.ALLOWED, // Network check doesn't require permission
    IS_ONLINE: navigator.onLine,
    DOWNLINK_MBPS: connection?.downlink ?? undefined,
    CONNECTION_TYPE: connection?.effectiveType ?? undefined,
    RTT_MS: connection?.rtt ?? undefined,
  };

  if (options.testDownloadSpeed) {
    const speed = await measureDownloadSpeed();
    result.DOWNLOAD_SPEED_MBPS = speed ?? undefined;
    if (!speed) {
      result.ERROR_MESSAGE = "Download speed test failed";
      result.ERROR_CODE = VKYCErrorCode.NETWORK_ERROR;
    }
  }

  return result;
}

async function requestMedia(
  constraints: MediaStreamConstraints, 
  permissionType: 'camera' | 'microphone' | 'camera-microphone'
): Promise<any> {
  if (!navigator.mediaDevices?.getUserMedia) {
    return {
      IS_PERMISSION_ALLOWED: VKYCPermissionStatus.NOT_ALLOWED,
      HAS_CAMERA: false,
      HAS_MICROPHONE: false,
      ERROR_MESSAGE: "getUserMedia not supported (use HTTPS)",
      ERROR_CODE: VKYCErrorCode.NOT_SUPPORTED,
    };
  }

  // Check current permission state first
  let isPermissionBlocked = false;
  
  if (navigator.permissions) {
    try {
      if (permissionType === 'camera') {
        const permission = await navigator.permissions.query({ name: 'camera' as PermissionName });
        if (permission.state === 'denied') {
          isPermissionBlocked = true;
        }
      } else if (permissionType === 'microphone') {
        const permission = await navigator.permissions.query({ name: 'microphone' as PermissionName });
        if (permission.state === 'denied') {
          isPermissionBlocked = true;
        }
      } else if (permissionType === 'camera-microphone') {
        const [cameraPerm, micPerm] = await Promise.all([
          navigator.permissions.query({ name: 'camera' as PermissionName }),
          navigator.permissions.query({ name: 'microphone' as PermissionName })
        ]);
        if (cameraPerm.state === 'denied' || micPerm.state === 'denied') {
          isPermissionBlocked = true;
        }
      }
      
      if (isPermissionBlocked) {
        return {
          IS_PERMISSION_ALLOWED: VKYCPermissionStatus.BLOCKED,
          HAS_CAMERA: false,
          HAS_MICROPHONE: false,
          ERROR_MESSAGE: "Media permissions are permanently blocked",
          ERROR_CODE: VKYCErrorCode.PERMISSION_DENIED,
        };
      }
    } catch (error) {
      // Permissions API not available or failed, continue with request
      console.warn('Permissions API not available:', error);
    }
  }

  try {
    const stream = await navigator.mediaDevices.getUserMedia(constraints);
    const videoTrack = stream.getVideoTracks()[0];
    const audioTrack = stream.getAudioTracks()[0];
    const settings = videoTrack?.getSettings();

    const result: any = {
      IS_PERMISSION_ALLOWED: VKYCPermissionStatus.ALLOWED,
      HAS_CAMERA: !!videoTrack,
      HAS_MICROPHONE: !!audioTrack,
    };

    if (videoTrack) {
      result.RESOLUTION_WIDTH = settings?.width;
      result.RESOLUTION_HEIGHT = settings?.height;
    }

    // Stop tracks immediately (we only needed permission + info)
    stream.getTracks().forEach((t) => t.stop());

    return result;
  } catch (err: any) {
    let permissionStatus: VKYCPermissionStatus;
    let errorCode = VKYCErrorCode.UNKNOWN_ERROR;
    let errorMessage = err.message || "Media access failed";

    if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
      errorCode = VKYCErrorCode.PERMISSION_DENIED;
      
      // Check current permission state to determine if it's blocked
      if (navigator.permissions) {
        try {
          let isNowBlocked = false;
          
          if (permissionType === 'camera') {
            const permission = await navigator.permissions.query({ name: 'camera' as PermissionName });
            isNowBlocked = permission.state === 'denied';
          } else if (permissionType === 'microphone') {
            const permission = await navigator.permissions.query({ name: 'microphone' as PermissionName });
            isNowBlocked = permission.state === 'denied';
          } else if (permissionType === 'camera-microphone') {
            const [cameraPerm, micPerm] = await Promise.all([
              navigator.permissions.query({ name: 'camera' as PermissionName }),
              navigator.permissions.query({ name: 'microphone' as PermissionName })
            ]);
            isNowBlocked = cameraPerm.state === 'denied' || micPerm.state === 'denied';
          }
          
          if (isNowBlocked) {
            permissionStatus = VKYCPermissionStatus.BLOCKED;
            errorMessage = "Media permission is permanently blocked";
          } else {
            permissionStatus = VKYCPermissionStatus.NOT_ALLOWED;
            errorMessage = "Permission prompt was dismissed";
          }
        } catch {
          // If Permissions API fails, we can't determine if it's blocked
          permissionStatus = VKYCPermissionStatus.NOT_ALLOWED;
          errorMessage = "Permission was denied";
        }
      } else {
        // No Permissions API, we can't distinguish between blocked and dismissed
        permissionStatus = VKYCPermissionStatus.NOT_ALLOWED;
        errorMessage = "Permission was denied";
      }
    } else if (err.name === "NotFoundError") {
      errorCode = VKYCErrorCode.DEVICE_NOT_FOUND;
      permissionStatus = VKYCPermissionStatus.NOT_ALLOWED;
    } else {
      permissionStatus = VKYCPermissionStatus.NOT_ALLOWED;
    }

    return {
      IS_PERMISSION_ALLOWED: permissionStatus,
      HAS_CAMERA: false,
      HAS_MICROPHONE: false,
      ERROR_MESSAGE: errorMessage,
      ERROR_CODE: errorCode,
    };
  }
}

async function measureDownloadSpeed(): Promise<number | null> {
  const testUrl = `https://speed.cloudflare.com/__down?bytes=${10 * 1024 * 1024}`; // 10 MB
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 20000);

  try {
    const start = performance.now();
    const res = await fetch(testUrl, { signal: controller.signal, cache: "no-store" });
    if (!res.ok || !res.body) throw new Error("No body");

    await res.body.pipeTo(new WritableStream()); 
    const duration = (performance.now() - start) / 1000;
    clearTimeout(timeout);
    return Number(((10 * 8) / duration).toFixed(2)); 
  } catch {
    clearTimeout(timeout);
    return null;
  }
}

export async function verifyAllPermissions(testSpeed = false) {
  const [camera, mic, location, network] = await Promise.all([
    requestCameraAccess(),
    requestMicrophoneAccess(),
    requestLocationAccess(),
    checkNetworkStatus({ testDownloadSpeed: testSpeed }),
  ]);

  return {
    camera,
    mic,
    location,
    network,
    videoAndMic: await requestVideoAndMicAccess(),
    IS_ALL_GRANTED:
      camera.IS_PERMISSION_ALLOWED === VKYCPermissionStatus.ALLOWED &&
      mic.IS_PERMISSION_ALLOWED === VKYCPermissionStatus.ALLOWED &&
      location.IS_PERMISSION_ALLOWED === VKYCPermissionStatus.ALLOWED &&
      network.IS_ONLINE,
  };
}

// Utility function to get human-readable permission status
export function getPermissionStatusDescription(status: VKYCPermissionStatus): string {
  switch (status) {
    case VKYCPermissionStatus.ALLOWED:
      return "Permission granted by user";
    case VKYCPermissionStatus.NOT_ALLOWED:
      return "Permission not granted (user dismissed or cancelled the prompt)";
    case VKYCPermissionStatus.BLOCKED:
      return "Permission permanently blocked by user";
    default:
      return "Unknown permission status";
  }
}