import React, { useState } from 'react';
import { useSocket } from '../context/SocketContext';
import { PiCloudCheckFill } from 'react-icons/pi';
import { BiSolidError } from 'react-icons/bi';
import { RiNotificationBadgeFill } from 'react-icons/ri';
import { IoMdClose } from 'react-icons/io';
import { ImCheckmark2 } from 'react-icons/im';
import { FcCallback } from 'react-icons/fc';

function Logs() {
  const {
    alsRegisterSingleCallback,
    alsOracleVerifyCallback,
    aslRegisterSingleErrorCallback,
    alsOracleVerifyErrorCallback,
    alsRegisterManyCallback,
    aslRegisterManyErrorCallback,
    alsverifyCallback,
    alsputCallback,
    alsputErrorCallback,
    postQuoteCallback,
    putQuoteCallback,
    putQuoteCallbackError,
    postTransferCallback,
    putTransferCallback,
    putTransferCallbackError,
  } = useSocket();

  const [expandedCallbacks, setExpandedCallbacks] = useState({});

  const toggleCallback = (callbackName) => {
    setExpandedCallbacks((prev) => ({
      ...prev,
      [callbackName]: !prev[callbackName],
    }));
  };

  const callbacks = [
    {
      name: 'ALS Oracle Verify',
      data: alsOracleVerifyCallback,
      type: 'success',
    },
    {
      name: 'ALS Single Registration',
      data: alsRegisterSingleCallback,
      type: 'success',
    },
    {
      name: 'ALS Single Registration Error',
      data: aslRegisterSingleErrorCallback,
      type: 'error',
    },
    {
      name: 'ALS Oracle Verify Error',
      data: alsOracleVerifyErrorCallback,
      type: 'error',
    },
    {
      name: 'ALS Many Registration',
      data: alsRegisterManyCallback,
      type: 'success',
    },
    {
      name: 'ALS Many Registration Error',
      data: aslRegisterManyErrorCallback,
      type: 'error',
    },

    { name: 'ALS Verify', data: alsverifyCallback, type: 'success' },
    { name: 'ALS Put', data: alsputCallback, type: 'success' },
    { name: 'ALS Put Error', data: alsputErrorCallback, type: 'error' },
    { name: 'Post Quote', data: postQuoteCallback, type: 'success' },
    { name: 'Put Quote', data: putQuoteCallback, type: 'success' },
    { name: 'Put Quote Error', data: putQuoteCallbackError, type: 'error' },
    { name: 'Post Transfer', data: postTransferCallback, type: 'success' },
    { name: 'Put Transfer', data: putTransferCallback, type: 'success' },
    {
      name: 'Put Transfer Error',
      data: putTransferCallbackError,
      type: 'error',
    },
  ];

  const hasCallbacks = callbacks.some((callback) => callback.data);

  const getStatusIcon = (type) => {
    return type === 'error' ? (
      <IoMdClose color='red' size={20} />
    ) : (
      <ImCheckmark2 color='green' size={20} />
    );
  };

  const getTimeFromData = (data) => {
    return (
      data?.body?.completedTimestamp ||
      data?.headers?.date ||
      new Date().toISOString()
    );
  };

  return (
    <div className='min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6'>
      <div className='max-w-7xl mx-auto'>
        {/* Header */}
        <div className='text-center mb-8 pt-5'>
          <h1 className='text-3xl font-bold text-gray-800 mb-2'>
            API Callbacks Monitor
          </h1>
          <p className='text-gray-600'>
            Real-time callback data from Mojaloop system
          </p>
          <div className='w-24 h-1 bg-[#05569f] mx-auto mt-4 rounded-full'></div>
        </div>

        {/* Stats Cards */}
        <div className='grid grid-cols-1 md:grid-cols-3 gap-6 mb-8'>
          <div className='bg-white rounded shadow-sm p-6 border-l-4 border-green-500'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm text-gray-600'>Successful Callbacks</p>
                <p className='text-2xl font-bold text-gray-800'>
                  {
                    callbacks.filter((cb) => cb.data && cb.type === 'success')
                      .length
                  }
                </p>
              </div>
              <div className='text-3xl'>
                <PiCloudCheckFill className='text-green-600' />
              </div>
            </div>
          </div>

          <div className='bg-white rounded shadow-sm p-6 border-l-4 border-red-500'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm text-gray-600'>Error Callbacks</p>
                <p className='text-2xl font-bold text-gray-800'>
                  {
                    callbacks.filter((cb) => cb.data && cb.type === 'error')
                      .length
                  }
                </p>
              </div>
              <div className='text-3xl'>
                <BiSolidError className='text-red-600' />
              </div>
            </div>
          </div>

          <div className='bg-white rounded shadow-sm p-6 border-l-4 border-blue-500'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm text-gray-600'>Total Callbacks</p>
                <p className='text-2xl font-bold text-gray-800'>
                  {callbacks.filter((cb) => cb.data).length}
                </p>
              </div>
              <div className='text-3xl'>
                <RiNotificationBadgeFill className='text-blue-600' />
              </div>
            </div>
          </div>
        </div>

        {/* Callbacks List */}
        <div className='space-y-4'>
          {!hasCallbacks ? (
            <div className='text-center py-12'>
              <div className='text-6xl mb-4 text-center mx-auto flex items-center justify-center'>
                <FcCallback />
              </div>
              <h3 className='text-xl font-semibold text-gray-600 mb-2'>
                No Callbacks Yet
              </h3>
              <p className='text-gray-500'>
                Waiting for incoming callback data...
              </p>
            </div>
          ) : (
            callbacks.map(
              (callback, index) =>
                callback.data && (
                  <div
                    key={index}
                    className='bg-white rounded shadow-sm border border-gray-200 overflow-hidden transition-all duration-300 hover:shadow-md'
                  >
                    {/* Callback Header */}
                    <div
                      className='p-4 cursor-pointer flex items-center justify-between'
                      onClick={() => toggleCallback(callback.name)}
                    >
                      <div className='flex items-center space-x-4'>
                        <div
                          className={`w-3 h-3 rounded-full ${
                            callback.type === 'error'
                              ? 'bg-red-500'
                              : 'bg-green-500'
                          }`}
                        ></div>
                        <div>
                          <h3 className='font-semibold text-gray-800'>
                            {callback.name}
                          </h3>
                          <p className='text-sm text-gray-500'>
                            {getTimeFromData(callback.data)}
                          </p>
                        </div>
                      </div>
                      <div className='flex items-center space-x-3'>
                        <span className='text-lg'>
                          {getStatusIcon(callback.type)}
                        </span>
                        <svg
                          className={`w-5 h-5 text-gray-400 transition-transform duration-300 ${
                            expandedCallbacks[callback.name] ? 'rotate-180' : ''
                          }`}
                          fill='none'
                          stroke='currentColor'
                          viewBox='0 0 24 24'
                        >
                          <path
                            strokeLinecap='round'
                            strokeLinejoin='round'
                            strokeWidth={2}
                            d='M19 9l-7 7-7-7'
                          />
                        </svg>
                      </div>
                    </div>

                    {/* Collapsible Content */}
                    {expandedCallbacks[callback.name] && (
                      <div className='border-t border-gray-100'>
                        <div className='p-4 bg-gray-50'>
                          <pre className='text-sm text-gray-800 bg-white p-4 rounded-lg border border-gray-200 overflow-x-auto max-h-96'>
                            {JSON.stringify(callback.data, null, 2)}
                          </pre>
                        </div>
                      </div>
                    )}
                  </div>
                ),
            )
          )}
        </div>

        {/* Footer */}
        <div className='text-center mt-12 text-gray-500 text-sm'>
          <p>
            Real-time monitoring • Mojaloop System •{' '}
            {new Date().toLocaleDateString()}
          </p>
        </div>
      </div>
    </div>
  );
}

export default Logs;
