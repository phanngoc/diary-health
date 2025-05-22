import os
import base64
from typing import Dict, Any, Optional
from dotenv import load_dotenv
from langchain_openai import ChatOpenAI
from langchain.prompts import ChatPromptTemplate

load_dotenv()

# Initialize OpenAI client
openai_api_key = os.getenv("OPENAI_API_KEY")
model = ChatOpenAI(api_key=openai_api_key, model="gpt-4o-mini")

# Define the prompt template for text notes
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

# Define the prompt template for image analysis
EXTRACT_MEDICATION_FROM_IMAGE_PROMPT = """
You are a medical assistant that extracts information about medications from images of medicine packaging, prescriptions, or notes.
Please analyze the image and extract the following information:
- Medication name
- Dosage
- Frequency (how often it should be taken)
- When it was taken (if visible in the image)
- Any side effects or feelings after taking it (if mentioned)

Respond with a JSON object in the following format:
```json
{{
  "medication_name": "name of the medication",
  "dosage": "dosage information",
  "frequency": "how often they take it",
  "taken_at": "when they took it (if visible)",
  "feeling_after": "any feelings or side effects mentioned (if visible)"
}}
```

If any information is not visible in the image, use null for that field.
"""

extract_medication_prompt = ChatPromptTemplate.from_template(EXTRACT_MEDICATION_PROMPT)
extract_medication_from_image_prompt = ChatPromptTemplate.from_template(EXTRACT_MEDICATION_FROM_IMAGE_PROMPT)


async def extract_medication_info(note: Optional[str] = None, image_data: Optional[str] = None) -> Dict[str, Any]:
    """
    Extract medication information from a user note or image using LLM.
    
    Args:
        note: A free-text note containing medication information
        image_data: A base64-encoded image of medication packaging or prescription
        
    Returns:
        A dictionary with extracted medication information
    """
    try:
        if note:
            # Process text note
            chain = extract_medication_prompt | model
            response = chain.invoke({"note": note})
        elif image_data:
            # Process image
            # Strip off the prefix if it exists (e.g., "data:image/jpeg;base64,")
            if "base64," in image_data:
                image_data = image_data.split("base64,")[1]
                
            # Process with vision model
            from langchain_openai import ChatOpenAI
            vision_model = ChatOpenAI(api_key=openai_api_key, model="gpt-4o")
            
            # Create a message with image content
            from langchain_core.messages import HumanMessage
            message = HumanMessage(
                content=[
                    {"type": "text", "text": extract_medication_from_image_prompt.template},
                    {
                        "type": "image_url",
                        "image_url": {
                            "url": f"data:image/jpeg;base64,{image_data}"
                        }
                    }
                ]
            )
            
            # Get response
            response = vision_model.invoke([message])
        else:
            raise ValueError("Either note or image_data must be provided")
        
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