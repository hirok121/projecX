# FastAPI React Authentication App

A modern full-stack authentication application built with FastAPI (Python) backend and React (JavaScript) frontend, featuring traditional email/password authentication and Google OAuth integration.

## Features

### Backend (FastAPI)
- **User Authentication**: Email/password registration and login
- **Google OAuth**: Sign in with Google integration
- **Account Linking**: Automatic linking of OAuth and password accounts
- **JWT Tokens**: Secure token-based authentication
- **SQLite Database**: User data storage with SQLAlchemy ORM
- **User Management**: Comprehensive user profile and account management
- **Security**: Password hashing with bcrypt, token validation
- **API Documentation**: Auto-generated docs with Swagger/OpenAPI

### Frontend (React)
- **Modern UI**: Clean, responsive design with Tailwind CSS
- **Authentication Flow**: Login, register, and OAuth pages
- **Protected Routes**: Route-based access control
- **User Profile**: Comprehensive profile management
- **Real-time Feedback**: Toast notifications for user actions
- **Form Validation**: Client-side validation with react-hook-form
- **Account Linking**: Seamless linking of multiple authentication methods

### User Management Features
- ✅ **is_active**: Account activation/deactivation
- ✅ **is_superuser**: Admin privileges
- ✅ **is_verified**: Email verification status
- ✅ **last_login**: Track user login activity
- ✅ **created_at/updated_at**: Account timestamps
- ✅ **Provider tracking**: Local vs OAuth authentication
- ✅ **Profile fields**: Bio, location, website, avatar
- ✅ **OAuth integration**: Auto-fill user data from Google

## Project Structure

```
fastapi_react/
├── backend/
│   ├── app/
│   │   ├── core/
│   │   │   ├── config.py          # Application configuration
│   │   │   └── security.py        # Authentication & security
│   │   ├── models/
│   │   │   └── user.py            # User database model
│   │   ├── schemas/
│   │   │   └── user.py            # Pydantic schemas
│   │   ├── services/
│   │   │   ├── user_service.py    # User business logic
│   │   │   └── oauth_service.py   # OAuth integration
│   │   ├── routers/
│   │   │   ├── auth.py            # Authentication endpoints
│   │   │   └── users.py           # User management endpoints
│   │   └── main.py                # FastAPI application
│   ├── requirements.txt           # Python dependencies
│   └── .env.example              # Environment variables template
└── client/
    ├── src/
    │   ├── components/
    │   │   ├── Navbar.js          # Navigation component
    │   │   └── ProtectedRoute.js  # Route protection
    │   ├── context/
    │   │   └── AuthContext.js     # Authentication state
    │   ├── pages/
    │   │   ├── Home.js            # Dashboard/home page
    │   │   ├── Login.js           # Login page
    │   │   ├── Register.js        # Registration page
    │   │   ├── Profile.js         # User profile page
    │   │   └── GoogleCallback.js  # OAuth callback handler
    │   ├── services/
    │   │   └── api.js             # API client
    │   └── App.js                 # Main React component
    ├── package.json               # Node.js dependencies
    └── tailwind.config.js         # Tailwind CSS configuration
```

## Setup Instructions

### Prerequisites
- Python 3.8+
- Node.js 16+
- npm or yarn

### Backend Setup

1. **Navigate to backend directory**:
   ```bash
   cd backend
   ```

2. **Create virtual environment**:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\\Scripts\\activate
   ```

3. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

4. **Environment configuration**:
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` file and update:
   ```env
   SECRET_KEY=your-super-secret-key-here
   GOOGLE_CLIENT_ID=your-google-client-id
   GOOGLE_CLIENT_SECRET=your-google-client-secret
   ```

5. **Run the application**:
   ```bash
   uvicorn app.main:app --reload
   ```
   
   The API will be available at `http://localhost:8000`
   - API Documentation: `http://localhost:8000/docs`
   - Alternative docs: `http://localhost:8000/redoc`

### Frontend Setup

1. **Navigate to client directory**:
   ```bash
   cd client
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start development server**:
   ```bash
   npm start
   ```
   
   The React app will be available at `http://localhost:5173`

### Google OAuth Setup

1. **Google Cloud Console**:
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select existing one
   - Enable Google+ API and Google OAuth2 API

2. **Create OAuth Credentials**:
   - Go to "Credentials" section
   - Create OAuth 2.0 Client ID
   - Set authorized redirect URIs:
     - `http://localhost:5173/auth/google/callback`

3. **Update Environment**:
   - Copy Client ID and Client Secret to backend `.env` file

## API Endpoints

### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/login` - User login
- `GET /auth/google` - Get Google OAuth URL
- `POST /auth/google/callback` - Handle Google OAuth callback
- `GET /auth/me` - Get current user info

### User Management
- `GET /users/profile` - Get user profile
- `PUT /users/profile` - Update user profile
- `POST /users/deactivate` - Deactivate account

### Admin Endpoints (Superuser only)
- `GET /users/{user_id}` - Get user by ID
- `POST /users/{user_id}/activate` - Activate user
- `POST /users/{user_id}/deactivate` - Deactivate user

## Database Schema

### User Model
```python
class User(Base):
    id: int (Primary Key)
    email: str (Unique, Required)
    username: str (Unique, Optional)
    full_name: str (Optional)
    hashed_password: str (Optional - for OAuth users)
    
    # OAuth fields
    google_id: str (Unique, Optional)
    provider: str (Default: "local")  # "local", "google", or "both"
    avatar_url: str (Optional)
    
    # Management fields
    is_active: bool (Default: True)
    is_superuser: bool (Default: False)
    is_verified: bool (Default: False)
    
    # Timestamps
    created_at: datetime
    updated_at: datetime
    last_login: datetime (Optional)
    
    # Profile fields
    bio: str (Optional)
    location: str (Optional)
    website: str (Optional)
```

## Account Linking Feature

This application includes an intelligent account linking system that provides seamless user experience:

### **How Account Linking Works:**

1. **Google OAuth First**: User signs in with Google → Creates account with `provider="google"`
2. **Password Registration**: Same user tries to register with email/password → System automatically links accounts
3. **Flexible Login**: User can now sign in with either Google OAuth or email/password
4. **Provider Tracking**: User's provider field updates to `"both"` to indicate multiple login methods

### **User Experience:**

- **No Duplicate Accounts**: Users never get "stuck" with multiple accounts for the same email
- **Automatic Linking**: No manual account linking process required
- **Clear Messaging**: Users are informed when accounts are linked
- **Flexible Access**: Users can choose their preferred login method

### **Implementation Details:**

- Backend automatically detects existing OAuth accounts during registration
- Password is securely added to existing Google accounts
- Provider field tracks authentication methods: `"local"`, `"google"`, or `"both"`
- All user data (profile, preferences) is preserved during linking

### **Test Account Linking:**

```bash
# Run the test script to see account linking in action
cd backend
python test_account_linking.py
```

## Security Features

- **Password Hashing**: bcrypt algorithm
- **JWT Tokens**: Secure token-based authentication
- **CORS Configuration**: Proper cross-origin setup
- **Input Validation**: Pydantic schemas for request validation
- **Rate Limiting**: Can be added via middleware
- **SQL Injection Protection**: SQLAlchemy ORM
- **Account Linking Security**: Secure password addition to OAuth accounts

## Suggestions for Enhanced User Management

### Already Implemented
1. ✅ **Account Status Management** (`is_active`)
2. ✅ **Admin Privileges** (`is_superuser`)
3. ✅ **Email Verification** (`is_verified`)
4. ✅ **Login Tracking** (`last_login`)
5. ✅ **Provider Tracking** (local vs OAuth)
6. ✅ **Profile Enhancement** (bio, location, website)
7. ✅ **OAuth Auto-fill** (profile data from Google)

### Future Enhancements
1. **Email Verification System**
   - Send verification emails on registration
   - Email verification endpoints
   - Password reset functionality

2. **Role-Based Access Control (RBAC)**
   - Multiple user roles (admin, moderator, user)
   - Permission-based access control
   - Role management endpoints

3. **Account Security**
   - Two-factor authentication (2FA)
   - Login attempt monitoring
   - Session management
   - Device tracking

4. **Advanced Profile Features**
   - Profile picture upload
   - Social media links
   - Privacy settings
   - Public/private profiles

5. **Audit and Monitoring**
   - User activity logging
   - Login history
   - Security event tracking
   - Analytics dashboard

6. **Account Management**
   - Account deletion (with data retention policies)
   - Data export (GDPR compliance)
   - Account suspension (temporary)
   - Bulk user operations

## Development Tips

1. **Database Migrations**: Use Alembic for database schema changes
2. **Testing**: Add pytest for backend testing
3. **Environment Management**: Use different configs for dev/staging/prod
4. **Logging**: Implement proper logging for debugging and monitoring
5. **Error Handling**: Add global error handlers
6. **Documentation**: Keep API documentation updated

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is open source and available under the [MIT License](LICENSE).