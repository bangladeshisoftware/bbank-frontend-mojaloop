app.post("/bulkTransfers", async (req, res) => {
  try {
    const bulkTransferRequest = req.body;
    const { 
      bulkTransferId, 
      bulkQuoteId, 
      payerFsp, 
      payeeFsp,
      individualTransfers,
      expiration 
    } = bulkTransferRequest;

    console.log(`📥 PAYEE: Received bulk transfer request`);
    console.log(`   Bulk Transfer ID: ${bulkTransferId}`);
    console.log(`   Payer FSP: ${payerFsp}`);
    console.log(`   Payee FSP: ${payeeFsp}`);

    // Emit to frontend
    io.emit("postBulkTransferCallback", {
      params: req.params,
      headers: req.headers,
      body: req.body
    });

    // Send 202 Accepted immediately
    res.status(202).send();

    // Process transfers
    const individualTransferResults = [];

    for (const transfer of individualTransfers) {
      try {
        const { 
          transferId, 
          transferAmount, 
          ilpPacket, 
          condition,
          extensionList 
        } = transfer;

        console.log(`🔄 Processing: ${transferId}`);

        // Validate ILP
        const isValid = validateILPPacket(ilpPacket, condition);
        
        if (!isValid) {
          throw new Error('Invalid ILP packet');
        }

        // Generate fulfilment
        const fulfilment = generateFulfilment(condition);

        // ✅ Fixed: Use proper timestamp
        const completedTimestamp = new Date().toISOString();

        console.log(`✅ Transfer ${transferId} COMMITTED`);
        console.log(`   Timestamp: ${completedTimestamp}`);

        // Build result
        const result = {
          transferId: transferId,
          transferState: "COMMITTED",
          fulfilment: fulfilment,
          completedTimestamp: completedTimestamp  // ✅ Fixed
        };

        if (extensionList) {
          result.extensionList = extensionList;
        }

        individualTransferResults.push(result);

      } catch (error) {
        console.error(`❌ Transfer failed: ${error.message}`);

        individualTransferResults.push({
          transferId: transfer.transferId,
          transferState: "ABORTED",
          errorInformation: {
            errorCode: "5000",
            errorDescription: error.message
          }
        });
      }
    }


    // Send response to Hub
    const url = `https://bulk-api.mojaloop.xyz/bulkTransfers/${bulkTransferId}`;

    const headers = {
      'Content-Type': 'application/vnd.interoperability.bulkTransfers+json;version=1.0',
      'Date': new Date().toUTCString(),
      'FSPIOP-Source': payeeFsp,          // ✅ Payee (BracBankDFSP)
      'FSPIOP-Destination': payerFsp,     // ✅ Payer (BangladeshBankDFSP)
      'FSPIOP-HTTP-Method': 'PUT',
      'FSPIOP-URI': `/bulkTransfers/${bulkTransferId}`
    };

    const payload = {
      individualTransferResults: individualTransferResults,
      bulkTransferState: "COMPLETED"
    };

    const response = await axios.put(url, payload, { headers });


  } catch (error) {
    
    // Send error response to Hub
    try {
      const url = `https://bulk-api.mojaloop.xyz/bulkTransfers/${req.body.bulkTransferId}/error`;
      
      await axios.put(url, {
        errorInformation: {
          errorCode: "2001",
          errorDescription: error.message
        }
      }, {
        headers: {
          'FSPIOP-Source': req.body.payeeFsp,
          'FSPIOP-Destination': req.body.payerFsp
        }
      });
    } catch (errResponse) {
      console.error("Failed to send error callback:", errResponse.message);
    }
    
    res.status(202).send();
  }
});

// Helper functions
function validateILPPacket(ilpPacket, condition) {
  try {
    if (!ilpPacket || !condition) return false;
    
    const decoded = Buffer.from(ilpPacket, 'base64').toString();
    const packet = JSON.parse(decoded);
    
    return packet && packet.amount;
  } catch (error) {
    return false;
  }
}

function generateFulfilment(condition) {
  return crypto.randomBytes(32).toString('base64url');
}

