# Sahaay - One-Tap Assistance System

**Project ID:** PS 25031  
**Hackathon:** Smart India Hackathon (SIH)

## Overview

**Sahaay** is an AI-powered assistance system designed to provide real-time decision-making with just **one tap**. The system uses computer vision to detect relevant scenarios and immediately sends actionable information to an admin dashboard for monitoring and further processing.

This project was developed for the **Smart India Hackathon (SIH)** and focuses on simplifying complex tasks with minimal user interaction.

---

## Features

- **One-Tap Operation**: Users can trigger the system with a single action.
- **Real-Time Detection**: Uses **YOLO (You Only Look Once)** for object detection on live video streams.
- **Database Integration**: Predicted results are stored in a backend database for record-keeping and analytics.
- **Admin Dashboard**: Visualizes predictions and analytics, enabling efficient monitoring and decision-making.
- **Scalable Architecture**: Modular design allows easy integration with other systems or models.

---

## Architecture

![Architecture Diagram](./assets/architecture.png)  
*The system captures video, processes it with the YOLO model, stores predictions in the database, and displays insights on the admin dashboard.*

---

## Tech Stack

- **Backend:** FastAPI / Flask (depending on implementation)
- **Frontend:** React.js / Angular (for Admin Dashboard)
- **AI/ML:** YOLO (Real-Time Object Detection)
- **Database:** PostgreSQL / MySQL
- **Deployment:** Docker (optional for containerization)

---

## Installation

1. Clone the repository:

bash<br>
git clone https://github.com/yourusername/sahaay.git<br>
cd sahaay

---

## Install Python dependencies

pip install -r requirements.txt<br>

---

## Run the backend server

python app.py<br>

---

## Launch the frontend dashboard

cd frontend<br>
npm install<br>
npm start<br>

---

## Usage

1. Open the dashboard in your browser.
2. Tap the **Start Detection** button to activate the model.
3. The system will process video in real-time and update predictions to the dashboard.
4. Admins can view and manage alerts or analytics directly from the dashboard.

---

## Model Details

-**Model:**YOLOv8
-**Training Data:** Custom dataset collected for the problem scenario
-**Output:** Prediction labels with bounding boxes and confidence scores
-**Integration:** Backend API receives predictions and updates the database

---

## Project Status

-✅ Real-time detection working
-✅ Database integration functional
-✅ Admin dashboard operational
-🔄 Deployment pending

---

## Contribution

We welcome contributions to improve the system! Please fork the repo, create a branch, and submit a pull request.

---

## Contact
Team J.A.R.V.I.S<br>
Email: prachishende182@gmail.com<br>
LinkedIn: https://www.linkedin.com/in/prachi-shende-933812259<br>
GitHub: https://github.com/prachishende007<br>
