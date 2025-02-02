## 🌍 Multilingual FAQ System

Welcome to the Multilingual FAQ System – an intelligent and scalable solution for delivering frequently asked questions (FAQs) in multiple languages. This project is built for seamless multilingual support, leveraging a powerful cloud infrastructure for performance and reliability. 

## 🛠️ Tech Stack

Frontend: HTML, CSS, JavaScript (Hosted on AWS Amplify)

Backend: Node.js, Express.js, Redis (AWS ElastiCache), MongoDB 

Cloud Hosting:

Backend: AWS EC2 🖥️

Static Files: AWS S3 📂

CI/CD: AWS CodePipeline (Optional)

Security: HTTPS enabled via Let’s Encrypt 🔒

## 🚀 Getting Started

## 👅 Clone the Repository

GitHub Repository:

Multilingual FAQ System
```bash
git clone https://github.com/Amar9nani/BHaratFD_Backend-Project.git
cd BHaratFD_Backend-Project
```

## 👖 Backend Deployment

Backend API:
```bash
cd backend
npm install
```

## 🚀 Set Up Environment Variables
Make sure you set up the necessary environment variables:

```bash
export MONGODB_URI="your-mongodb-uri"
export REDIS_URL="redis://your-elasticache-endpoint:6379"
export GOOGLE_CLOUD_PROJECT_ID="your-google-cloud-project-id"
export GOOGLE_CLOUD_CREDENTIALS_PATH="path-to-your-google-cloud-credentials.json"
```

## 🏠 Frontend Deployment (AWS Amplify)

Frontend Hosted on AWS Amplify

## 📂 Testing the Backend
The backend is hosted on AWS EC2 and secured with HTTPS using a custom domain ```https://myfaq.duckdns.org.``` To test the API, you can use the custom domain:

API Endpoint (Example): ```https://myfaq.duckdns.org/api/faqs```
Admin API Endpoint: ```https://myfaq.duckdns.org/admin/faqs``` (only accessible by authorized users)
Example API Usage:
```bash
# Fetch FAQs in English (default)
curl https://myfaq.duckdns.org/api/faqs/

# Fetch FAQs in Hindi
curl https://myfaq.duckdns.org/api/faqs/?lang=hi

# Fetch FAQs in Bengali
curl https://myfaq.duckdns.org/api/faqs/?lang=bn

# Create a new FAQ
curl -X POST https://myfaq.duckdns.org/api/faqs -H "Content-Type: application/json" -d '{"question": "Test Question", "answer": "Test Answer"}'

# Update an existing FAQ (replace :id with the actual FAQ ID)
curl -X PUT https://myfaq.duckdns.org/admin/faqs/:id -H "Content-Type: application/json" -d '{"question": "Updated Question", "answer": "Updated Answer"}'

# Delete an existing FAQ (replace :id with the actual FAQ ID)
curl -X DELETE https://myfaq.duckdns.org/admin/faqs/:id
```
## 📌 Summary

The Multilingual FAQ System is a scalable and cloud-native solution for managing FAQs across multiple languages. With AWS EC2 (backend), AWS Amplify (frontend), and Redis caching, the system ensures high performance, security, and availability. 🚀

🎯 Features:

🏆 Multilingual Support: Dynamic FAQ translations.

⚡ Optimized Performance: Redis caching for faster responses.

🔒 Secure API: HTTPS-enabled backend.

🏗️ Scalable Architecture: Hosted on AWS with robust infrastructure.

🖥️ Admin Panel: Easy management of FAQs.

## My Name: Nanduri Venkata Durga Amarnadh
## Email: [namarnadh.9@gmail.com](namarnadh.9@gmail.com)
## Linkedin: [https://www.linkedin.com/in/amarnadh9/](https://www.linkedin.com/in/amarnadh9/)
## GitHub: [https://github.com/Amar9nani](https://github.com/Amar9nani) 


Enjoy exploring and contributing! 🚀🔥
## ****************************************
