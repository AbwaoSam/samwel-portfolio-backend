import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import OpenAI from 'openai';
import mongoose from 'mongoose';

// 1. Load Environment Variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// 2. Middleware
app.use(cors());
app.use(express.json());

// 3. Database Connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ Connected to MongoDB successfully'))
  .catch((err) => console.error('❌ MongoDB connection error:', err));

// 4. Database Models
const projectSchema = new mongoose.Schema({
  title: { type: String, required: true },
  desc: { type: String, required: true },
  link: { type: String, required: true },
  imageUrl: { type: String }, 
  tags: [String], 
}, { timestamps: true });

const Project = mongoose.model('Project', projectSchema);

// 5. Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// ROUTES

// --- Project Routes ---
app.get('/api/projects', async (req, res) => {
  try {
    const projects = await Project.find().sort({ createdAt: -1 });
    res.json(projects);
  } catch (error) {
    console.error('Fetch Projects Error:', error);
    res.status(500).json({ error: 'Failed to fetch projects' });
  }
});

app.post('/api/projects', async (req, res) => {
  const { title, desc, link, imageUrl, tags, secretKey } = req.body;

  if (secretKey !== process.env.ADMIN_SECRET_KEY) {
    return res.status(401).json({ error: 'Unauthorized: Invalid secret key' });
  }

  try {
    const newProject = new Project({ title, desc, link, imageUrl, tags });
    await newProject.save();
    res.status(201).json({ success: true, project: newProject });
  } catch (error) {
    console.error('Create Project Error:', error);
    res.status(500).json({ error: 'Failed to create project' });
  }
});

app.delete('/api/projects/:id', async (req, res) => {
  const { secretKey } = req.body;

  if (secretKey !== process.env.ADMIN_SECRET_KEY) {
    return res.status(401).json({ error: 'Unauthorized: Invalid secret key' });
  }

  try {
    await Project.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Project deleted successfully' });
  } catch (error) {
    console.error('Delete Project Error:', error);
    res.status(500).json({ error: 'Failed to delete project' });
  }
});

// --- AI Chat Route ---
app.post('/api/chat', async (req, res) => {
  const { message } = req.body;

  if (!message || typeof message !== 'string') {
    return res.status(400).json({ error: 'Message is required' });
  }

  try {
    const response = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-5.4-mini',
      messages: [
        {
          role: 'system',
          content:
            'You are the AI assistant on Samwel Abwao\'s portfolio website. Samwel is a Software Engineer from Kenya, specializing in React, Node.js, Kotlin, Android development, databases, and DevOps. He studied at Alliance High School (2020-2023) and is currently pursuing a BSc. Software Engineering at Multimedia University of Kenya (2024-2028). He interned at Momentum Labs CLG. Answer visitors\' questions about Samwel\'s skills, projects, and experience in a friendly and professional tone. If asked something unrelated to Samwel or software engineering, politely redirect the conversation.',
        },
        { role: 'user', content: message },
      ],
      max_completion_tokens: 500,
    });

    const reply = response.choices[0]?.message?.content || 'Sorry, I could not generate a response.';
    res.json({ reply });
  } catch (error) {
    console.error('OpenAI API error:', error.message);
    res.status(500).json({ error: 'Failed to get AI response.' });
  }
});

// --- Contact Form API (Using Resend) ---
app.post('/api/contact', async (req, res) => {
  const { name, email, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'Portfolio Contact <onboarding@resend.dev>', 
        to: process.env.EMAIL_USER, 
        reply_to: email, 
        subject: `New Contact Message from ${name}`,
        html: `
          <div style="font-family: sans-serif; color: #333;">
            <h2 style="color: #1e4635;">New Message from Portfolio</h2>
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Message:</strong></p>
            <p style="background: #f4f4f4; padding: 15px; border-radius: 5px;">${message}</p>
          </div>
        `
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Resend API Error:', data);
      throw new Error(data.message || 'Failed to send email');
    }

    res.json({ success: true, message: 'Message sent successfully!' });
  } catch (error) {
    console.error('Contact Form Error:', error);
    res.status(500).json({ error: 'Failed to send message.' });
  }
});

// START SERVER
app.listen(PORT, () => {
  console.log(`\n Server running on port ${PORT}`);
  console.log(` AI Model: ${process.env.OPENAI_MODEL || 'gpt-5.4-mini'}`);
  console.log(` Email configured for: ${process.env.EMAIL_USER}`);
});