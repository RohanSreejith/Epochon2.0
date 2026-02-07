from .legal_agent import LegalAgent
from .risk_agent import RiskAgent
from .ethics_agent import EthicsAgent
from .confidence_agent import ConfidenceAgent
from .language_agent import LanguageAgent
import json
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class Coordinator:
    def __init__(self):
        self.legal = LegalAgent()
        self.risk = RiskAgent()
        self.ethics = EthicsAgent()
        self.confidence = ConfidenceAgent()
        self.language = LanguageAgent()
        self.session_history = []

    def reset(self):
        """Clears session history and agent states."""
        self.session_history = []
        logger.info("Session reset.")

    def run_debate(self, user_input):
        logger.info(f"New input: {user_input}")
        
        # 1. Translate if needed
        english_input = self.language.translate(user_input, "English")
        
        # 2. Parallel Analysis (Round 1)
        # Note: In a real async app, use asyncio.gather
        legal_res = self.legal.analyze(english_input)
        risk_res = self.risk.analyze(english_input, legal_res)
        
        # 3. Ethics Veto Check
        ethics_res = self.ethics.analyze(english_input, risk_res)
        try:
            ethics_json = json.loads(ethics_res)
            if ethics_json.get("veto", False):
                return {
                    "status": "REFUSED",
                    "reason": ethics_json.get("reason", "Safety Violation"),
                    "logs": [
                        {"agent": "Legal", "msg": legal_res},
                        {"agent": "Risk", "msg": risk_res},
                        {"agent": "Ethics", "msg": "VETO Triggered"},
                    ]
                }
        except:
            pass # Fallback if JSON fails

        # 4. Confidence Check
        confidence_res = self.confidence.analyze(english_input, legal_res, risk_res)
        try:
            conf_json = json.loads(confidence_res)
            if conf_json.get("refusal_triggered", False) or conf_json.get("score", 0) < 40:
                 return {
                    "status": "REFUSED",
                    "reason": "Low Confidence / Insufficient Information",
                    "logs": [
                        {"agent": "Confidence", "msg": f"Score: {conf_json.get('score')}% - Refused"}
                    ]
                }
        except:
            pass

        # 5. Synthesis / Consensus
        return {
            "status": "SUCCESS",
            "logs": [
                {"agent": "Legal", "msg": legal_res},
                {"agent": "Risk", "msg": risk_res},
                {"agent": "Ethics", "msg": ethics_res},
                {"agent": "Confidence", "msg": confidence_res},
            ],
            "response": legal_res # For prototype, return legal advice directly
        }

if __name__ == "__main__":
    coord = Coordinator()
    print(coord.run_debate("My landlord is threatening me"))
