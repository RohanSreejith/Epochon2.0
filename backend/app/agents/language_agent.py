from ..llm.groq_client import GroqClient

class LanguageAgent:
    def __init__(self):
        self.llm = GroqClient()
        
    def translate(self, text, target_language="English"):
        if target_language == "English" and text.isascii(): # Simple heuristic, assume English input
            return text

        prompt = f"""Translate the following text to {target_language}.
        Text: "{text}"
        
        Return ONLY the translated text. No explanations.
        """
        
        response = self.llm.get_completion(prompt)
        return response.strip() if response else text

    def detect_language(self, text):
        prompt = f"""Detect the language of the following text: "{text}".
        Return ONLY the language name (e.g., Hindi, Kannada, English).
        """
        response = self.llm.get_completion(prompt)
        return response.strip() if response else "Unknown"

if __name__ == "__main__":
    agent = LanguageAgent()
    print(agent.translate("नमस्ते", "English"))
