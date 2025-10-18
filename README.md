# Tracking System

A modern shipment tracking system with AI-powered OCR for automatic data extraction from images.

## Features

### Customer Features
- 🔍 **Easy Tracking**: Query shipments by entering name and phone number
- 📦 **Real-time Status**: View current shipment status and tracking details
- 📱 **Responsive Design**: Works seamlessly on desktop and mobile devices
- 📄 **Receipt Viewing**: View uploaded receipts and labels directly

### Admin Features
- 📤 **Image Upload**: Upload receipt/label images for tracking records
- 🤖 **AI-Powered OCR**: Automatic text extraction from uploaded images
- ✍️ **Smart Data Extraction**: Automatically extracts **ALL** required data from images:
  - ✅ Tracking numbers (UPS, FedEx, USPS, LBC, J&T, and more)
  - ✅ Customer names (from "Name:", "To:", "Recipient:" labels)
  - ✅ Phone numbers (Philippine mobile and international formats)
- 📝 **Manual Override**: Option to manually enter or edit any extracted information
- 🔍 **Multiple Format Support**: Recognizes various courier and shipment formats
- 📊 **Track Management**: View, edit, and manage all tracking records
- 🔎 **Search & Filter**: Quickly find tracking records

### Status Options
- ⏳ Pending
- 🔄 Processing
- 🚚 In Transit
- 📦 Out for Delivery
- ✅ Delivered
- ❌ Cancelled

## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **OCR**: Tesseract.js
- **Icons**: Lucide React
- **Routing**: React Router DOM

## Getting Started

### Prerequisites
- Node.js 16+ installed
- Supabase account and project

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd template-web-1-9
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env` file in the root directory:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. Run database migrations:
- Go to your Supabase project dashboard
- Navigate to SQL Editor
- Run the migration files in order from the `supabase/migrations` folder

5. Start the development server:
```bash
npm run dev
```

6. Open your browser and navigate to `http://localhost:5173`

## Routes

- `/` - Customer tracking query interface
- `/admin` - Admin dashboard for managing tracking records

## Database Schema

### tracking_records
- `id` (uuid) - Primary key
- `tracking_number` (text) - Unique tracking identifier
- `customer_name` (text) - Customer full name
- `customer_phone` (text) - Customer phone number
- `status` (text) - Shipment status
- `notes` (text) - Additional notes
- `image_url` (text) - URL to uploaded image
- `extracted_data` (jsonb) - Raw OCR extracted data
- `created_at` (timestamp) - Creation timestamp
- `updated_at` (timestamp) - Last update timestamp
- `created_by` (uuid) - Admin who created the record

## Usage

### For Customers
1. Visit the homepage
2. Enter your full name and phone number
3. Click "Track Shipment"
4. View your tracking information and status

### For Admins
1. Navigate to `/admin`
2. Click "Add New Record"
3. Upload a receipt/label image
4. **OCR automatically extracts ALL data**:
   - ✅ Tracking number
   - ✅ Customer name
   - ✅ Phone number
   - All fields show a green "(Auto-extracted from image)" indicator
5. Review the extracted data (usually takes 2-10 seconds)
6. Edit any fields if OCR misread something
7. Select shipment status and add notes
8. Save the record

**That's it!** No manual typing of tracking numbers or customer details needed.

### OCR Data Extraction
The system automatically extracts from uploaded images:

**Tracking Numbers** - Supports multiple formats:
- UPS: `1ZXXXXXXXXXXXXXXXXX`
- FedEx/USPS: `12-22 digit numbers`
- LBC/J&T: `AB1234567890123`
- Generic: `ABC123456789`, `TRK-123-456`, `AWB12345`
- Any format with "Tracking:", "AWB:", "REF:" labels

**Customer Information:**
- Names (from labels like "Name:", "Customer:", "Consignee:", "To:", "Recipient:")
- Phone numbers (Philippine format 09XXXXXXXXX, +639XXXXXXXXX, or any 10-11 digits)
- Raw text stored for manual review if needed

## Build for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## Deployment

This project is configured for deployment on Vercel. The `vercel.json` configuration is already included.

1. Install Vercel CLI:
```bash
npm i -g vercel
```

2. Deploy:
```bash
vercel
```

## License

MIT License

## Support

For issues and questions, please open an issue on the repository.
