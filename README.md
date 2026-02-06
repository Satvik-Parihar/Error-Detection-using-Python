# Error Detection Techniques

## Overview
This project is a comprehensive implementation of various Error Detection Techniques used in Computer Networks. It features a modern, interactive web interface built with **React** and a robust backend logic implemented in **Python (FastAPI)**.

## Features
The application provides interactive simulations and theoretical explanations for the following techniques:
1.  **VRC (Vertical Redundancy Check)**: Parity bit calculation (Even/Odd).
2.  **LRC (Longitudinal Redundancy Check)**: Block parity calculation.
3.  **CRC (Cyclic Redundancy Check)**: Polynomial division based error detection.
4.  **Checksum**: Summation and 1's complement method.
5.  **Hamming Code**: Error correcting code implementation.

## Technology Stack
-   **Frontend**: React (Vite)
-   **Backend**: Python (FastAPI)
-   **Styling**: Modern CSS (Glassmorphism, Neon effects)
-   **Language**: JavaScript, Python

## Setup Instructions

### One-Command Start (Recommended)
1.  Ensure you have **Node.js** and **Python** installed.
2.  Install all dependencies (frontend & backend) if you haven't already:
    ```bash
    npm run install:all
    ```
3.  Run the entire project with a single command:
    ```bash
    npm start
    ```
    This will launch both the backend (port 8000) and frontend (port 5173).

---
### Manual Setup

#### Backend
1.  Navigate to the `backend` directory:
    ```bash
    cd backend
    ```
2.  Install dependencies:
    ```bash
    pip install -r requirements.txt
    ```
3.  Run the server:
    ```bash
    uvicorn main:app --reload
    ```

#### Frontend
1.  Navigate to the `frontend` directory:
    ```bash
    cd frontend
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Run the development server:
    ```bash
    npm run dev
    ```

## Usage
1.  Open the web application (auto-opens or go to `http://localhost:5173`).
2.  Select an Error Detection technique from the navigation.
3.  Read the theory to understand the concept.
4.  Enter input data to see the algorithm in action.

## Author
**Satvik Parihar**  
contact: harishparihar663@gmail.com
