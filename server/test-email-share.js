const { sendCustomEmail, verifyEmailConfig, emailTemplates } = require('./config/email');

// Test email configuration and sending
async function testEmailShare() {
  console.log('🔧 Testing email configuration...');
  
  // Test email configuration
  const configValid = await verifyEmailConfig();
  if (!configValid) {
    console.error('❌ Email configuration is invalid');
    return;
  }
  
  console.log('✅ Email configuration is valid');
  
  // Create a mock trip for testing
  const mockTrip = {
    id: 'test-trip-123',
    name: 'Test Trip to Paris',
    description: 'A wonderful trip to the City of Light',
    destinationCity: 'Paris',
    destinationCountry: 'France',
    startDate: new Date('2024-06-15'),
    endDate: new Date('2024-06-22'),
    totalBudget: 2500.00,
    estimatedCost: 2300.00,
    coverPhoto: 'https://images.pexels.com/photos/460621/pexels-photo-460621.jpeg'
  };
  
  const mockSender = {
    name: 'John Doe',
    email: 'john@example.com'
  };
  
  const shareUrl = 'http://localhost:5173/shared-trip/test-trip-123';
  
  // Generate email content using template
  const emailContent = emailTemplates.itineraryShare(mockTrip, mockSender, shareUrl);
  
  console.log('📧 Email content generated:');
  console.log('Subject:', emailContent.subject);
  console.log('HTML length:', emailContent.html.length);
  console.log('Text length:', emailContent.text.length);
  
  // Create a simple PDF content for testing
  const pdfContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>${mockTrip.name} - Test PDF</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 40px; }
          .header { text-align: center; border-bottom: 2px solid #3b82f6; padding-bottom: 20px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>${mockTrip.name}</h1>
          <p>Test PDF Attachment</p>
        </div>
        <p>This is a test PDF attachment for the email sharing feature.</p>
        <p>Trip Details:</p>
        <ul>
          <li>Destination: ${mockTrip.destinationCity}, ${mockTrip.destinationCountry}</li>
          <li>Dates: ${mockTrip.startDate.toLocaleDateString()} - ${mockTrip.endDate.toLocaleDateString()}</li>
          <li>Budget: $${mockTrip.totalBudget}</li>
        </ul>
      </body>
    </html>
  `;
  
  // Test sending email
  console.log('📤 Sending test email...');
  
  try {
    const emailResult = await sendCustomEmail({
      to: 'deepak23188@iiitd.ac.in', // Send to yourself for testing
      subject: emailContent.subject,
      html: emailContent.html,
      text: emailContent.text,
      attachments: [{
        filename: `${mockTrip.name.replace(/[^a-zA-Z0-9]/g, '_')}-itinerary.pdf`,
        content: pdfContent,
        contentType: 'application/pdf'
      }]
    });
    
    if (emailResult.success) {
      console.log('✅ Email sent successfully!');
      console.log('Message ID:', emailResult.messageId);
      console.log('📧 Check your email inbox for the test message');
    } else {
      console.error('❌ Email sending failed:', emailResult.error);
    }
  } catch (error) {
    console.error('❌ Error sending email:', error);
  }
}

// Run the test
testEmailShare().catch(console.error);
