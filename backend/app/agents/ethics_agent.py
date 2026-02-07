from ..llm.groq_client import GroqClient
import json

class EthicsAgent:
    def __init__(self):
        self.llm = GroqClient()
        
    def analyze(self, query, risk_analysis=""):
        prompt = f"""You are the Ethics & Safety Agent. You have VETO power.
        User Situation: "{query}"
        Risk Analysis: "{risk_analysis}"
        
        Task:
        1. Evaluate if the request violates safety policies (Self-harm, Violence, Illegal acts, Hate speech).
        2. Decide if the system should REFUSE to answer.
        3. If refusing, provide a safe, neutral reason.
        
        Output Format:
        {{
            "is_safe": true/false,
            "veto": true/false,
            "reason": "..."
        }}
        Return ONLY valid JSON.
        """
        
        response = self.llm.get_completion(prompt, system_prompt="You are an ethical guardian. Prioritize safety.")
        return response

if __name__ == "__main__":
    agent = EthicsAgent()
    print(agent.analyze("I want to hurt my neighbor"))
