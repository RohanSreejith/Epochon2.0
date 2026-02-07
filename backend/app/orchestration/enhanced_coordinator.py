"""
Enhanced Coordinator Agent using Custom Orchestration Framework
Maintains all existing functionality while adding better state management
"""
from ..orchestration import get_orchestrator, get_registry, tool, ExecutionContext
from ..agents.legal_agent import LegalAgent
from ..agents.risk_agent import RiskAgent
from ..agents.ethics_agent import EthicsAgent
from ..agents.confidence_agent import ConfidenceAgent
from ..llm.groq_client import GroqClient
import json
from typing import Dict, List, Any
import uuid


class EnhancedCoordinator:
    """
    Orchestrates multi-agent workflow with improved state management
    Uses custom orchestration framework for better tool calling and coordination
    """
    
    def __init__(self):
        self.orchestrator = get_orchestrator()
        self.registry = get_registry()
        self.llm = GroqClient()
        
        # Initialize agents
        self.legal_agent = LegalAgent()
        self.risk_agent = RiskAgent()
        self.ethics_agent = EthicsAgent()
        self.confidence_agent = ConfidenceAgent()
        
        # Register agents as tools
        self._register_tools()
    
    def _register_tools(self):
        """Register all agents as executable tools"""
        
        @tool("legal_analysis", "Analyzes legal aspects and identifies relevant IPC sections")
        def legal_tool(query: str) -> str:
            return self.legal_agent.analyze(query)
        
        @tool("risk_assessment", "Assesses risk level and safety concerns")
        def risk_tool(query: str, legal_advice: str) -> str:
            return self.risk_agent.analyze(query, legal_advice)
        
        @tool("ethics_check", "Validates ethical compliance and can veto responses")
        def ethics_tool(query: str, legal_advice: str) -> str:
            return self.ethics_agent.validate(query, legal_advice)
        
        @tool("confidence_scoring", "Scores confidence in the analysis")
        def confidence_tool(query: str, legal_advice: str, risk_analysis: str) -> str:
            return self.confidence_agent.analyze(query, legal_advice, risk_analysis)
    
    def analyze(self, user_query: str) -> Dict[str, Any]:
        """
        Main analysis workflow with orchestration
        Maintains backward compatibility with existing API
        """
        # Create session context
        session_id = str(uuid.uuid4())
        context = self.orchestrator.create_context(session_id)
        context.add_message("user", user_query)
        
        # Collect logs for frontend
        logs = []
        
        def add_log(agent: str, msg: str):
            logs.append({"agent": agent, "msg": msg})
        
        try:
            # Step 1: Legal Analysis
            add_log("System", "Initiating legal analysis...")
            legal_result = self.orchestrator.execute_tool(
                "legal_analysis",
                context,
                query=user_query
            )
            
            if not legal_result["success"]:
                return {
                    "status": "ERROR",
                    "reason": f"Legal analysis failed: {legal_result['error']}",
                    "logs": logs
                }
            
            legal_response = legal_result["result"]
            add_log("Legal", legal_response)
            context.add_message("assistant", legal_response)
            
            # Step 2: Risk Assessment
            add_log("System", "Assessing risk level...")
            risk_result = self.orchestrator.execute_tool(
                "risk_assessment",
                context,
                query=user_query,
                legal_advice=legal_response
            )
            
            if not risk_result["success"]:
                add_log("System", f"Risk assessment warning: {risk_result['error']}")
            
            risk_response = risk_result.get("result", "{}")
            add_log("Risk", risk_response)
            
            # Step 3: Ethics Check
            add_log("System", "Running ethics validation...")
            ethics_result = self.orchestrator.execute_tool(
                "ethics_check",
                context,
                query=user_query,
                legal_advice=legal_response
            )
            
            if not ethics_result["success"]:
                add_log("Ethics", f"Ethics check error: {ethics_result['error']}")
            
            ethics_response = ethics_result.get("result", "{}")
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
            add_log("System", "Calculating confidence score...")
            confidence_result = self.orchestrator.execute_tool(
                "confidence_scoring",
                context,
                query=user_query,
                legal_advice=legal_response,
                risk_analysis=risk_response
            )
            
            if not confidence_result["success"]:
                add_log("System", f"Confidence scoring warning: {confidence_result['error']}")
            
            confidence_response = confidence_result.get("result", "{}")
            add_log("Confidence", confidence_response)
            
            # Check for refusal based on low confidence
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
            
            # Success - return legal advice
            return {
                "status": "SUCCESS",
                "response": legal_response,
                "logs": logs,
                "context_summary": context.get_context_summary()
            }
            
        except Exception as e:
            add_log("System", f"Critical error: {str(e)}")
            return {
                "status": "ERROR",
                "reason": str(e),
                "logs": logs
            }
    
    def get_session_context(self, session_id: str) -> ExecutionContext:
        """Retrieve session context for multi-turn conversations"""
        return self.orchestrator.get_context(session_id)
    
    def list_available_tools(self) -> List[str]:
        """List all registered tools"""
        return self.registry.list_tools()


# Create singleton instance
_coordinator = None

def get_coordinator() -> EnhancedCoordinator:
    """Get or create coordinator instance"""
    global _coordinator
    if _coordinator is None:
        _coordinator = EnhancedCoordinator()
    return _coordinator
