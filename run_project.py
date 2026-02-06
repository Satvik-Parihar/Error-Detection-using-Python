import subprocess
import sys
import platform

def run_project():
    system = platform.system()
    
    if system == "Windows":
        # Launch Backend in new PowerShell window
        subprocess.Popen(["start", "powershell", "-NoExit", "-Command", "cd backend; uvicorn main:app --reload --port 8000"], shell=True)
        # Launch Frontend in new PowerShell window
        subprocess.Popen(["start", "powershell", "-NoExit", "-Command", "cd frontend; npm run dev"], shell=True)
        print("Launched Frontend and Backend in separate windows.")
    else:
        print("This script is optimized for Windows. On Linux/Mac, use 'npm start'.")

if __name__ == "__main__":
    run_project()
