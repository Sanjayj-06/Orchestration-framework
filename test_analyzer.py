import sys
import os

backend_path = os.path.abspath(os.path.join(os.path.dirname(__file__), 'backend'))
if backend_path not in sys.path:
    sys.path.insert(0, backend_path)

try:
    from backend.app.services.requirement_analyzer import analyze_user_requirement
except ImportError:
    from app.services.requirement_analyzer import analyze_user_requirement  # type: ignore

req = "I want an agent that researches a given topic using available information sources. It should collect important facts, key findings, recent developments, and relevant sources. It should organize the information clearly so another agent can use it."

try:
    res = analyze_user_requirement(req)
    print("SUCCESS")
    print(res)
except Exception as e:
    import traceback
    traceback.print_exc()
