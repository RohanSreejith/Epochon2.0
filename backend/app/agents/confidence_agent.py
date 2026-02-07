from ..llm.groq_client import GroqClient
import json

class ConfidenceAgent:
    def __init__(self):
        self.llm = GroqClient()
        
    def analyze(self, query, legal_advice, risk_analysis):
        prompt = f"""You are the Confidence Assessment Agent. You are SKEPTICAL.
        User Situation: "{query}"
        Legal Advice: "{legal_advice}"
        Risk Analysis: "{risk_analysis}"
        
        Task:
        1. Evaluate if the user provided enough information.
        2. Evaluate if the legal advice is specific and grounded.
        3. Assign a confidence score (0-100%).
        4. If < 40%, trigger REFUSAL.
        
        Output Format:
        {{
            "score": 85,
            "reasoning": "...",
            "missing_info": ["Date of incident", ...],
            "refusal_triggered": true/false
        }}
        Return ONLY valid JSON.
        """
        
        response = self.llm.get_completion(prompt, system_prompt="You are a strict evaluator. Be harsh.")
        return response

if __name__ == "__main__":
    agent = ConfidenceAgent()
    print(agent.analyze("He hit me", "File FIR", "High Risk"))
