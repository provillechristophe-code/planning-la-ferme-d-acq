Set WshShell = CreateObject("WScript.Shell")
Set FSO = CreateObject("Scripting.FileSystemObject")

' Obtenir automatiquement le dossier du projet
projectPath = FSO.GetParentFolderName(WScript.ScriptFullName)

' 1. Lancer le serveur Node.js backend (masqué)
WshShell.Run "cmd /c cd /d """ & projectPath & """ && node server/index.js", 0, False

' Attendre 2 secondes
WScript.Sleep 2000

' 2. Lancer le serveur React frontend (masqué)
WshShell.Run "cmd /c cd /d """ & projectPath & "\client"" && npm start", 0, False

' Attendre 6 secondes
WScript.Sleep 6000

' 3. Détecter Chrome et ouvrir en mode application
chrome64 = "C:\Program Files\Google\Chrome\Application\chrome.exe"
chrome32 = "C:\Program Files (x86)\Google\Chrome\Application\chrome.exe"

If FSO.FileExists(chrome64) Then
    WshShell.Run """" & chrome64 & """" & " --app=http://localhost:3000", 1, False
ElseIf FSO.FileExists(chrome32) Then
    WshShell.Run """" & chrome32 & """" & " --app=http://localhost:3000", 1, False
Else
    WshShell.Run "http://localhost:3000", 1, False
End If