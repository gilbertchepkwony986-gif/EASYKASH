$port = 3000
$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:$port/")

try {
    $listener.Start()
} catch {
    Write-Host "Failed to start listener on port $port. Trying port 3001..." -ForegroundColor Yellow
    $port = 3001
    $listener = New-Object System.Net.HttpListener
    $listener.Prefixes.Add("http://localhost:$port/")
    $listener.Start()
}

Write-Host "======================================================" -ForegroundColor Green
Write-Host "  EasyKash Loan Platform (PowerShell Server) Started!" -ForegroundColor Cyan
Write-Host "  Open URL: http://localhost:$port" -ForegroundColor White
Write-Host "  Apply Page:     http://localhost:$port/#apply" -ForegroundColor Gray
Write-Host "  Withdraw Page:  http://localhost:$port/#withdraw-loan" -ForegroundColor Gray
Write-Host "  Admin Portal:   http://localhost:$port/#admin" -ForegroundColor Gray
Write-Host "======================================================" -ForegroundColor Green
Write-Host "Press Ctrl+C in this terminal to stop the server." -ForegroundColor Yellow

$baseDir = $PSScriptRoot

while ($listener.IsListening) {
    try {
        $context = $listener.GetContext()
        $request = $context.Request
        $response = $context.Response

        $rawUrl = $request.RawUrl.Split('?')[0]
        if ($rawUrl -eq "/" -or $rawUrl -eq "/withdraw-loan" -or $rawUrl -eq "/admin" -or $rawUrl -eq "/calculator" -or $rawUrl -eq "/check-status" -or $rawUrl -eq "/repay") {
            $filePath = Join-Path $baseDir "index.html"
        } else {
            $relPath = $rawUrl.TrimStart('/').Replace('/', [System.IO.Path]::DirectorySeparatorChar)
            $filePath = Join-Path $baseDir $relPath
            if (-not (Test-Path $filePath -PathType Leaf)) {
                $filePath = Join-Path $baseDir "index.html"
            }
        }

        if (Test-Path $filePath -PathType Leaf) {
            $ext = [System.IO.Path]::GetExtension($filePath).ToLower()
            $contentType = switch ($ext) {
                ".html" { "text/html; charset=utf-8" }
                ".css"  { "text/css; charset=utf-8" }
                ".js"   { "application/javascript; charset=utf-8" }
                ".json" { "application/json; charset=utf-8" }
                ".png"  { "image/png" }
                ".jpg"  { "image/jpeg" }
                ".ico"  { "image/x-icon" }
                ".svg"  { "image/svg+xml" }
                default { "application/octet-stream" }
            }

            $bytes = [System.IO.File]::ReadAllBytes($filePath)
            $response.ContentType = $contentType
            $response.ContentLength64 = $bytes.Length
            $response.StatusCode = 200
            $response.OutputStream.Write($bytes, 0, $bytes.Length)
        } else {
            $response.StatusCode = 404
        }
        $response.Close()
    } catch {
        # Handle client aborts gracefully
    }
}
