# Start Frontend Server
Set-Location C:\Users\HP\Desktop\EKYC-Platform\frontend
$env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")
npm start
