--

# Network Engineer Agentic System - Backend

This project is the backend service for an AI-powered agentic system designed to assist Network Technical Assistance Center (TAC) engineers. It leverages Large Language Models (LLMs) via AWS Bedrock to automate log analysis, provide troubleshooting recommendations, and manage technical cases through a sophisticated Planner-Executor architecture.

The system is built with FastAPI, Celery, and Redis, providing a robust, scalable, and asynchronous foundation for complex agentic workflows.

## Core Features

-   **Case-Centric Design**: All operations are centered around a specific case, mirroring a real-world TAC workflow.
-   **Planner-Executor Architecture**: Instead of simple Q&A, the agent creates multi-step execution plans to handle complex user requests, such as "Find the command to check for errors, then read the case summary."
-   **Asynchronous Task Processing**: Heavy-lifting tasks like log analysis are offloaded to Celery workers, ensuring the API remains responsive.
-   **Extensible Tool System**: New capabilities can be added by defining tools in simple JSON files and providing corresponding Python handler functions.
-   **Vector-Based Knowledge Base**: Utilizes ChromaDB and Bedrock Embeddings to create a searchable knowledge base from documents like CLI manuals, enabling the agent to recommend specific commands.
-   **Automated Log Analysis**: A Celery task can parse raw log files, extract key information using a command map, and generate a structured `tac_summary.json` report.

## Project Structure

```
├── agents/                 # Contains the Planner and Executor agents
├── cortex/                 # The "brain" orchestrating the agents and tools
├── data/
│   ├── tool_definitions/   # JSON definitions for each tool available to the agent
│   └── structured_kb/      # Structured knowledge like the command map
├── prompts/                # Prompt templates for the LLMs
├── tools/                  # Python functions that implement the tool logic
├── celery_worker.py        # The Celery worker for background tasks
├── main.py                 # The main FastAPI application
├── requirements.txt        # Python dependencies
└── ...
```

---

## Getting Started

### Prerequisites

1.  **Python 3.9+**: Ensure you have a modern version of Python installed.
2.  **Redis**: A Redis server must be running. This is used as the message broker for Celery. You can run it locally via Docker:
    ```bash
    docker run -d -p 6379:6379 --name agentic-redis redis
    ```
3.  **AWS Credentials**: The application uses AWS Bedrock. You must have your AWS credentials configured. Create a `.env` file in the project root and add your credentials:
    ```.env
    AWS_REGION=us-east-1
    AWS_ACCESS_KEY_ID=YOUR_AWS_ACCESS_KEY
    AWS_SECRET_ACCESS_KEY=YOUR_AWS_SECRET_KEY

    # Celery Configuration (defaults to localhost Redis)
    CELERY_BROKER_URL=redis://localhost:6379/0
    CELERY_RESULT_BACKEND=redis://localhost:6379/0
    ```

### Installation

1.  **Clone the repository:**
    ```bash
    git clone <your-repo-url>
    cd <your-repo-directory>
    ```

2.  **Create a virtual environment and activate it:**
    ```bash
    python -m venv venv
    source venv/bin/activate  # On Windows, use `venv\Scripts\activate`
    ```

3.  **Install the required Python packages:**
    ```bash
    pip install -r requirements.txt
    ```

---

## Running the System

To run the full system, you need to start **two separate processes** in two different terminals: the FastAPI web server and the Celery worker.

### 1. Run the FastAPI Web Server

This server handles all API requests from the frontend. The `--reload` flag will automatically restart the server whenever you make changes to the code.

```bash
uvicorn main:app --reload
```

The API will be available at `http://127.0.0.1:8000`. You can access the auto-generated API documentation at `http://127.0.0.1:8000/docs`.

### 2. Run the Celery Worker

This worker listens for and executes background tasks, such as the log file analysis. The `--loglevel=info` flag provides useful output for debugging.

```bash
celery -A celery_worker.celery_app worker --loglevel=info
```

**Both of these processes must be running for the application to be fully functional.**

---

## Future Implementation Steps

This project has a solid foundation, but there are many exciting directions for future development:

-   **Initial Case Triage**: Enhance the `POST /cases` endpoint to automatically trigger an initial "triage" plan when a new case is created, populating the `next_steps` in the summary with intelligent questions based on the initial problem description.
-   **Log Analysis as a Tool**: Refactor the `/analyze_case` endpoint into a `log_analyzer_v1` tool. This would allow the agent to decide *when* to analyze logs as part of a larger plan, rather than it being a purely user-driven action.
-   **Tool Management UI**: Create a section in the `Admin` panel of the frontend to view, add, or edit tool definitions directly from the UI.
-   **Knowledge Base Management**: Expand the `Admin` panel to show which documents have been ingested into the ChromaDB vector store and allow for re-indexing.
-   **Human-in-the-Loop Execution**: For complex or potentially risky plans, introduce a "confirmation" step where the agent presents the plan to the user for approval before execution.
-   **More Sophisticated Tools**:
    *   A tool that can SSH into a device to run commands (requires careful security considerations).
    *   A tool that can query a database of known bugs or release notes.
    *   A tool that can generate and send formatted emails to escalate a case.