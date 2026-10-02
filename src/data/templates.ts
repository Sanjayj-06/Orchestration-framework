import type { AgentTemplate } from '../types/agent';

export const STARTER_TEMPLATES: AgentTemplate[] = [
  {
    id: 'customer_support_rag',
    name: 'Customer Support RAG Agent',
    description: 'Retrieves knowledge base docs, maintains conversation history, and invokes API tools for order refunds.',
    badge: 'Popular',
    nodes: [
      {
        id: 'node_trigger',
        type: 'triggerNode',
        position: { x: 50, y: 180 },
        data: {
          label: 'Customer Webhook / Chat',
          category: 'trigger',
          subtitle: 'Incoming user messages',
          config: { triggerType: 'webhook', webhookPath: '/v1/webhooks/support-chat' }
        }
      },
      {
        id: 'node_memory',
        type: 'memoryNode',
        position: { x: 350, y: 100 },
        data: {
          label: 'Knowledge Base Vector RAG',
          category: 'memory',
          subtitle: 'Qdrant Hybrid Retrieval',
          config: {
            memoryType: 'vector_rag',
            vectorCollection: 'support_docs_v2',
            topK: 4,
            similarityThreshold: 0.75,
            embeddingModel: 'text-embedding-3-small'
          }
        }
      },
      {
        id: 'node_short_term',
        type: 'memoryNode',
        position: { x: 350, y: 300 },
        data: {
          label: 'Short-Term History Buffer',
          category: 'memory',
          subtitle: 'Sliding window (last 6 turns)',
          config: {
            memoryType: 'short_term_buffer'
          }
        }
      },
      {
        id: 'node_llm',
        type: 'llmNode',
        position: { x: 680, y: 180 },
        data: {
          label: 'GPT-4o Reasoning Core',
          category: 'llm',
          subtitle: 'OpenAI GPT-4o Model',
          config: {
            provider: 'openai',
            model: 'gpt-4o',
            temperature: 0.3,
            maxTokens: 1024,
            systemPrompt: 'You are an empathetic, concise Customer Support Assistant. Use retrieved knowledge docs {{node_memory.output}} and conversation context {{node_short_term.output}} to answer accurately. If an order refund is required, request the order refund API tool.'
          }
        }
      },
      {
        id: 'node_tool_refund',
        type: 'toolNode',
        position: { x: 1000, y: 100 },
        data: {
          label: 'Process Refund API',
          category: 'tool',
          subtitle: 'REST Tool (Shopify)',
          config: {
            toolType: 'rest_api',
            apiUrl: 'https://api.store.com/v1/refunds',
            httpMethod: 'POST',
            bodyTemplate: '{\n  "order_id": "{{input.order_id}}",\n  "reason": "customer_request"\n}'
          }
        }
      },
      {
        id: 'node_tool_search',
        type: 'toolNode',
        position: { x: 1000, y: 290 },
        data: {
          label: 'Web Search Fallback',
          category: 'tool',
          subtitle: 'Tavily Search API',
          config: {
            toolType: 'web_search',
            apiUrl: 'https://api.tavily.com/search'
          }
        }
      }
    ],
    edges: [
      { id: 'e1', source: 'node_trigger', target: 'node_memory', animated: true },
      { id: 'e2', source: 'node_trigger', target: 'node_short_term', animated: true },
      { id: 'e3', source: 'node_memory', target: 'node_llm', animated: true },
      { id: 'e4', source: 'node_short_term', target: 'node_llm', animated: true },
      { id: 'e5', source: 'node_llm', target: 'node_tool_refund', animated: true, label: 'Tool Call' },
      { id: 'e6', source: 'node_llm', target: 'node_tool_search', animated: true, label: 'Fallback Search' }
    ]
  },
  {
    id: 'autonomous_researcher',
    name: 'Autonomous Web Research & Analyst',
    description: 'Uses Claude 3.5 Sonnet with Tavily search & Python data analysis sandbox to draft deep intelligence reports.',
    badge: 'Advanced',
    nodes: [
      {
        id: 'node_trig_manual',
        type: 'triggerNode',
        position: { x: 50, y: 200 },
        data: {
          label: 'Research Goal Trigger',
          category: 'trigger',
          subtitle: 'Manual User Input / Prompt',
          config: { triggerType: 'manual_chat' }
        }
      },
      {
        id: 'node_tavily',
        type: 'toolNode',
        position: { x: 350, y: 100 },
        data: {
          label: 'Web Search Deep Engine',
          category: 'tool',
          subtitle: 'Tavily Search Tool',
          config: { toolType: 'web_search', apiUrl: 'https://api.tavily.com/search' }
        }
      },
      {
        id: 'node_python',
        type: 'toolNode',
        position: { x: 350, y: 300 },
        data: {
          label: 'Python Data Analytics Sandbox',
          category: 'tool',
          subtitle: 'E2B Isolated Container',
          config: {
            toolType: 'code_sandbox',
            codeSnippet: 'import pandas as pd\nimport numpy as np\n\ndef analyze(data):\n    df = pd.DataFrame(data)\n    return df.describe().to_dict()'
          }
        }
      },
      {
        id: 'node_claude',
        type: 'llmNode',
        position: { x: 700, y: 200 },
        data: {
          label: 'Claude 3.5 Sonnet Synthesis',
          category: 'llm',
          subtitle: 'Anthropic Claude Model',
          config: {
            provider: 'anthropic',
            model: 'claude-3-5-sonnet',
            temperature: 0.2,
            maxTokens: 2048,
            systemPrompt: 'You are a senior analyst. Analyze search findings {{node_tavily.output}} and data calculations {{node_python.output}} to synthesize a structured report.'
          }
        }
      }
    ],
    edges: [
      { id: 'er1', source: 'node_trig_manual', target: 'node_tavily', animated: true },
      { id: 'er2', source: 'node_trig_manual', target: 'node_python', animated: true },
      { id: 'er3', source: 'node_tavily', target: 'node_claude', animated: true },
      { id: 'er4', source: 'node_python', target: 'node_claude', animated: true }
    ]
  },
  {
    id: 'lead_qualifier',
    name: 'B2B Lead Qualification & CRM Agent',
    description: 'Processes lead forms via Gemini 1.5 Pro, checks lead score logic, and syncs qualified leads to Hubspot CRM.',
    badge: 'Enterprise',
    nodes: [
      {
        id: 'node_lead_webhook',
        type: 'triggerNode',
        position: { x: 50, y: 200 },
        data: {
          label: 'Typeform / Webhook',
          category: 'trigger',
          subtitle: 'Inbound Lead Submission',
          config: { triggerType: 'webhook', webhookPath: '/v1/webhooks/lead-form' }
        }
      },
      {
        id: 'node_gemini',
        type: 'llmNode',
        position: { x: 350, y: 200 },
        data: {
          label: 'Gemini 1.5 Pro Evaluator',
          category: 'llm',
          subtitle: 'Google Gemini Model',
          config: {
            provider: 'google',
            model: 'gemini-1.5-pro',
            temperature: 0.1,
            systemPrompt: 'Evaluate the incoming lead payload. Output a JSON with fit_score (1-100), key_budget, and decision.'
          }
        }
      },
      {
        id: 'node_logic',
        type: 'logicNode',
        position: { x: 680, y: 200 },
        data: {
          label: 'Fit Score Router',
          category: 'logic',
          subtitle: 'If fit_score >= 70',
          config: { conditionField: 'fit_score', conditionOperator: 'greater_than', conditionValue: '70' }
        }
      },
      {
        id: 'node_crm_tool',
        type: 'toolNode',
        position: { x: 1000, y: 120 },
        data: {
          label: 'HubSpot CRM Sync',
          category: 'tool',
          subtitle: 'REST Tool (HubSpot)',
          config: {
            toolType: 'rest_api',
            apiUrl: 'https://api.hubapi.com/crm/v3/objects/contacts',
            httpMethod: 'POST'
          }
        }
      }
    ],
    edges: [
      { id: 'el1', source: 'node_lead_webhook', target: 'node_gemini', animated: true },
      { id: 'el2', source: 'node_gemini', target: 'node_logic', animated: true },
      { id: 'el3', source: 'node_logic', target: 'node_crm_tool', animated: true, label: 'Qualified' }
    ]
  }
];
