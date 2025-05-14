import os
from typing import Dict, Any
from dotenv import load_dotenv
from langchain_openai import ChatOpenAI
from langchain.prompts import ChatPromptTemplate

load_dotenv()

# Initialize OpenAI client
openai_api_key = os.getenv("OPENAI_API_KEY")
model = ChatOpenAI(api_key=openai_api_key, model="gpt-4o-mini")

# Define the prompt template
EXTRACT_MEDICATION_PROMPT = """
You are a medical assistant that extracts information about medications from user notes.
Please extract the following information from the user's medication note:
- Medication name
- Dosage
- Frequency (how often they take it)
- When they took it (time/date)
- Any side effects or feelings after taking it

User note: {note}

Respond with a JSON object in the following format:
```json
{{
  "medication_name": "name of the medication",
  "dosage": "dosage information",
  "frequency": "how often they take it",
  "taken_at": "when they took it",
  "feeling_after": "any feelings or side effects mentioned"
}}
```

If any information is not provided in the note, use null for that field.
"""

extract_medication_prompt = ChatPromptTemplate.from_template(EXTRACT_MEDICATION_PROMPT)


async def extract_medication_info(note: str) -> Dict[str, Any]:
    """
    Extract medication information from a user note using LLM.
    
    Args:
        note: A free-text note containing medication information
        
    Returns:
        A dictionary with extracted medication information
    """
    try:
        chain = extract_medication_prompt | model
        response = chain.invoke({"note": note})
        
        # Extract the JSON part from the response
        content = response.content
        if "```json" in content:
            content = content.split("```json")[1].split("```")[0].strip()
        elif "```" in content:
            content = content.split("```")[1].split("```")[0].strip()
            
        # Parse the content as JSON
        import json
        result = json.loads(content)
        return result
    except Exception as e:
        print(f"Error extracting medication info: {e}")
        # Return empty values as fallback
        return {
            "medication_name": None,
            "dosage": None,
            "frequency": None,
            "taken_at": None,
            "feeling_after": None
        } 