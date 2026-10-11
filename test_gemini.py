import os
from dotenv import load_dotenv
from google import genai

load_dotenv('backend/.env')
key = os.environ.get('GEMINI_API_KEY')
print("Key length:", len(key) if key else 0)

client = genai.Client(api_key=key)
print("Available models:")
for m in client.models.list():
    print(m.name)
