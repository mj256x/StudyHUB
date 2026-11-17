# StudyHUB 🎓

Welcome to **StudyHUB**! 

As a student, keeping track of multiple classes, deadlines, scattered lecture slides, and daily study time can get chaotic very quickly. I spent about **6 months** designing and developing StudyHUB from the ground up to solve that exact problem: a single, clean, and distraction-free web app to organize academic life in one place.

This project was built as my final capstone project for **CS50x**. While it may still have a few quirks, it was a massive personal learning journey where I stepped out of tutorial mode and built a full-stack, real-world application from scratch.

---

## 💡 What Can You Do in StudyHUB?

Here is a quick walkthrough of how you can use the app:

### 1. 📚 Manage Your Subjects
Create dedicated spaces for each course or topic you're taking. Every subject acts as a hub where your tasks, uploaded materials, and study time live together.

### 2. ✅ Break Down Tasks & To-Dos
Deadlines can feel overwhelming when assignments are huge. In StudyHUB, you can:
- Create main tasks with due dates linked to specific subjects.
- Break them down into smaller subtasks that you can check off one by one.
- Watch your completion status automatically update as you make progress.

### 3. ⏱️ Focus Timer & Study Session Tracker
Instead of using a separate phone app or timer, StudyHUB includes a built-in study timer:
- Pick a subject, set your target focus duration, and start your session.
- Add extra time on the fly if you're in the zone.
- Review your **Session History** to see exactly where your time went and celebrate your consistency.

### 4. 📁 Keep Study Materials & PDFs Handy
Upload lecture notes, assignment sheets, or reading PDFs directly into a subject. They are stored securely in cloud storage and easily accessible whenever you're studying that topic.

### 5. 📊 Real-Time Dashboard
The home dashboard gives you an instant snapshot of your current state: pending tasks, active subjects, and total study minutes logged.

---

## 🛠️ What I Used & Why

When building this over 6 months, I deliberately chose tools and architectural patterns that pushed me to understand how real web applications work under the hood:

- **Python & Flask**: Used as the core backend engine. As the codebase expanded, I structured it using **Flask Blueprints** (`auth`, `tasks`, `subjects`, `sessions`, `user`, `home`) to keep the routing clean, modular, and maintainable.
- **PostgreSQL (`psycopg2`)**: Used a production-grade relational database with connection pooling (`ThreadedConnectionPool`) to efficiently manage queries for users, subjects, hierarchical tasks, and session logs.
- **Supabase Storage**: Used to store and serve uploaded course documents and PDFs in the cloud, paired with **PyMuPDF** to handle document processing.
- **Cloudinary**: Handles user avatar uploads, ensuring image optimization and keeping the application server completely stateless.
- **Vanilla JavaScript & Responsive CSS**: Rather than jumping into heavy frontend frameworks like React, I intentionally built the UI using vanilla JavaScript and custom CSS. This allowed me to master the DOM, asynchronous `fetch()` API calls, dynamic modals, and responsive layouts firsthand.
- **Gunicorn**: Production WSGI HTTP server used to run the app reliably on cloud hosting platforms.

---

## 💬 A Note from the Developer

This project represents 6 months of continuous learning, refactoring, and debugging. My goal wasn't just to pass an assignment, but to build something complete that anyone could open in a browser, create an account on, and actually find useful.

If you are trying out the live demo:
- Feel free to create an account, add a subject, set a timer, or check off a task.
- If the initial page takes 30–40 seconds to open, it's just the free hosting server waking up!

Thank you for checking out StudyHUB! Feedback and suggestions are always welcome. 🚀
