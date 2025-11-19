**Browser\_hardware\_access:**

**We are going to create a README.md file for the VKYC Hardware Permissions package.**

**The README should include:**

- **Overview**

- **Installation**

- **Quick Start**

- **API Reference (with examples for each function)**

- **Enums and Interfaces explanation**

- **Browser Support**

- **Troubleshooting**

- **Let's structure it accordingly.**

**A comprehensive TypeScript library for detecting hardware availability and managing user permissions in web browsers.** 


## <a name="_bhc14i9h05s4"></a>**Features**
- **Camera Detection & Permission - Check camera availability and request access**
- **Microphone Detection & Permission - Verify microphone hardware and permissions**
- **Location Access - Request geolocation with precise coordinates**
- **Network Status - Check connectivity, speed, and connection type**
- **TypeScript Ready - Full type definitions and IntelliSense support**
- **Cross-Browser - Works on Chrome, Firefox, Safari, and Edge**
- **Permission States - Distinguishes between allowed, dismissed, and blocked states**
##
## <a name="_mythv65djoaz"></a><a name="_n9vgp38b2i6b"></a>**Installation:**
```
npm i browser_hardware_access
```
or
```
yarn add browser_hardware_access
```
## <a name="_yn970khn1n2d"></a>**Quick Start**
```
import { verifyAllPermissions, VKYCPermissionStatus } from 'browser_hardware_access';
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
```

## <a name="_jg4wfhsmkrpf"></a><a name="_ve59plq9pqrz"></a><a name="_d6nk5lusg0jl"></a><a name="_8xg9vvfem7j2"></a><a name="_c8lw2wn4nvon"></a>**Core Concepts**
**Permission States:**
The library provides clear distinction between three permission states:
```
import { VKYCPermissionStatus } from 'browser_hardware_access';
// Three possible states:
VKYCPermissionStatus.ALLOWED      // User explicitly granted permission
VKYCPermissionStatus.NOT_ALLOWED  // User dismissed or cancelled the prompt
VKYCPermissionStatus.BLOCKED      // User permanently denied permission
```

## <a name="_jg4wfhsmkrpf"></a><a name="_ve59plq9pqrz"></a><a name="_d6nk5lusg0jl"></a><a name="_8xg9vvfem7j2"></a><a name="_c8lw2wn4nvon"></a>**Error Handling**
```
import { VKYCErrorCode } from 'browser_hardware_access';

VKYCErrorCode.PERMISSION_DENIED   // User denied permission
VKYCErrorCode.DEVICE_NOT_FOUND    // Hardware not available
VKYCErrorCode.NOT_SUPPORTED       // Browser doesn't support feature
VKYCErrorCode.TIMEOUT             // Request timed out
VKYCErrorCode.NETWORK_ERROR       // Network issues
VKYCErrorCode.UNKNOWN_ERROR       // Other errors
```
## <a name="_2yt40jkwph4v"></a>**API Reference**
### <a name="_1oz4nae30q1j"></a>**Core Functions**

**requestCameraAccess()**

Requests camera permission and returns camera capabilities.

```
import { requestCameraAccess, VKYCPermissionStatus } from 'browser_hardware_access';

const result = await requestCameraAccess();
  if (result.IS_PERMISSION_ALLOWED === VKYCPermissionStatus.ALLOWED) {
    console.log(`Camera ready! Resolution: ${result.RESOLUTION_WIDTH}x${result.RESOLUTION_HEIGHT}`);
  } else if (result.IS_PERMISSION_ALLOWED === VKYCPermissionStatus.BLOCKED) {
    console.log('Camera permission is permanently blocked');
}
```

#### <a name="_gwyf9dimvr7a"></a>**requestMicrophoneAccess()**

Requests microphone permission and checks hardware availability.
```
const result = await requestMicrophoneAccess();
if (result.IS_PERMISSION_ALLOWED === VKYCPermissionStatus.ALLOWED) {
    console.log('Microphone access granted');
} else if (result.HAS_MICROPHONE) {
    console.log('Microphone exists but permission not granted');
}
```

#### <a name="_2qmz4aus8fw5"></a>**requestVideoAndMicAccess()**
Requests both camera and microphone permissions simultaneously.

```
const result = await requestVideoAndMicAccess();
const canVideoCall = result.IS_PERMISSION_ALLOWED === VKYCPermissionStatus.ALLOWED && result.HAS_CAMERA && result.HAS_MICROPHONE;
```

#### <a name="_lup790s7wmti"></a>**requestLocationAccess()**
Requests geolocation permission and returns coordinates.

```
const result = await requestLocationAccess();
if (result.IS_PERMISSION_ALLOWED === VKYCPermissionStatus.ALLOWED) {
    console.log(`Location: ${result.LATITUDE}, ${result.LONGITUDE}`);
  } else {
    console.error(`Location error: ${result.ERROR\_MESSAGE}`);
}
```

#### <a name="_y55biju5463q"></a>**checkNetworkStatus()**
Checks network connectivity with optional speed test.
```
// Basic check
const network = await checkNetworkStatus();
// With speed test
const detailedNetwork = await checkNetworkStatus({ testDownloadSpeed: true });
console.log({
    online: network.IS_ONLINE,
    type: network.CONNECTION_TYPE,
    speed: network.DOWNLOAD_SPEED_MBPS
});
```
#### <a name="_w3ybiphspp0g"></a>**verifyAllPermissions()**
Comprehensive check of all permissions in parallel.
```
  const allPermissions = await verifyAllPermissions(true);

  console.log('Camera:', allPermissions.camera.IS_PERMISSION_ALLOWED);
  console.log('Microphone:', allPermissions.mic.IS_PERMISSION_ALLOWED);
  console.log('Location:', allPermissions.location.IS_PERMISSION_ALLOWED);
  console.log('Network speed:', allPermissions.network.DOWNLOAD_SPEED_MBPS);

  if (allPermissions.IS_ALL_GRANTED) {
    startVKYCProcess();
  }

```
### <a name="_vhwkesrq9dpk"></a>**Utility Functions**
#### <a name="_vh7k7gwq4otm"></a>**getPermissionStatusDescription()**
Get human-readable permission status messages.
```
import { getPermissionStatusDescription } from 'browser_hardware_access';
const cameraResult = await requestCameraAccess();
const description = getPermissionStatusDescription(cameraResult.IS_PERMISSION_ALLOWED);
// Returns: "Permission granted by user"
// Or: "Permission not granted (user dismissed or cancelled the prompt)"
// Or: "Permission permanently blocked by user"
```
## <a name="_n3wdw76f2e99"></a>**Complete Examples**
### <a name="_cxb20gcmre9a"></a>**Video Call Setup**

```
import { requestVideoAndMicAccess , checkNetworkStatus , VKYCPermissionStatus } from 'browser_hardware_access';

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
    showPermissionError(hardware.IS\_PERMISSION\_ALLOWED);
  }
}
```

### <a name="_gqk0o336x3cy"></a>**Location Verification Flow**
```
import { requestLocationAccess, VKYCPermissionStatus } from 'browser_hardware_access';

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

```

### <a name="_mv7083ty199e"></a>**Comprehensive VKYC Check**
```
import { verifyAllPermissions, VKYCPermissionStatus } from 'browser_hardware_access';

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
```
## <a name="_c7h3pu8btslr"></a>**Response Interfaces**
## <a name="_g5u1u7fv32ns"></a>**Camera Result:**
```
{
  IS_PERMISSION_ALLOWED: VKYCPermissionStatus;
  HAS_CAMERA: boolean;
  RESOLUTION_WIDTH?: number;
  RESOLUTION_HEIGHT?: number;
  ERROR_MESSAGE?: string;
  ERROR_CODE?: VKYCErrorCode;
}
```
### <a name="_m7bxq7fbi17f"></a>**Microphone Result:**
```
{
  IS_PERMISSION_ALLOWED: VKYCPermissionStatus;
  HAS_MICROPHONE: boolean;
  ERROR_MESSAGE?: string;
  ERROR_CODE?: VKYCErrorCode;
}
```

### <a name="_djq8obbnbq4m"></a>**Location Result**
```
{
  IS_PERMISSION_ALLOWED: VKYCPermissionStatus;
  LATITUDE: string;
  LONGITUDE: string;
  ERROR_MESSAGE?: string;
  ERROR_CODE?: VKYCErrorCode;
}
```


### <a name="_d43sb2ha50qu"></a>**Network Result**
```
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
```
### <a name="_d43sb2ha50qu"></a>**enum VKYCErrorCode**
```
{
  PERMISSION_DENIED = "PERMISSION_DENIED",
  DEVICE_NOT_FOUND = "DEVICE_NOT_FOUND",
  NOT_SUPPORTED = "NOT_SUPPORTED",
  TIMEOUT = "TIMEOUT",
  NETWORK_ERROR = "NETWORK_ERROR",
  UNKNOWN_ERROR = "UNKNOWN_ERROR",
}
```
### <a name="_d43sb2ha50qu"></a>**enum VKYCPermissionStatus**
```
{
  ALLOWED = "ALLOWED",
  NOT_ALLOWED = "NOT_ALLOWED",  // User dismissed/cancelled the prompt
  BLOCKED = "BLOCKED"           // User explicitly blocked the permission
}
```
##
## <a name="_3dkqgfyx1org"></a><a name="_5i53wtvr9bvc"></a><a name="_qos0cqcp5d0h"></a><a name="_8sfalp5ax652"></a><a name="_bu1wn953pd0p"></a><a name="_3hduw1mg94sb"></a><a name="_9k54j9ssfpqw"></a><a name="_xgbb8ueyhs6"></a><a name="_fsmd1ufxq5z1"></a>**Browser Support**

|Browser|Camera|Microphone|Location|Network Info|
| :- | :- | :- | :- | :- |
|Chrome|✅ 61+|✅ 61+|✅ 5+|✅ 61+|
|Firefox|✅ 52+|✅ 52+|✅ 55+|✅ 55+|
|Safari|✅ 11+|✅ 11+|✅ 3.1+|⚠️ Limited|
|Edge|✅ 79+|✅ 79+|✅ 79+|✅ 79+|
## <a name="_9h1rwur7gw0i"></a>**Requirements**
- HTTPS: Camera and microphone access require secure contexts
- User Gesture: Permission prompts must be triggered by user actions (clicks, taps)
- Modern Browser: ES2018+ compatible browser recommended
## <a name="_e34ynnw5d0c7"></a>**Common Issues & Solutions**
### <a name="_nijco2q80ncd"></a>**Permissions Not Working**
- Cause: Calling from non-HTTPS context
- Fix: Deploy to HTTPS or use localhost for development
### <a name="_tsu1kbyszube"></a>**Permission Prompts Not Showing**
- Cause: Called without user gesture
- Fix: Trigger from button click event handlers
###
### <a name="_4sa6cz4f739"></a><a name="_4jow87n4ryg"></a>**Location Timeout**
- Cause: Slow GPS or network issues
- Fix: Implement retry logic with user feedback
### <a name="_dmor5eazu4a6"></a>**Camera/Mic Not Detected**
- Cause: Hardware not available or drivers missing
- Fix: Check HAS\_CAMERA/HAS\_MICROPHONE and provide fallbacks
## <a name="_yikvt2au0xti"></a>**Best Practices**
1. Request permissions progressively - Don't ask for everything at once
1. Handle all three states - ALLOWED, NOT\_ALLOWED, and BLOCKED require different UX
1. Provide clear instructions - Tell users why you need each permission
1. Test on multiple devices - Hardware availability varies
1. Implement fallbacks - Provide alternatives when hardware isn't available
## <a name="_p5w4hjxim5t9"></a>**Contributing**
1. Fork the repository
1. Create a feature branch (git checkout -b feature/amazing-feature)
1. Commit your changes (git commit -m 'Add amazing feature')
1. Push to the branch (git push origin feature/amazing-feature)
1. Open a Pull Request
## <a name="_5p9ewksov3bb"></a>**License**
MIT © VKYC Team
## <a name="_t6oo3g20f4cn"></a>**Support**
For bugs and feature requests, please [create an issue](https://github.com/browser_hardware_access/issues) on GitHub.

