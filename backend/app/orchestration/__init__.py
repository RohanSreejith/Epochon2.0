"""
Custom Orchestration Framework
Inspired by Google ADK patterns but lightweight and dependency-free.
Provides: Tool calling, State management, Agent coordination
"""
from typing import Dict, List, Any, Callable, Optional
from dataclasses import dataclass, field
from datetime import datetime
import json


@dataclass
class ToolDefinition:
    """Defines an agent tool with metadata"""
    name: str
    description: str
    function: Callable
    parameters: Dict[str, Any] = field(default_factory=dict)
    
    def execute(self, **kwargs) -> Any:
        """Execute the tool function"""
        return self.function(**kwargs)


@dataclass
class ExecutionContext:
    """Maintains state across agent interactions"""
    session_id: str
    conversation_history: List[Dict[str, str]] = field(default_factory=list)
    tool_results: Dict[str, Any] = field(default_factory=dict)
    metadata: Dict[str, Any] = field(default_factory=dict)
    
    def add_message(self, role: str, content: str):
        """Add message to conversation history"""
        self.conversation_history.append({
            "role": role,
            "content": content,
            "timestamp": datetime.now().isoformat()
        })
    
    def store_tool_result(self, tool_name: str, result: Any):
        """Store result from tool execution"""
        self.tool_results[tool_name] = {
            "result": result,
            "timestamp": datetime.now().isoformat()
        }
    
    def get_context_summary(self) -> str:
        """Get formatted summary of current context"""
        return f"Session: {self.session_id}, Messages: {len(self.conversation_history)}, Tools Used: {list(self.tool_results.keys())}"


class ToolRegistry:
    """Central registry for all agent tools"""
    
    def __init__(self):
        self.tools: Dict[str, ToolDefinition] = {}
    
    def register(self, tool: ToolDefinition):
        """Register a new tool"""
        self.tools[tool.name] = tool
        return tool
    
    def get(self, name: str) -> Optional[ToolDefinition]:
        """Get tool by name"""
        return self.tools.get(name)
    
    def list_tools(self) -> List[str]:
        """List all registered tool names"""
        return list(self.tools.keys())
    
    def get_tools_description(self) -> str:
        """Get formatted description of all tools"""
        descriptions = []
        for name, tool in self.tools.items():
            descriptions.append(f"- {name}: {tool.description}")
        return "\n".join(descriptions)


class AgentOrchestrator:
    """
    Main orchestration engine
    Coordinates tool execution, manages state, handles errors
    """
    
    def __init__(self, registry: ToolRegistry):
        self.registry = registry
        self.contexts: Dict[str, ExecutionContext] = {}
    
    def create_context(self, session_id: str) -> ExecutionContext:
        """Create new execution context for a session"""
        context = ExecutionContext(session_id=session_id)
        self.contexts[session_id] = context
        return context
    
    def get_context(self, session_id: str) -> Optional[ExecutionContext]:
        """Get existing context"""
        return self.contexts.get(session_id)
    
    def execute_tool(self, tool_name: str, context: ExecutionContext, **kwargs) -> Dict[str, Any]:
        """
        Execute a tool with error handling and logging
        Returns: {"success": bool, "result": Any, "error": str}
        """
        tool = self.registry.get(tool_name)
        if not tool:
            return {
                "success": False,
                "result": None,
                "error": f"Tool '{tool_name}' not found"
            }
        
        try:
            result = tool.execute(**kwargs)
            context.store_tool_result(tool_name, result)
            return {
                "success": True,
                "result": result,
                "error": None
            }
        except Exception as e:
            return {
                "success": False,
                "result": None,
                "error": str(e)
            }
    
    def execute_workflow(self, session_id: str, tools_to_run: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Execute a sequence of tools
        tools_to_run: [{"tool": "legal_agent", "params": {...}}, ...]
        Returns: List of execution results
        """
        context = self.get_context(session_id) or self.create_context(session_id)
        results = []
        
        for tool_spec in tools_to_run:
            tool_name = tool_spec.get("tool")
            params = tool_spec.get("params", {})
            
            result = self.execute_tool(tool_name, context, **params)
            results.append({
                "tool": tool_name,
                **result
            })
            
            # Stop on error if critical
            if not result["success"] and tool_spec.get("critical", False):
                break
        
        return results


# Global instances
_registry = ToolRegistry()
_orchestrator = AgentOrchestrator(_registry)


def get_registry() -> ToolRegistry:
    """Get global tool registry"""
    return _registry


def get_orchestrator() -> AgentOrchestrator:
    """Get global orchestrator"""
    return _orchestrator


def tool(name: str, description: str, parameters: Optional[Dict] = None):
    """
    Decorator to register a function as a tool
    
    Usage:
        @tool("legal_agent", "Analyzes legal aspects")
        def analyze_legal(query: str) -> dict:
            ...
    """
    def decorator(func: Callable) -> Callable:
        tool_def = ToolDefinition(
            name=name,
            description=description,
            function=func,
            parameters=parameters or {}
        )
        _registry.register(tool_def)
        return func
    return decorator
