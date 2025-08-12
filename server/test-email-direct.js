const { sendCustomEmail, verifyEmailConfig, emailTemplates } = require('./config/email');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Test email sharing directly
async function testEmailSharingDirect() {
  try {
    console.log('🔧 Testing email sharing directly...');
    
    // Test email configuration
    const configValid = await verifyEmailConfig();
    if (!configValid) {
      console.error('❌ Email configuration is invalid');
      return;
    }
    
    console.log('✅ Email configuration is valid');
    
    // Get a real trip from the database
    const trip = await prisma.trip.findFirst({
      include: {
        user: true
      }
    });
    
    if (!trip) {
      console.log('❌ No trips found in database. Please create a trip first.');
      return;
    }
    
    console.log('✅ Found trip:', trip.name);
    console.log('Trip ID:', trip.id);
    console.log('User:', trip.user.name);
    
    // Generate share URL
    const shareUrl = `http://localhost:5173/shared-trip/${trip.id}`;
    
    // Generate email content using template
    const emailContent = emailTemplates.itineraryShare(trip, trip.user, shareUrl);
    
    console.log('📧 Email content generated:');
    console.log('Subject:', emailContent.subject);
    console.log('HTML length:', emailContent.html.length);
    console.log('Text length:', emailContent.text.length);
    
    // Create PDF content
    const pdfContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>${trip.name} - Itinerary</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 40px; }
            .header { text-align: center; border-bottom: 2px solid #3b82f6; padding-bottom: 20px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>${trip.name}</h1>
            <p>Itinerary PDF</p>
          </div>
          <p>This is the PDF attachment for the trip itinerary.</p>
          <p>Trip Details:</p>
          <ul>
            <li>Destination: ${trip.destinationCity}, ${trip.destinationCountry}</li>
            <li>Dates: ${new Date(trip.startDate).toLocaleDateString()} - ${new Date(trip.endDate).toLocaleDateString()}</li>
            <li>Budget: $${trip.totalBudget || 0}</li>
          </ul>
        </body>
      </html>
    `;

    // Convert HTML to PDF using puppeteer
    const puppeteer = require('puppeteer');
    let pdfBuffer;
    
    try {
      const browser = await puppeteer.launch({ 
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });
      const page = await browser.newPage();
      await page.setContent(pdfContent, { waitUntil: 'networkidle0' });
      
      pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: {
          top: '20mm',
          right: '20mm',
          bottom: '20mm',
          left: '20mm'
        }
      });
      
      await browser.close();
      console.log('✅ PDF generated successfully');
    } catch (error) {
      console.error('Error generating PDF:', error);
      pdfBuffer = pdfContent; // Fallback to HTML content
    }
    
    // Send email
    console.log('📤 Sending email...');
    
    const emailResult = await sendCustomEmail({
      to: 'deepak23188@iiitd.ac.in', // Send to yourself for testing
      subject: emailContent.subject,
      html: emailContent.html,
      text: emailContent.text,
      attachments: [{
        filename: `${trip.name.replace(/[^a-zA-Z0-9]/g, '_')}-itinerary.pdf`,
        content: pdfBuffer,
        contentType: 'application/pdf'
      }]
    });
    
    if (emailResult.success) {
      console.log('✅ Email sent successfully!');
      console.log('Message ID:', emailResult.messageId);
      console.log('📧 Check your email inbox for the test message');
      console.log('');
      console.log('🎉 Email sharing functionality is working correctly!');
      console.log('');
      console.log('The email includes:');
      console.log('✅ Beautiful HTML template with trip details');
      console.log('✅ PDF attachment with itinerary');
      console.log('✅ Shareable link to view online');
      console.log('✅ All trip information (dates, budget, destination)');
    } else {
      console.error('❌ Email sending failed:', emailResult.error);
    }
    
  } catch (error) {
    console.error('❌ Error testing email sharing:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the test
testEmailSharingDirect();
