from flask import Flask, render_template, request, jsonify
import base64
import urllib.parse

app = Flask(__name__)

# دوال فك التشفير
def decode_base64(data):
    try:
        return base64.b64decode(data.encode()).decode('utf-8')
    except:
        return "[Base64] ❌ خطأ"

def decode_url(data):
    try:
        return urllib.parse.unquote(data)
    except:
        return "[URL] ❌ خطأ"

def decode_hex(data):
    try:
        return bytes.fromhex(data).decode('utf-8')
    except:
        return "[Hex] ❌ خطأ"

def decode_rot13(data):
    return data.translate(str.maketrans(
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz",
        "NOPQRSTUVWXYZABCDEFGHIJKLMnopqrstuvwxyzabcdefghijklm"))

operations = {
    "base64": decode_base64,
    "url": decode_url,
    "hex": decode_hex,
    "rot13": decode_rot13,
}

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/process", methods=["POST"])
def process():
    data = request.json.get("input")
    steps = request.json.get("steps")

    results = []
    current = data
    for step in steps:
        func = operations.get(step)
        if func:
            before = current
            current = func(current)
            results.append({"method": step.upper(), "before": before, "after": current})

    return jsonify({"result": current, "steps": results})


if __name__ == "__main__":
    app.run(debug=True)
