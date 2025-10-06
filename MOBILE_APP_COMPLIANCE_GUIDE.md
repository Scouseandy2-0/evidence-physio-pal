# PhysioEvidence Mobile App - Store Compliance Guide

## App Information

### Basic Details
- **App Name**: PhysioEvidence - Evidence-Based Physiotherapy
- **Short Name**: PhysioEvidence
- **Bundle ID (iOS)**: app.lovable.a02e8b8d2be54928a892be4933ee8029
- **Package Name (Android)**: app.lovable.a02e8b8d2be54928a892be4933ee8029
- **Version**: 1.0.0
- **Category**: Medical, Health, Education

### App Description
Evidence-based physiotherapy platform for research, protocols, and patient management. Provides healthcare professionals with access to clinical evidence, treatment protocols, patient management tools, and CPD tracking.

---

## Technical Stack

### Framework & Core Technologies
- **Framework**: React 18.3.1 with TypeScript
- **Mobile Framework**: Capacitor 7.4.3
- **Build Tool**: Vite
- **UI Framework**: Tailwind CSS with shadcn/ui components
- **Backend**: Supabase (PostgreSQL database, Authentication, Edge Functions)
- **API Base URL**: https://xbonrxqrzkuwxovyqrxx.supabase.co

### Key Dependencies
- @capacitor/core: ^7.4.3
- @capacitor/ios: ^7.4.3
- @capacitor/android: ^7.4.3
- @supabase/supabase-js: ^2.56.0
- react-router-dom: ^6.30.1
- @tanstack/react-query: ^5.83.0

---

## App Store Compliance Requirements

### 1. Privacy Policy (REQUIRED)
**Status**: ⚠️ NEEDS TO BE CREATED

You must create and host a privacy policy that covers:

#### Data Collection
- **User Authentication Data**: Email, password (hashed), name, professional title
- **Healthcare Professional Data**: License number, registration number, specialization, healthcare role, department
- **Usage Analytics**: Login times, feature usage, search queries, evidence views
- **Patient Data** (HIPAA/GDPR sensitive):
  - Patient names, DOB, conditions
  - Session notes and treatment records
  - Assessment results
- **CPD Records**: Training activities, certificates, hours claimed
- **Study Group Data**: Group memberships, discussions
- **Subscription Data**: Stripe customer ID, subscription tier, payment status

#### Data Usage
- Providing personalized healthcare professional tools
- Evidence-based research access
- Patient management (healthcare professionals only)
- CPD tracking and certification
- Collaboration features
- Subscription management

#### Data Sharing
- **Supabase**: Backend infrastructure (USA/EU servers)
- **Stripe**: Payment processing
- **OpenAI API**: AI-powered features (evidence summarization, chat)
- **No third-party advertising or tracking**

#### Data Retention
- User accounts: Until deletion requested
- Patient data: Follows healthcare retention requirements
- Analytics: Aggregated, 2 years
- Audit logs: 7 years (compliance requirement)

#### User Rights
- Access personal data
- Request data deletion
- Export data
- Opt-out of analytics

**Required URLs**:
- Privacy Policy URL: `https://[yourdomain.com]/privacy`
- Terms of Service URL: `https://[yourdomain.com]/terms`

### 2. Age Rating

#### Apple App Store
**Recommended Rating**: 17+ (Medical/Treatment Information)
- Contains unrestricted access to medical information
- Healthcare professional tools
- Patient data management

#### Google Play Store
**Recommended Rating**: Mature 17+
- Medical information and advice
- Professional healthcare tools

### 3. App Permissions (iOS)

Add to `ios/App/App/Info.plist`:

```xml
<!-- Camera (if implementing document scanning) -->
<key>NSCameraUsageDescription</key>
<string>PhysioEvidence needs camera access to scan documents and certificates for CPD tracking.</string>

<!-- Photo Library -->
<key>NSPhotoLibraryUsageDescription</key>
<string>PhysioEvidence needs access to save and retrieve documents related to your professional development.</string>

<!-- Local Network (for offline functionality) -->
<key>NSLocalNetworkUsageDescription</key>
<string>PhysioEvidence needs local network access to sync data when available.</string>
```

### 4. App Permissions (Android)

Add to `android/app/src/main/AndroidManifest.xml`:

```xml
<!-- Internet access (already included) -->
<uses-permission android:name="android.permission.INTERNET" />

<!-- Network state -->
<uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />

<!-- Camera (if implementing document scanning) -->
<uses-permission android:name="android.permission.CAMERA" />

<!-- Storage (for documents/certificates) -->
<uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />
<uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" 
                 android:maxSdkVersion="28" />
```

---

## Healthcare Compliance

### HIPAA Compliance (USA)
**Status**: ⚠️ REQUIRES BUSINESS ASSOCIATE AGREEMENT

#### Current Security Measures
- ✅ Row-Level Security (RLS) enabled on all tables
- ✅ Patient data access logging (`patient_access_logs` table)
- ✅ Healthcare role verification required
- ✅ License verification system
- ✅ Audit trails for sensitive operations
- ✅ Encrypted data transmission (HTTPS/TLS)
- ✅ Password strength requirements
- ✅ Rate limiting on API endpoints

#### Required Actions
1. **Supabase BAA**: Contact Supabase for Business Associate Agreement
2. **Stripe BAA**: If processing healthcare payments
3. **Data Encryption**: Enable database encryption at rest (Supabase Pro plan)
4. **Audit Logs**: Ensure 7-year retention of access logs
5. **Breach Notification**: Implement procedures within 60 days
6. **User Training**: Healthcare professionals must acknowledge HIPAA training

### GDPR Compliance (EU)
**Status**: ⚠️ PARTIALLY IMPLEMENTED

#### Required Features
- ✅ Right to access data
- ✅ Right to deletion (cascade delete on user)
- ⚠️ Data export (needs implementation)
- ⚠️ Cookie consent banner (needs implementation)
- ✅ Transparent data processing
- ✅ Audit logging

#### Required Actions
1. Implement data export functionality
2. Add cookie consent management
3. Designate Data Protection Officer (DPO)
4. Update privacy policy with GDPR specifics

---

## Authentication & Security

### Authentication Methods
- **Email/Password**: Primary method (Supabase Auth)
- **Email Verification**: ⚠️ Currently disabled (enable in production)
- **Password Reset**: Implemented via Supabase
- **Session Management**: Automatic refresh tokens

### User Roles System
```typescript
// Healthcare Roles
enum healthcare_role {
  'physiotherapist',
  'physical_therapist', 
  'sports_therapist',
  'occupational_therapist',
  'medical_doctor',
  'nurse_practitioner',
  'student',
  'researcher'
}

// Admin Roles (separate table)
enum admin_role {
  'super_admin',
  'admin',
  'moderator'
}
```

### Security Features
- Row-Level Security on all database tables
- License verification for healthcare professionals
- Patient access requires:
  1. Healthcare role assigned
  2. License verified
  3. Admin approval for patient access
  4. Active patient assignment
- Rate limiting on sensitive operations
- Security event audit logging
- IP address logging for patient access

---

## Database Schema

### Core Tables
1. **profiles** - User profile data
2. **admin_users** - Admin role assignments (separate from profiles)
3. **subscribers** - Stripe subscription data
4. **patients** - Patient records (restricted access)
5. **patient_sessions** - Treatment session records
6. **patient_assignments** - Therapist-patient relationships
7. **patient_access_logs** - Audit trail
8. **conditions** - Medical conditions database
9. **evidence** - Research evidence database
10. **treatment_protocols** - Treatment protocol library
11. **assessment_tools** - Clinical assessment tools
12. **cpd_activities** - CPD tracking
13. **study_groups** - Collaboration groups
14. **user_activity_stats** - Usage analytics
15. **notifications** - User notifications

### Database Functions (Security Definer)
- `is_admin()` - Check admin status
- `is_verified_admin()` - Check verified healthcare admin
- `secure_assign_healthcare_role()` - Prevent self-escalation
- `approve_patient_access()` - Admin-only patient access approval
- `assign_patient_to_therapist()` - Secure patient assignment
- `check_rate_limit()` - Rate limiting
- `audit_security_event()` - Security logging

---

## API Integration

### Supabase Edge Functions
Located in `supabase/functions/`:

1. **ai-chat** - AI chatbot for healthcare queries (OpenAI)
2. **ai-evidence-summarizer** - Evidence summarization (OpenAI)
3. **text-to-speech** - Audio generation for evidence
4. **pubmed-integration** - PubMed research integration
5. **cochrane-integration** - Cochrane Library integration
6. **pedro-integration** - PEDro database integration
7. **guidelines-integration** - Clinical guidelines
8. **evidence-sync** - Background evidence synchronization
9. **generate-condition-protocols** - AI protocol generation
10. **create-checkout** - Stripe checkout session
11. **check-subscription** - Verify subscription status
12. **customer-portal** - Stripe customer portal
13. **stripe-webhook** - Handle Stripe events
14. **validate-promo-code** - Promo code validation
15. **security-check** - Security scanning
16. **admin-populate** - Admin data population
17. **realtime-chat** - Real-time collaboration

### Required API Keys (Environment Variables)
- `OPENAI_API_KEY` - OpenAI API access
- `STRIPE_SECRET_KEY` - Stripe payments
- `SUPABASE_URL` - Backend URL
- `SUPABASE_ANON_KEY` - Public API key
- `SUPABASE_SERVICE_ROLE_KEY` - Admin operations

---

## Subscription & Monetization

### Stripe Integration
- **Payment Processor**: Stripe
- **Subscription Tiers**:
  - Free: Basic access
  - Basic: £3.99/month
  - Professional: £9.99/month
  - Enterprise: £19.99/month

### Features by Tier
#### Free
- Browse conditions
- View validated protocols
- Limited evidence access

#### Premium (All paid tiers)
- Unlimited evidence access
- AI evidence summarizer
- AI clinical chat assistant
- Patient management
- Custom protocol builder
- CPD tracking
- Study groups
- Advanced analytics

### In-App Purchase Setup

#### iOS (StoreKit)
Not currently implemented. To add:
1. Configure App Store Connect
2. Create subscription products
3. Implement StoreKit 2
4. Alternative: Use Stripe web checkout (current implementation)

#### Android (Google Play Billing)
Not currently implemented. To add:
1. Configure Google Play Console
2. Create subscription products
3. Implement Google Play Billing Library
4. Alternative: Use Stripe web checkout (current implementation)

**Current Implementation**: Web-based Stripe checkout (opens in browser)

---

## Build & Deployment Instructions

### Prerequisites
```bash
npm install -g @capacitor/cli @ionic/cli
```

### Build Process

#### 1. Install Dependencies
```bash
npm install
```

#### 2. Build Web Assets
```bash
npm run build
```

#### 3. Sync Native Platforms
```bash
npx cap sync ios
npx cap sync android
```

#### 4. iOS Build (macOS only)

##### Development
```bash
npx cap open ios
```

Then in Xcode:
1. Select your development team
2. Update Bundle Identifier if needed
3. Configure signing certificates
4. Build and run on simulator/device

##### Production
1. Archive the app (Product > Archive)
2. Validate with App Store
3. Upload to App Store Connect
4. Submit for review

##### iOS Requirements
- Xcode 14+ (latest stable recommended)
- macOS 12.5+
- Apple Developer Account ($99/year)
- Provisioning profiles and certificates
- App Store Connect access

#### 5. Android Build

##### Development
```bash
npx cap open android
```

Then in Android Studio:
1. Build > Build Bundle(s) / APK(s)
2. Run on emulator/device

##### Production
1. Generate signed APK/Bundle:
```bash
cd android
./gradlew bundleRelease
```

2. Sign the bundle with your keystore
3. Upload to Google Play Console
4. Submit for review

##### Android Requirements
- Android Studio (latest stable)
- Java JDK 11+
- Android SDK 33+ (target SDK 34 recommended)
- Keystore file for signing
- Google Play Developer Account ($25 one-time)

### Environment Configuration

#### Development
Use hot-reload for testing:
```json
// capacitor.config.ts
server: {
  url: "https://a02e8b8d-2be5-4928-a892-be4933ee8029.lovableproject.com",
  cleartext: true
}
```

#### Production
Remove server configuration:
```json
// capacitor.config.ts - Production
server: {
  androidScheme: 'https',
  cleartext: false
}
```

---

## App Store Submission Checklist

### Apple App Store

#### Preparation
- [ ] Create App Store Connect listing
- [ ] Prepare app icons (1024x1024px)
- [ ] Create screenshots (all device sizes)
- [ ] Write app description (max 4000 characters)
- [ ] Define keywords (max 100 characters)
- [ ] Prepare privacy policy URL
- [ ] Prepare support URL
- [ ] Select age rating
- [ ] Configure in-app purchases (if using StoreKit)

#### App Review Information
- [ ] Demo account credentials (for review)
- [ ] Notes about healthcare professional verification
- [ ] Explanation of patient data handling
- [ ] HIPAA compliance documentation

#### Required Assets
- App Icon: 1024x1024px (no transparency, no rounded corners)
- Screenshots:
  - iPhone 6.7": 1290x2796px (3 required)
  - iPhone 6.5": 1284x2778px
  - iPad Pro (12.9"): 2048x2732px (if supporting iPad)

#### Testing
- [ ] TestFlight beta testing
- [ ] Test all user flows
- [ ] Test subscription flows
- [ ] Test on multiple device sizes
- [ ] Verify privacy permissions

### Google Play Store

#### Preparation
- [ ] Create Google Play Console listing
- [ ] Prepare app icons (512x512px)
- [ ] Create screenshots (phone and tablet)
- [ ] Create feature graphic (1024x500px)
- [ ] Write app description (short and full)
- [ ] Prepare privacy policy URL
- [ ] Select content rating (IARC)
- [ ] Configure in-app products (if using Google Play Billing)

#### App Review Information
- [ ] Demo account credentials
- [ ] Healthcare professional verification notes
- [ ] HIPAA compliance documentation
- [ ] Sensitive permissions explanation

#### Required Assets
- App Icon: 512x512px (32-bit PNG)
- Feature Graphic: 1024x500px (JPG or PNG)
- Screenshots:
  - Phone: Min 320px, Max 3840px (2-8 required)
  - 7" Tablet: Min 320px (optional)
  - 10" Tablet: Min 320px (optional)

#### Testing
- [ ] Internal testing track
- [ ] Closed testing (alpha/beta)
- [ ] Test subscription flows
- [ ] Test on multiple devices
- [ ] Pre-launch report review

---

## App Store Optimization (ASO)

### Keywords (iOS)
physiotherapy, physical therapy, evidence based, clinical guidelines, treatment protocols, patient management, CPD, healthcare professional, medical education, clinical research

### Search Terms (Android)
Same as above, plus:
physio, rehab, rehabilitation, sports therapy, evidence, clinical practice, medical app

### Screenshots Strategy
1. **Hero Shot**: Main dashboard with evidence search
2. **Feature 1**: Treatment protocol builder
3. **Feature 2**: Patient management interface
4. **Feature 3**: Evidence database with AI summary
5. **Feature 4**: CPD tracking dashboard

### App Preview Video (Optional but Recommended)
- Duration: 15-30 seconds
- Show key features: search, protocols, patient management
- Highlight AI assistant
- End with CPD tracking

---

## Post-Launch Monitoring

### Analytics to Track
- User acquisition source
- Feature usage (via `user_activity_stats`)
- Subscription conversion rates
- Crash reports
- User retention
- Average session duration
- Most-used features

### App Performance Monitoring
- Implement Sentry or Firebase Crashlytics
- Monitor API response times
- Track database query performance
- Monitor subscription webhook failures

### User Feedback
- Respond to app store reviews
- In-app feedback mechanism
- Support email: [your-support-email]

---

## Legal & Compliance Documents Required

### 1. Privacy Policy
**Must include**:
- Data controller information
- Types of data collected
- Legal basis for processing (GDPR)
- Data retention periods
- User rights
- Contact information
- Cookie policy
- Third-party services (Supabase, Stripe, OpenAI)

### 2. Terms of Service
**Must include**:
- User eligibility (healthcare professionals)
- License verification requirements
- Prohibited uses
- Intellectual property rights
- Limitation of liability
- Medical disclaimer
- Subscription terms
- Termination conditions

### 3. HIPAA Business Associate Agreement
**Required from**:
- Supabase (database provider)
- Any cloud service handling PHI

### 4. Medical Disclaimer
```
PhysioEvidence is a clinical decision support tool for qualified 
healthcare professionals. It is not a substitute for professional 
medical judgment. All treatment decisions should be made by qualified 
healthcare providers based on individual patient assessment. The 
information provided is for educational and informational purposes only.
```

### 5. Professional Liability Insurance
- Recommended for app owner
- Covers potential misuse or errors in clinical content

---

## Support & Maintenance

### User Support Channels
- Email support: [your-support-email]
- In-app help documentation
- FAQ section
- Video tutorials (recommended)

### Update Strategy
- **Security updates**: Immediate (critical patches)
- **Bug fixes**: Within 48 hours
- **Feature updates**: Monthly or bi-monthly
- **Content updates**: Evidence database should update weekly

### Compliance Monitoring
- Review RLS policies quarterly
- Audit access logs monthly
- Update clinical content regularly
- Renew BAAs annually
- Review app permissions yearly

---

## Contact Information

### Technical Support
- Developer Email: [your-email]
- Support Email: [support-email]
- Website: [your-website]

### Legal
- Privacy Policy: [privacy-url]
- Terms of Service: [terms-url]
- Data Protection Officer: [dpo-email]

### App Store Presence
- Apple App Store: [pending]
- Google Play Store: [pending]
- App Website: [website-url]

---

## Quick Reference

### App Identifiers
```
iOS Bundle ID: app.lovable.a02e8b8d2be54928a892be4933ee8029
Android Package: app.lovable.a02e8b8d2be54928a892be4933ee8029
App Name: PhysioEvidence
```

### URLs
```
API Base: https://xbonrxqrzkuwxovyqrxx.supabase.co
Web App: https://a02e8b8d-2be5-4928-a892-be4933ee8029.lovableproject.com
```

### Build Commands
```bash
npm install           # Install dependencies
npm run build        # Build web assets
npx cap sync         # Sync native platforms
npx cap open ios     # Open in Xcode
npx cap open android # Open in Android Studio
```

---

## Version History
- **v1.0.0** - Initial release documentation

---

*Last Updated: 2025*
*Document Version: 1.0*
