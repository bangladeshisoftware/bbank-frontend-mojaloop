import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
} from '@mui/material';
// import MetaData from '@/components/MetaData'
import { ImSpinner4 } from 'react-icons/im';
import { BsSendCheckFill } from 'react-icons/bs';
import { useSocket } from '../context/SocketContext';
import swal from 'sweetalert';
import { AiOutlineBank } from 'react-icons/ai';
import Countdown from '../components/CountDown';
import { FiLoader } from 'react-icons/fi';
import SelectUserOption from '../components/SelectUserOption';
import { useAuth } from '../context/AuthContext';

const P2P = () => {
  const {
    resetState,
    alsputCallback,
    alsputErrorCallback,
    putQuoteCallback,
    putQuoteCallbackError,
    putTransferCallback,
    putTransferCallbackError,

    alsOracleVerifyCallback,
    alsOracleVerifyErrorCallback,
  } = useSocket();
  const { getProfile } = useAuth();
  const [amount, setAmount] = useState('');
  const [type, setType] = useState('P2P');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  // new
  const [idType, setIdType] = useState('');
  const [searchData, setSearchData] = useState({});
  const [receiverData, setReceiverData] = useState({});
  const [receiverNumber, setReceiverNumber] = useState('');
  const [alsVerifyErrorData, setAlsVerifyErrorData] = useState('');
  const [quoteData, setquoteData] = useState({});
  const [quoteHeaderData, setQuoteHeaderData] = useState({});
  const [quoteParamsId, setQuoteParamsId] = useState({});
  const [quoteVerifyErrorData, setQuoteVerifyErrorData] = useState('');
  const [transferErrorData, setTransferErrorData] = useState('');
  const [transferVerifyData, setTransferVerifyData] = useState({});
  const [selectedUser, setSelectUser] = useState('');
  const [amountLimit, setAmountLimit] = useState('');

  // step 1 - init
  const handleSearch = async () => {
    if (!selectedUser) {
      return swal('Warning!', 'Please select a sender merchant!', 'warning');
    }
    if (!idType || !receiverNumber) {
      swal('Warning!', 'Select ID Type and Enter Receiver Number!', 'warning');
      return;
    }
    setLoading(true);
    // if confirm in step 1, then call second function, because that already in selected.
    try {
      const res = await fetch(
        `${
          import.meta.env.VITE_APP_SERVER
        }/api/oracle-verify/${idType}/${receiverNumber}`,
        {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        },
      );
      if (res.ok) {
        return;
      } else {
        const message = 'Something went wrong!';
        swal('Failed!', message, 'error');
        setSearchData({});
        setReceiverData({});
        setStatus('');
        setSearchData({});
        setAlsVerifyErrorData('');
        setLoading(false);
      }

      console.log(data);
    } catch (error) {
      setLoading(false);
      console.error(error);
    }
  };
  // waite for callback - oracle, error
  useEffect(() => {
    if (alsOracleVerifyCallback && selectedUser && idType && receiverNumber) {
      console.log('full data: ', alsOracleVerifyCallback);
      console.log('required data: ', alsOracleVerifyCallback?.body?.fspId);
      SearchByParties(alsOracleVerifyCallback?.body?.fspId);
    } else {
      console.log('not matched the condition..');
    }
  }, [alsOracleVerifyCallback, alsOracleVerifyErrorCallback]);
  // transfer final search stage.

  const SearchByParties = async (recv_dfsp) => {
    if (!recv_dfsp) return;

    if (!selectedUser) {
      return swal('Warning!', 'Please select a sender merchant!', 'warning');
    }
    if (!idType || !receiverNumber) {
      swal('Warning!', 'Select ID Type and Enter Receiver Number!', 'warning');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(
        `${
          import.meta.env.VITE_APP_SERVER
        }/api/verify-parties/${recv_dfsp}/${idType}/${receiverNumber}`,
        {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        },
      );
      if (res.ok) {
        return;
      } else {
        const ress = (await res?.json()) || {};
        const message = ress?.message || 'Receiver Merchant dose not exits!';
        swal('Failed!', message, 'error');
        setSearchData({});
        setReceiverData({});
        setStatus('');
        setSearchData({});
        setAlsVerifyErrorData('');
        setLoading(false);
      }

      console.log(data);
    } catch (error) {
      setLoading(false);
      console.error(error);
    }
  };

  const handleQuote = async () => {
    if (!amount) {
      swal('Warning!', 'Enter Amount!', 'warning');
      return;
    }
    if (Number(amount) > Number(amountLimit)) {
      swal(
        'Limit overdue!',
        `Your single transaction limit is ${amountLimit}!`,
        'warning',
      );
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(
        `${import.meta.env.VITE_APP_SERVER}/api/init-quotes`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            payer_id: selectedUser,
            payee: searchData,
            amount,
            type: type,
          }), // now payerfsp default merchant id is 1
        },
      );
      if (res.ok) {
        return;
      } else {
        setquoteData({});
        setLoading(false);
        // display message not found payer account.
        swal('Not Exits', 'Something went wrong!', 'error');
      }
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  const handleTransfer = async () => {
    if (confirm('Are you sure you want to continue?')) {
      setLoading(true);
      try {
        const response = await fetch(
          `${import.meta.env.VITE_APP_SERVER}/api/init-transfer`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              quoteId: quoteParamsId,
              payer_fsp: quoteHeaderData?.['fspiop-destination'], // use bracket notation for keys with hyphen
              payee_fsp: quoteHeaderData?.['fspiop-source'],
              currency: quoteData?.payeeReceiveAmount?.currency,
              amount: quoteData?.payeeReceiveAmount?.amount,
              ilpPacket: quoteData?.ilpPacket,
              condition: quoteData?.condition,
              expiration: quoteData?.expiration,
            }),
          },
        );
        if (response.ok) {
          return;
        } else {
          swal(
            'Failed Transfer!',
            'Something went wrong to init Transfer request!',
            'error',
          );
          setLoading(false);
        }
      } catch (error) {
        setLoading(false);
      }
    }
  };

  const handleCancel = () => {
    setLoading(false);
    setProcessing(false);
    setStatus('');
    setSearchData({});
    setIdType('');
    setReceiverNumber('');
    setReceiverData({});
    setAmount('');
    setAlsVerifyErrorData('');
    setquoteData({});
    setQuoteVerifyErrorData('');
    setTransferVerifyData({});
    setTransferErrorData('');
    resetState();
  };

  useEffect(() => {
    if (putTransferCallback) {
      setAlsVerifyErrorData('');
      setQuoteVerifyErrorData('');
      setTransferErrorData('');
      setquoteData({});
      setQuoteHeaderData({});
      setQuoteParamsId({});
      setSearchData({});
      setTransferVerifyData(putTransferCallback?.body);
      setLoading(false);
      setStatus('view-transfer-info');
      getProfile();
    } else if (putTransferCallbackError) {
      setAlsVerifyErrorData('');
      setQuoteVerifyErrorData('');
      setTransferErrorData(
        putTransferCallbackError?.body?.errorInformation?.errorDescription,
      );
      setquoteData({});
      setQuoteHeaderData({});
      setQuoteParamsId({});
      setSearchData({});
      setTransferVerifyData({});
      setLoading(false);
      setStatus('view-transfer-info');
    } else if (putQuoteCallback) {
      setAlsVerifyErrorData('');
      setQuoteVerifyErrorData('');
      setquoteData(putQuoteCallback?.body);
      setQuoteHeaderData(putQuoteCallback?.headers);
      setQuoteParamsId(putQuoteCallback?.params?.id);
      setSearchData({});
      setLoading(false);
      setStatus('view-quote-info');
    } else if (alsputCallback) {
      setAlsVerifyErrorData('');
      setQuoteVerifyErrorData('');
      setSearchData(alsputCallback?.body);
      setReceiverData(alsputCallback?.body);
      setLoading(false);
      setStatus('view-search-info');
    } else if (alsputErrorCallback || alsOracleVerifyErrorCallback) {
      setAlsVerifyErrorData(
        alsputErrorCallback?.body?.errorInformation?.errorDescription ||
          alsOracleVerifyErrorCallback?.body?.errorInformation
            ?.errorDescription,
      );
      setQuoteVerifyErrorData('');
      setSearchData({});
      setReceiverData({});
      setLoading(false);
      setStatus('view-search-info');
    } else if (putQuoteCallbackError) {
      setAlsVerifyErrorData('');
      setQuoteVerifyErrorData(
        putQuoteCallbackError?.body?.errorInformation?.errorDescription,
      );
      setSearchData({});
      setReceiverData({});
      setquoteData({});
      setLoading(false);
      setStatus('view-quote-info');
    }
    null;
  }, [
    alsputCallback,
    alsputErrorCallback,
    alsOracleVerifyErrorCallback,
    putQuoteCallback,
    putQuoteCallbackError,
    putTransferCallback,
    putTransferCallbackError,
  ]);
  return (
    <div className='bg-gray-100 p-6 md:h-[86.8vh] h-[100%]'>
      <Box className='flex justify-center items-center mt-10'>
        {/* <MetaData /> */}

        <Box className='flex flex-col md:flex-row gap-40 py-5 '>
          {/* Sender Emulator */}
          <Box className='w-[280px] h-[560px] bg-white shadow-2xl rounded-[40px] relative overflow-hidden border-8 border-black flex flex-col justify-between'>
            <Box className='absolute top-2 left-1/2 -translate-x-1/2 w-24 h-1.5 bg-gray-800 rounded-full'></Box>
            <Box className='p-3 pt-10 '>
              <Typography variant='h6' fontWeight={700} color='primary'>
                Sender
              </Typography>
              {/* Dynamic Sender FSP Input */}
              {/* step 1 */}
              <div className='flex flex-col gap-4 mt-2.5'>
                {status == 'view-transfer-info' ? (
                  (transferErrorData && (
                    <>
                      <div className='mb-2 space-y border border-red-100 rounded-md shadow-sky-50 p-1.5 py-5 bg-red-50'>
                        <Typography variant='p' color='red'>
                          {transferErrorData}
                        </Typography>
                      </div>
                      <div className='mt-4 flex items-center gap-2'>
                        <Button
                          fullWidth
                          variant='contained'
                          color='danger'
                          className='text-white py-2 mt-4'
                          onClick={handleCancel}
                          disabled={loading}
                        >
                          Try again
                        </Button>
                      </div>
                    </>
                  )) || (
                    <div>
                      <Typography variant='p'>
                        Transfer is completed.
                      </Typography>
                      <div className='mb-2 mt-3 space-y border flex justify-center items-center border-green-100 rounded-md shadow-sky-50 p-1.5 py-3 bg-gray-50'>
                        <BsSendCheckFill className='text-blue-400' size={40} />
                      </div>
                      <div className='mt-4 flex items-center gap-2'>
                        <Button
                          fullWidth
                          variant='contained'
                          color='primary'
                          className='text-white py-2 mt-4'
                          onClick={handleCancel} // handle transfers.
                          disabled={loading}
                        >
                          Back to Home
                        </Button>
                      </div>
                    </div>
                  )
                ) : status == 'view-quote-info' ? (
                  (quoteVerifyErrorData && (
                    <>
                      <div className='mb-2 space-y border border-red-100 rounded-md shadow-sky-50 p-1.5 py-5 bg-red-50'>
                        <Typography variant='p' color='red'>
                          {quoteVerifyErrorData}
                        </Typography>
                      </div>
                      <div className='mt-4 flex items-center gap-2'>
                        <Button
                          fullWidth
                          variant='contained'
                          color='danger'
                          className='text-white py-2 mt-4'
                          onClick={handleCancel}
                          disabled={loading}
                        >
                          Try again
                        </Button>
                      </div>
                    </>
                  )) || (
                    <div>
                      <Typography variant='p'>Transfer Details:-</Typography>
                      <div className='mb-2 mt-3 space-y border border-green-100 rounded-md shadow-sky-50 p-1.5 bg-gray-50'>
                        <Typography>
                          Currency: {quoteData?.payeeReceiveAmount?.currency}
                        </Typography>
                        <Typography>
                          Amount: {quoteData?.payeeReceiveAmount?.amount}
                        </Typography>
                        <Typography>
                          Transfer Fee:{' '}
                          {typeof quoteData?.extensionList?.extension[0]
                            ?.value === 'number'
                            ? quoteData.extensionList.extension[0].value.toFixed(
                                2,
                              )
                            : '0.00'}
                        </Typography>
                        <Typography className='flex gap-2 text-red-600 py-2'>
                          Expired in:{' '}
                          <Countdown
                            onFinish={() => handleCancel()}
                            targetDate={quoteData?.expiration}
                          />
                        </Typography>
                      </div>
                      <div className='mt-4 flex items-center gap-2'>
                        <Button
                          fullWidth
                          variant='contained'
                          color='danger'
                          className='text-white py-2 mt-4'
                          onClick={handleCancel}
                          disabled={loading}
                        >
                          Cancel
                        </Button>
                        <Button
                          fullWidth
                          variant='contained'
                          color='primary'
                          className='text-white py-2 mt-4'
                          onClick={handleTransfer} // handle transfers.
                          disabled={loading}
                        >
                          {loading ? (
                            <div className='flex items-center gap-1'>
                              <ImSpinner4 className='animate-spin' />{' '}
                              <span>Waite...</span>
                            </div>
                          ) : (
                            'SEND'
                          )}
                        </Button>
                      </div>
                    </div>
                  )
                ) : status == 'view-search-info' ? (
                  (alsVerifyErrorData && (
                    <>
                      <div className='mb-2 space-y border border-red-100 rounded-md shadow-sky-50 p-1.5 py-5 bg-red-50'>
                        <Typography variant='p' color='red'>
                          {alsVerifyErrorData}
                        </Typography>
                      </div>
                      <div className='mt-4 flex items-center gap-2'>
                        <Button
                          fullWidth
                          variant='contained'
                          color='danger'
                          className='text-white py-2 mt-4'
                          onClick={handleCancel}
                          disabled={loading}
                        >
                          Search again
                        </Button>
                      </div>
                    </>
                    // search again.
                  )) || (
                    <div>
                      <div className='mb-2 space-y border border-green-100 rounded-md shadow-sky-50 p-1.5 bg-gray-50'>
                        <Typography variant='p'>
                          {searchData?.party?.name}
                        </Typography>
                        <Typography>
                          {
                            searchData?.party?.personalInfo?.complexName
                              ?.firstName
                          }
                        </Typography>
                        <Typography>
                          {
                            searchData?.party?.personalInfo?.complexName
                              ?.lastName
                          }
                        </Typography>
                        <Typography>
                          {searchData?.party?.partyIdInfo?.partyIdentifier}
                        </Typography>
                      </div>
                      <TextField
                        fullWidth
                        label='Enter Amount'
                        type='number'
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className='mb-4'
                      />
                      <div className='mt-4 flex items-center gap-2'>
                        <Button
                          fullWidth
                          variant='contained'
                          color='danger'
                          className='text-white py-2 mt-4'
                          onClick={handleCancel}
                          disabled={loading}
                        >
                          Cancel
                        </Button>
                        <Button
                          fullWidth
                          variant='contained'
                          color='primary'
                          className='text-white py-2 mt-4'
                          onClick={handleQuote}
                          disabled={loading}
                        >
                          {loading ? (
                            <div className='flex items-center gap-1'>
                              <ImSpinner4 className='animate-spin' />{' '}
                              <span>Waite...</span>
                            </div>
                          ) : (
                            'NEXT'
                          )}
                        </Button>
                      </div>
                    </div>
                  )
                ) : (
                  <>
                    <FormControl fullWidth className='mb-2'>
                      <SelectUserOption
                        onSelect={(id, al) => {
                          setSelectUser(id);
                          setAmountLimit(al);
                        }}
                        label='Sender Merchant'
                      />
                    </FormControl>
                    <Divider />
                    <FormControl fullWidth className='mb-2'>
                      <InputLabel id='type'>Payment Type</InputLabel>
                      <Select
                        labelId='type'
                        value={type}
                        label='Payment Type'
                        onChange={(e) => setType(e.target.value)}
                      >
                        <MenuItem value='P2P'>P2P Transfer</MenuItem>
                        <MenuItem value='INSTANT'>Instant Payment</MenuItem>
                        <MenuItem value='NPSB'>NPSB</MenuItem>
                        <MenuItem value='RTGS'>RTGS</MenuItem>
                        <MenuItem value='BEFTN'>BEFTN</MenuItem>
                      </Select>
                    </FormControl>
                    <FormControl fullWidth className='mb-2'>
                      <InputLabel id='payee_id_type'>
                        Receiver ID TYPE
                      </InputLabel>
                      <Select
                        labelId='payee_id_type'
                        value={idType}
                        label='ID Type'
                        onChange={(e) => setIdType(e.target.value)}
                      >
                        <MenuItem value='MSISDN'>MSISDN</MenuItem>
                        <MenuItem value='BUSINESS'>BUSINESS</MenuItem>
                      </Select>
                    </FormControl>
                    <TextField
                      fullWidth
                      label='Receiver Number'
                      value={receiverNumber}
                      onChange={(e) => setReceiverNumber(e.target.value)}
                      className='mb-2'
                    />
                    <div>
                      <Button
                        fullWidth
                        variant='contained'
                        color='primary'
                        className='text-white py-2 mt-4'
                        onClick={handleSearch}
                        disabled={loading}
                      >
                        {loading ? (
                          <div className='flex items-center gap-1'>
                            <ImSpinner4 className='animate-spin' />{' '}
                            <span>Searching...</span>
                          </div>
                        ) : (
                          'NEXT'
                        )}
                      </Button>
                    </div>
                  </>
                )}
              </div>
            </Box>
            <Box className='bg-gray-200 text-center py-2 text-xs'>
              Simulated Device • Sender
            </Box>
          </Box>
          <Box>
            <div className=' justify-center flex items-center rounded bg-black/70 text-white text-2xl px-2 h-140'>
              <span className='bg-blue-500 text-white w-20 h-20 rounded-full flex items-center justify-center'>
                Hub
              </span>
            </div>
          </Box>
          {/* Receiver Emulator */}
          <Box className='w-[280px] h-[560px]  bg-white shadow-2xl rounded-[40px] relative overflow-hidden border-8 border-black flex flex-col justify-between'>
            <Box className='absolute top-2 left-1/2 -translate-x-1/2 w-24 h-1.5 bg-gray-800 rounded-full'></Box>
            <Box className='p-3 pt-10'>
              <Typography variant='h6' fontWeight={700} color='success.main'>
                Receiver{' '}
                {receiverData?.party?.partyIdInfo?.fspId && (
                  <span>({receiverData?.party?.partyIdInfo?.fspId})</span>
                )}
              </Typography>
              {status == 'view-transfer-info' && !transferErrorData ? (
                <div>
                  <div className='mb-2 mt-3 space-y border flex justify-center items-center border-green-100 rounded-md shadow-sky-50 p-1.5 py-3 bg-gray-50'>
                    <AiOutlineBank color='green' size={40} />
                  </div>
                  <div className='mt-4 text-blue-500 font-semibold text-center flex items-center gap-2'>
                    Received {amount} Tk
                  </div>
                </div>
              ) : status == 'view-quote-info' && !quoteVerifyErrorData ? (
                <div className='mt-2'>
                  {receiverData && (
                    <div className='mb-2 flex items-center gap-1 justify-center space-y border border-green-100 rounded-md shadow-sky-50 p-1.5 bg-gray-50'>
                      <FiLoader className='animate-spin' />{' '}
                      <Typography variant='p'>waiting...</Typography>
                    </div>
                  )}
                  <Typography variant='p' className='text-orange-500'>
                    Payee server generate quote and send to the hub...
                  </Typography>
                </div>
              ) : status == 'view-search-info' && !alsVerifyErrorData ? (
                <div className='mt-2'>
                  {receiverData && (
                    <div className='mb-2 flex items-center gap-1 justify-center space-y border border-green-100 rounded-md shadow-sky-50 p-1.5 bg-gray-50'>
                      <FiLoader className='animate-spin' />{' '}
                      <Typography variant='p'>waiting...</Typography>
                    </div>
                  )}
                  <Typography variant='p' className='text-orange-500'>
                    Payee server is alert...
                  </Typography>
                </div>
              ) : (
                <Box className='flex flex-col items-center justify-center h-[360px]'>
                  <Typography variant='h6' color='success.main'>
                    Waiting for Transfer process...
                  </Typography>
                </Box>
              )}
            </Box>
            <Box className='bg-gray-200 text-center py-2 text-xs'>
              Simulated Device • Receiver
            </Box>
          </Box>
        </Box>
      </Box>
    </div>
  );
};

export default P2P;
