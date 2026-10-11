import abc
from typing import List, Dict, Any, Optional

class AIProvider(abc.ABC):
    """Abstract base class for AI Providers"""
    
    @abc.abstractmethod
    def generate_response(
        self, 
        model_name: str, 
        system_prompt: str, 
        history: List[Dict[str, str]], 
        message: str, 
        temperature: float, 
        max_tokens: int,
        api_key: str
    ) -> str:
        """Generates a response from the LLM provider"""
        pass
    
    @abc.abstractmethod
    def test_connection(self, api_key: str) -> bool:
        """Tests the connection to the provider"""
        pass

class OpenAIProvider(AIProvider):
    def generate_response(
        self, 
        model_name: str, 
        system_prompt: str, 
        history: List[Dict[str, str]], 
        message: str, 
        temperature: float, 
        max_tokens: int,
        api_key: str
    ) -> str:
        import openai
        client = openai.OpenAI(api_key=api_key)
        messages: Any = [{"role": "system", "content": system_prompt}]
        for h in history[-8:]:
            messages.append({"role": h["role"], "content": h["content"]})
        messages.append({"role": "user", "content": message})
        
        # Default to a valid model if "auto" or invalid is specified
        if model_name == "auto" or "gpt" not in model_name:
            model_name = "gpt-4o-mini"
            
        completion = client.chat.completions.create(
            model=model_name,
            messages=messages,
            temperature=temperature,
            max_tokens=max_tokens
        )
        return completion.choices[0].message.content or ""

    def test_connection(self, api_key: str) -> bool:
        try:
            import openai
            client = openai.OpenAI(api_key=api_key)
            client.models.list()
            return True
        except Exception:
            return False

class GeminiProvider(AIProvider):
    MODEL_ALIASES = {
        "gemini-1.5-flash": "gemini-3.5-flash",
        "gemini-1.5-pro": "gemini-3.5-flash",
        "gemini-2.0-flash": "gemini-3.5-flash",
        "gemini-2.5-flash": "gemini-3.5-flash",
        "gemini-2.5-pro": "gemini-3.5-flash",
        "gemini-2.5-flash-lite": "gemini-3.1-flash-lite",
        "auto": "gemini-3.5-flash",
    }

    def generate_response(
        self, 
        model_name: str, 
        system_prompt: str, 
        history: List[Dict[str, str]], 
        message: str, 
        temperature: float, 
        max_tokens: int,
        api_key: str
    ) -> str:
        import logging
        logger = logging.getLogger("agentcraft.providers.gemini")

        from google import genai
        from google.genai import types

        resolved_model = self.MODEL_ALIASES.get(model_name.lower().strip(), model_name)
        if resolved_model == "auto" or "gemini" not in resolved_model:
            resolved_model = "gemini-3.5-flash"

        logger.info(
            f"[GeminiProvider] Dispatching request: provider=gemini, requested_model='{model_name}', "
            f"resolved_model='{resolved_model}', temperature={temperature}, max_output_tokens={max_tokens}"
        )

        client = genai.Client(api_key=api_key)

        # Ensure sufficient tokens for thinking models and output generation
        effective_max_tokens = max(max_tokens or 2048, 2048)

        # Disable or minimize internal thinking budget so chat/generation is not starved
        thinking_config = None
        if hasattr(types, "ThinkingConfig"):
            try:
                thinking_config = types.ThinkingConfig(thinking_budget=0)
            except Exception:
                thinking_config = None

        config = types.GenerateContentConfig(
            system_instruction=system_prompt,
            temperature=temperature,
            max_output_tokens=effective_max_tokens,
            thinking_config=thinking_config,
        )

        # Build chat history for Gemini in google-genai format
        chat_history = []
        for h in history[-8:]:
            role = "user" if h["role"] == "user" else "model"
            chat_history.append(
                types.Content(
                    role=role,
                    parts=[types.Part.from_text(text=h["content"])]
                )
            )

        models_to_try = [resolved_model]
        for fallback in ["gemini-3.5-flash", "gemini-3.7-flash", "gemini-3.1-flash-lite"]:
            if fallback not in models_to_try:
                models_to_try.append(fallback)

        resp = None
        last_error = None
        used_model = resolved_model

        for m in models_to_try:
            try:
                used_model = m
                chat = client.chats.create(
                    model=m,
                    config=config,
                    history=chat_history
                )
                resp = chat.send_message(message)
                break
            except Exception as e:
                last_error = e
                err_text = str(e)
                if ("503" in err_text or "UNAVAILABLE" in err_text or "429" in err_text or "RESOURCE_EXHAUSTED" in err_text) and m != models_to_try[-1]:
                    logger.warning(
                        f"[GeminiProvider] Model '{m}' returned transient error: {err_text}. "
                        f"Attempting fallback to '{models_to_try[-1]}'..."
                    )
                    continue
                raise

        if resp is None:
            if last_error:
                raise last_error
            raise ValueError(f"Gemini API request failed across models: {models_to_try}")

        # Check prompt feedback for blocks
        if hasattr(resp, "prompt_feedback") and resp.prompt_feedback:
            block_reason = getattr(resp.prompt_feedback, "block_reason", None)
            if block_reason:
                logger.warning(f"[GeminiProvider] Prompt blocked: block_reason={block_reason}")
                raise ValueError(f"Gemini prompt blocked by safety policy: {block_reason}")

        # Check candidates
        candidates = getattr(resp, "candidates", None) or []
        candidate_count = len(candidates)
        finish_reason = getattr(candidates[0], "finish_reason", None) if candidate_count > 0 else None

        # Extract text content safely
        text_content = ""
        if hasattr(resp, "text") and resp.text:
            text_content = resp.text
        elif candidate_count > 0 and candidates[0].content and candidates[0].content.parts:
            parts = candidates[0].content.parts
            extracted_parts = [p.text for p in parts if getattr(p, "text", None)]
            text_content = "".join(extracted_parts)

        logger.info(
            f"[GeminiProvider] Response received: provider=gemini, model='{resolved_model}', "
            f"candidate_count={candidate_count}, finish_reason={finish_reason}, "
            f"text_present={bool(text_content.strip())}, text_length={len(text_content)}"
        )

        if not text_content or not text_content.strip():
            if candidate_count == 0:
                raise ValueError("Gemini returned 0 response candidates.")
            finish_str = str(finish_reason) if finish_reason else "UNKNOWN"
            if "SAFETY" in finish_str:
                raise ValueError(f"Gemini response blocked by content safety filters (finish_reason={finish_str}).")
            elif "RECITATION" in finish_str:
                raise ValueError(f"Gemini response blocked by recitation check (finish_reason={finish_str}).")
            elif "BLOCKLIST" in finish_str or "PROHIBITED" in finish_str:
                raise ValueError(f"Gemini response blocked by policy (finish_reason={finish_str}).")
            elif "MALFORMED_FUNCTION_CALL" in finish_str:
                raise ValueError(f"Gemini model attempted an invalid function call (finish_reason={finish_str}).")
            elif "MAX_TOKENS" in finish_str:
                raise ValueError(f"Gemini response was cut off before text generation began (finish_reason={finish_str}).")
            else:
                raise ValueError(f"Gemini returned an empty response (finish_reason={finish_str}, candidates={candidate_count}).")

        return text_content

    def test_connection(self, api_key: str) -> bool:
        try:
            from google import genai
            client = genai.Client(api_key=api_key)
            for _ in client.models.list():
                break
            return True
        except Exception:
            return False

class AnthropicProvider(AIProvider):
    def generate_response(
        self, 
        model_name: str, 
        system_prompt: str, 
        history: List[Dict[str, str]], 
        message: str, 
        temperature: float, 
        max_tokens: int,
        api_key: str
    ) -> str:
        try:
            from anthropic import Anthropic  # type: ignore
        except ImportError:
            raise ValueError("Anthropic library not installed. pip install anthropic")
            
        client = Anthropic(api_key=api_key)
        
        if model_name == "auto" or "claude" not in model_name:
            model_name = "claude-3-5-sonnet-20240620"
            
        messages: Any = []
        for h in history[-8:]:
            # Anthropic roles are 'user' and 'assistant'
            role = "user" if h["role"] == "user" else "assistant"
            messages.append({"role": role, "content": h["content"]})
            
        messages.append({"role": "user", "content": message})
        
        create_kwargs: Dict[str, Any] = {
            "model": model_name,
            "system": system_prompt,
            "max_tokens": max_tokens,
            "messages": messages,
        }
        if temperature is not None:
            create_kwargs["extra_body"] = {"temperature": temperature}
            
        msg = client.messages.create(**create_kwargs)
        if msg.content and len(msg.content) > 0:
            first_block = msg.content[0]
            return getattr(first_block, "text", str(first_block))
        return ""

    def test_connection(self, api_key: str) -> bool:
        try:
            from anthropic import Anthropic  # type: ignore
            client = Anthropic(api_key=api_key)
            client.models.list()
            return True
        except Exception:
            return False
