"""
Capture actual browser PNGs of genuine Postman/Newman JSON test results.
These are screenshots of the RESULT REPORT, not of the Postman desktop UI.
"""
import json
from pathlib import Path
import html
import shutil
import subprocess
import tempfile

base = Path(__file__).resolve().parent.parent
source = base / "postman/results/newman-results.json"
data = json.loads(source.read_text(encoding="utf-8"))
executions = data.get("run", {}).get("executions", [])
expected = [
    ("01", "POST", 201, "01-create.png"),
    ("02", "GET", 200, "02-list.png"),
    ("03", "GET", 200, "03-detail.png"),
    ("04", "PUT", 200, "04-update.png"),
    ("05", "DELETE", 200, "05-delete.png"),
]
chrome = next((shutil.which(n) for n in ("google-chrome", "chromium", "chromium-browser") if shutil.which(n)), None)
if not chrome:
    raise RuntimeError("Chromium/Google Chrome required for genuine report screenshots")

def escaped(value):
    return html.escape(str(value if value is not None else ""), quote=True)

def decode_body(response):
    body = response.get("body")
    if isinstance(body, str):
        return body
    stream = response.get("stream")
    if isinstance(stream, dict):
        value = stream.get("data")
        if isinstance(value, list):
            return bytes(value).decode("utf-8", errors="replace")
    if isinstance(stream, str):
        return stream
    return json.dumps(body or response, ensure_ascii=False, indent=2)

template = """<!DOCTYPE html>
<html lang="tr"><head><meta charset="utf-8"/>
<style>
*{box-sizing:border-box} body{margin:0;background:#101821;color:#ebf2fa;font:16px Arial,sans-serif}
.frame{padding:42px 52px;width:1250px;min-height:900px}
.eyebrow{letter-spacing:2px;color:#9bacbd;font-size:14px;font-weight:700}
h1{font-size:31px;margin:12px 0 24px;color:#fff}
.title{display:flex;align-items:center;gap:20px;margin-bottom:26px}
.pill{background:#173d33;border:1px solid #26715a;color:#8ae1bd;padding:12px 19px;border-radius:10px;font-weight:bold}
.block{border:1px solid #354558;border-radius:12px;overflow:hidden;margin-bottom:20px}
.head{background:#263344;padding:14px 20px;font-size:15px;font-weight:bold;color:#b8cce1}
.content{background:#16212d;padding:20px 22px}
.request{font-family:Consolas,monospace;font-size:18px;color:#a9d8fd}
.method{color:#8fdfbb;font-weight:900}
pre{font:15px/1.45 Consolas,'Courier New',monospace;white-space:pre-wrap;overflow-wrap:anywhere;max-height:245px;overflow:hidden;margin:0}
.assertion{padding:7px 0;color:#b9f2d4;font-size:15px}
.footer{font-size:13px;color:#93a5b9;margin-top:20px;line-height:1.6}
.status{font-size:19px;color:#9aefc7;font-weight:bold}
</style></head><body><div class="frame">
<div class="eyebrow">TASKFLOW · POSTMAN COLLECTION RUN VIA NEWMAN · VERIFIED HTTP EXECUTION</div>
<h1>@@NAME@@</h1>
<div class="title"><span class="pill">✓ PASS</span><span class="status">HTTP @@STATUS@@ · @@METHOD@@</span></div>
<div class="block"><div class="head">REQUEST — gerçek HTTP isteği</div><div class="content">
<div class="request"><span class="method">@@METHOD@@</span> @@URL@@</div>
<div style="margin-top:16px"><pre>@@BODY@@</pre></div></div></div>
<div class="block"><div class="head">RESPONSE — API'nin gerçek yanıtı</div><div class="content"><pre>@@RESPONSE@@</pre></div></div>
<div class="block"><div class="head">POSTMAN ASSERTIONS — @@ASSERTION_COUNT@@ checked</div>
<div class="content">@@ASSERTIONS@@</div></div>
<div class="footer">Kaynak: Newman JSON Reporter · postman/results/newman-results.json
<br>Gerçek Newman test raporunun Chromium ile alınmış görüntüsüdür; Postman masaüstü arayüzü değildir.</div>
</div></body></html>"""

out = base / "postman/screenshots"
out.mkdir(parents=True, exist_ok=True)
summaries = []
for prefix, method, status, filename in expected:
    ex = next((x for x in executions if x.get("item", {}).get("name", "").startswith(prefix + " - ")), None)
    if ex is None:
        raise RuntimeError("Missing actual Newman request " + prefix)
    actual = ex.get("response", {}).get("code")
    assertions = ex.get("assertions", [])
    if actual != status or any(x.get("error") for x in assertions):
        raise RuntimeError("Failed actual Newman request " + prefix + ": " + str(actual))

    request = ex.get("request", {})
    req_url = request.get("url", "")
    if isinstance(req_url, dict):
        req_url = req_url.get("raw", "")
    body = request.get("body") or {}
    request_body = body.get("raw") if isinstance(body, dict) else None
    if not request_body:
        request_body = "(no request body)"
    response = decode_body(ex.get("response", {}))
    try:
        response = json.dumps(json.loads(response), ensure_ascii=False, indent=2)
    except (ValueError, TypeError):
        pass
    checks = "".join('<div class="assertion">✓ ' + escaped(a.get("assertion", "Assertion")) + "</div>" for a in assertions)
    values = {
        "@@NAME@@": escaped(ex["item"]["name"]),
        "@@METHOD@@": escaped(method),
        "@@STATUS@@": str(actual),
        "@@URL@@": escaped(req_url),
        "@@BODY@@": escaped(request_body)[:2500],
        "@@RESPONSE@@": escaped(response)[:4500],
        "@@ASSERTION_COUNT@@": str(len(assertions)),
        "@@ASSERTIONS@@": checks or "Request executed successfully",
    }
    page = template
    for token, value in values.items():
        page = page.replace(token, value)
    temp = Path(tempfile.gettempdir()) / ("taskflow-newman-" + prefix + ".html")
    temp.write_text(page, encoding="utf-8")
    image = out / filename
    result = subprocess.run([
        chrome, "--headless", "--no-sandbox", "--disable-dev-shm-usage", "--disable-gpu",
        "--hide-scrollbars", "--force-device-scale-factor=1", "--window-size=1280,1000",
        "--screenshot=" + str(image), temp.as_uri()
    ], capture_output=True, text=True, timeout=45)
    if result.returncode or not image.exists() or image.stat().st_size < 1000:
        raise RuntimeError("Screenshot failed " + filename + " " + result.stderr[-1000:])
    summaries.append({
        "name": ex["item"]["name"], "method": method, "httpStatus": actual,
        "assertions": len(assertions), "passed": True, "image": filename
    })

(base / "postman/results/summary.json").write_text(json.dumps({
    "runner": "Newman (official Postman collection runner)",
    "type": "Real HTTP executions",
    "image_provenance": "Chromium screenshots of Newman result reports, not Postman app UI",
    "tests": summaries
}, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
print("Created verified Newman evidence images:", ", ".join(s["image"] for s in summaries))
