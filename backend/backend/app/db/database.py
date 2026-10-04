import sqlite3
import json
import os
import datetime
from typing import List, Optional, Dict, Any
try:
    from app.models.agent_models import Agent, AgentSpecification, ChatMessage, Workflow, ToolStep
except ImportError:
    from backend.app.models.agent_models import Agent, AgentSpecification, ChatMessage, Workflow, ToolStep

DB_PATH = os.environ.get("AGENT_DB_PATH", "agents.db")

def get_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS agents (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            description TEXT NOT NULL,
            purpose TEXT NOT NULL,
            status TEXT NOT NULL DEFAULT 'active',
            specification TEXT NOT NULL,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL
        )
    """)
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS chat_messages (
            id TEXT PRIMARY KEY,
            agent_id TEXT NOT NULL,
            session_id TEXT NOT NULL,
            role TEXT NOT NULL,
            content TEXT NOT NULL,
            tool_steps TEXT,
            timestamp TEXT NOT NULL
        )
    """)
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS workflows (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            description TEXT NOT NULL,
            nodes TEXT NOT NULL,
            edges TEXT NOT NULL,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL
        )
    """)
    conn.commit()

    cursor.execute("SELECT COUNT(*) as count FROM agents")
    count = cursor.fetchone()["count"]
    if count == 0:
        seed_default_agents(conn)
    conn.close()

def seed_default_agents(conn):
    cursor = conn.cursor()
    now = datetime.datetime.now(datetime.timezone.utc).isoformat()
    starter_specs = [
        {
            "name": "Research Assistant",
            "purpose": "Find and analyze research papers, summarize methodologies, and identify key research gaps.",
            "description": "Specialized in scanning academic publications, literature reviews, and synthesizing scholarly insights.",
            "tasks": [
                "Search academic literature and web sources",
                "Extract core methodologies and empirical findings",
                "Identify discrepancies and unaddressed research gaps",
                "Produce structured synthesis reports with citations"
            ],
            "behavior": {"style": "detailed", "autonomy": "guided"},
            "capabilities": {"web_search": True, "files": True, "data_analysis": False, "code_execution": False, "database": False, "apis": False, "other_agents": False},
            "tools": ["web_search", "file_processing"],
            "memory": {"enabled": True, "scope": "across_conversations", "optimization": "balanced"},
            "model": {"provider": "recommended", "name": "auto", "temperature": 0.4, "max_tokens": 2500},
            "output": {"format": "report", "custom_instruction": "Structure with clear executive summary, findings, and bibliography"},
            "advanced": {"system_prompt": "You are an elite academic research assistant with deep domain knowledge across science and engineering.", "context_window": 8000, "retry_attempts": 3, "tool_timeout_seconds": 30, "error_handling": "graceful"}
        },
        {
            "name": "Coding Assistant",
            "purpose": "Help developers design, write, debug, and optimize robust software solutions.",
            "description": "Full-stack programming companion with deep expertise in Python, JavaScript, TypeScript, and architecture.",
            "tasks": [
                "Review and debug code snippets",
                "Explain complex algorithms and best practices",
                "Generate clean, idiomatic, and tested code",
                "Refactor for performance and maintainability"
            ],
            "behavior": {"style": "technical", "autonomy": "automatic"},
            "capabilities": {"web_search": True, "files": True, "data_analysis": False, "code_execution": True, "database": False, "apis": False, "other_agents": False},
            "tools": ["web_search", "file_processing", "code_execution"],
            "memory": {"enabled": True, "scope": "across_conversations", "optimization": "balanced"},
            "model": {"provider": "recommended", "name": "auto", "temperature": 0.2, "max_tokens": 3000},
            "output": {"format": "code", "custom_instruction": "Provide complete working code blocks with concise inline explanations"},
            "advanced": {"system_prompt": "You are an expert principal software engineer with a focus on clean code and defensive programming.", "context_window": 8000, "retry_attempts": 3, "tool_timeout_seconds": 30, "error_handling": "graceful"}
        },
        {
            "name": "Data Analysis Assistant",
            "purpose": "Analyze datasets, identify statistical trends, compute metrics, and explain data insights.",
            "description": "Data science specialist capable of interpreting tables, CSV files, and computing quantitative metrics.",
            "tasks": [
                "Inspect tabular datasets and schemas",
                "Calculate statistical summaries and correlations",
                "Spot anomalies, trends, and growth patterns",
                "Generate formatted tables and actionable takeaways"
            ],
            "behavior": {"style": "professional", "autonomy": "guided"},
            "capabilities": {"web_search": False, "files": True, "data_analysis": True, "code_execution": True, "database": True, "apis": False, "other_agents": False},
            "tools": ["file_processing", "data_analysis", "code_execution", "database"],
            "memory": {"enabled": True, "scope": "across_conversations", "optimization": "balanced"},
            "model": {"provider": "recommended", "name": "auto", "temperature": 0.3, "max_tokens": 2000},
            "output": {"format": "table", "custom_instruction": "Format tabular comparisons and key metric summaries"},
            "advanced": {"system_prompt": "You are a seasoned data analyst focused on precision, statistical accuracy, and business value.", "context_window": 8000, "retry_attempts": 3, "tool_timeout_seconds": 30, "error_handling": "graceful"}
        }
    ]
    for idx, spec in enumerate(starter_specs):
        agent_id = f"agent-starter-{idx+1}"
        cursor.execute(
            "INSERT INTO agents (id, name, description, purpose, status, specification, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
            (agent_id, spec["name"], spec["description"], spec["purpose"], "active", json.dumps(spec), now, now)
        )
    conn.commit()

def list_agents() -> List[Agent]:
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM agents ORDER BY created_at DESC")
    rows = cursor.fetchall()
    agents = []
    for r in rows:
        spec_dict = json.loads(r["specification"])
        agents.append(Agent(
            id=r["id"],
            name=r["name"],
            description=r["description"],
            purpose=r["purpose"],
            status=r["status"],
            specification=AgentSpecification(**spec_dict),
            created_at=r["created_at"],
            updated_at=r["updated_at"]
        ))
    conn.close()
    return agents

def get_agent(agent_id: str) -> Optional[Agent]:
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM agents WHERE id = ?", (agent_id,))
    row = cursor.fetchone()
    conn.close()
    if not row:
        return None
    spec_dict = json.loads(row["specification"])
    return Agent(
        id=row["id"],
        name=row["name"],
        description=row["description"],
        purpose=row["purpose"],
        status=row["status"],
        specification=AgentSpecification(**spec_dict),
        created_at=row["created_at"],
        updated_at=row["updated_at"]
    )

def save_agent(agent: Agent) -> Agent:
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
        INSERT OR REPLACE INTO agents (id, name, description, purpose, status, specification, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        agent.id,
        agent.name,
        agent.description,
        agent.purpose,
        agent.status,
        json.dumps(agent.specification.model_dump()),
        agent.created_at,
        agent.updated_at
    ))
    conn.commit()
    conn.close()
    return agent

def delete_agent(agent_id: str) -> bool:
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM agents WHERE id = ?", (agent_id,))
    deleted = cursor.rowcount > 0  # capture BEFORE second execute
    cursor.execute("DELETE FROM chat_messages WHERE agent_id = ?", (agent_id,))
    conn.commit()
    conn.close()
    return deleted


def save_chat_message(agent_id: str, session_id: str, message: ChatMessage):
    conn = get_connection()
    cursor = conn.cursor()
    tool_steps_json = json.dumps([s.model_dump() for s in message.tool_steps]) if message.tool_steps else None
    cursor.execute("""
        INSERT INTO chat_messages (id, agent_id, session_id, role, content, tool_steps, timestamp)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    """, (message.id, agent_id, session_id, message.role, message.content, tool_steps_json, message.timestamp))
    conn.commit()
    conn.close()

def get_chat_history(agent_id: str, session_id: Optional[str] = None, limit: int = 50) -> List[ChatMessage]:
    conn = get_connection()
    cursor = conn.cursor()
    if session_id:
        cursor.execute(
            "SELECT * FROM chat_messages WHERE agent_id = ? AND session_id = ? ORDER BY timestamp ASC LIMIT ?",
            (agent_id, session_id, limit)
        )
    else:
        cursor.execute(
            "SELECT * FROM chat_messages WHERE agent_id = ? ORDER BY timestamp ASC LIMIT ?",
            (agent_id, limit)
        )
    rows = cursor.fetchall()
    conn.close()
    messages = []
    for r in rows:
        tool_steps = None
        if r["tool_steps"]:
            steps_data = json.loads(r["tool_steps"])
            tool_steps = [ToolStep(**step) for step in steps_data]
        messages.append(ChatMessage(
            id=r["id"],
            role=r["role"],
            content=r["content"],
            timestamp=r["timestamp"],
            tool_steps=tool_steps
        ))
    return messages

def clear_chat_history(agent_id: str, session_id: Optional[str] = None) -> bool:
    conn = get_connection()
    cursor = conn.cursor()
    if session_id:
        cursor.execute("DELETE FROM chat_messages WHERE agent_id = ? AND session_id = ?", (agent_id, session_id))
    else:
        cursor.execute("DELETE FROM chat_messages WHERE agent_id = ?", (agent_id,))
    conn.commit()
    conn.close()
    return True

def list_workflows() -> List[Workflow]:
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM workflows ORDER BY created_at DESC")
    rows = cursor.fetchall()
    conn.close()
    return [Workflow(
        id=r["id"],
        name=r["name"],
        description=r["description"],
        nodes=json.loads(r["nodes"]),
        edges=json.loads(r["edges"]),
        created_at=r["created_at"],
        updated_at=r["updated_at"]
    ) for r in rows]

def save_workflow(wf: Workflow) -> Workflow:
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
        INSERT OR REPLACE INTO workflows (id, name, description, nodes, edges, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    """, (
        wf.id,
        wf.name,
        wf.description,
        json.dumps(wf.nodes),
        json.dumps(wf.edges),
        wf.created_at,
        wf.updated_at
    ))
    conn.commit()
    conn.close()
    return wf
