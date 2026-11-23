# New Exodus Radio - minimal local web server (Windows PowerShell, no install needed)
# Serves this folder at http://localhost:8080 so the site's JSON data files load.
$port = 8080
$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$types = @{
  ".html"="text/html; charset=utf-8"; ".css"="text/css; charset=utf-8"; ".js"="text/javascript; charset=utf-8";
  ".json"="application/json; charset=utf-8"; ".svg"="image/svg+xml"; ".png"="image/png"; ".jpg"="image/jpeg";
  ".jpeg"="image/jpeg"; ".webp"="image/webp"; ".ico"="image/x-icon"; ".xml"="application/xml"; ".txt"="text/plain";
  ".mp3"="audio/mpeg"; ".m4a"="audio/mp4"; ".woff2"="font/woff2"
}
$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:$port/")
try { $listener.Start() } catch { Write-Host "Port $port is busy. Close the other server and try again."; exit 1 }
Write-Host ""
Write-Host "  New Exodus Radio preview is running at http://localhost:$port"
Write-Host "  Close this window to stop it."
Write-Host ""
Start-Process "http://localhost:$port/"
while ($listener.IsListening) {
  $ctx = $listener.GetContext()
  $path = [Uri]::UnescapeDataString($ctx.Request.Url.AbsolutePath).TrimStart("/")
  if ($path -eq "" -or $path.EndsWith("/")) { $path += "index.html" }
  $file = [System.IO.Path]::GetFullPath((Join-Path $root $path))
  $res = $ctx.Response
  if ($file.StartsWith($root) -and (Test-Path $file -PathType Leaf)) {
    $ext = [System.IO.Path]::GetExtension($file).ToLower()
    $res.ContentType = if ($types.ContainsKey($ext)) { $types[$ext] } else { "application/octet-stream" }
    $bytes = [System.IO.File]::ReadAllBytes($file)
    $res.ContentLength64 = $bytes.Length
    $res.OutputStream.Write($bytes, 0, $bytes.Length)
  } else {
    $res.StatusCode = 404
    $msg = [Text.Encoding]::UTF8.GetBytes("Not found: /$path")
    $res.OutputStream.Write($msg, 0, $msg.Length)
  }
  $res.Close()
}
