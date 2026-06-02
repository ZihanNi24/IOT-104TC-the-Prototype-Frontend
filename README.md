# MediNest Frontend Prototype

This folder contains the exported frontend source code for **MediNest**, the application-layer prototype designed for the **ESP32 Smart Medication Reminder and Incentive System**.

This frontend is part of the IOT104TC coursework project. Its purpose is to demonstrate how the ESP32-based smart medication reminder prototype could be connected to a user-facing application layer. The app prototype focuses on user flow, UI/UX structure, Patient Mode, Caregiver Mode, prescription review logic, and caregiver monitoring concepts.

## Project Context

The full coursework project is an IoT medication reminder prototype based on ESP32. The hardware side includes timed reminders, pill quantity display, physical lid control, medication confirmation, reward feedback, and MQTT event reporting.

This frontend prototype represents the **application layer** of the IoT system. It shows how device events and medication information could be presented to patients and caregivers through a mobile interface.

## What's Included

This export includes:

- `src/App.jsx` and related components  
  The main application UI and interaction logic.

- `src/lib/*`  
  Whacka client SDK files used by the exported frontend.

- `index.html`  
  Main HTML entry file.

- `vite.config.js`  
  Vite build configuration.

- `package.json`  
  Project dependencies and development scripts.

- Tailwind / PostCSS configuration  
  Styling and frontend build setup.

## Important Note

This is a **frontend prototype only**.

It is not a standalone full-stack application and it does not include an independent backend server. Some features, including data storage, AI functions, file storage, authentication, payments, and push-related services, depend on Whacka's hosted backend.

The exported frontend code makes authenticated calls to the Whacka backend associated with this project.

Because of this, the code should be understood as evidence of the UI/UX structure and application-layer logic, rather than as a completely independent deployable software system.

## Running Locally for Development

To run the frontend locally, create a `.env.local` file in this folder.

Example:

```env
VITE_PROJECT_ID=<project_id>
VITE_API_BASE=https://whacka.app
VITE_SUPABASE_URL=<your_supabase_url>
VITE_SUPABASE_ANON_KEY=<your_supabase_anon_key>
