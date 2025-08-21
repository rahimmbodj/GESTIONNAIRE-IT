# Script de déploiement Firebase pour CROUS Réseau
# PowerShell

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   DEPLOIEMENT CROUS RESEAU FIREBASE" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Vérification de Node.js
Write-Host "[1/5] Vérification de Node.js..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "✓ Node.js version: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ ERREUR: Node.js non installé!" -ForegroundColor Red
    Read-Host "Appuyez sur Entrée pour continuer..."
    exit 1
}

# Vérification de npm
Write-Host "[2/5] Vérification de npm..." -ForegroundColor Yellow
try {
    $npmVersion = npm --version
    Write-Host "✓ npm version: $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ ERREUR: npm non installé!" -ForegroundColor Red
    Read-Host "Appuyez sur Entrée pour continuer..."
    exit 1
}

# Vérification de Firebase CLI
Write-Host "[3/5] Vérification de Firebase CLI..." -ForegroundColor Yellow
try {
    $firebaseVersion = firebase --version
    Write-Host "✓ Firebase CLI version: $firebaseVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ ERREUR: Firebase CLI non installé!" -ForegroundColor Red
    Write-Host "Installez-le avec: npm install -g firebase-tools" -ForegroundColor Yellow
    Read-Host "Appuyez sur Entrée pour continuer..."
    exit 1
}

# Construction de l'application
Write-Host "[4/5] Construction de l'application..." -ForegroundColor Yellow
Write-Host "Cette étape peut prendre quelques minutes..." -ForegroundColor Gray
try {
    npm run build
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ Application construite avec succès!" -ForegroundColor Green
    } else {
        throw "Erreur de construction"
    }
} catch {
    Write-Host "✗ ERREUR: La construction a échoué!" -ForegroundColor Red
    Read-Host "Appuyez sur Entrée pour continuer..."
    exit 1
}

# Déploiement Firebase
Write-Host "[5/5] Déploiement sur Firebase..." -ForegroundColor Yellow
Write-Host "Déploiement de l'hébergement..." -ForegroundColor Gray
try {
    firebase deploy --only hosting
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ Hébergement déployé avec succès!" -ForegroundColor Green
    } else {
        throw "Erreur de déploiement hosting"
    }
} catch {
    Write-Host "✗ ERREUR: Le déploiement a échoué!" -ForegroundColor Red
    Read-Host "Appuyez sur Entrée pour continuer..."
    exit 1
}

Write-Host ""
Write-Host "Déploiement des règles Firestore..." -ForegroundColor Gray
try {
    firebase deploy --only firestore:rules
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ Règles Firestore déployées!" -ForegroundColor Green
    } else {
        Write-Host "⚠ Avertissement: Déploiement des règles échoué" -ForegroundColor Yellow
    }
} catch {
    Write-Host "⚠ Avertissement: Déploiement des règles échoué" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "    DEPLOIEMENT TERMINE AVEC SUCCES!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "🌐 Votre application est accessible sur:" -ForegroundColor White
Write-Host "   https://focus-melody-467918-u9.web.app" -ForegroundColor Cyan
Write-Host ""
Write-Host "🔧 Console Firebase:" -ForegroundColor White
Write-Host "   https://console.firebase.google.com/project/focus-melody-467918-u9" -ForegroundColor Cyan
Write-Host ""
Write-Host "📱 Testez votre application PWA!" -ForegroundColor Green
Write-Host ""

Read-Host "Appuyez sur Entrée pour continuer..."


