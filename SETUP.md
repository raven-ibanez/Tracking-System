# Setup Guide for Tracking System

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Set Up Supabase

#### Create a Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Wait for the database to be set up

#### Get Your Credentials
1. Go to Project Settings → API
2. Copy your project URL
3. Copy your `anon/public` API key

#### Create Environment File
Create a `.env` file in the root directory:
```env
VITE_SUPABASE_URL=your_project_url_here
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

### 3. Run Database Migrations

Go to your Supabase project dashboard:
1. Navigate to **SQL Editor**
2. Create a new query
3. Run the migration file: `supabase/migrations/20250117000000_create_tracking_system.sql`

Copy and paste the entire contents of the migration file and execute it.

### 4. Set Up Storage (for image uploads)

1. In your Supabase dashboard, go to **Storage**
2. Create a new bucket called `tracking-images`
3. Set the bucket to **public** (so uploaded images are accessible)
4. Configure the following policy for the bucket:

```sql
-- Allow public read access
CREATE POLICY "Public read access"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'tracking-images');

-- Allow authenticated users to upload
CREATE POLICY "Authenticated users can upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'tracking-images');

-- Allow authenticated users to update
CREATE POLICY "Authenticated users can update"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'tracking-images');

-- Allow authenticated users to delete
CREATE POLICY "Authenticated users can delete"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'tracking-images');
```

### 5. Set Up Authentication (Optional but Recommended)

For the admin panel, you should set up authentication:

1. Go to **Authentication** in Supabase dashboard
2. Configure **Email & Password** provider
3. Create an admin user:
   - Go to **Authentication → Users**
   - Click "Add User"
   - Enter email and password
   - Save

### 6. Start Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### 7. Access the Application

- **Customer Interface**: `http://localhost:5173/` (public tracking query)
- **Admin Panel**: `http://localhost:5173/admin` (requires authentication)

## Admin Panel Access

To access the admin panel, you'll need to implement authentication. Here's a quick way:

### Option 1: Add Simple Auth (Temporary for Testing)

If you want to test without full authentication, you can temporarily modify the admin panel to bypass auth checks. However, **DO NOT deploy to production without proper authentication**.

### Option 2: Implement Supabase Auth (Recommended)

1. Create a login component
2. Use Supabase's `auth.signInWithPassword()` method
3. Protect the `/admin` route with authentication checks

Example login code:
```typescript
import { supabase } from './lib/supabase';

const login = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });
  
  if (error) {
    console.error('Login error:', error);
    return;
  }
  
  // Redirect to admin panel
  window.location.href = '/admin';
};
```

## Testing the System

### Test Customer Tracking
1. First, add a test record in the admin panel
2. Go to the homepage
3. Enter the customer name and phone number you used
4. You should see the tracking information

### Test OCR Extraction
1. Go to `/admin`
2. Click "Add New Record"
3. Upload an image of a receipt or shipping label
4. **Wait 2-10 seconds** for OCR processing (progress bar shows status)
5. The system automatically extracts **ALL THREE** required fields:
   - ✅ **Tracking number** (supports UPS, FedEx, LBC, J&T, and many formats)
   - ✅ **Customer name** (from labels like "Name:", "Consignee:", "To:", "Recipient:")
   - ✅ **Phone number** (Philippine mobile 09XX or international +639XX)
6. Each auto-filled field shows a green "(Auto-extracted from image)" indicator
7. Review the extracted data - edit any fields if OCR misread
8. Select the shipment status and add notes
9. Save the record

**No manual data entry required!** Just upload the image and verify.

## Troubleshooting

### "Failed to fetch" errors
- Check that your Supabase URL and key are correct in `.env`
- Ensure the migrations have been run
- Verify that Row Level Security (RLS) policies are set up correctly

### Images not uploading
- Make sure the `tracking-images` bucket exists
- Check that the bucket is public
- Verify storage policies are configured correctly

### OCR not working
- Ensure Tesseract.js is properly installed
- Check browser console for errors
- Try with a clearer image (high contrast, good quality)

### Authentication issues
- Verify user exists in Supabase Auth
- Check that auth policies allow the required operations
- Ensure JWT token is being passed correctly

## Production Deployment

Before deploying to production:

1. ✅ Set up proper authentication
2. ✅ Configure environment variables on your hosting platform
3. ✅ Review and tighten security policies
4. ✅ Test all features thoroughly
5. ✅ Set up proper error handling and logging
6. ✅ Configure CORS if needed

### Deploy to Vercel

```bash
vercel
```

Make sure to add your environment variables in the Vercel dashboard:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

## Need Help?

If you encounter issues, check:
1. Supabase dashboard for error logs
2. Browser console for client-side errors
3. Network tab to see API requests/responses

## Features Overview

### For Customers
- Search tracking by name and phone
- View shipment status
- See delivery notes
- View receipt images

### For Admins
- Upload receipt/label images - **OCR extracts everything automatically**:
  - Tracking numbers (all formats)
  - Customer names
  - Phone numbers
- Zero manual data entry needed!
- Create and manage tracking records
- Update shipment status
- Add delivery notes
- Search and filter records
- Edit extracted data if OCR makes mistakes

Enjoy your new tracking system! 🚀

