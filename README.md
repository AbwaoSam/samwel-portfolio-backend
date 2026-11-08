# Samwel Abwao — Portfolio Backend API 

This is the RESTful API backend that powers my personal portfolio website. It handles project data, an AI-powered chatbot, and a contact form system, all connected to a cloud database.

🔗 **Live API:** [https://samwel-portfolio-backend-api.onrender.com/api/projects](https://samwel-portfolio-backend-api.onrender.com/api/projects)
🔗 **Frontend Repo:** [https://github.com/AbwaoSam/samwel-portfolio-frontend](https://github.com/AbwaoSam/samwel-portfolio-frontend)

##  Features

- **Custom REST API:** Serves project data to the frontend.
- **Database Integration:** Connected to MongoDB Atlas for persistent data storage.
- **Admin CRUD Operations:** Protected POST and DELETE routes to manage portfolio projects.
- **AI Integration:** Uses the OpenAI API (`gpt-5.4-mini`) to power a custom chatbot with context about my background.
- **Email Service:** Integrated with Resend API to handle contact form submissions securely and reliably.

##  Tech Stack

- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB (Mongoose)
- **AI:** OpenAI API
- **Email:** Resend API
- **Environment:** Dotenv

##  API Endpoints

| Method | Endpoint | Description | Protected? |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/projects` | Fetches all portfolio projects | ❌ |
| `POST` | `/api/projects` | Adds a new project to the database | ✅ (Requires `secretKey`) |
| `DELETE` | `/api/projects/:id` | Deletes a project by its ID | ✅ (Requires `secretKey`) |
| `POST` | `/api/chat` | Sends a message to the AI assistant | ❌ |
| `POST` | `/api/contact` | Sends an email via the contact form | ❌ |

##  Getting Started (Local Development)

### 1. Clone the repository
```bash
git clone https://github.com/AbwaoSam/samwel-portfolio-backend.git
cd samwel-portfolio-backend
```

### 2. Install dependencies
```bash
npm install
```

### 3. Install dependencies
Create a .env file in the root directory and add the following keys (you will need your own API keys):
```bash
PORT=5000
MONGODB_URI=your_mongodb_connection_string
OPENAI_API_KEY=your_openai_api_key
OPENAI_MODEL=gpt-5.4-mini
EMAIL_USER=your_email@gmail.com
RESEND_API_KEY=your_resend_api_key
ADMIN_SECRET_KEY=your_custom_admin_secret_key
```

### 4. Run the server
```bash
node --watch index.js
```
