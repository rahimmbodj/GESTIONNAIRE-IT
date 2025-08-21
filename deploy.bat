@echo off
echo ========================================
echo    DEPLOIEMENT CROUS RESEAU FIREBASE
echo ========================================
echo.

echo [1/4] Construction de l'application...
call npm run build
if %errorlevel% neq 0 (
    echo ERREUR: La construction a echoue!
    pause
    exit /b 1
)
echo ✓ Application construite avec succes!
echo.

echo [2/4] Verification de la configuration Firebase...
firebase --version
if %errorlevel% neq 0 (
    echo ERREUR: Firebase CLI non installe!
    pause
    exit /b 1
)
echo ✓ Firebase CLI verifie!
echo.

echo [3/4] Deploiement sur Firebase Hosting...
firebase deploy --only hosting
if %errorlevel% neq 0 (
    echo ERREUR: Le deploiement a echoue!
    pause
    exit /b 1
)
echo ✓ Deploiement reussi!
echo.

echo [4/4] Deploiement des regles Firestore...
firebase deploy --only firestore:rules
if %errorlevel% neq 0 (
    echo ERREUR: Deploiement des regles echoue!
    pause
    exit /b 1
)
echo ✓ Regles Firestore deployees!
echo.

echo ========================================
echo    DEPLOIEMENT TERMINE AVEC SUCCES!
echo ========================================
echo.
echo Votre application est accessible sur:
echo https://focus-melody-467918-u9.web.app
echo.
echo Console Firebase:
echo https://console.firebase.google.com/project/focus-melody-467918-u9
echo.
pause


