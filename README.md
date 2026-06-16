# B Bank - Frontend Portal

The React-based admin portal for **B Bank DFSP**, built with Vite + React. Provides a real-time dashboard for merchant management, payment initiation, transaction monitoring, and live Mojaloop callback inspection — all powered by a persistent WebSocket connection to the B Bank backend.

---

## Table of Contents

- [Features](#features)
- [Environment Setup](#environment-setup)
- [Installation](#installation)
- [WebSocket Integration](#websocket-integration)
  - [SocketContext](#socketcontext)
  - [Available Socket Events](#available-socket-events)
  - [Usage in Components](#usage-in-components)
  - [Resetting State](#resetting-state)
- [Project Structure](#project-structure)

---

## Features

### Authentication

- JWT-based login with token persistence
- Role-aware access control (`ADMIN`, `MERCHANT`, `OPERATOR`, `VIEWER`)
- Auto-redirect on session expiry

### Dashboard

- Real-time balance overview per merchant wallet
- Transaction volume and summary charts (Recharts)
- Recent activity feed with live updates via WebSocket

### Merchant Management

- Full CRUD — add, edit, view, deactivate, and delete merchants
- Field-level validation (ID type/value, NID, account number, daily limits)
- Merchant status toggle (active / inactive)
- Paginated and searchable merchant table with date range filters
- Opening balance deposit on merchant creation

### Payment Initiation

- **Party Lookup** — resolve payee FSP by ID type and identifier
- **Quote Initiation** — send a quote request and receive ILP data in real time
- **Transfer Execution** — confirm and submit a transfer with ILP packet and condition
- Support for all payment rails: `P2P`, `INSTANT`
- Coming soon: `BULK`, `NPSB`, `RTGS`, `BEFTN`

### Real-Time Callback Monitor

- Live view of every Mojaloop callback phase (Parties → Quotes → Transfers)
- Displays raw `headers`, `params`, and `body` for each callback event
- Separate panels for success and error callbacks
- Bulk quote and bulk transfer callback support

### Transaction History

- Full audit trail per merchant with status, direction, fees, and timestamps
- Filter by status, type, date range
- Drill-down view showing ILP packet, condition, fulfilment, and error details

### Settings

- Configure `quote_fee` percentage applied on incoming quotes
- View current FSP ID and currency defaults

---

## Environment Setup

Create a `.env` file in the project root:

```dotenv
VITE_APP_SERVER=https://your-abank-server.com
```

| Variable          | Description                                                                                       |
| ----------------- | ------------------------------------------------------------------------------------------------- |
| `VITE_APP_SERVER` | Base URL of the B Bank backend server. Used for both REST API calls and the Socket.IO connection. |

> All Vite environment variables must be prefixed with `VITE_` to be accessible in the browser via `import.meta.env`.

---

## Installation

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env
# Set VITE_APP_SERVER to your backend URL

# 3. Start development server
npm run dev

# 4. Build for production
npm run build
```

---

## WebSocket Integration

### SocketContext

The `SocketContext.jsx` provider wraps the entire application and maintains a single persistent Socket.IO connection to the backend. It manages state for every Mojaloop callback event category and exposes them via React context.

**Wrap your app in the provider:**

```jsx
// main.jsx
import { SocketProvider } from './context/SocketContext';

<SocketProvider>
  <App />
</SocketProvider>;
```

The socket connects automatically on mount to `VITE_APP_SERVER` and disconnects cleanly on unmount.

---

### Available Socket Events

All events carry a payload of `{ params, query, headers, body }` matching the raw Mojaloop callback data received by the backend.

#### ALS — Participant Registration

| Context Value                    | Socket Event                   | Description                                |
| -------------------------------- | ------------------------------ | ------------------------------------------ |
| `alsRegisterSingleCallback`      | `alsRegisterOneCallback`       | Single participant registered successfully |
| `aslRegisterSingleErrorCallback` | `alsRegisterOneErrorCallback`  | Single participant registration failed     |
| `alsRegisterManyCallback`        | `alsRegisterManyCallback`      | Batch participants registered successfully |
| `aslRegisterManyErrorCallback`   | `alsRegisterManyErrorCallback` | Batch participant registration failed      |

#### ALS — Party Verification

| Context Value                  | Socket Event                   | Description                                   |
| ------------------------------ | ------------------------------ | --------------------------------------------- |
| `alsOracleVerifyCallback`      | `alsOracleVerifyCallback`      | Oracle verify success (party found in ALS)    |
| `alsOracleVerifyErrorCallback` | `alsOracleVerifyErrorCallback` | Oracle verify failure (party not found)       |
| `alsverifyCallback`            | `alsverifyCallback`            | Party lookup request received by this DFSP    |
| `alsputCallback`               | `alsputCallback`               | Party lookup response received (PUT /parties) |
| `alsputErrorCallback`          | `alsputErrorCallback`          | Party lookup error received                   |

#### Quotes

| Context Value               | Socket Event                | Description                                        |
| --------------------------- | --------------------------- | -------------------------------------------------- |
| `postQuoteCallback`         | `postQuoteCallback`         | Quote request received (Payee DFSP side)           |
| `putQuoteCallback`          | `putQuoteCallback`          | Quote response received with ILP data (Payer side) |
| `putQuoteCallbackError`     | `putQuoteCallbackError`     | Quote failed                                       |
| `postBulkQuoteCallback`     | `postBulkQuoteCallback`     | Bulk quote request received                        |
| `putBulkQuoteCallback`      | `putBulkQuoteCallback`      | Bulk quote response received                       |
| `putBulkQuoteCallbackError` | `putBulkQuoteCallbackError` | Bulk quote failed                                  |

#### Transfers

| Context Value                  | Socket Event                   | Description                                              |
| ------------------------------ | ------------------------------ | -------------------------------------------------------- |
| `postTransferCallback`         | `postTransferCallback`         | Transfer request received (Payee DFSP side)              |
| `putTransferCallback`          | `putTransferCallback`          | Transfer result received — COMMITTED / ABORTED / EXPIRED |
| `putTransferCallbackError`     | `putTransferCallbackError`     | Transfer failed                                          |
| `postBulkTransferCallback`     | `postBulkTransferCallback`     | Bulk transfer request received                           |
| `putBulkTransferCallback`      | `putBulkTransferCallback`      | Bulk transfer result received                            |
| `putBulkTransferCallbackError` | `putBulkTransferCallbackError` | Bulk transfer failed                                     |

---

### Usage in Components

```jsx
import { useSocket } from '../context/SocketContext';

export default function TransferMonitor() {
  const { putTransferCallback, putTransferCallbackError } = useSocket();

  useEffect(() => {
    if (putTransferCallback) {
      const state = putTransferCallback.body?.transferState;
      console.log('Transfer result:', state); // COMMITTED | ABORTED | EXPIRED
    }
  }, [putTransferCallback]);

  useEffect(() => {
    if (putTransferCallbackError) {
      const err = putTransferCallbackError.body?.errorInformation;
      console.error(`[${err?.errorCode}] ${err?.errorDescription}`);
    }
  }, [putTransferCallbackError]);

  return (
    <div>
      {putTransferCallback?.body?.transferState === 'COMMITTED' && (
        <p>Transfer successful!</p>
      )}
    </div>
  );
}
```

**Listening for a completed quote to auto-populate transfer fields:**

```jsx
const { putQuoteCallback, resetState } = useSocket();

useEffect(() => {
  if (putQuoteCallback) {
    const { ilpPacket, condition, expiration } = putQuoteCallback.body;
    setTransferForm({ ilpPacket, condition, expiration });
  }
}, [putQuoteCallback]);
```

---

### Resetting State

Call `resetState()` to clear all callback state — useful when starting a new transaction flow to avoid stale data triggering side effects:

```jsx
const { resetState } = useSocket();

function handleNewTransfer() {
  resetState(); // clears all ALS, Quote, Transfer callback state
  startQuoteFlow();
}
```

**Cleared by `resetState()`:** `alsverifyCallback`, `alsputCallback`, `alsputErrorCallback`, `alsOracleVerifyCallback`, `alsOracleVerifyErrorCallback`, `postQuoteCallback`, `putQuoteCallback`, `putQuoteCallbackError`, `postTransferCallback`, `putTransferCallback`, `putTransferCallbackError`

---

## Project Structure

```
src/
├── context/
│   └── SocketContext.jsx       # Global Socket.IO provider & all callback state
├── components/
│   ├── ui/                     # Shared UI components
│   ├── merchant/               # Merchant list, form, detail views
│   ├── transfer/               # Quote & transfer initiation flow
│   └── monitor/                # Live callback inspector panels
├── pages/
│   ├── Home.jsx
│   ├── DFSP.jsx
│   ├── Logs.jsx
│   ├── merchant/Merchant.jsx
│   ├── Transaction/Transactions.jsx
│   ├── Transfer.jsx
│   ├── Balance/BalancePage.jsx
│   ├── Liquidity/Liquidity.jsx
│   ├── Users/Users.jsx
│   └── Auth/Login.jsx
│   └── Auth/OTPVerify.jsx
│   ├── Settings.jsx
│   └── ActivityLogs/ActivityLogs.jsx
├── hooks/                      # Custom hooks (useAuth, useApi, etc.)
├── services/                   # Axios instance & API call functions
├── routes/                     # React Router v6 route definitions
└── main.jsx                    # App entry — SocketProvider wraps everything
```

---

## License

Private - Bangladeshi Software LTD. All rights reserved.
