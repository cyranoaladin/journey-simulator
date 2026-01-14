
import json, pathlib
try:
    p = pathlib.Path("artifacts/proof/lead12_r12/playwright_report.json")
    d = json.loads(p.read_text())
    
    # helper to find test
    found = False
    for suite in d.get("suites", []):
         # Suites can be nested.
         # Flatten suites?
         stack = [suite]
         while stack:
             s = stack.pop()
             if "suites" in s:
                 stack.extend(s["suites"])
             if "specs" in s:
                 for spec in s["specs"]:
                     if "connect-only.spec.ts" in spec.get("file", ""):
                          for test in spec.get("tests", []):
                               for result in test.get("results", []):
                                    if result.get("status") == "unexpected":
                                         print("-" * 20)
                                         print("ERROR FOUND in connect-only:")
                                         if "error" in result:
                                              print(result["error"].get("message"))
                                              print(result["error"].get("stack"))
                                         else:
                                              print("No error object in result")
                                         found = True
    if not found:
        print("No unexpected errors found for connect-only (or file not found in report)")
except Exception as e:
    print(e)
