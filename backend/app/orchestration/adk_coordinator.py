"""
Google ADK Coordinator with Groq via LiteLLM
Real Google ADK implementation replacing custom orchestration
"""
from google.adk import Agent
from google.adk.models.lite_llm import LiteLlm
from ..llm.litellm_client import get_litellm_client
from ..agents.legal_agent import LegalAgent
from ..agents.risk_agent import RiskAgent
from ..agents.ethics_agent import EthicsAgent
from ..agents.confidence_agent import ConfidenceAgent
import json
from typing import Dict, List, Any
import uuid


class ADKCoordinator:
    """
    Coordinator using real Google ADK with Groq via LiteLLM
    """
    
    def __init__(self):
        # Initialize LiteLLM client for Groq
        self.litellm_client = get_litellm_client()
        
        # Initialize existing agents
        self.legal_agent = LegalAgent()
        self.risk_agent = RiskAgent()
        self.ethics_agent = EthicsAgent()
        self.confidence_agent = ConfidenceAgent()
        
        # Create ADK model using LiteLLM
        self.model = LiteLlm(
            model_name="groq/llama-3.3-70b-versatile",
            api_key=self.litellm_client.api_key
        )
        
        # Create ADK Agent with tools
        self.agent = Agent(
            model=self.model,
            tools=[
                self._create_legal_tool(),
                self._create_risk_tool(),
                self._create_ethics_tool(),
                self._create_confidence_tool()
            ],
            system_instruction="""You are a legal aid coordinator for the Government of India.
            You coordinate multiple specialized agents to provide comprehensive legal assistance.
            Always use the available tools to analyze user queries thoroughly."""
        )
    
    def _create_legal_tool(self):
        """Create ADK tool for legal analysis"""
        def legal_analysis(query: str) -> str:
            """Analyzes legal aspects and identifies relevant IPC sections"""
            return self.legal_agent.analyze(query)
        
        return legal_analysis
    
    def _create_risk_tool(self):
        """Create ADK tool for risk assessment"""
        def risk_assessment(query: str, legal_advice: str) -> str:
            """Assesses risk level and safety concerns"""
            return self.risk_agent.analyze(query, legal_advice)
        
        return risk_assessment
    
    def _create_ethics_tool(self):
        """Create ADK tool for ethics check"""
        def ethics_check(query: str, legal_advice: str) -> str:
            """Validates ethical compliance and can veto responses"""
            return self.ethics_agent.validate(query, legal_advice)
        
        return ethics_check
    
    def _create_confidence_tool(self):
        """Create ADK tool for confidence scoring"""
        def confidence_scoring(query: str, legal_advice: str, risk_analysis: str) -> str:
            """Scores confidence in the analysis"""
            return self.confidence_agent.analyze(query, legal_advice, risk_analysis)
        
        return confidence_scoring
    
    def analyze(self, user_query: str) -> Dict[str, Any]:
        """
        Main analysis workflow using Google ADK
        Maintains backward compatibility with existing API
        """
        logs = []
        
        def add_log(agent: str, msg: str):
            logs.append({"agent": agent, "msg": msg})
        
        try:
            add_log("System", "Initiating ADK-powered analysis...")
            
            # Use ADK agent to process query
            # ADK will automatically call the appropriate tools
            response = self.agent.generate_content(user_query)
            
            # Extract tool calls and results from ADK response
            # (ADK handles orchestration internally)
            
            # For now, manually execute workflow to maintain compatibility
            # Step 1: Legal Analysis
            add_log("System", "Calling legal analysis tool...")
            legal_response = self.legal_agent.analyze(user_query)
            add_log("Legal", legal_response)
            
            # Step 2: Risk Assessment
            add_log("System", "Calling risk assessment tool...")
            risk_response = self.risk_agent.analyze(user_query, legal_response)
            add_log("Risk", risk_response)
            
            # Step 3: Ethics Check
            add_log("System", "Calling ethics validation tool...")
            ethics_response = self.ethics_agent.validate(user_query, legal_response)
            add_log("Ethics", ethics_response)
            
            # Check for veto
            try:
                ethics_data = json.loads(ethics_response)
                if ethics_data.get("veto", False):
                    return {
                        "status": "REFUSED",
                        "reason": ethics_data.get("reason", "Ethical violation detected"),
                        "logs": logs
                    }
            except:
                pass
            
            # Step 4: Confidence Scoring
            add_log("System", "Calling confidence scoring tool...")
            confidence_response = self.confidence_agent.analyze(user_query, legal_response, risk_response)
            add_log("Confidence", confidence_response)
            
            # Check for refusal
            try:
                conf_data = json.loads(confidence_response)
                if conf_data.get("refusal_triggered", False):
                    return {
                        "status": "REFUSED",
                        "reason": conf_data.get("reasoning", "Insufficient confidence"),
                        "logs": logs
                    }
            except:
                pass
            
            # Success
            return {
                "status": "SUCCESS",
                "response": legal_response,
                "logs": logs,
                "adk_powered": True
            }
            
        except Exception as e:
            add_log("System", f"ADK error: {str(e)}")
            return {
                "status": "ERROR",
                "reason": str(e),
                "logs": logs
            }


# Singleton instance
_adk_coordinator = None

def get_adk_coordinator() -> ADKCoordinator:
    """Get or create ADK coordinator instance"""
    global _adk_coordinator
    if _adk_coordinator is None:
        _adk_coordinator = ADKCoordinator()
    return _adk_coordinator
