import unittest
from unittest.mock import MagicMock, patch
import os
import sys

backend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from app.models.agent_models import (
    Agent, AgentSpecification, AgentModel, AgentCapabilities,
    AgentBehavior, AgentOutput, AgentAdvanced
)
from app.services.agent_runtime import AgentRuntime
from app.services.providers import GeminiProvider


class TestModelResolutionRegression(unittest.TestCase):
    """Regression test suite for agent model resolution and obsolete model handling."""

    def setUp(self):
        self.runtime = AgentRuntime()

    def _create_agent(self, model_name: str, provider: str = "gemini") -> Agent:
        return Agent(
            id="agent-test-fact-check",
            name="Fact Check Agent",
            description="Specialized in verifying claims against empirical sources.",
            purpose="Verify research claims.",
            specification=AgentSpecification(
                name="Fact Check Agent",
                purpose="Verify research claims.",
                description="Specialized in verifying claims against empirical sources.",
                model=AgentModel(provider=provider, name=model_name, temperature=0.4, max_tokens=2048),
                capabilities=AgentCapabilities(web_search=True),
                behavior=AgentBehavior(style="detailed", autonomy="guided"),
                output=AgentOutput(format="report"),
                advanced=AgentAdvanced(system_prompt="You are Fact Check Agent.")
            )
        )

    @patch("app.services.agent_runtime.GeminiProvider")
    @patch("app.services.agent_runtime.save_chat_message")
    @patch("app.services.agent_runtime.get_chat_history", return_value=[])
    def test_obsolete_model_cannot_override_valid_configured_default(
        self, mock_history, mock_save, mock_provider_cls
    ):
        """Proves that an agent with obsolete saved model 'gemini-2.5-flash' yields to configured default 'gemini-3.8-flash'."""
        mock_provider = MagicMock()
        mock_provider.generate_response.return_value = "Verified findings."
        mock_provider_cls.return_value = mock_provider

        # Agent was saved with obsolete model 'gemini-2.5-flash'
        agent = self._create_agent(model_name="gemini-2.5-flash")

        # User configured default in Settings is 'gemini-3.5-flash'
        user_configured_models = {"gemini": "gemini-3.5-flash"}

        self.runtime.run(
            agent=agent,
            message="Verify the claim.",
            session_id="test-session",
            api_keys={"gemini": "fake-test-key"},
            models=user_configured_models
        )

        # Verify the model passed to generate_response is the configured valid default, NOT the obsolete saved model
        called_args, called_kwargs = mock_provider.generate_response.call_args
        actual_model = called_kwargs.get("model_name")
        self.assertEqual(
            actual_model,
            "gemini-3.5-flash",
            f"Expected configured default 'gemini-3.5-flash', but got '{actual_model}'"
        )
        self.assertNotEqual(
            actual_model,
            "gemini-2.5-flash",
            "Obsolete model 'gemini-2.5-flash' should not be sent"
        )

    @patch("app.services.agent_runtime.GeminiProvider")
    @patch("app.services.agent_runtime.save_chat_message")
    @patch("app.services.agent_runtime.get_chat_history", return_value=[])
    def test_auto_agent_uses_configured_default(
        self, mock_history, mock_save, mock_provider_cls
    ):
        """Proves that an agent with model 'auto' (e.g. starter agents) uses user's configured model."""
        mock_provider = MagicMock()
        mock_provider.generate_response.return_value = "Analysis complete."
        mock_provider_cls.return_value = mock_provider

        agent = self._create_agent(model_name="auto")
        user_configured_models = {"gemini": "gemini-3.7-flash"}

        self.runtime.run(
            agent=agent,
            message="Analyze data.",
            session_id="test-session-2",
            api_keys={"gemini": "fake-test-key"},
            models=user_configured_models
        )

        _, called_kwargs = mock_provider.generate_response.call_args
        self.assertEqual(called_kwargs.get("model_name"), "gemini-3.7-flash")

    @patch("app.services.agent_runtime.GeminiProvider")
    @patch("app.services.agent_runtime.save_chat_message")
    @patch("app.services.agent_runtime.get_chat_history", return_value=[])
    def test_obsolete_model_without_user_override_falls_back_to_supported_model(
        self, mock_history, mock_save, mock_provider_cls
    ):
        """Proves that when no configured model is sent, obsolete models fall back to gemini-3.5-flash."""
        mock_provider = MagicMock()
        mock_provider.generate_response.return_value = "Result."
        mock_provider_cls.return_value = mock_provider

        agent = self._create_agent(model_name="gemini-2.5-flash")

        self.runtime.run(
            agent=agent,
            message="Check statement.",
            session_id="test-session-3",
            api_keys={"gemini": "fake-test-key"},
            models=None
        )

        _, called_kwargs = mock_provider.generate_response.call_args
        self.assertEqual(called_kwargs.get("model_name"), "gemini-3.5-flash")

    def test_gemini_provider_aliases_and_models_to_try(self):
        """Proves that GeminiProvider aliases never map to gemini-2.5-flash and never try gemini-2.5-flash."""
        provider = GeminiProvider()
        
        # Verify obsolete models are aliased to active models
        for obsolete in ["gemini-1.5-flash", "gemini-1.5-pro", "gemini-2.0-flash", "gemini-2.5-flash", "auto"]:
            mapped = provider.MODEL_ALIASES.get(obsolete)
            self.assertIn(
                mapped,
                ["gemini-3.5-flash", "gemini-3.7-flash", "gemini-3.8-flash", "gemini-flash-latest"],
                f"Obsolete model '{obsolete}' must map to an active model, got '{mapped}'"
            )
            self.assertNotEqual(mapped, "gemini-2.5-flash")


if __name__ == "__main__":
    unittest.main()
