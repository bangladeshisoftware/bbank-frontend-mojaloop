'use client';

import { createContext, useContext, useEffect, useState } from 'react';

import { io } from 'socket.io-client';

const SocketContext = createContext();

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  // new
  // ALS
  // ALS # Registration
  const [alsRegisterSingleCallback, setAlsRegisterSingleCallback] =
    useState(null);
  const [aslRegisterSingleErrorCallback, setAlsRegisterSingleErrorCallback] =
    useState(null);
  const [alsRegisterManyCallback, setAlsRegisterManyCallback] = useState(null);
  const [aslRegisterManyErrorCallback, setAlsRegisterManyErrorCallback] =
    useState(null);
  // ALS # Verify
  const [alsverifyCallback, setalsVerifyCallback] = useState(null);
  const [alsputCallback, setalsputCallback] = useState(null);
  const [alsputErrorCallback, setalsputErrorCallback] = useState(null);
  // Quote
  const [postQuoteCallback, setPostQuoteCallback] = useState(null);
  const [putQuoteCallback, setPutQuoteCallback] = useState(null);
  const [putQuoteCallbackError, setPutQuoteCallbackError] = useState(null);

  const [postBulkQuoteCallback, setPostBulkQuoteCallback] = useState(null);
  const [putBulkQuoteCallback, setPutBulkQuoteCallback] = useState(null);
  const [putBulkQuoteCallbackError, setPutBulkQuoteCallbackError] =
    useState(null);

  // Transfers
  const [postTransferCallback, setPostTransfersCallback] = useState(null);
  const [putTransferCallback, setPutTransfersCallback] = useState(null);
  const [putTransferCallbackError, setPutTransfersCallbackError] =
    useState(null);

  const [postBulkTransferCallback, setPostBulkTransfersCallback] =
    useState(null);
  const [putBulkTransferCallback, setPutBulkTransfersCallback] = useState(null);
  const [putBulkTransferCallbackError, setPutBulkTransfersCallbackError] =
    useState(null);

  useEffect(() => {
    const socketInstance = io(import.meta.env.VITE_APP_SERVER); // server URL

    setSocket(socketInstance);

    // ALS # Registration
    socketInstance.on('alsRegisterOneCallback', (data) => {
      console.log('New single ALS Registration callback data:', data);
      setAlsRegisterSingleCallback(data);
    });

    socketInstance.on('alsRegisterOneErrorCallback', (data) => {
      console.log('New single ALS Error Registration callback data:', data);
      setAlsRegisterSingleErrorCallback(data);
    });

    socketInstance.on('alsRegisterManyCallback', (data) => {
      console.log('New many ALS Registration callback data:', data);
      setAlsRegisterManyCallback(data);
    });

    socketInstance.on('alsRegisterManyErrorCallback', (data) => {
      console.log('New many ALS Error Registration callback data:', data);
      setAlsRegisterManyErrorCallback(data);
    });

    // ALS # Verify
    socketInstance.on('alsverifyCallback', (data) => {
      console.log('New alsverifyCallback data:', data);
      setalsVerifyCallback(data);
    });

    socketInstance.on('alsputCallback', (data) => {
      console.log('New aslputCallback data:', data);
      setalsputCallback(data);
    });

    socketInstance.on('alsputErrorCallback', (data) => {
      console.log('New aslputErrorCallback data:', data);
      setalsputErrorCallback(data);
    });

    // Quote
    socketInstance.on('postQuoteCallback', (data) => {
      console.log('New postQuoteCallback data:', data);
      setPostQuoteCallback(data);
    });

    socketInstance.on('putQuoteCallback', (data) => {
      console.log('New putQuoteCallback data:', data);
      setPutQuoteCallback(data);
    });

    socketInstance.on('putQuoteCallbackError', (data) => {
      console.log('New putQuoteCallbackError data:', data);
      setPutQuoteCallbackError(data);
    });
    // Bulk
    socketInstance.on('postBulkQuoteCallback', (data) => {
      console.log('New postBulkQuoteCallback data:', data);
      setPostBulkQuoteCallback(data);
    });

    socketInstance.on('putBulkQuoteCallback', (data) => {
      console.log('New putBulkQuoteCallback data:', data);
      setPutBulkQuoteCallback(data);
    });

    socketInstance.on('putBulkQuoteCallbackError', (data) => {
      console.log('New putBulkQuoteCallbackError data:', data);
      setPutBulkQuoteCallbackError(data);
    });

    // Transfers
    socketInstance.on('postTransferCallback', (data) => {
      console.log('New postTransferCallback data:', data);
      setPostTransfersCallback(data);
    });

    socketInstance.on('putTransferCallback', (data) => {
      console.log('New putTransferCallback data:', data);
      setPutTransfersCallback(data);
    });

    socketInstance.on('putTransferCallbackError', (data) => {
      console.log('New putTransferCallbackError data:', data);
      setPutTransfersCallbackError(data);
    });
    // Bulk
    socketInstance.on('postBulkTransferCallback', (data) => {
      console.log('New postBulkTransferCallback data:', data);
      setPostBulkTransfersCallback(data);
    });

    socketInstance.on('putBulkTransferCallback', (data) => {
      console.log('New putBulkTransferCallback data:', data);
      setPutBulkTransfersCallback(data);
    });

    socketInstance.on('putBulkTransferCallbackError', (data) => {
      console.log('New putBulkTransferCallbackError data:', data);
      setPutBulkTransfersCallbackError(data);
    });

    // Cleanup on unmount
    return () => {
      socketInstance.disconnect();
    };
  }, []);
  function resetState() {
    setalsVerifyCallback(null);
    setalsputCallback(null);
    setalsputErrorCallback(null);
    setPostQuoteCallback(null);
    setPutQuoteCallback(null);
    setPutQuoteCallbackError(null);
    setPostTransfersCallback(null);
    setPutTransfersCallback(null);
    setPutTransfersCallbackError(null);
  }
  return (
    <SocketContext.Provider
      value={{
        socket,
        resetState,
        alsRegisterSingleCallback,
        aslRegisterSingleErrorCallback,
        alsRegisterManyCallback,
        aslRegisterManyErrorCallback,
        alsverifyCallback,
        alsputCallback,
        alsputErrorCallback,
        postQuoteCallback,
        putQuoteCallback,
        putQuoteCallbackError,
        postBulkQuoteCallback,
        putBulkQuoteCallback,
        putBulkQuoteCallbackError,
        postTransferCallback,
        putTransferCallback,
        putTransferCallbackError,
        postBulkTransferCallback,
        putBulkTransferCallback,
        putBulkTransferCallbackError,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};
