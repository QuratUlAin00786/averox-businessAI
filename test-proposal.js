// Test script for the test-proposal endpoint
// Use built-in fetch

async function testProposalCreation() {
  try {
    console.log('Testing proposal creation...');
    
    const response = await fetch('http://localhost:5000/api/test-proposal', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({}), // Empty body, test endpoint doesn't need data
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
      }
    } catch (parseError) {
      console.error('Failed to parse response as JSON:', parseError);
    }
  } catch (error) {
    console.error('Error during test:', error);
  }
}

// Run the test
testProposalCreation();