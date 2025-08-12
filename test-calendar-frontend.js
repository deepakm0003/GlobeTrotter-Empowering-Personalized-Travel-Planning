// Frontend Calendar Test Script
// Run this in the browser console on the calendar page

async function testCalendarFrontend() {
  console.log('🧪 Testing Calendar Frontend...\n');

  try {
    // Test 1: Check if trips are loaded
    console.log('1. Checking if trips are loaded...');
    const tripElements = document.querySelectorAll('option[value]');
    console.log('✅ Found', tripElements.length, 'trip options');

    // Test 2: Try to open the Add Event modal
    console.log('\n2. Testing Add Event modal...');
    const addEventButton = document.querySelector('button:contains("Add Event")') || 
                          document.querySelector('button[onclick*="setShowAddEvent"]') ||
                          Array.from(document.querySelectorAll('button')).find(btn => 
                            btn.textContent.includes('Add Event')
                          );
    
    if (addEventButton) {
      console.log('✅ Add Event button found');
      addEventButton.click();
      
      // Wait for modal to appear
      setTimeout(() => {
        const modal = document.querySelector('.fixed.inset-0');
        if (modal) {
          console.log('✅ Add Event modal opened successfully');
          
          // Test 3: Check form fields
          console.log('\n3. Checking form fields...');
          const tripSelect = modal.querySelector('select');
          const nameInput = modal.querySelector('input[type="text"]');
          const dateInput = modal.querySelector('input[type="date"]');
          
          if (tripSelect) console.log('✅ Trip selection field found');
          if (nameInput) console.log('✅ Event name field found');
          if (dateInput) console.log('✅ Event date field found');
          
          // Test 4: Try to fill and submit form
          if (tripSelect && nameInput && dateInput) {
            console.log('\n4. Testing form submission...');
            
            // Select first available trip
            if (tripSelect.options.length > 1) {
              tripSelect.value = tripSelect.options[1].value;
              tripSelect.dispatchEvent(new Event('change'));
              console.log('✅ Trip selected:', tripSelect.options[1].text);
            }
            
            // Fill in event name
            nameInput.value = 'Test Event ' + Date.now();
            nameInput.dispatchEvent(new Event('input'));
            console.log('✅ Event name filled');
            
            // Set date to tomorrow
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            dateInput.value = tomorrow.toISOString().split('T')[0];
            dateInput.dispatchEvent(new Event('change'));
            console.log('✅ Event date set');
            
            // Try to submit
            const submitButton = modal.querySelector('button:contains("Add Event")') ||
                               Array.from(modal.querySelectorAll('button')).find(btn => 
                                 btn.textContent.includes('Add Event')
                               );
            
            if (submitButton) {
              console.log('✅ Submit button found, attempting to submit...');
              submitButton.click();
            }
          }
          
        } else {
          console.log('❌ Modal did not open');
        }
      }, 500);
      
    } else {
      console.log('❌ Add Event button not found');
    }

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Helper function to find elements by text content
function containsText(selector, text) {
  return Array.from(document.querySelectorAll(selector)).find(el => 
    el.textContent.includes(text)
  );
}

// Run the test
testCalendarFrontend();
