
# Network Engineer Agentic System - Frontend

This is the React-based frontend for the AI-powered Network Engineer Agentic System. It provides a clean, professional, and case-centric user interface for TAC engineers to interact with the agent, manage cases, and administer the system's knowledge base.

The application is built as a Single Page Application (SPA) using modern React features like Hooks and Context for state management and is deployed via **AWS Amplify**, with continuous deployment configured from a GitHub repository.

## Core Features

-   **Case-Centric Workspace**: The UI is built around the concept of an "active case." All user interactions, such as asking questions or analyzing logs, are performed within the context of the selected case.
-   **Asynchronous Plan Visualization**: The frontend is designed to handle the long-running, multi-step plans generated by the backend. It provides a real-time `PlanDisplay` component that shows the user exactly what the agent is doing, step-by-step.
-   **Separated User Workflows**: The UI is split into two distinct sections:
    *   **Workspace**: The primary view for TAC engineers to create, select, and work on cases.
    *   **Admin Panel**: A separate area for administrators to manage the system's knowledge base by uploading new documents.
-   **Proactive Agent Interaction**: The UI supports the backend's proactive triage feature, allowing the agent to autonomously analyze new cases and populate next steps.
-   **Cloud-Native Deployment**: Hosted on AWS Amplify, ensuring a scalable, reliable, and globally available user interface with automated deployments.

## Key Component Descriptions

The `src` directory contains several key components that define the application's structure and functionality:

-   **`App.js`**: The main application shell. It sets up the top-level router (`/` for the Workspace, `/admin` for the Admin Panel) and the main header, which dynamically displays the active case ID.

-   **`Workspace.js`**: The core component for the TAC engineer. It's a stateful component that manages the entire user session. It renders either the "Lobby" view (for selecting a case) or the "Active Case" view. It handles the chat interaction, including the asynchronous "start and poll" logic for monitoring plan execution.

-   **`AdminPage.js`**: A dedicated page that houses administrative components. Currently, it contains the `Upload` component for managing the knowledge base. This separation keeps the main workspace clean for operators.

-   **`PlanDisplay.js`**: A crucial UI component for visualizing the agent's execution plan. It receives a `plan` object and renders each step with a description and a status icon (Pending, Executing, Completed, Failed), providing real-time transparency into the agent's thought process.

-   **`TacSummary.js`**: A detailed widget that displays the structured `tac_summary.json` for the active case. It's designed to be re-rendered whenever the case data is updated by an agent action.

-   **`context/CaseContext.js`**: A simple and effective global state manager using React Context. It provides the `activeCaseId` to all components, ensuring the entire application is synchronized to the currently selected case.

-   **`NewCaseModal.js`**: A modal dialog for creating a new case. It captures the Case ID and initial problem description from the user.

---

## Development and Deployment Workflow

This project uses a Git-based, CI/CD workflow with AWS Amplify.

### Local Development

1.  **Prerequisites**:
    *   Node.js (v16 or later) and npm.
    *   The backend server must be running locally. Follow the setup instructions in the backend's `README.md`.

2.  **Installation**:
    ```bash
    # Navigate to the frontend directory
    cd frontend

    # Install dependencies
    npm install
    ```

3.  **Environment Configuration for Local Development**:
    For local development, you need to tell the React app where to find your local backend API. Create a `.env.local` file in the `frontend` root directory. This file is ignored by Git and is only for your local machine.

    **File: `.env.local`**
    ```
    REACT_APP_API_URL=http://127.0.0.1:8000
    ```

4.  **Running the Local Server**:
    ```bash
    npm start
    ```
    This will open the application at `http://localhost:3000` and connect to your local backend running at `http://127.0.0.1:8000`.

### Deployment to AWS Amplify

Deployment is handled automatically by AWS Amplify.

1.  **Connecting to the Production Backend**:
    The deployed Amplify application needs to know the URL of the production backend API. This is configured as an **environment variable within the AWS Amplify Console**, not in a `.env` file.

    *   Navigate to your app in the AWS Amplify Console.
    *   Go to **App settings > Environment variables**.
    *   Ensure a variable named `REACT_APP_API_URL` is set to the public URL of your deployed backend service (e.g., `https://api.your-domain.com`).

2.  **Triggering a Deployment**:
    A new deployment is automatically triggered whenever code is pushed or merged to the connected branch in the GitHub repository (e.g., `main` or `master`).

    *   Commit your changes to a feature branch:
        ```bash
        git checkout -b my-new-feature
        git add .
        git commit -m "feat: Add new plan visualization"
        git push origin my-new-feature
        ```
    *   Create a Pull Request in GitHub to merge `my-new-feature` into the main branch.
    *   Once the Pull Request is merged, Amplify will detect the change, start a new build, and deploy the updated version of the frontend automatically. No manual `npm run build` is required for deployment.

---

## Available Scripts

### `npm start`

Runs the app in local development mode.

### `npm test`

Launches the test runner in interactive watch mode.

### `npm run build`

Builds the app for production to the `build` folder. This command is primarily run by the AWS Amplify build process, not manually.