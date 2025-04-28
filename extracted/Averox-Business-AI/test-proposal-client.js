// Test script to simulate the client-side proposal creation flow
// This will fail due to missing authentication - that's expected

async function testClientProposalCreation() {
  try {
    console.log('Testing client-side proposal creation flow...');
    
    const proposalData = {
      name: "Client Test Proposal",
      opportunityId: 91,
      accountId: 102,
      createdBy: 2, 
      status: "Draft",
      content: {},
      metadata: {}
    };
    
    console.log('Sending proposal data:', JSON.stringify(proposalData, null, 2));
    
    const response = await fetch('http://localhost:5000/api/proposals', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(proposalData),
    });
    
    const responseText = await response.text();
    console.log('Raw server response:', responseText);
    
    try {
      const result = JSON.parse(responseText);
      console.log('Parsed result:', result);
      
      if (result.success) {
        console.log('✅ Test passed: Proposal created successfully');
      } else {
        console.log('❌ Test failed: Proposal not created');
        console.log('Error message:', result.message || result.error);
      }
    } catch (parseError) {
      console.error('Failed to parse response as JSON:', parseError);
    }
  } catch (error) {
    console.error('Error during test:', error);
  }
}

// Run the test
testClientProposalCreation();