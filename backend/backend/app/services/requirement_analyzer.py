import os
import json
import re
from typing import Optional, List, Dict, Any

try:
    from app.models.agent_models import (
        AgentSpecification,
        AgentBehavior,
        AgentCapabilities,
        AgentMemory,
        AgentModel,
        AgentOutput,
        AgentAdvanced,
        HumanReadableSummary,
        RequirementAnalysisResponse
    )
except ImportError:
    from backend.app.models.agent_models import (
        AgentSpecification,
        AgentBehavior,
        AgentCapabilities,
        AgentMemory,
        AgentModel,
        AgentOutput,
        AgentAdvanced,
        HumanReadableSummary,
        RequirementAnalysisResponse
    )

def analyze_user_requirement(requirement: str, preferred_name: Optional[str] = None) -> RequirementAnalysisResponse:
    openai_key = os.environ.get("OPENAI_API_KEY", "").strip()
    
    # If OpenAI API Key is present, attempt LLM-based analysis
    if openai_key:
        try:
            import openai
            client = openai.OpenAI(api_key=openai_key)
            prompt = f"""
You are an expert AI system architect.
A non-technical user wants to build an AI agent with this simple requirement:
"{requirement}"

Convert this requirement into a JSON object matching this schema:
{{
  "name": "concise agent name",
  "purpose": "clear 1-2 sentence purpose",
  "description": "2-3 sentence description",
  "tasks": ["step 1", "step 2", "step 3", "step 4", "step 5"],
  "behavior": {{
    "style": "detailed" | "simple" | "professional" | "creative" | "technical",
    "autonomy": "guided" | "automatic" | "ask_me"
  }},
  "capabilities": {{
    "web_search": true/false,
    "files": true/false,
    "data_analysis": true/false,
    "code_execution": true/false,
    "database": true/false,
    "apis": true/false,
    "other_agents": true/false
  }},
  "tools": ["tool_names_matching_capabilities"],
  "memory": {{
    "enabled": true,
    "scope": "across_conversations",
    "optimization": "balanced"
  }},
  "model": {{
    "provider": "recommended",
    "name": "auto",
    "temperature": 0.5,
    "max_tokens": 2048
  }},
  "output": {{
    "format": "normal" | "structured" | "table" | "report" | "json" | "code",
    "custom_instruction": ""
  }},
  "suggested_sample_questions": ["question 1", "question 2", "question 3"]
}}
Return ONLY valid JSON.
"""
            completion = client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[{"role": "user", "content": prompt}],
                temperature=0.3,
                response_format={"type": "json_object"}
            )
            raw_text = completion.choices[0].message.content
            parsed = json.loads(raw_text)
            
            name = preferred_name or parsed.get("name", "Custom AI Assistant")
            tasks = parsed.get("tasks", [])
            purpose = parsed.get("purpose", requirement)
            desc = parsed.get("description", requirement)
            sample_qs = parsed.get("suggested_sample_questions", [
                f"How can you help me with {name}?",
                "What is your primary capability?",
                "Give me an example of what you can do."
            ])
            
            # Map tools
            caps = parsed.get("capabilities", {})
            active_tools = [k for k, v in caps.items() if v]
            
            spec = AgentSpecification(
                name=name,
                purpose=purpose,
                description=desc,
                tasks=tasks,
                behavior=AgentBehavior(**parsed.get("behavior", {})),
                capabilities=AgentCapabilities(**caps),
                tools=active_tools,
                memory=AgentMemory(**parsed.get("memory", {})),
                model=AgentModel(**parsed.get("model", {})),
                output=AgentOutput(**parsed.get("output", {})),
                advanced=AgentAdvanced(
                    system_prompt=f"You are {name}. Your purpose is: {purpose}. Always act in accordance with your specified working style and capabilities.",
                    context_window=8000,
                    retry_attempts=3,
                    tool_timeout_seconds=30
                )
            )
            
            summary = HumanReadableSummary(
                name=name,
                purpose=purpose,
                what_it_will_do=tasks,
                suggested_sample_questions=sample_qs
            )
            return RequirementAnalysisResponse(specification=spec, summary=summary)
        except Exception as e:
            # Fallback to intelligent rule-based synthesizer
            pass

    # Intelligent Heuristic / NLP Pattern Synthesizer
    req_lower = requirement.lower()

    # Domain Detection & Mapping
    if any(k in req_lower for k in ["paper", "research", "summarize", "literature", "scholar", "academic", "gap", "study", "arxiv"]):
        domain = "research"
        name = preferred_name or "Research Assistant"
        purpose = "Find and analyze academic papers, summarize findings, and identify unaddressed research gaps."
        description = "An academic intelligence agent designed to scan publications, extract empirical findings, and synthesize structured research reviews."
        tasks = [
            "Search for relevant academic publications and online literature",
            "Read and extract core methodologies and arguments from documents",
            "Synthesize findings across different authors and perspectives",
            "Identify unexplored questions and research gaps",
            "Generate a structured research summary with citations"
        ]
        style = "detailed"
        autonomy = "guided"
        caps = AgentCapabilities(web_search=True, files=True, data_analysis=False, code_execution=False, database=False, apis=False, other_agents=False)
        output_format = "report"
        sample_questions = [
            "Find recent papers on LLM agents and summarize key architectural paradigms.",
            "What are the biggest open research gaps in sustainable computing?",
            "Summarize the methodology of recent retrieval-augmented generation benchmarks."
        ]
    elif any(k in req_lower for k in ["code", "programming", "python", "javascript", "developer", "bug", "debug", "software", "api", "typescript", "git", "algo"]):
        domain = "coding"
        name = preferred_name or "Coding Assistant"
        purpose = "Assist developers in writing, debugging, testing, and optimizing robust, clean software."
        description = "A versatile programming companion with deep software engineering knowledge, specializing in debugging, algorithms, and clean architecture."
        tasks = [
            "Analyze and debug code snippets to identify errors and anti-patterns",
            "Explain complex algorithms and system designs simply",
            "Generate clean, idiomatic, and production-ready code solutions",
            "Recommend performance optimizations and security best practices",
            "Produce comprehensive unit tests and documentation"
        ]
        style = "technical"
        autonomy = "automatic"
        caps = AgentCapabilities(web_search=True, files=True, data_analysis=False, code_execution=True, database=False, apis=False, other_agents=False)
        output_format = "code"
        sample_questions = [
            "How do I create a debounced search input in React TypeScript?",
            "Write a Python script to recursively search files and extract emails.",
            "Explain the difference between optimistic concurrency and pessimistic locking with code."
        ]
    elif any(k in req_lower for k in ["excel", "data", "csv", "analysis", "statistics", "dataset", "chart", "metrics", "insights", "trends"]):
        domain = "data"
        name = preferred_name or "Data Analysis Assistant"
        purpose = "Analyze structured datasets, calculate statistical indicators, and surface high-impact trends."
        description = "A quantitative data analysis agent built to inspect tabular data, compute descriptive statistics, and translate numbers into clear takeaways."
        tasks = [
            "Parse and profile tabular datasets, CSVs, and spreadsheets",
            "Calculate summary metrics, variance, and percentile distributions",
            "Detect statistical anomalies, seasonal patterns, and correlations",
            "Structure results into intuitive comparison tables",
            "Deliver executive-level takeaways and business recommendations"
        ]
        style = "professional"
        autonomy = "guided"
        caps = AgentCapabilities(web_search=False, files=True, data_analysis=True, code_execution=True, database=True, apis=False, other_agents=False)
        output_format = "table"
        sample_questions = [
            "Analyze this quarter's sales metrics and highlight underperforming categories.",
            "What is the mathematical formula and Python code to detect dataset outliers using IQR?",
            "How should I structure a data warehouse schema for e-commerce event tracking?"
        ]
    elif any(k in req_lower for k in ["customer", "support", "help desk", "faq", "service", "ticket", "inquiry", "complaint"]):
        domain = "support"
        name = preferred_name or "Customer Support Assistant"
        purpose = "Resolve customer questions with empathy, clarity, and rapid troubleshooting guidance."
        description = "A friendly, customer-centric support agent trained to answer common questions, troubleshoot issues, and escalate when appropriate."
        tasks = [
            "Understand customer queries and assess sentiment accurately",
            "Retrieve relevant policy and troubleshooting answers from knowledge bases",
            "Provide step-by-step resolution steps in a polite, friendly tone",
            "Clarify ambiguities before suggesting irreversible account changes",
            "Summarize the ticket resolution for customer history logs"
        ]
        style = "simple"
        autonomy = "guided"
        caps = AgentCapabilities(web_search=True, files=True, data_analysis=False, code_execution=False, database=False, apis=True, other_agents=False)
        output_format = "normal"
        sample_questions = [
            "A customer wants a refund after 35 days. How should I respond politely?",
            "How do I troubleshoot a user who cannot receive password reset emails?",
            "Draft a reassuring reply for a service outage lasting 2 hours."
        ]
    elif any(k in req_lower for k in ["document", "pdf", "contract", "invoice", "resume", "extract", "agreement", "legal"]):
        domain = "document"
        name = preferred_name or "Document Analyzer"
        purpose = "Read, parse, and extract critical clauses, obligations, and figures from complex documents."
        description = "An intelligent document assistant capable of reading dense PDFs, extracting structured metadata, and summarizing terms."
        tasks = [
            "Ingest and inspect multi-page documents and contractual agreements",
            "Extract critical dates, financial amounts, and named entities",
            "Highlight potential risks, liabilities, and ambiguous clauses",
            "Summarize multi-page documents into concise executive briefs",
            "Answer targeted questions backed strictly by document text"
        ]
        style = "detailed"
        autonomy = "guided"
        caps = AgentCapabilities(web_search=False, files=True, data_analysis=False, code_execution=False, database=False, apis=False, other_agents=False)
        output_format = "report"
        sample_questions = [
            "What are the termination notice requirements in this agreement?",
            "Extract all payment deadlines and penalty clauses from this contract.",
            "Summarize the key deliverables and scope boundaries."
        ]
    elif any(k in req_lower for k in ["write", "content", "blog", "social media", "copy", "newsletter", "article", "marketing", "post"]):
        domain = "content"
        name = preferred_name or "Content Writer"
        purpose = "Craft captivating, audience-tailored articles, newsletters, and marketing copy."
        description = "A creative wordsmith agent focused on storytelling, strong narrative hooks, and persuasive copywriting across various media."
        tasks = [
            "Research trending topics and target audience motivations",
            "Develop engaging outlines with high-converting hooks",
            "Draft original, high-quality blog posts and articles",
            "Adapt voice and tone for different platforms and brands",
            "Refine copy for readability, brevity, and emotional resonance"
        ]
        style = "creative"
        autonomy = "automatic"
        caps = AgentCapabilities(web_search=True, files=False, data_analysis=False, code_execution=False, database=False, apis=False, other_agents=False)
        output_format = "report"
        sample_questions = [
            "Write a compelling LinkedIn post introducing a new AI product.",
            "Draft a 3-part newsletter sequence about productivity for founders.",
            "Create 5 catchy headlines for an article on future workplace trends."
        ]
    elif any(k in req_lower for k in ["productivity", "task", "schedule", "calendar", "organize", "plan", "time management", "habit"]):
        domain = "productivity"
        name = preferred_name or "Personal Productivity Assistant"
        purpose = "Help prioritize daily schedules, streamline workflows, and maintain focus on high-impact goals."
        description = "A personal executive assistant designed to organize tasks, manage schedules, and keep you accountable to your key priorities."
        tasks = [
            "Deconstruct ambitious goals into manageable daily action items",
            "Prioritize task lists using Eisenhower matrix principles",
            "Draft structured daily schedules and time-blocked calendar agendas",
            "Provide end-of-day reflection check-ins and productivity metrics",
            "Automate repetitive workflow routines and reminders"
        ]
        style = "simple"
        autonomy = "guided"
        caps = AgentCapabilities(web_search=False, files=False, data_analysis=False, code_execution=False, database=False, apis=True, other_agents=False)
        output_format = "structured"
        sample_questions = [
            "Help me plan my tomorrow with 3 core priorities and time blocks.",
            "How do I overcome procrastination when starting a daunting project?",
            "Create a weekly review checklist to evaluate progress."
        ]
    else:
        # Custom Agent
        clean_req = re.sub(r'^(i want (an|a)|help me|build an?|create an?)\s+', '', requirement, flags=re.IGNORECASE).strip()
        words = clean_req.split()
        short_name = " ".join(words[:3]).title() if words else "Custom"
        name = preferred_name or f"{short_name} Assistant"
        purpose = f"Provide expert assistance to {clean_req.lower() if clean_req else 'accomplish your specific objectives'}."
        description = f"An adaptable AI assistant tailored to help users with: {requirement}"
        tasks = [
            f"Understand the user's specific goals regarding {clean_req[:40] if clean_req else 'the task'}",
            "Gather relevant facts, parameters, and background context",
            "Formulate step-by-step strategies and recommendations",
            "Execute requested workflows with consistent accuracy",
            "Provide clear, actionable responses and follow-up suggestions"
        ]
        style = "detailed"
        autonomy = "guided"
        caps = AgentCapabilities(web_search=True, files=True, data_analysis=False, code_execution=False, database=False, apis=False, other_agents=False)
        output_format = "normal"
        sample_questions = [
            f"How can you assist me with {name}?",
            "What are your best practices and primary tools?",
            "Give me a concrete plan to get started."
        ]

    # Map capabilities into tool list
    active_tools = []
    if caps.web_search: active_tools.append("web_search")
    if caps.files: active_tools.append("file_processing")
    if caps.data_analysis: active_tools.append("data_analysis")
    if caps.code_execution: active_tools.append("code_execution")
    if caps.database: active_tools.append("database")
    if caps.apis: active_tools.append("apis")
    if caps.other_agents: active_tools.append("other_agents")

    spec = AgentSpecification(
        name=name,
        purpose=purpose,
        description=description,
        tasks=tasks,
        behavior=AgentBehavior(style=style, autonomy=autonomy),
        capabilities=caps,
        tools=active_tools,
        memory=AgentMemory(enabled=True, scope="across_conversations", optimization="balanced"),
        model=AgentModel(provider="recommended", name="auto", temperature=0.4 if style in ["detailed", "technical"] else 0.7, max_tokens=2048),
        output=AgentOutput(format=output_format, custom_instruction=""),
        advanced=AgentAdvanced(
            system_prompt=f"You are {name}. Purpose: {purpose}. Working style: {style}. Work with {autonomy} autonomy.",
            context_window=8000,
            retry_attempts=3,
            tool_timeout_seconds=30
        )
    )

    summary = HumanReadableSummary(
        name=name,
        purpose=purpose,
        what_it_will_do=tasks,
        suggested_sample_questions=sample_questions
    )

    return RequirementAnalysisResponse(specification=spec, summary=summary)
