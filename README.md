Browser_hardware_access:

We are going to create a README.md file for the VKYC Hardware Permissions package.
The README should include:

Overview

Installation

Quick Start

API Reference (with examples for each function)

Enums and Interfaces explanation

Browser Support

Troubleshooting

Let's structure it accordingly.

A comprehensive TypeScript library for detecting hardware availability and managing user permissions in web browsers. 


Features
Camera Detection & Permission - Check camera availability and request access
Microphone Detection & Permission - Verify microphone hardware and permissions
Location Access - Request geolocation with precise coordinates
Network Status - Check connectivity, speed, and connection type
TypeScript Ready - Full type definitions and IntelliSense support
Cross-Browser - Works on Chrome, Firefox, Safari, and Edge
Permission States - Distinguishes between allowed, dismissed, and blocked states


Installation:
npm i browser_hardware_access

or

yarn add browser_hardware_access

Quick Start
import { verifyAllPermissions, VKYCPermissionStatus } from 'vkyc-hardware-permissions';


// Check all permissions at once
const results = await verifyAllPermissions();


if (results.IS_ALL_GRANTED) {
  console.log('All permissions granted! Ready for video verification.');
} else {
  console.log('Some permissions missing:', {
    camera: results.camera.IS_PERMISSION_ALLOWED,
    microphone: results.mic.IS_PERMISSION_ALLOWED,
    location: results.location.IS_PERMISSION_ALLOWED
  });
}








Core Concepts
Permission States:
The library provides clear distinction between three permission states:
import { VKYCPermissionStatus } from 'vkyc-hardware-permissions';


// Three possible states:
VKYCPermissionStatus.ALLOWED      // User explicitly granted permission
VKYCPermissionStatus.NOT_ALLOWED  // User dismissed or cancelled the prompt
VKYCPermissionStatus.BLOCKED      // User permanently denied permission


Error Handling
import { VKYCErrorCode } from 'vkyc-hardware-permissions';


VKYCErrorCode.PERMISSION_DENIED   // User denied permission
VKYCErrorCode.DEVICE_NOT_FOUND    // Hardware not available
VKYCErrorCode.NOT_SUPPORTED       // Browser doesn't support feature
VKYCErrorCode.TIMEOUT             // Request timed out
VKYCErrorCode.NETWORK_ERROR       // Network issues
VKYCErrorCode.UNKNOWN_ERROR       // Other errors

API Reference
Core Functions












requestCameraAccess()
Requests camera permission and returns camera capabilities.




import { requestCameraAccess, VKYCPermissionStatus } from 'vkyc-hardware-permissions';


const result = await requestCameraAccess();


if (result.IS_PERMISSION_ALLOWED === VKYCPermissionStatus.ALLOWED) {
  console.log(`Camera ready! Resolution: ${result.RESOLUTION_WIDTH}x${result.RESOLUTION_HEIGHT}`);
} else if (result.IS_PERMISSION_ALLOWED === VKYCPermissionStatus.BLOCKED) {
  console.log('Camera permission is permanently blocked');
}


requestMicrophoneAccess()
Requests microphone permission and checks hardware availability.
const result = await requestMicrophoneAccess();


if (result.IS_PERMISSION_ALLOWED === VKYCPermissionStatus.ALLOWED) {
  console.log('Microphone access granted');
} else if (result.HAS_MICROPHONE) {
  console.log('Microphone exists but permission not granted');
}


requestVideoAndMicAccess()
Requests both camera and microphone permissions simultaneously.
const result = await requestVideoAndMicAccess();
const canVideoCall =
  result.IS_PERMISSION_ALLOWED === VKYCPermissionStatus.ALLOWED &&
  result.HAS_CAMERA &&
  result.HAS_MICROPHONE;
requestLocationAccess()
Requests geolocation permission and returns coordinates.
const result = await requestLocationAccess();
if (result.IS_PERMISSION_ALLOWED === VKYCPermissionStatus.ALLOWED) {
  console.log(`Location: ${result.LATITUDE}, ${result.LONGITUDE}`);
} else {
  console.error(`Location error: ${result.ERROR_MESSAGE}`);
}

checkNetworkStatus()
Checks network connectivity with optional speed test.
// Basic check
const network = await checkNetworkStatus();
// With speed test
const detailedNetwork = await checkNetworkStatus({ testDownloadSpeed: true });
console.log({
  online: network.IS_ONLINE,
  type: network.CONNECTION_TYPE,
  speed: network.DOWNLOAD_SPEED_MBPS
});

verifyAllPermissions()
Comprehensive check of all permissions in parallel.
const allPermissions = await verifyAllPermissions(true);
console.log('Camera:', allPermissions.camera.IS_PERMISSION_ALLOWED);
console.log('Microphone:', allPermissions.mic.IS_PERMISSION_ALLOWED);
console.log('Location:', allPermissions.location.IS_PERMISSION_ALLOWED);
console.log('Network speed:', allPermissions.network.DOWNLOAD_SPEED_MBPS);
if (allPermissions.IS_ALL_GRANTED) {
  startVKYCProcess();
}


Utility Functions
getPermissionStatusDescription()
Get human-readable permission status messages.
import { getPermissionStatusDescription } from 'vkyc-hardware-permissions';


const cameraResult = await requestCameraAccess();
const description = getPermissionStatusDescription(cameraResult.IS_PERMISSION_ALLOWED);
// Returns: "Permission granted by user"
// Or: "Permission not granted (user dismissed or cancelled the prompt)"
// Or: "Permission permanently blocked by user"

Complete Examples
Video Call Setup
import {
  requestVideoAndMicAccess,
  checkNetworkStatus,
  VKYCPermissionStatus
} from 'vkyc-hardware-permissions';


async function setupVideoCall() {
  const [hardware, network] = await Promise.all([
    requestVideoAndMicAccess(),
    checkNetworkStatus({ testDownloadSpeed: true })
  ]);


  if (hardware.IS_PERMISSION_ALLOWED === VKYCPermissionStatus.ALLOWED) {
    if (network.DOWNLOAD_SPEED_MBPS && network.DOWNLOAD_SPEED_MBPS > 2) {
      startVideoCall();
    } else {
      showWarning('Slow network detected');
    }
  } else {
    showPermissionError(hardware.IS_PERMISSION_ALLOWED);
  }
}

Location Verification Flow
import { requestLocationAccess, VKYCPermissionStatus } from 'vkyc-hardware-permissions';


async function verifyUserLocation() {
  const location = await requestLocationAccess();
 
  switch (location.IS_PERMISSION_ALLOWED) {
    case VKYCPermissionStatus.ALLOWED:
      await validateLocation(location.LATITUDE, location.LONGITUDE);
      break;
     
    case VKYCPermissionStatus.NOT_ALLOWED:
      showRetryPrompt('Location access is required for verification');
      break;
     
    case VKYCPermissionStatus.BLOCKED:
      showBrowserSettingsInstructions('location');
      break;
  }
}











Comprehensive VKYC Check
import { verifyAllPermissions, VKYCPermissionStatus } from 'vkyc-hardware-permissions';


async function performVKYCCheck() {
  const permissions = await verifyAllPermissions(true);
 
  const missingPermissions = [];
 
  if (permissions.camera.IS_PERMISSION_ALLOWED !== VKYCPermissionStatus.ALLOWED) {
    missingPermissions.push('camera');
  }
 
  if (permissions.mic.IS_PERMISSION_ALLOWED !== VKYCPermissionStatus.ALLOWED) {
    missingPermissions.push('microphone');
  }
 
  if (!permissions.network.IS_ONLINE) {
    missingPermissions.push('internet connection');
  }
 
  if (missingPermissions.length === 0) {
    return { success: true, permissions };
  } else {
    return {
      success: false,
      missing: missingPermissions,
      permissions
    };
  }
}





Response Interfaces
Camera Result:
{
  IS_PERMISSION_ALLOWED: VKYCPermissionStatus;
  HAS_CAMERA: boolean;
  RESOLUTION_WIDTH?: number;
  RESOLUTION_HEIGHT?: number;
  ERROR_MESSAGE?: string;
  ERROR_CODE?: VKYCErrorCode;
}



Microphone Result:
{
  IS_PERMISSION_ALLOWED: VKYCPermissionStatus;
  HAS_MICROPHONE: boolean;
  ERROR_MESSAGE?: string;
  ERROR_CODE?: VKYCErrorCode;
}

Location Result
{
  IS_PERMISSION_ALLOWED: VKYCPermissionStatus;
  LATITUDE: string;
  LONGITUDE: string;
  ERROR_MESSAGE?: string;
  ERROR_CODE?: VKYCErrorCode;
}



Network Result
{
  IS_PERMISSION_ALLOWED: VKYCPermissionStatus; // Always ALLOWED for network
  IS_ONLINE: boolean;
  DOWNLINK_MBPS?: number;
  CONNECTION_TYPE?: string;
  RTT_MS?: number;
  DOWNLOAD_SPEED_MBPS?: number;
  ERROR_MESSAGE?: string;
  ERROR_CODE?: VKYCErrorCode;
}

















Browser Support
Browser
Camera
Microphone
Location
Network Info
Chrome   ✅ 61+ ✅ 61+ ✅ 5+ ✅ 61+
Firefox  ✅ 52+  ✅ 52+  ✅ 55+  ✅ 55+
Safari   ✅ 11+  ✅ 11+  ✅ 3.1+  ⚠️ Limited
Edge     ✅ 79+  ✅ 79+  ✅ 79+  ✅ 79+

Requirements
HTTPS: Camera and microphone access require secure contexts
User Gesture: Permission prompts must be triggered by user actions (clicks, taps)
Modern Browser: ES2018+ compatible browser recommended
Common Issues & Solutions
Permissions Not Working
Cause: Calling from non-HTTPS context
Fix: Deploy to HTTPS or use localhost for development
Permission Prompts Not Showing
Cause: Called without user gesture
Fix: Trigger from button click event handlers


Location Timeout
Cause: Slow GPS or network issues
Fix: Implement retry logic with user feedback
Camera/Mic Not Detected
Cause: Hardware not available or drivers missing
Fix: Check HAS_CAMERA/HAS_MICROPHONE and provide fallbacks
Best Practices
Request permissions progressively - Don't ask for everything at once
Handle all three states - ALLOWED, NOT_ALLOWED, and BLOCKED require different UX
Provide clear instructions - Tell users why you need each permission
Test on multiple devices - Hardware availability varies
Implement fallbacks - Provide alternatives when hardware isn't available
Contributing
Fork the repository
Create a feature branch (git checkout -b feature/amazing-feature)
Commit your changes (git commit -m 'Add amazing feature')
Push to the branch (git push origin feature/amazing-feature)
Open a Pull Request
License
MIT © VKYC Team
Support
For bugs and feature requests, please create an issue on GitHub.
