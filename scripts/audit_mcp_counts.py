import json
import subprocess

BASE = "https://voxtelefony.com/api/mcp"
HEADERS = [
    "-H", "Content-Type: application/json",
    "-H", "Accept: application/json, text/event-stream",
    "-H", "MCP-Protocol-Version: 2025-06-18",
]


def call(payload):
    process = subprocess.run(
        ["curl", "-sS", "-L", "-X", "POST", BASE, *HEADERS, "--data", json.dumps(payload)],
        capture_output=True,
        text=True,
        timeout=30,
        check=False,
    )
    for line in process.stdout.splitlines():
        if line.startswith("data: "):
            return json.loads(line[6:])
    return None


listed = call({"jsonrpc": "2.0", "id": 1, "method": "tools/list", "params": {}})
tools = [
    tool["name"]
    for tool in listed["result"]["tools"]
    if tool["name"].startswith("query_")
]
results = []
for index, name in enumerate(tools, start=2):
    response = call({
        "jsonrpc": "2.0",
        "id": index,
        "method": "tools/call",
        "params": {"name": name, "arguments": {"limit": 1, "fields": ["id"]}},
    })
    count = None
    error = None
    try:
        result = response["result"]
        structured = result.get("structuredContent") or {}
        count = structured.get("count")
        if result.get("isError"):
            error = (result.get("content") or [{}])[0].get("text")
    except Exception as exc:
        error = str(exc)
    results.append({"tool": name, "count": count, "error": error})

with open("mcp-entity-count-audit.json", "w", encoding="utf-8") as handle:
    json.dump(results, handle, indent=2)

populated = [item for item in results if isinstance(item["count"], int) and item["count"] > 0]
print(f"tools={len(results)} populated={len(populated)} errors={sum(1 for item in results if item['error'])}")
for item in populated:
    print(f"{item['tool']} {item['count']}")
