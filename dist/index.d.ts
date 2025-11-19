declare enum VKYCErrorCode {
    PERMISSION_DENIED = "PERMISSION_DENIED",
    DEVICE_NOT_FOUND = "DEVICE_NOT_FOUND",
    NOT_SUPPORTED = "NOT_SUPPORTED",
    TIMEOUT = "TIMEOUT",
    NETWORK_ERROR = "NETWORK_ERROR",
    UNKNOWN_ERROR = "UNKNOWN_ERROR"
}
declare enum VKYCPermissionStatus {
    ALLOWED = "ALLOWED",
    NOT_ALLOWED = "NOT_ALLOWED",// User dismissed/cancelled the prompt
    BLOCKED = "BLOCKED"
}
interface BaseVKYCResult {
    IS_PERMISSION_ALLOWED: VKYCPermissionStatus;
    ERROR_MESSAGE?: string;
    ERROR_CODE?: VKYCErrorCode;
}
interface VKYCCameraResult extends BaseVKYCResult {
    HAS_CAMERA: boolean;
    RESOLUTION_WIDTH?: number;
    RESOLUTION_HEIGHT?: number;
}
interface VKYCMicResult extends BaseVKYCResult {
    HAS_MICROPHONE: boolean;
}
interface VKYCLocationResult extends BaseVKYCResult {
    LATITUDE: string;
    LONGITUDE: string;
}
interface VKYCNetworkResult extends BaseVKYCResult {
    IS_ONLINE: boolean;
    DOWNLINK_MBPS?: number;
    CONNECTION_TYPE?: string;
    RTT_MS?: number;
    DOWNLOAD_SPEED_MBPS?: number;
}
declare function requestCameraAccess(): Promise<VKYCCameraResult>;
declare function requestMicrophoneAccess(): Promise<VKYCMicResult>;
declare function requestVideoAndMicAccess(): Promise<VKYCCameraResult & VKYCMicResult>;
declare function requestLocationAccess(): Promise<VKYCLocationResult>;
declare function checkNetworkStatus(options?: {
    testDownloadSpeed?: boolean;
}): Promise<VKYCNetworkResult>;
declare function verifyAllPermissions(testSpeed?: boolean): Promise<{
    camera: VKYCCameraResult;
    mic: VKYCMicResult;
    location: VKYCLocationResult;
    network: VKYCNetworkResult;
    videoAndMic: VKYCCameraResult & VKYCMicResult;
    IS_ALL_GRANTED: boolean;
}>;
declare function getPermissionStatusDescription(status: VKYCPermissionStatus): string;

export { type BaseVKYCResult, type VKYCCameraResult, VKYCErrorCode, type VKYCLocationResult, type VKYCMicResult, type VKYCNetworkResult, VKYCPermissionStatus, checkNetworkStatus, getPermissionStatusDescription, requestCameraAccess, requestLocationAccess, requestMicrophoneAccess, requestVideoAndMicAccess, verifyAllPermissions };
