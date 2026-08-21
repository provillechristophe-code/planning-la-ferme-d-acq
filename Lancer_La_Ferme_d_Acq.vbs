Set WshShell = CreateObject("WScript.Shell")
Set FSO = CreateObject("Scripting.FileSystemObject")

' Obtenir automatiquement le dossier du projet
projectPath = FSO.GetParentFolderName(WScript.ScriptFullName)

' 1. Arrêter les anciens processus Node.js bloqués
WshShell.Run "cmd /c taskkill /f /im node.exe 2>nul", 0, True
WScript.Sleep 1000

' 2. Démarrer le serveur et le client
WshShell.Run "cmd /c cd /d """ & projectPath & """ && npm run dev-all", 0, False

' 3. Attendre activement que l'application soit prête sur http://localhost:3000
On Error Resume Next
Set http = CreateObject("MSXML2.XMLHTTP")
ready = False

For i = 1 To 30
    http.open "GET", "http://localhost:3000", False
    http.send
    If http.status = 200 Then
        ready = True
        Exit For
    End If
    WScript.Sleep 1000
Next
On Error GoTo 0

' 4. Ouvrir Chrome seulement quand le serveur est 100% prêt
chrome64 = "C:\Program Files\Google\Chrome\Application\chrome.exe"
chrome32 = "C:\Program Files (x86)\Google\Chrome\Application\chrome.exe"

If FSO.FileExists(chrome64) Then
    WshShell.Run """" & chrome64 & """" & " --app=http://localhost:3000", 1, False
ElseIf FSO.FileExists(chrome32) Then
    WshShell.Run """" & chrome32 & """" & " --app=http://localhost:3000", 1, False
Else
    WshShell.Run "http://localhost:3000", 1, False
End If