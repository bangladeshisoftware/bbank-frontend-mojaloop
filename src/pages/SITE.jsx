import React, { useState } from 'react'
import { Box, Typography, TextField, Button } from '@mui/material'
// import MetaData from '@/components/MetaData'
import { ImSpinner4 } from "react-icons/im";

const P2P = () => {
  const [amount, setAmount] = useState('')
  const [senderFsp, setSenderFsp] = useState('payerfsp') // Dynamic sender FSP
  const [receiverFsp, setReceiverFsp] = useState('payeefsp')
  const [senderBalance, setSenderBalance] = useState(2000)
  const [receiverBalance, setReceiverBalance] = useState(500)
  const [status, setStatus] = useState('')
  const [loading, setLoading] = useState(false)
  const [processing, setProcessing] = useState(false)
  // new
  const [number, setNumber] = useState("")
  const [searchData, setSearchData] = useState({})
  const [receiverNumber, setReceiverNumber] = useState("")
  const [receiverData, setReceiverData] = useState({})
  const [quoteData, setquoteData] = useState({})

  const handleSearch = async () => {
     if (!number || !receiverNumber) {
      swal('Warning!','Enter Sender or Receiver Number!','warning')
      return
    }

    setLoading(true)
    try {
      const res = await fetch(`${import.meta.env.VITE_APP_SERVER}/api/sims/search-party/MSISDN/${number}/MSISDN/${receiverNumber}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      })
      if(res.ok){
        // step 1
       const ress = await res?.json() || {}
        if(ress?.party_info?.payer?.status==200 && ress?.party_info?.payee?.status==200){
          setSearchData(ress?.party_info?.payer?.data)
          setReceiverData(ress?.party_info?.payee?.data)
          setStatus('view-search-info')
        }else{
          // reject not change the screen.
          const message = ress?.party_info?.payer?.status!=200 && ress?.party_info?.payee?.status!=200 ? 'Sender and Receiver both Party dose not exits.' : ress?.party_info?.payer?.status!=200 ? 'Sender Party dose not exits!' : 'Receiver Party dose not exits!'; 
           setSearchData({})
           setReceiverData({})
           setStatus('')
        // display message not found payer account.
        swal('Not Found', message, 'error')
        }
      }else{
        setSearchData({})
        setStatus('')
        // display message not found payer account.
        swal('Not Exits','Parties account dose not exits!', 'error')
      }

      console.log(data)
    } catch (error) {
      console.error(error)
    }finally{
      setLoading(false)
    }
  }

   const handleQuote = async () => {
     if (!amount) {
      swal('Warning!','Enter Amount!','warning')
      return
    }

    setLoading(true)
    try {
      const res = await fetch(`${import.meta.env.VITE_APP_SERVER}/api/sims/quote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body:JSON.stringify({payer: searchData, payee:receiverData, amount})
      })
      if(res.ok){
      const data = await res.json()
      // visible next screen.
      setquoteData(data)
      setStatus('view-quote-info') 
      console.log(data)
      }else{
        setquoteData({})
        setStatus('')
        // display message not found payer account.
        swal('Not Exits','Something went wrong!', 'error')
      }

    } catch (error) {
      console.error(error)
    }finally{
      setLoading(false)
    }
  }

  const handleCancel = ()=>{
    setLoading(false)
    setProcessing(false)
    setStatus("")
    setSearchData({})
    setNumber("")
    setReceiverNumber("")
    setReceiverData({})
    setAmount("")
  }
  return (
    <Box className='flex justify-center items-center bg-gray-100 p-6'>
      {/* <MetaData /> */}
      <Box className='flex flex-col md:flex-row gap-10 py-5 md:h-[81.4vh]'>

        {/* Sender Emulator */}
        <Box
          className='w-[280px] h-[560px] bg-white shadow-2xl rounded-[40px] relative overflow-hidden border-8 border-black flex flex-col justify-between'
        >
          <Box className='absolute top-2 left-1/2 -translate-x-1/2 w-24 h-1.5 bg-gray-800 rounded-full'></Box>
          <Box className='p-3 pt-10 '>
            <Typography variant='h6' fontWeight={700} color='primary'>
              Sender
            </Typography>
            {/* Dynamic Sender FSP Input */}
            {/* step 1 */}
            <div className='flex flex-col gap-4 mt-2.5'>
              {status == 'view-search-info' ? (<div>
                 <div className='mb-2 space-y border border-green-100 rounded-md shadow-sky-50 p-1.5 bg-gray-50'>
                  <Typography variant='p'>Display name: {searchData?.displayName}</Typography>
                  <Typography>First name: {searchData?.firstName}</Typography>
                  <Typography>Middle name: {searchData?.middleName}</Typography>
                  <Typography>Last name: {searchData?.lastName}</Typography>
                </div>
                 <TextField
              fullWidth
              label='Enter Amount'
              type='number'
              value={amount}
              onChange={e => setAmount(e.target.value)}
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
             {loading ? (<div className='flex items-center gap-1'><ImSpinner4 className='animate-spin' /> <span>Waite...</span></div>) : ('NEXT')} 
            </Button>
          </div>
              </div>) : (
              <>
              <TextField
              fullWidth
              label='Sender MSISDN'
              value={number}
              onChange={e => setNumber(e.target.value)}
              className='mb-2' />
                 <TextField
              fullWidth
              label='Receiver MSISDN'
              value={receiverNumber}
              onChange={e => setReceiverNumber(e.target.value)}
              className='mb-2' />
               <div>
              <Button
              fullWidth
              variant='contained'
              color='primary'
              className='text-white py-2 mt-4'
              onClick={handleSearch}
              disabled={loading}
            >
             {loading ? (<div className='flex items-center gap-1'><ImSpinner4 className='animate-spin' /> <span>Searching...</span></div>) : ('NEXT')} 
            </Button>
          </div>
              </>
              )
            }
            </div>

         
          </Box>
          <Box className='bg-gray-200 text-center py-2 text-xs'>
            Simulated Device • Sender
          </Box>
        </Box>

        {/* Receiver Emulator */}
        <Box
          className='w-[280px] h-[560px]  bg-white shadow-2xl rounded-[40px] relative overflow-hidden border-8 border-black flex flex-col justify-between'
        >
          <Box className='absolute top-2 left-1/2 -translate-x-1/2 w-24 h-1.5 bg-gray-800 rounded-full'></Box>
          <Box className='p-3 pt-10'>
            <Typography variant='h6' fontWeight={700} color='success.main'>
              Receiver
            </Typography>
            {status == 'view-search-info' ? (
              <div className='mt-2'>
                <div className='mb-2 space-y border border-green-100 rounded-md shadow-sky-50 p-1.5 bg-gray-50'>
                  <Typography variant='p'>Display name: {receiverData?.displayName}</Typography>
                  <Typography>First name: {receiverData?.firstName}</Typography>
                  <Typography>Middle name: {receiverData?.middleName}</Typography>
                  <Typography>Last name: {receiverData?.lastName}</Typography>
                </div>
                  </div>
            ) : (
               <Box className='flex flex-col items-center justify-center h-[360px]'>
              <Typography variant='h6' color='success.main'>
                Waiting for Transfer process...
              </Typography>
            </Box>
            ) }

           
          </Box>
          <Box className='bg-gray-200 text-center py-2 text-xs'>
            Simulated Device • Receiver
          </Box>
        </Box>
      </Box>

    </Box>
  )
}

export default P2P
