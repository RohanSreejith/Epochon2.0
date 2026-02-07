from ..llm.groq_client import GroqClient
from ..utils.vector_search import VectorSearch
import os
import json

class LegalAgent:
    def __init__(self):
        self.llm = GroqClient()
        # Robust Column Mapping (IPC)
        self.ipc_search = None
        ipc_path = "backend/app/data/ipc/ipc.csv"
        
        if os.path.exists(ipc_path):
            try:
                import pandas as pd
                df = pd.read_csv(ipc_path, nrows=0)
                cols = df.columns.tolist()
                section_col = next((c for c in cols if "section" in c.lower()), cols[0])
                desc_col = next((c for c in cols if "desc" in c.lower() or "offense" in c.lower() or "detail" in c.lower()), cols[1] if len(cols)>1 else cols[0])
                print(f"IPC Agent: Mapped IPC columns - Section: '{section_col}', Content: '{desc_col}'")
                self.ipc_search = VectorSearch(ipc_path, desc_col, section_col)
            except Exception as e:
                print(f"Failed to initialize IPC Search: {e}")
        else:
             print("IPC Agent: No IPC dataset found at", ipc_path)

        # Robust Column Mapping (BSA)
        self.bsa_search = None
        bsa_path = "backend/app/data/bsa/bsa_sections.csv"
        if os.path.exists(bsa_path):
             try:
                import pandas as pd
                df = pd.read_csv(bsa_path, nrows=0)
                cols = df.columns.tolist()
                bsa_sec_col = next((c for c in cols if "section" in c.lower()), cols[0])
                bsa_desc_col = next((c for c in cols if "desc" in c.lower() or "provision" in c.lower()), cols[1])
                print(f"Legal Agent: Mapped BSA columns - Section: '{bsa_sec_col}', Content: '{bsa_desc_col}'")
                self.bsa_search = VectorSearch(bsa_path, bsa_desc_col, bsa_sec_col)
             except Exception as e:
                print(f"Failed to initialize BSA Search: {e}")
        
        # Robust Column Mapping (FIR - Merged)
        self.fir_search = None
        fir_path = "backend/app/data/fir/fir.csv"
        if os.path.exists(fir_path):
             try:
                import pandas as pd
                df = pd.read_csv(fir_path, nrows=0)
                cols = df.columns.tolist()
                # FIR needs text description column
                fir_desc_col = next((c for c in cols if "desc" in c.lower() or "detail" in c.lower() or "narration" in c.lower()), cols[0]) 
                # And maybe an ID
                fir_id_col = next((c for c in cols if "id" in c.lower() or "no" in c.lower()), cols[0])
                print(f"Legal Agent: Mapped FIR columns - ID: '{fir_id_col}', Content: '{fir_desc_col}'")
                self.fir_search = VectorSearch(fir_path, fir_desc_col, fir_id_col)
             except Exception as e:
                print(f"Failed to initialize FIR Search: {e}")

        # Robust Column Mapping (Case Laws)
        self.case_search = None
        case_path = "backend/app/data/case_laws/judgments.csv" # Updated to match verified filename
        
        if os.path.exists(case_path):
            try:
                import pandas as pd
                df = pd.read_csv(case_path, nrows=0)
                cols = df.columns.tolist()
                # Heuristics for Case Laws
                title_col = next((c for c in cols if "case" in c.lower() or "pet" in c.lower() or "diary" in c.lower()), cols[0])
                content_col = next((c for c in cols if "judg" in c.lower() or "order" in c.lower() or "headnote" in c.lower()), cols[-1])
                
                print(f"Legal Agent: Mapped Case Law columns - Title: '{title_col}', Content: '{content_col}'")
                self.case_search = VectorSearch(case_path, content_col, title_col)
            except Exception as e:
                print(f"Failed to initialize Case Law Search: {e}")
        else:
             print("Legal Agent: No Case Law dataset found at", case_path) 
        
    def analyze(self, query):
        # 1. Retrieve relevant laws
        context = ""
        
        # IPC Search
        if self.ipc_search:
            ipc_results = self.ipc_search.search(query)
            if ipc_results:
                context += "Relevant IPC Sections:\n"
                for res in ipc_results:
                    context += f"- Section {res.get('Section', 'N/A')}: {res.get('Description', 'N/A')}\n"
        
        # BSA Search (Evidence Act)
        if self.bsa_search:
            bsa_results = self.bsa_search.search(query)
            if bsa_results:
                context += "\nRelevant BSA (Evidence Act):\n"
                for res in bsa_results:
                     context += f"- Section {res.get('Section', 'N/A')}: {res.get('Description', 'N/A')}\n"

        # Case Law Search
        if self.case_search:
            case_results = self.case_search.search(query)
            if case_results:
                context += "\nRelevant Case Precedents:\n"
                for res in case_results:
                    # Generic access since keys depend on user's CSV
                    vals = list(res.values())
                    context += f"- Case: {vals[0] if len(vals) > 0 else 'Unknown'} | Excerpt: {str(vals[1])[:200] if len(vals) > 1 else '...'}\n"
        
        # FIR Pattern Search (Optional context)
        # if self.fir_search: ... (Maybe too noisy, let's keep it for now but commented out unless relevant)

        # 2. Formulate Prompt
        prompt = f"""You are a Legal Aid AI Agent for Indian Law.
        User Situation: "{query}"
        
        Context from IPC Database:
        {context}
        
        Task:
        1. Identify the most relevant IPC sections.
        2. Explain why they apply.
        3. Suggest a legal course of action (e.g., File FIR).
        
        Output Format:
        {{
            "sections": ["Section 378", ...],
            "reasoning": "...",
            "advice": "..."
        }}
        Return ONLY valid JSON.
        """
        
        # 3. Call LLM
        response = self.llm.get_completion(prompt, system_prompt="You are a strict legal assistant. Output JSON only.")
        return response

if __name__ == "__main__":
    agent = LegalAgent()
    print(agent.analyze("someone stole my bike"))
