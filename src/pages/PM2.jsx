import { Button } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { FaMoneyBillTransfer } from 'react-icons/fa6';
import { MdPersonSearch } from 'react-icons/md';
import { ImSpinner4 } from 'react-icons/im';
import swal from 'sweetalert';
import { useSocket } from '../context/SocketContext';
import SelectUserOption from '../components/SelectUserOption';

function PM2() {
  const {
    resetState,
    alsverifyCallback,
    alsputCallback,
    alsputErrorCallback,
    postBulkQuoteCallback,
    putBulkQuoteCallback,
    putBulkQuoteCallbackError,
    postBulkTransferCallback,
    putBulkTransferCallback,
    putBulkTransferCallbackError,
  } = useSocket();
  const [selectedUser, setSelectUser] = useState('');
  const [parties, setParties] = useState([
    { idType: 'MSISDN', identifier: '01234567891' },
    // { idType: 'MSISDN', identifier: '01789080344' },
  ]);
  const [recipients, setRecipients] = useState([]);
  const [individualTransfer, setIndividualTransfer] = useState([]);
  const [loading, setLoading] = useState(false);
  const [callback, setCallBack] = useState([]);
  const [callback2, setCallBack2] = useState([]);
  const [callback3, setCallBack3] = useState([]);
  const [bulkQuoteId, setBulkQuoteID] = useState('');
  const [payerFSP, setPayerFSP] = useState('');
  const [payeeFSP, setPayeeFSP] = useState('');

  useEffect(() => {
    if (alsputCallback) {
      setCallBack((prev) => [...prev, alsputCallback]);
      // success recipients
      const recipients = [...callback, alsputCallback]
        .filter((v) => !v?.body?.errorInformation?.errorDescription)
        .map((v) => ({
          partyIdType: v?.body?.party?.partyIdInfo?.partyIdType,
          partyIdentifier: v?.body?.party?.partyIdInfo?.partyIdentifier,
          fspId: v?.body?.party?.partyIdInfo?.fspId,
        }));
      setRecipients(recipients);
    }
    if (alsputErrorCallback) {
      setCallBack((prev) => [...prev, alsputErrorCallback]);
    }
    if (alsverifyCallback) {
      setCallBack((prev) => [...prev, alsverifyCallback]);
    }
    if (postBulkQuoteCallback) {
      setCallBack2((prev) => [...prev, postBulkQuoteCallback]);
    }
    if (putBulkQuoteCallback) {
      setCallBack2((prev) => [...prev, putBulkQuoteCallback]);
      const data = putBulkQuoteCallback?.body?.individualQuoteResults?.map(
        (v) => ({
          transferId: v?.quoteId,
          transferAmount: v?.transferAmount?.amount,
          currency: v?.transferAmount?.currency,
          amount: v?.transferAmount?.amount,
          ilpPacket: v?.ilpPacket,
          condition: v?.condition, // v?.payeeFspFee
          extensionList: {
            extension: [{ key: 'Fee', value: v?.payeeFspFee?.amount }],
          },
          expiration: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
        }),
      );
      setIndividualTransfer(data);
      setBulkQuoteID(putBulkQuoteCallback?.params?.bulkQuoteId);
      setPayerFSP(putBulkQuoteCallback?.headers?.['fspiop-destination']);
      setPayeeFSP(putBulkQuoteCallback?.headers?.['fspiop-source']);
    }
    if (putBulkQuoteCallbackError) {
      setCallBack2((prev) => [...prev, putBulkQuoteCallbackError]);
    }
  }, [
    alsverifyCallback,
    alsputCallback,
    alsputErrorCallback,
    postBulkQuoteCallback,
    putBulkQuoteCallback,
    putBulkQuoteCallbackError,
  ]);

  // Search
  const handleSearch = async () => {
    if (parties?.length < 1) return;
    setCallBack([]);
    setLoading(true);
    try {
      const res = await fetch(
        `${import.meta.env.VITE_APP_SERVER}/api/verify-bulk-parties`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(parties), // now payerfsp default merchant id is 1
        },
      );
      if (res.ok) {
        return;
      } else {
        const ress = (await res?.json()) || {};
        const message = ress?.message || 'Receiver Merchant dose not exits!';
        swal('Failed!', message, 'error');
      }
    } catch (error) {
      console.log('e', error);
    } finally {
      setLoading(false);
    }
  };
  // Quotes
  const handleSendQuotes = async () => {
    if (!selectedUser)
      return swal('Failed!', 'Sender Account is not selected yet!', 'warning');

    if (recipients?.length < 1)
      return swal('Failed!', 'Recipients is not define!', 'warning');
    const formate = {
      payer_id: selectedUser,
      recipients: recipients,
      amount_per_recipient: 10,
      disbursement_type: 'BONUS',
    };
    console.log(formate);

    setCallBack2([]);
    setLoading(true);

    try {
      const res = await fetch(
        `${import.meta.env.VITE_APP_SERVER}/api/init-bulk-quotes`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formate), // now payerfsp default merchant id is 1
        },
      );
      if (res.ok) {
        return;
      } else {
        const ress = (await res?.json()) || {};
        const message = ress?.message || 'Something went wrong!';
        swal('Failed!', message, 'error');
      }
    } catch (error) {
      console.log('e', error);
    } finally {
      setLoading(false);
    }
  };
  // Transfers
  const handleSendTransfers = async () => {
    if (!selectedUser)
      return swal('Failed!', 'Sender Account is not selected yet.', 'warning');

    if (
      individualTransfer?.length < 1 ||
      !bulkQuoteId ||
      !payerFSP ||
      !payeeFSP
    )
      return swal('Failed!', 'Transfer is not define.', 'warning');
    const formate = {
      bulkQuoteId: bulkQuoteId,
      payerFSP: payerFSP,
      payeeFSP: payeeFSP,
      individualTransfers: individualTransfer || [],
      expiration: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
    };
    console.log(formate);

    setCallBack3([]);
    setLoading(true);

    try {
      const res = await fetch(
        `${import.meta.env.VITE_APP_SERVER}/api/init-bulk-transfer`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            bulkQuoteId,
            payerFsp: payerFSP,
            payeeFsp: payeeFSP,
            individualTransfers: individualTransfer || [],
          }),
        },
      );
      if (res.ok) {
        return;
      } else {
        const ress = (await res?.json()) || {};
        const message = ress?.message || 'Something went wrong!';
        swal('Failed!', message, 'error');
      }
    } catch (error) {
      console.log('e', error);
    } finally {
      setLoading(false);
    }
  };
  return (
    <div>
      <div className='shadow m-5 py-6 px-8 rounded hover:border-blue-200 transition-all border border-gray-50'>
        <div className='mb-5 flex items-center gap-3'>
          <SelectUserOption
            onSelect={(id) => setSelectUser(id)}
            label='Choose Active Merchant'
          />
          <Button
            variant='contained'
            color='primary'
            className='text-white py-2 mt-4'
            onClick={handleSearch} // handle transfers.
            disabled={loading}
          >
            {loading ? (
              <div className='flex items-center gap-1'>
                <ImSpinner4 className='animate-spin' /> <span>Waite...</span>
              </div>
            ) : (
              <div className='flex items-center gap-1'>
                <MdPersonSearch size={25} /> <span>Verify Merchant</span>
              </div>
            )}
          </Button>
          <Button
            variant='contained'
            color='primary'
            className='text-white py-2 mt-4'
            onClick={handleSendQuotes} // handle transfers.
            disabled={loading}
          >
            {loading ? (
              <div className='flex items-center gap-1'>
                <ImSpinner4 className='animate-spin' /> <span>Waite...</span>
              </div>
            ) : (
              <div className='flex items-center gap-1'>
                <MdPersonSearch size={25} /> <span>Send Quotes</span>
              </div>
            )}
          </Button>
          <Button
            variant='contained'
            color='primary'
            className='text-white py-2 mt-4'
            onClick={handleSendTransfers}
            disabled={loading}
          >
            {loading ? (
              <div className='flex items-center gap-1'>
                <ImSpinner4 className='animate-spin' /> <span>Waite...</span>
              </div>
            ) : (
              <div className='flex items-center gap-1'>
                <MdPersonSearch size={25} /> <span>Send Transfers</span>
              </div>
            )}
          </Button>
        </div>
        <h2 className='ml-1 py-3'> GP2/ Bulk Transfers</h2>
        <div className='flex  gap-5 justify-around'>
          <div className='p-5 overflow-x-scroll hover:bg-white transition-all mt-4 border border-gray-300 w-full  rounded-md'>
            <b>
              Call Back:{' '}
              <span className='text-gray-600'>(Merchant Verify)</span>
            </b>
            <pre>{JSON.stringify(callback, null, 2)}</pre>
          </div>
          <div className='p-5 overflow-x-scroll hover:bg-white transition-all mt-4 border border-gray-300 w-full  rounded-md'>
            <b>
              Call Back: <span className='text-gray-600'>(bulk Quotes)</span>
            </b>
            <pre>{JSON.stringify(callback2, null, 2)}</pre>
          </div>
          <div className='p-5 overflow-x-scroll hover:bg-white transition-all mt-4 border border-gray-300 w-full  rounded-md'>
            <b>
              Call Back: <span className='text-gray-600'>(bulk Transfers)</span>
            </b>
            <pre>{JSON.stringify(callback3, null, 2)}</pre>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PM2;
