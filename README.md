# SmartyDeck - AI-Powered Quiz Generation Platform

SmartyDeck is an intelligent quiz generation platform that uses AI to transform any content into interactive quizzes and flashcards, helping users learn faster and remember longer.

![SmartyDeck](https://images.unsplash.com/photo-1551434678-e076c223a692?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=2850&q=80)

## Features

- **AI-Powered Quiz Generation**: Upload any text or document and instantly create customized quizzes tailored to your learning needs.
- **Multiple Question Types**: Support for multiple choice, multi-select, true/false, and matching questions.
- **Adaptive Learning**: The system adapts to your performance, focusing more on areas where you need improvement.
- **Progress Tracking**: Track your learning progress over time with detailed analytics and insights.
- **User Management**: Admin panel for managing users and invite codes.
- **Responsive Design**: Works on desktop, tablet, and mobile devices.

## Installation

### Prerequisites

- Node.js (v18 or higher)
- MongoDB (v4.4 or higher)
- Claude API key (from Anthropic)

### Setup

1. **Clone the repository**

```bash
git clone https://github.com/yourusername/smartydeck.git
cd smartydeck
```

2. **Install dependencies**

```bash
npm install
```

3. **Environment setup**

Create a `.env` file in the root directory with the following variables:

```
MONGO_URI=mongodb://localhost:27017/
MONGO_DB=SmartyDeck2
MONGO_USER=admin
MONGO_PASSWORD=password
JWT_SECRET=your_jwt_secret_key
CLAUDE_API_KEY=your_claude_api_key
```

4. **Create an admin user**

```bash
npm run create-admin admin@example.com adminuser password
```

5. **Start the development server**

```bash
npm run dev
```

6. **Build for production**

```bash
npm run build
```

7. **Start the production server**

```bash
npm run start
```

## API Endpoints

### Authentication

- **POST /api/auth/register**: Register a new user
  - Body: `{ email, username, password, inviteCode }`
  - Response: `{ success, user }`

- **POST /api/auth/login**: Login a user
  - Body: `{ email, password }`
  - Response: `{ success, user, token }`

- **GET /api/auth/me**: Get current user info
  - Headers: `Authorization: Bearer {token}`
  - Response: `{ success, user }`

- **POST /api/auth/refresh**: Refresh authentication token
  - Headers: `Authorization: Bearer {token}`
  - Response: `{ success, user, token }`

### Quiz Management

- **POST /api/quiz/generate**: Generate a quiz using AI
  - Headers: `Authorization: Bearer {token}`
  - Body: `{ content, questionTypes, questionCounts, instructions }`
  - Response: `{ success, quiz }`

- **GET /api/quiz**: Get all quizzes for the current user
  - Headers: `Authorization: Bearer {token}`
  - Response: `{ success, quizzes }`

- **POST /api/quiz**: Create a new quiz
  - Headers: `Authorization: Bearer {token}`
  - Body: `{ title, description, questions, tags, isPublic }`
  - Response: `{ success, quiz }`

- **GET /api/quiz/:id**: Get a specific quiz
  - Headers: `Authorization: Bearer {token}`
  - Response: `{ success, quiz }`

- **PUT /api/quiz/:id**: Update a quiz
  - Headers: `Authorization: Bearer {token}`
  - Body: `{ title, description, questions, tags, isPublic }`
  - Response: `{ success, quiz }`

- **DELETE /api/quiz/:id**: Delete a quiz
  - Headers: `Authorization: Bearer {token}`
  - Response: `{ success, message }`

- **POST /api/quiz/results**: Save quiz practice results
  - Headers: `Authorization: Bearer {token}`
  - Body: `{ quizId, answers, score, timeSpent }`
  - Response: `{ success, message }`

### User Activity

- **GET /api/user/activity**: Get user activity history
  - Headers: `Authorization: Bearer {token}`
  - Response: `{ success, activities }`

### Admin Endpoints

- **GET /api/admin/invite-codes**: Get all invite codes
  - Headers: `Authorization: Bearer {token}` (admin only)
  - Response: `{ success, inviteCodes }`

- **POST /api/admin/invite-codes**: Generate new invite codes
  - Headers: `Authorization: Bearer {token}` (admin only)
  - Body: `{ count, expiresInDays, maxUses, customCode }`
  - Response: `{ success, inviteCodes }`

- **GET /api/admin/invite-codes/:id**: Get a specific invite code
  - Headers: `Authorization: Bearer {token}` (admin only)
  - Response: `{ success, inviteCode }`

- **PATCH /api/admin/invite-codes/:id**: Update an invite code
  - Headers: `Authorization: Bearer {token}` (admin only)
  - Body: `{ isUsed, expiresAt, maxUses }`
  - Response: `{ success, inviteCode }`

- **GET /api/admin/invite-codes/:id/users**: Get users who used an invite code
  - Headers: `Authorization: Bearer {token}` (admin only)
  - Response: `{ success, users }`

- **GET /api/admin/users**: Get all users
  - Headers: `Authorization: Bearer {token}` (admin only)
  - Response: `{ success, users }`

- **PATCH /api/admin/users/:id**: Update a user
  - Headers: `Authorization: Bearer {token}` (admin only)
  - Body: `{ email, role, password, expiresAt }`
  - Response: `{ success, user }`

## Project Structure

```
smartydeck/
├── assets/               # Static assets
├── components/           # Vue components
├── middleware/           # Nuxt middleware
├── pages/                # Application pages
├── public/               # Public files
├── scripts/              # Utility scripts
├── server/               # Server-side code
│   ├── api/              # API endpoints
│   ├── config/           # Server configuration
│   ├── models/           # Mongoose models
│   └── utils/            # Server utilities
├── stores/               # Pinia stores
├── .env                  # Environment variables
├── .env.example          # Example environment variables
├── nuxt.config.ts        # Nuxt configuration
├── package.json          # Project dependencies
├── tailwind.config.js    # Tailwind CSS configuration
└── tsconfig.json         # TypeScript configuration
```

## Technologies

- **Frontend**: Vue.js, Nuxt.js, Tailwind CSS, Pinia
- **Backend**: Node.js, Express.js, MongoDB, Mongoose
- **AI**: Claude API by Anthropic
- **Authentication**: JWT (JSON Web Tokens)

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Acknowledgements

- [Nuxt.js](https://nuxt.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [MongoDB](https://www.mongodb.com/)
- [Anthropic Claude](https://www.anthropic.com/)
