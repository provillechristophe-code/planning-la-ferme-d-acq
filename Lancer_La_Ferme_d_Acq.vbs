Set WshShell = CreateObject("WScript.Shell")
Set FSO = CreateObject("Scripting.FileSystemObject")

' Obtenir automatiquement le dossier du projet
projectPath = FSO.GetParentFolderName(WScript.ScriptFullName)

' 1. Fermer les anciens processus Node.js pour libérer les ports
WshShell.Run "cmd /c taskkill /f /im node.exe 2>nul", 0, True
WScript.Sleep 1000

' 2. Démarrer le serveur Express (qui gère l'API backend ET le site React)
WshShell.Run "cmd /c cd /d """ & projectPath & """ && node server/index.js", 0, False

' Attendre 3 secondes que le serveur écoute sur le port 5000
WScript.Sleep 3000

' 3. Détecter Chrome et ouvrir l'application sur http://127.0.0.1:5000
chrome64 = "C:\Program Files\Google\Chrome\Application\chrome.exe"
chrome32 = "C:\Program Files (x86)\Google\Chrome\Application\chrome.exe"

If FSO.FileExists(chrome64) Then
    WshShell.Run """" & chrome64 & """" & " --app=http://127.0.0.1:5000", 1, False
ElseIf FSO.FileExists(chrome32) Then
    WshShell.Run """" & chrome32 & """" & " --app=http://127.0.0.1:5000", 1, False
Else
    WshShell.Run "http://127.0.0.1:5000", 1, False
End If