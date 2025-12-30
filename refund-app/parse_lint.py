import json

def read_json_flexible(filename):
    for encoding in ['utf-8-sig', 'utf-8']:
        try:
            with open(filename, 'r', encoding=encoding) as f:
                return json.load(f)
        except Exception:
            continue
    raise Exception("Could not read JSON with any expected encoding")

try:
    data = read_json_flexible('lint-json.json')
    
    with open('errors-list.txt', 'w', encoding='utf-8') as out:
        for file in data:
            for msg in file['messages']:
                if msg['severity'] == 2: # Error
                    out.write(f"{file['filePath']}:{msg['line']}:{msg['column']} - {msg['message']} ({msg.get('ruleId', 'unknown')})\n")
except Exception as e:
    with open('errors-list.txt', 'w', encoding='utf-8') as out:
        out.write(f"Error: {e}\n")
